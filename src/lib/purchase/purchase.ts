import { cache } from "react";
import { getDb } from "@/lib/db";
import {
  ACTIVE_PURCHASE_STATUSES,
  CONTACT_REVEAL_STATUSES,
} from "@/constants/purchase";

/**
 * 連絡先購入のデータ取得層（サーバー専用）
 *
 * 連絡先の開示可否に関わる重要なロジックのため、
 * 権限判定は必ずこの層と server action・ページ側で行います。
 */

/** 「有効な」購入（進行中 or 入金確認済み）を1件取得。無ければ null */
export const getActivePurchase = cache(
  async (studentId: string, teacherId: string) => {
    return getDb().purchase.findFirst({
      where: {
        studentId,
        teacherId,
        status: { in: [...ACTIVE_PURCHASE_STATUSES] },
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
 * 購入1件を「本人のもの」として取得する（購入詳細ページ用）。
 * 他人の購入IDを渡しても null になり、連絡先が漏れないようにする。
 * 連絡先フィールドは呼び出し側で status === PAID を確認してから使うこと。
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
      transferDate: true,
      studentMemo: true,
      paymentReportedAt: true,
      confirmedAt: true,
      createdAt: true,
      contactRevealedAt: true,
      teacher: {
        select: {
          id: true,
          slug: true,
          displayName: true,
          profileImageUrl: true,
          // 連絡先（開示は呼び出し側で PAID を確認してから行う）
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

/** 連絡先を開示してよいか（サーバー側の最終判定） */
export function canRevealContact(status: string): boolean {
  return CONTACT_REVEAL_STATUSES.includes(
    status as (typeof CONTACT_REVEAL_STATUSES)[number],
  );
}
