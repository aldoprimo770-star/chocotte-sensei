"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  verificationSchema,
  type VerificationInput,
  type VerificationValues,
} from "@/schemas/verification.schema";
import { submitVerificationAction } from "./actions";
import { DOCUMENT_TYPE_OPTIONS } from "@/constants/verification";
import { Button } from "@/components/ui/button";
import { FormField, Input, InputErrorMessage } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

/**
 * 本人確認 申請フォーム（新規 / 再申請 共通）
 */
export function VerificationForm({
  defaultValues,
  submitLabel = "申請する",
}: {
  defaultValues?: Partial<VerificationInput>;
  submitLabel?: string;
}) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  // 入力型(Input)と変換後の型(Values)を明示。送信は生の入力値(getValues)を渡す。
  const {
    register,
    handleSubmit,
    getValues,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<VerificationInput, unknown, VerificationValues>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      documentType: defaultValues?.documentType,
      documentUrl: defaultValues?.documentUrl ?? "",
      note: defaultValues?.note ?? "",
    },
  });

  async function submit() {
    setFormError(null);
    const result = await submitVerificationAction(getValues());

    if (result.success) {
      router.refresh();
      return;
    }
    if (result.fieldErrors) {
      for (const [field, message] of Object.entries(result.fieldErrors)) {
        setError(field as keyof VerificationInput, { message });
      }
    }
    setFormError(result.error ?? "送信に失敗しました。");
  }

  return (
    <form onSubmit={handleSubmit(() => submit())} className="space-y-5" noValidate>
      {formError && (
        <p
          role="alert"
          className="rounded-xl bg-accent-light px-4 py-3 text-sm text-accent"
        >
          {formError}
        </p>
      )}

      <FormField>
        <Label htmlFor="documentType" required>
          本人確認書類の種類
        </Label>
        <Select
          id="documentType"
          hasError={!!errors.documentType}
          {...register("documentType")}
        >
          <option value="" disabled>
            選択してください
          </option>
          {DOCUMENT_TYPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
        <InputErrorMessage message={errors.documentType?.message} />
      </FormField>

      <FormField>
        <Label htmlFor="documentUrl" required>
          書類画像のURL
        </Label>
        <Input
          id="documentUrl"
          type="url"
          placeholder="https://example.com/id.jpg"
          hasError={!!errors.documentUrl}
          {...register("documentUrl")}
        />
        <InputErrorMessage message={errors.documentUrl?.message} />
        <p className="mt-1.5 text-xs text-muted">
          提出画像は管理者のみが確認します。公開ページには表示されません。
        </p>
      </FormField>

      <FormField>
        <Label htmlFor="note">備考（任意）</Label>
        <Textarea
          id="note"
          rows={3}
          placeholder="補足事項があればご記入ください"
          hasError={!!errors.note}
          {...register("note")}
        />
        <InputErrorMessage message={errors.note?.message} />
      </FormField>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "送信中..." : submitLabel}
      </Button>
    </form>
  );
}
