"use client";

import { useTransition } from "react";
import type { PaymentMethod, PurchaseStatus } from "@prisma/client";
import {
  confirmPurchasePaymentAction,
  revealPurchaseContactAction,
} from "@/app/(admin)/admin/actions";

/** 購入行の操作ボタン（入金確認・連絡先公開） */
export function PurchaseRowActions({
  purchaseId,
  status,
  paymentMethod,
  contactRevealed,
}: {
  purchaseId: string;
  status: PurchaseStatus;
  paymentMethod: PaymentMethod;
  contactRevealed: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  function run(action: () => Promise<unknown>) {
    startTransition(() => {
      void action();
    });
  }

  // 銀行振込かつ未完了 → 入金確認が必要
  const needsConfirmation =
    paymentMethod === "BANK_TRANSFER" && status === "PENDING";
  // 完了済みだが開示フラグ未設定 → 手動公開が可能
  const canReveal = status === "COMPLETED" && !contactRevealed;

  if (!needsConfirmation && !canReveal) {
    return <span className="text-xs text-gray-400">操作なし</span>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {needsConfirmation && (
        <button
          type="button"
          disabled={isPending}
          onClick={() => run(() => confirmPurchasePaymentAction(purchaseId))}
          className="rounded-lg border border-primary bg-primary px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-primary-hover disabled:opacity-50"
        >
          入金確認
        </button>
      )}
      {canReveal && (
        <button
          type="button"
          disabled={isPending}
          onClick={() => run(() => revealPurchaseContactAction(purchaseId))}
          className="rounded-lg border border-gray-300 px-2.5 py-1 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100 disabled:opacity-50"
        >
          連絡先公開
        </button>
      )}
    </div>
  );
}
