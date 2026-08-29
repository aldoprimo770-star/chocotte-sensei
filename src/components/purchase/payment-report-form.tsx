"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { reportBankTransferPaymentAction } from "@/app/(public)/teachers/[slug]/purchase/actions";
import { Button } from "@/components/ui/button";
import { FormField, Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

/**
 * 「振込しました」報告フォーム。
 * 成功しても連絡先は表示されない（管理者が PAID にするまで待つ）。
 */
export function PaymentReportForm({
  purchaseId,
  defaultName,
}: {
  purchaseId: string;
  defaultName?: string | null;
}) {
  const router = useRouter();
  const [bankTransferName, setBankTransferName] = useState(defaultName ?? "");
  const [transferDate, setTransferDate] = useState(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  });
  const [studentMemo, setStudentMemo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const result = await reportBankTransferPaymentAction(purchaseId, {
        bankTransferName,
        transferDate,
        studentMemo,
      });
      if (result.success) {
        router.refresh();
        return;
      }
      setError(result.error);
    } catch {
      setError("報告に失敗しました。時間をおいてお試しください。");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField>
        <Label htmlFor="bankTransferName">実際に振り込んだ名義（必須）</Label>
        <Input
          id="bankTransferName"
          type="text"
          required
          maxLength={80}
          placeholder="ヤマダ タロウ"
          value={bankTransferName}
          onChange={(e) => setBankTransferName(e.target.value)}
        />
        <p className="mt-1 text-xs text-muted">
          通帳やアプリに表示される名義をそのまま入力してください。
        </p>
      </FormField>

      <FormField>
        <Label htmlFor="transferDate">振込日（必須）</Label>
        <Input
          id="transferDate"
          type="date"
          required
          value={transferDate}
          onChange={(e) => setTransferDate(e.target.value)}
        />
      </FormField>

      <FormField>
        <Label htmlFor="studentMemo">メモ（任意）</Label>
        <Textarea
          id="studentMemo"
          rows={3}
          maxLength={500}
          placeholder="例: ○○銀行から振込ました"
          value={studentMemo}
          onChange={(e) => setStudentMemo(e.target.value)}
        />
      </FormField>

      {error && (
        <p
          role="alert"
          className="rounded-xl bg-accent-light px-4 py-3 text-sm text-accent"
        >
          {error}
        </p>
      )}

      <Button type="submit" fullWidth size="lg" disabled={isSubmitting}>
        {isSubmitting ? "送信中..." : "振込しました"}
      </Button>

      <p className="text-center text-xs text-muted">
        このボタンを押しただけでは連絡先は表示されません。入金確認後に表示されます。
      </p>
    </form>
  );
}
