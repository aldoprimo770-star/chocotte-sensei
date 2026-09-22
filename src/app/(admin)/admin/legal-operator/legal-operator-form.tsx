"use client";

import { useState, useTransition } from "react";
import type { OperatorLegalInfo } from "@/constants/operator-legal";
import { saveOperatorLegalAction } from "@/app/(admin)/admin/actions";
import { Button } from "@/components/ui/button";

/** 特商法・事業者情報の編集フォーム（管理者専用） */
export function LegalOperatorForm({ initial }: { initial: OperatorLegalInfo }) {
  const [form, setForm] = useState<OperatorLegalInfo>(initial);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function setField<K extends keyof OperatorLegalInfo>(
    key: K,
    value: OperatorLegalInfo[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const result = await saveOperatorLegalAction(form);
      if (result.success) {
        setSuccess("事業者情報を保存しました。公開ページに反映されます。");
        return;
      }
      setError(result.error ?? "保存に失敗しました。");
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field
        label="販売事業者名（正式な氏名）"
        value={form.legalName}
        onChange={(v) => setField("legalName", v)}
        placeholder="戸籍上の氏名"
        hint="サイト名のみでは足りません。特商法ページに表示されます。"
      />
      <Field
        label="公開メールアドレス"
        value={form.email}
        onChange={(v) => setField("email", v)}
        placeholder="例: info@example.com"
        type="email"
        hint="空欄の場合はお問い合わせフォーム案内になります。"
      />
      <Field
        label="住所"
        value={form.address}
        onChange={(v) => setField("address", v)}
        placeholder="請求時開示の場合、一般公開されません"
        hint="一般公開を選んだときだけ /legal 等に表示されます。"
      />
      <Field
        label="電話番号"
        value={form.phone}
        onChange={(v) => setField("phone", v)}
        placeholder="請求時開示の場合、一般公開されません"
        hint="一般公開を選んだときだけ /legal 等に表示されます。"
      />

      <fieldset>
        <legend className="mb-2 block text-sm font-medium text-gray-700">
          住所・電話番号の公開方針
        </legend>
        <label className="mb-2 flex items-start gap-2 text-sm text-gray-700">
          <input
            type="radio"
            className="mt-0.5"
            name="addressPhoneDisclosure"
            checked={form.addressPhoneDisclosure === "on_request"}
            onChange={() => setField("addressPhoneDisclosure", "on_request")}
          />
          <span>
            請求時開示（推奨）
            <span className="mt-0.5 block text-xs text-gray-500">
              一般向けページには実値を出さず、開示請求フォームで個別に案内します。
            </span>
          </span>
        </label>
        <label className="flex items-start gap-2 text-sm text-gray-700">
          <input
            type="radio"
            className="mt-0.5"
            name="addressPhoneDisclosure"
            checked={form.addressPhoneDisclosure === "public"}
            onChange={() => setField("addressPhoneDisclosure", "public")}
          />
          <span>
            一般公開
            <span className="mt-0.5 block text-xs text-gray-500">
              /legal・利用規約などに住所と電話番号が表示されます。
            </span>
          </span>
        </label>
      </fieldset>

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
        {isPending ? "保存中..." : "事業者情報を保存"}
      </Button>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  hint,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        type={type}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      {hint ? <p className="mt-1 text-xs text-gray-500">{hint}</p> : null}
    </div>
  );
}
