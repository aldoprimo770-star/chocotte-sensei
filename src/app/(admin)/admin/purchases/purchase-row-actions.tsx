"use client";

import { useTransition } from "react";
import type { PurchaseStatus } from "@prisma/client";
import {
  confirmPurchasePaymentAction,
  revealPurchaseContactAction,
} from "@/app/(admin)/admin/actions";

/** 購入行の操作ボタン（入金確認・連絡先公開） */
export function PurchaseRowActions({
  purchaseId,
  status,
  contactRevealed,
}: {
  purchaseId: string;
  status: PurchaseStatus;
  contactRevealed: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  function run(action: () => Promise<unknown>) {
    startTransition(() => {
      void action();
    });
  }

  const needsConfirmation =
    status === "PAYMENT_REPORTED" || status === "PENDING_PAYMENT";
  const canReveal = status === "PAID" && !contactRevealed;

  if (!needsConfirmation && !canReveal) {
    return <span className="text-xs text-gray-400">操作なし</span>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {needsConfirmation && (
        <button
          type="button"
          disabled={isPending}
          onClick={() => {
            if (
              !window.confirm(
                "銀行口座への入金を確認しましたか？「入金確認済み」にすると生徒に連絡先が表示されます。",
              )
            ) {
              return;
            }
            run(() => confirmPurchasePaymentAction(purchaseId));
          }}
          className="rounded-lg border border-primary bg-primary px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-primary-hover disabled:opacity-50"
        >
          入金確認済みにする
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
