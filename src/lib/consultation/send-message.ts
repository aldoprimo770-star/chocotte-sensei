import { getDb } from "@/lib/db";
import {
  CONSULTATION_LIMIT_MESSAGE,
  NG_WORD_BLOCK_MESSAGE,
  PRE_CONSULTATION_MAX_ROUND_TRIPS,
} from "@/constants/consultation";
import { detectNgWord } from "@/lib/consultation/ng-words";
import { canSendFreeMessage, countRoundTrips } from "@/lib/consultation/limits";
import { hasCompletedContactPurchase } from "@/lib/consultation/consultation";
import {
  sendConsultationReplyToStudentEmail,
  sendConsultationToTeacherEmail,
} from "@/lib/email/consultation-email";

export type SendConsultationResult =
  | { success: true; messageId: string }
  | { success: false; error: string };

/**
 * 事前相談メッセージを送信する（生徒・先生共通コア）。
 * NGワード検査・往復制限・メール通知を行う。
 */
export async function sendConsultationMessage(params: {
  conversationId: string;
  senderUserId: string;
  senderRole: "STUDENT" | "TEACHER";
  body: string;
}): Promise<SendConsultationResult> {
  const body = params.body.trim();
  if (!body) {
    return { success: false, error: "メッセージを入力してください" };
  }
  if (body.length > 2000) {
    return {
      success: false,
      error: "メッセージは2000文字以内で入力してください",
    };
  }

  const hit = await detectNgWord(body);
  if (hit) {
    return { success: false, error: NG_WORD_BLOCK_MESSAGE };
  }

  const conversation = await getDb().conversation.findUnique({
    where: { id: params.conversationId },
    select: {
      id: true,
      type: true,
      status: true,
      studentId: true,
      teacherId: true,
      teacher: {
        select: {
          displayName: true,
          user: { select: { id: true, email: true } },
        },
      },
      student: {
        select: {
          email: true,
          studentProfile: { select: { displayName: true } },
        },
      },
    },
  });

  if (!conversation || conversation.type !== "PRE_CONSULTATION") {
    return { success: false, error: "相談が見つかりません。" };
  }

  if (conversation.status === "CLOSED") {
    return { success: false, error: "この相談は終了しています。" };
  }

  // 参加者チェック
  if (params.senderRole === "STUDENT") {
    if (conversation.studentId !== params.senderUserId) {
      return { success: false, error: "権限がありません。" };
    }
  } else if (conversation.teacher.user.id !== params.senderUserId) {
    return { success: false, error: "権限がありません。" };
  }

  const messages = await getDb().conversationMessage.findMany({
    where: { conversationId: conversation.id, kind: "TEXT" },
    select: { senderRole: true },
  });

  const purchased = await hasCompletedContactPurchase(
    conversation.studentId,
    conversation.teacherId,
  );

  const limit = canSendFreeMessage(messages, params.senderRole, purchased);
  if (!limit.ok) {
    // ステータスを LOCKED に更新（購入で再開）
    if (conversation.status !== "LOCKED") {
      await getDb().conversation.update({
        where: { id: conversation.id },
        data: { status: "LOCKED" },
      });
    }
    return { success: false, error: CONSULTATION_LIMIT_MESSAGE };
  }

  const now = new Date();
  const created = await getDb().conversationMessage.create({
    data: {
      conversationId: conversation.id,
      senderUserId: params.senderUserId,
      senderRole: params.senderRole,
      kind: "TEXT",
      body,
    },
    select: { id: true },
  });

  // 送信後の往復数で LOCKED 判定
  const after = countRoundTrips([
    ...messages,
    { senderRole: params.senderRole },
  ]);
  const shouldLock =
    !purchased &&
    after.studentCount >= PRE_CONSULTATION_MAX_ROUND_TRIPS &&
    after.teacherCount >= PRE_CONSULTATION_MAX_ROUND_TRIPS;

  await getDb().conversation.update({
    where: { id: conversation.id },
    data: {
      lastMessageAt: now,
      status: shouldLock ? "LOCKED" : "OPEN",
    },
  });

  // メール通知（失敗しても送信自体は成功）
  const studentName =
    conversation.student.studentProfile?.displayName ?? "生徒";
  const teacherName = conversation.teacher.displayName;

  try {
    if (params.senderRole === "STUDENT") {
      await sendConsultationToTeacherEmail({
        to: conversation.teacher.user.email,
        teacherName,
        studentName,
        preview: body,
        conversationId: conversation.id,
      });
      await getDb().notification.create({
        data: {
          userId: conversation.teacher.user.id,
          type: "NEW_CONSULTATION",
          title: "事前相談が届きました",
          body: `${studentName}さんから事前相談が届きました。`,
          linkUrl: `/consultations/${conversation.id}`,
        },
      });
    } else {
      await sendConsultationReplyToStudentEmail({
        to: conversation.student.email,
        studentName,
        teacherName,
        preview: body,
        conversationId: conversation.id,
      });
      await getDb().notification.create({
        data: {
          userId: conversation.studentId,
          type: "CONSULTATION_REPLY",
          title: "先生から返信が届きました",
          body: `${teacherName}先生から返信が届きました。`,
          linkUrl: `/mypage/consultations/${conversation.id}`,
        },
      });
    }
  } catch {
    // 通知失敗は握りつぶす
  }

  return { success: true, messageId: created.id };
}
