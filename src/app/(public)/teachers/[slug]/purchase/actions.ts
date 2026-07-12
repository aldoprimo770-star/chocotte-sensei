"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db";
import { requireRole } from "@/lib/auth/session";
import { getActivePurchase } from "@/lib/purchase/purchase";
import { SITE } from "@/constants/site";

/**
 * 連絡先購入の Server Actions
 *
 * すべて冒頭で「生徒(STUDENT)」であることを検証します。
 * 二重課金を防ぐため、有効な購入（入金確認中 or 完了）があれば
 * 新規作成せず既存の購入へ誘導します。
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

/** PayPal で連絡先を購入する（テストモードでは即時完了） */
export async function purchaseWithPayPalAction(
  teacherId: string,
): Promise<PurchaseActionResult> {
  const session = await requireRole("STUDENT");
  const studentId = session.user.id;

  const { ok } = await assertPurchasableTeacher(teacherId);
  if (!ok) {
    return { success: false, error: "この先生は現在購入できません。" };
  }

  // 既に有効な購入があればそれを再利用（二重課金防止）
  const active = await getActivePurchase(studentId, teacherId);
  if (active) {
    return {
      success: true,
      purchaseId: active.id,
      alreadyOwned: active.status === "COMPLETED",
    };
  }

  try {
    const { createOrder, captureOrder } = await import("@/lib/payments/paypal");

    // 1) 注文作成 → 2) 購入レコードを PENDING で作成 → 3) capture → 完了
    const order = await createOrder({
      amount: SITE.contactPrice,
      referenceId: teacherId,
    });

    const purchase = await getDb().purchase.create({
      data: {
        studentId,
        teacherId,
        amount: SITE.contactPrice,
        paymentMethod: "PAYPAL",
        status: "PENDING",
        paypalOrderId: order.orderId,
      },
      select: { id: true },
    });

    const capture = await captureOrder(order.orderId);

    if (!capture.ok) {
      await getDb().purchase.update({
        where: { id: purchase.id },
        data: { status: "FAILED" },
      });
      return {
        success: false,
        error: "決済を完了できませんでした。時間をおいてお試しください。",
      };
    }

    await getDb().purchase.update({
      where: { id: purchase.id },
      data: { status: "COMPLETED", contactRevealedAt: new Date() },
    });

    revalidatePath("/mypage/purchases");
    revalidatePath("/admin/purchases");
    revalidatePath("/admin");

    return { success: true, purchaseId: purchase.id, alreadyOwned: false };
  } catch {
    return {
      success: false,
      error: "決済処理中にエラーが発生しました。",
    };
  }
}

/** 銀行振込で連絡先を購入する（入金確認まで PENDING） */
export async function purchaseWithBankTransferAction(
  teacherId: string,
  bankTransferName: string,
): Promise<PurchaseActionResult> {
  const session = await requireRole("STUDENT");
  const studentId = session.user.id;

  const { ok } = await assertPurchasableTeacher(teacherId);
  if (!ok) {
    return { success: false, error: "この先生は現在購入できません。" };
  }

  const active = await getActivePurchase(studentId, teacherId);
  if (active) {
    return {
      success: true,
      purchaseId: active.id,
      alreadyOwned: active.status === "COMPLETED",
    };
  }

  const name = bankTransferName.trim().slice(0, 50);

  try {
    const purchase = await getDb().purchase.create({
      data: {
        studentId,
        teacherId,
        amount: SITE.contactPrice,
        paymentMethod: "BANK_TRANSFER",
        status: "PENDING",
        bankTransferName: name || null,
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
