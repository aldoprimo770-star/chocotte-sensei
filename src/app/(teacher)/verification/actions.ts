"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db";
import { requireRole } from "@/lib/auth/session";
import { verificationSchema, type VerificationInput } from "@/schemas/verification.schema";
import type { FormActionResult } from "@/types/action";

/**
 * 本人確認の申請 / 再申請 Server Action
 *
 * 1先生につき1件（teacherId が unique）のため upsert で扱います。
 * 再申請時はステータスを PENDING に戻し、却下理由をクリアします。
 */
export async function submitVerificationAction(
  input: VerificationInput,
): Promise<FormActionResult> {
  const session = await requireRole("TEACHER");

  // 自分の先生プロフィールを特定
  const profile = await getDb().teacherProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!profile) {
    return { success: false, error: "プロフィールが見つかりません。" };
  }

  const parsed = verificationSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fieldErrors[key]) {
        fieldErrors[key] = issue.message;
      }
    }
    return {
      success: false,
      error: "入力内容をご確認ください。",
      fieldErrors,
    };
  }

  const { documentType, documentUrl, note } = parsed.data;

  try {
    // 承認済みの場合は再申請を受け付けない（不要な差し戻しを防ぐ）
    const existing = await getDb().identityVerification.findUnique({
      where: { teacherId: profile.id },
      select: { status: true },
    });
    if (existing?.status === "APPROVED") {
      return { success: false, error: "すでに本人確認は承認済みです。" };
    }

    await getDb().identityVerification.upsert({
      where: { teacherId: profile.id },
      create: {
        teacherId: profile.id,
        documentType,
        documentUrl,
        note: note ?? null,
        status: "PENDING",
      },
      update: {
        documentType,
        documentUrl,
        note: note ?? null,
        // 再申請：審査中に戻し、前回の却下理由・審査記録をクリア
        status: "PENDING",
        rejectReason: null,
        reviewedAt: null,
        reviewedBy: null,
      },
    });

    revalidatePath("/verification");
    revalidatePath("/admin/verifications");
    revalidatePath("/admin");
    return { success: true };
  } catch {
    return { success: false, error: "申請の送信に失敗しました。" };
  }
}
