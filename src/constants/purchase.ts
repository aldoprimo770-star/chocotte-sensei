import type { PaymentMethod, PurchaseStatus } from "@prisma/client";

/** 支払い方法の表示ラベル */
export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  PAYPAL: "PayPal（旧）",
  BANK_TRANSFER: "銀行振込",
};

/** 購入ステータスの表示ラベルと配色 */
export const PURCHASE_STATUS_LABELS: Record<
  PurchaseStatus,
  { label: string; className: string }
> = {
  PENDING_PAYMENT: {
    label: "入金待ち",
    className: "bg-secondary-light text-foreground",
  },
  PAYMENT_REPORTED: {
    label: "入金確認待ち",
    className: "bg-amber-100 text-amber-800",
  },
  PAID: {
    label: "入金確認済み",
    className: "bg-primary-light text-primary",
  },
  CANCELLED: {
    label: "キャンセル",
    className: "bg-gray-100 text-gray-600",
  },
};

/** 連絡先を開示してよいステータス */
export const CONTACT_REVEAL_STATUSES: ReadonlyArray<PurchaseStatus> = ["PAID"];

/** 新規購入をブロックする（進行中 or 完了）ステータス */
export const ACTIVE_PURCHASE_STATUSES: ReadonlyArray<PurchaseStatus> = [
  "PENDING_PAYMENT",
  "PAYMENT_REPORTED",
  "PAID",
];
