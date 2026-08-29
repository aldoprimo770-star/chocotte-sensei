"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { startBankTransferPurchaseAction } from "./actions";
import { Button } from "@/components/ui/button";

/**
 * 銀行振込での購入手続き開始パネル。
 * PayPal / テストモード即時完了は含まない。
 */
export function PurchasePanel({
  teacherId,
  price,
  bankConfigured,
}: {
  teacherId: string;
  price: number;
  bankConfigured: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    setError(null);
    setIsSubmitting(true);
    try {
      const result = await startBankTransferPurchaseAction(teacherId);
      if (result.success) {
        router.push(`/mypage/purchases/${result.purchaseId}`);
        router.refresh();
        return;
      }
      setError(result.error);
    } catch {
      setError("処理に失敗しました。時間をおいてお試しください。");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!bankConfigured) {
    return (
      <p className="text-sm text-muted" role="status">
        現在、振込先口座の準備中です。しばらくしてから再度お試しください。
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        「銀行振込で購入する」を押すと、振込先口座と金額が表示されます。
        振込後に「振込しました」を報告してください。運営が入金を確認するまで連絡先は表示されません。
      </p>

      {error && (
        <p
          role="alert"
          className="rounded-xl bg-accent-light px-4 py-3 text-sm text-accent"
        >
          {error}
        </p>
      )}

      <Button
        type="button"
        fullWidth
        size="lg"
        onClick={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting
          ? "処理中..."
          : `銀行振込で購入する（¥${price.toLocaleString()}）`}
      </Button>
    </div>
  );
}
