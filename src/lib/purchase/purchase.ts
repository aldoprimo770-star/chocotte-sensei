import { cache } from "react";
import { getDb } from "@/lib/db";

/**
 * 連絡先購入のデータ取得層（サーバー専用）
 *
 * 連絡先の開示可否に関わる重要なロジックのため、
 * 権限判定は必ずこの層とserver action・ページ側で行います。
 */

/** 「有効な」購入（入金確認中 or 完了）を1件取得。無ければ null */
export const getActivePurchase = cache(
  async (studentId: string, teacherId: string) => {
    return getDb().purchase.findFirst({
      where: {
        studentId,
        teacherId,
        status: { in: ["PENDING", "COMPLETED"] },
      },
      orderBy: { createdAt: "desc" },
      select: { id: true, status: true },
    });
  },
);

/** 生徒の購入履歴（新しい順・先生情報付き） */
export async function getStudentPurchases(studentId: string) {
  return getDb().purchase.findMany({
    where: { studentId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      status: true,
      paymentMethod: true,
      amount: true,
      createdAt: true,
      teacher: {
        select: { displayName: true, profileImageUrl: true, slug: true },
      },
    },
  });
}

/**
 * 購入1件を「本人のもの」として取得する（連絡先開示ページ用）。
 * 他人の購入IDを渡しても null になり、連絡先が漏れないようにする。
 * COMPLETED のときのみ連絡先（email/phone等）を含めて返す。
 */
export async function getPurchaseForStudent(
  purchaseId: string,
  studentId: string,
) {
  const purchase = await getDb().purchase.findFirst({
    where: { id: purchaseId, studentId },
    select: {
      id: true,
      status: true,
      paymentMethod: true,
      amount: true,
      bankTransferName: true,
      createdAt: true,
      contactRevealedAt: true,
      teacher: {
        select: {
          slug: true,
          displayName: true,
          profileImageUrl: true,
          // 連絡先（開示は呼び出し側で status を確認してから行う）
          phone: true,
          lineId: true,
          youtubeUrl: true,
          websiteUrl: true,
          snsUrl: true,
          user: { select: { email: true } },
        },
      },
    },
  });

  return purchase;
}
