"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { sendConsultationMessage } from "@/lib/consultation/send-message";
import {
  consultationMessageSchema,
  consultationReportSchema,
} from "@/schemas/consultation.schema";
import type { FormActionResult } from "@/types/action";

/** 先生からメッセージ送信 */
export async function sendTeacherConsultationMessageAction(
  conversationId: string,
  body: string,
): Promise<FormActionResult> {
  const session = await requireRole("TEACHER");
  const parsed = consultationMessageSchema.safeParse({ body });
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "入力内容を確認してください",
    };
  }

  const result = await sendConsultationMessage({
    conversationId,
    senderUserId: session.user.id,
    senderRole: "TEACHER",
    body: parsed.data.body,
  });

  if (!result.success) {
    return { success: false, error: result.error };
  }

  revalidatePath(`/consultations/${conversationId}`);
  revalidatePath("/consultations");
  revalidatePath(`/mypage/consultations/${conversationId}`);
  return { success: true };
}

/** 先生からの通報 */
export async function reportConsultationAsTeacherAction(
  conversationId: string,
  reason: string,
  messageId?: string,
): Promise<FormActionResult> {
  const session = await requireRole("TEACHER");
  const parsed = consultationReportSchema.safeParse({ reason, messageId });
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "入力内容を確認してください",
    };
  }

  const profile = await getDb().teacherProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!profile) {
    return { success: false, error: "プロフィールが見つかりません。" };
  }

  const conversation = await getDb().conversation.findFirst({
    where: {
      id: conversationId,
      teacherId: profile.id,
      type: "PRE_CONSULTATION",
    },
    select: { id: true },
  });
  if (!conversation) {
    return { success: false, error: "相談が見つかりません。" };
  }

  await getDb().conversationReport.create({
    data: {
      conversationId,
      messageId: parsed.data.messageId,
      reporterUserId: session.user.id,
      reason: parsed.data.reason,
      status: "NEW",
    },
  });

  revalidatePath("/admin/reports");
  return { success: true };
}
