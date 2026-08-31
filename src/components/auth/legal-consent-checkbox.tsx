"use client";

import Link from "next/link";
import { InputErrorMessage } from "@/components/ui/input";

/**
 * 会員登録・再同意用の「利用規約・プライバシーポリシーに同意する」チェック
 */
export function LegalConsentCheckbox({
  checked,
  onChange,
  error,
  id = "agreeLegal",
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
  id?: string;
}) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground"
      >
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 rounded border-border text-primary focus:ring-primary"
        />
        <span>
          <Link
            href="/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            利用規約
          </Link>
          と
          <Link
            href="/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            プライバシーポリシー
          </Link>
          に同意する
          <span className="text-accent"> *</span>
        </span>
      </label>
      <InputErrorMessage message={error} />
    </div>
  );
}
