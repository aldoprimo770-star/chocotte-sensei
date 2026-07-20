"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import {
  getOrCreatePreConsultation,
  hasCompletedContactPurchase,
} from "@/lib/consultation/consultation";
import { sendConsultationMessage } from "@/lib/consultation/send-message";
import {
  consultationMessageSchema,
  consultationReportSchema,
} from "@/schemas/consultation.schema";
import type { FormActionResult } from "@/types/action";

export type StartConsultationResult =
  | { success: true; conversationId: string }
  | { success: false; error: string };

/** 先生プロフィールから事前相談を開始（既存ならその ID を返す） */
export async function startConsultationAction(
  teacherProfileId: string,
): Promise<StartConsultationResult> {
  const session = await requireRole("STUDENT");

  const teacher = await getDb().teacherProfile.findFirst({
    where: {
      id: teacherProfileId,
      isPublic: true,
      status: "APPROVED",
    },
    select: { id: true },
  });
  if (!teacher) {
    return { success: false, error: "先生が見つかりません。" };
  }

  const conversation = await getOrCreatePreConsultation(
    session.user.id,
    teacher.id,
  );

  revalidatePath("/mypage/consultations");
  return { success: true, conversationId: conversation.id };
}

/** 生徒からメッセージ送信 */
export async function sendStudentConsultationMessageAction(
  conversationId: string,
  body: string,
): Promise<FormActionResult> {
  const session = await requireRole("STUDENT");
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
    senderRole: "STUDENT",
    body: parsed.data.body,
  });

  if (!result.success) {
    return { success: false, error: result.error };
  }

  revalidatePath(`/mypage/consultations/${conversationId}`);
  revalidatePath("/mypage/consultations");
  revalidatePath(`/consultations/${conversationId}`);
  return { success: true };
}

/** 生徒からの通報 */
export async function reportConsultationAction(
  conversationId: string,
  reason: string,
  messageId?: string,
): Promise<FormActionResult> {
  const session = await requireRole("STUDENT");
  const parsed = consultationReportSchema.safeParse({ reason, messageId });
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "入力内容を確認してください",
    };
  }

  const conversation = await getDb().conversation.findFirst({
    where: {
      id: conversationId,
      studentId: session.user.id,
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

/** 購入済みか（UI用・サーバー確認） */
export async function checkConsultationUnlocked(
  teacherProfileId: string,
): Promise<boolean> {
  const session = await requireRole("STUDENT");
  return hasCompletedContactPurchase(session.user.id, teacherProfileId);
}
