"use client";

import { useState, useTransition } from "react";
import type { BankAccountInfo } from "@/constants/bank-transfer";
import { BANK_ACCOUNT_TYPES } from "@/constants/bank-transfer";
import { saveBankAccountAction } from "@/app/(admin)/admin/actions";
import { Button } from "@/components/ui/button";

/** 振込先口座の編集フォーム（管理者専用） */
export function BankAccountForm({ initial }: { initial: BankAccountInfo }) {
  const [form, setForm] = useState<BankAccountInfo>(initial);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function setField<K extends keyof BankAccountInfo>(
    key: K,
    value: BankAccountInfo[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const result = await saveBankAccountAction(form);
      if (result.success) {
        setSuccess("振込先口座を保存しました。今後の新規購入に反映されます。");
        return;
      }
      setError(result.error ?? "保存に失敗しました。");
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field
        label="銀行名"
        value={form.bankName}
        onChange={(v) => setField("bankName", v)}
        placeholder="○○銀行"
        required
      />
      <Field
        label="支店名"
        value={form.branchName}
        onChange={(v) => setField("branchName", v)}
        placeholder="○○支店"
        required
      />

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          口座種別
        </label>
        <select
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          value={form.accountType}
          onChange={(e) => setField("accountType", e.target.value)}
          required
        >
          {BANK_ACCOUNT_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <Field
        label="口座番号"
        value={form.accountNumber}
        onChange={(v) => setField("accountNumber", v)}
        placeholder="1234567"
        required
      />
      <Field
        label="口座名義"
        value={form.accountHolder}
        onChange={(v) => setField("accountHolder", v)}
        placeholder="チョコットセンセイ ○○○○"
        required
      />

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          振込名義についての説明
        </label>
        <textarea
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          rows={3}
          value={form.remitterNote}
          onChange={(e) => setField("remitterNote", e.target.value)}
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
      {success && (
        <p role="status" className="text-sm text-emerald-700">
          {success}
        </p>
      )}

      <Button type="submit" disabled={isPending}>
        {isPending ? "保存中..." : "口座情報を保存"}
      </Button>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        type="text"
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
      />
    </div>
  );
}
