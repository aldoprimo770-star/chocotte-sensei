import type { PaymentMethod, PurchaseStatus } from "@prisma/client";

/** 支払い方法の表示ラベル */
export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  PAYPAL: "PayPal",
  BANK_TRANSFER: "銀行振込",
};

/** 購入ステータスの表示ラベルと配色 */
export const PURCHASE_STATUS_LABELS: Record<
  PurchaseStatus,
  { label: string; className: string }
> = {
  PENDING: { label: "入金確認中", className: "bg-secondary-light text-foreground" },
  COMPLETED: { label: "完了", className: "bg-primary-light text-primary" },
  FAILED: { label: "失敗", className: "bg-accent-light text-accent" },
  REFUNDED: { label: "返金済み", className: "bg-gray-100 text-gray-600" },
};
