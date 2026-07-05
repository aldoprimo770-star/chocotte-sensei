"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  purchaseWithPayPalAction,
  purchaseWithBankTransferAction,
} from "./actions";
import { Button } from "@/components/ui/button";
import { FormField, Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Method = "PAYPAL" | "BANK_TRANSFER";

/**
 * 購入パネル（クライアントコンポーネント）
 * 支払い方法を選択して購入アクションを呼び出し、
 * 成功したら購入詳細（連絡先 or 入金確認中）へ遷移します。
 */
export function PurchasePanel({
  teacherId,
  price,
  paypalTestMode,
}: {
  teacherId: string;
  price: number;
  paypalTestMode: boolean;
}) {
  const router = useRouter();
  const [method, setMethod] = useState<Method>("PAYPAL");
  const [bankName, setBankName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    setError(null);
    setIsSubmitting(true);
    try {
      const result =
        method === "PAYPAL"
          ? await purchaseWithPayPalAction(teacherId)
          : await purchaseWithBankTransferAction(teacherId, bankName);

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

  return (
    <div className="space-y-5">
      <fieldset className="space-y-3">
        <legend className="mb-1 text-sm font-medium text-foreground">
          支払い方法を選択
        </legend>

        <MethodOption
          checked={method === "PAYPAL"}
          onChange={() => setMethod("PAYPAL")}
          title="PayPal"
          description={
            paypalTestMode
              ? "テストモードで動作します（実際の請求は発生しません）"
              : "クレジットカード・PayPal残高でお支払い"
          }
        />
        <MethodOption
          checked={method === "BANK_TRANSFER"}
          onChange={() => setMethod("BANK_TRANSFER")}
          title="銀行振込"
          description="お申し込み後、入金確認ができ次第、連絡先を開示します"
        />
      </fieldset>

      {method === "BANK_TRANSFER" && (
        <FormField>
          <Label htmlFor="bankName">振込名義（任意）</Label>
          <Input
            id="bankName"
            type="text"
            placeholder="ヤマダ タロウ"
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
          />
        </FormField>
      )}

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
          : method === "PAYPAL"
            ? `PayPalで支払う（¥${price.toLocaleString()}）`
            : "銀行振込で申し込む"}
      </Button>
    </div>
  );
}

/** 支払い方法の選択カード */
function MethodOption({
  checked,
  onChange,
  title,
  description,
}: {
  checked: boolean;
  onChange: () => void;
  title: string;
  description: string;
}) {
  return (
    <label
      className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors ${
        checked
          ? "border-primary bg-primary-light"
          : "border-border hover:border-primary/40"
      }`}
    >
      <input
        type="radio"
        name="paymentMethod"
        checked={checked}
        onChange={onChange}
        className="mt-1 accent-[var(--color-primary)]"
      />
      <span>
        <span className="block font-medium text-foreground">{title}</span>
        <span className="block text-sm text-muted">{description}</span>
      </span>
    </label>
  );
}
