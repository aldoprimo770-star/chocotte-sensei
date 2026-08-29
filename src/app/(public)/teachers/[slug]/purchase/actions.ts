"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db";
import { requireRole } from "@/lib/auth/session";
import { getActivePurchase } from "@/lib/purchase/purchase";
import { SITE } from "@/constants/site";
import { formatDate } from "@/lib/date";
import {
  getBankAccountInfo,
  isBankAccountConfigured,
} from "@/lib/settings/bank-account";
import { resolveAdminEmails } from "@/lib/admin/emails";
import { sendPaymentReportedAdminNotification } from "@/lib/email/purchase-email";

/**
 * 連絡先購入の Server Actions（銀行振込のみ）
 *
 * すべて冒頭で「生徒(STUDENT)」であることを検証します。
 * 二重課金を防ぐため、有効な購入（進行中 or 入金確認済み）があれば
 * 新規作成せず既存の購入へ誘導します。
 *
 * 重要: 生徒の操作では絶対に PAID にしない。
 */

/** 購入アクションの戻り値 */
export type PurchaseActionResult =
  | { success: true; purchaseId: string; alreadyOwned: boolean }
  | { success: false; error: string };

/** 購入対象の先生が「公開中・承認済み」であることを確認する */
async function assertPurchasableTeacher(
  teacherId: string,
): Promise<{ ok: boolean }> {
  const teacher = await getDb().teacherProfile.findFirst({
    where: { id: teacherId, isPublic: true, status: "APPROVED" },
    select: { id: true },
  });
  return { ok: Boolean(teacher) };
}

/**
 * 銀行振込での購入手続きを開始する（PENDING_PAYMENT）。
 * この時点では連絡先は開示しない。
 */
export async function startBankTransferPurchaseAction(
  teacherId: string,
): Promise<PurchaseActionResult> {
  const session = await requireRole("STUDENT");
  const studentId = session.user.id;

  const { ok } = await assertPurchasableTeacher(teacherId);
  if (!ok) {
    return { success: false, error: "この先生は現在購入できません。" };
  }

  const bank = await getBankAccountInfo();
  if (!isBankAccountConfigured(bank)) {
    return {
      success: false,
      error:
        "現在、振込先口座の準備中です。しばらくしてから再度お試しください。",
    };
  }

  const active = await getActivePurchase(studentId, teacherId);
  if (active) {
    return {
      success: true,
      purchaseId: active.id,
      alreadyOwned: active.status === "PAID",
    };
  }

  try {
    const purchase = await getDb().purchase.create({
      data: {
        studentId,
        teacherId,
        amount: SITE.contactPrice,
        paymentMethod: "BANK_TRANSFER",
        status: "PENDING_PAYMENT",
      },
      select: { id: true },
    });

    revalidatePath("/mypage/purchases");
    revalidatePath("/admin/purchases");
    revalidatePath("/admin");

    return { success: true, purchaseId: purchase.id, alreadyOwned: false };
  } catch {
    return { success: false, error: "申し込み処理中にエラーが発生しました。" };
  }
}

/**
 * 生徒が「振込しました」を報告する（PAYMENT_REPORTED）。
 * この時点でも連絡先は開示しない。
 */
export async function reportBankTransferPaymentAction(
  purchaseId: string,
  input: {
    bankTransferName: string;
    transferDate: string;
    studentMemo?: string;
  },
): Promise<PurchaseActionResult> {
  const session = await requireRole("STUDENT");
  const studentId = session.user.id;

  const name = input.bankTransferName.trim().slice(0, 80);
  if (!name) {
    return { success: false, error: "振込名義を入力してください。" };
  }

  const transferDateRaw = input.transferDate.trim();
  if (!transferDateRaw) {
    return { success: false, error: "振込日を入力してください。" };
  }
  const transferDate = new Date(`${transferDateRaw}T00:00:00+09:00`);
  if (Number.isNaN(transferDate.getTime())) {
    return { success: false, error: "振込日の形式が正しくありません。" };
  }

  const memo = input.studentMemo?.trim().slice(0, 500) || null;

  const purchase = await getDb().purchase.findFirst({
    where: { id: purchaseId, studentId },
    select: {
      id: true,
      status: true,
      amount: true,
      teacher: { select: { displayName: true } },
      student: {
        select: {
          email: true,
          studentProfile: { select: { displayName: true } },
        },
      },
    },
  });

  if (!purchase) {
    return { success: false, error: "購入情報が見つかりません。" };
  }

  if (purchase.status === "PAID") {
    return { success: true, purchaseId: purchase.id, alreadyOwned: true };
  }

  if (purchase.status === "CANCELLED") {
    return { success: false, error: "この購入はキャンセル済みです。" };
  }

  if (
    purchase.status !== "PENDING_PAYMENT" &&
    purchase.status !== "PAYMENT_REPORTED"
  ) {
    return { success: false, error: "この購入では振込報告できません。" };
  }

  try {
    await getDb().purchase.update({
      where: { id: purchase.id },
      data: {
        status: "PAYMENT_REPORTED",
        bankTransferName: name,
        transferDate,
        studentMemo: memo,
        paymentReportedAt: new Date(),
        // 絶対に PAID / contactRevealedAt にしない
      },
    });

    // 管理者通知（失敗しても購入報告自体は成功扱い）
    try {
      const adminEmails = await resolveAdminEmails();
      if (adminEmails.length > 0) {
        await sendPaymentReportedAdminNotification(adminEmails, {
          purchaseId: purchase.id,
          studentName:
            purchase.student.studentProfile?.displayName ?? "（未設定）",
          studentEmail: purchase.student.email,
          teacherName: purchase.teacher.displayName,
          amount: purchase.amount,
          bankTransferName: name,
          transferDateLabel: formatDate(transferDate),
          studentMemo: memo,
        });
      }
    } catch (err) {
      console.error("[purchase] admin notification failed", err);
    }

    revalidatePath(`/mypage/purchases/${purchase.id}`);
    revalidatePath("/mypage/purchases");
    revalidatePath("/admin/purchases");
    revalidatePath("/admin");

    return { success: true, purchaseId: purchase.id, alreadyOwned: false };
  } catch {
    return { success: false, error: "振込報告の保存に失敗しました。" };
  }
}
