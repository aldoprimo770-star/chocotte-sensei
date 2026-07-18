"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@/schemas/auth.schema";
import { requestPasswordResetAction } from "./actions";
import { Button } from "@/components/ui/button";
import { FormField, Input, InputErrorMessage } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/** パスワード再設定メール送信フォーム */
export function ForgotPasswordForm() {
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  async function onSubmit(values: ForgotPasswordInput) {
    setFormError(null);
    setSuccessMessage(null);

    const result = await requestPasswordResetAction(values);

    if (result.success) {
      setSuccessMessage(
        result.message ??
          "ご入力のメールアドレス宛に、パスワード再設定の案内を送信しました。",
      );
      return;
    }

    setFormError(result.error ?? "送信に失敗しました");
  }

  if (successMessage) {
    return (
      <div className="space-y-4">
        <p className="rounded-xl bg-primary-light px-4 py-3 text-sm text-primary">
          {successMessage}
        </p>
        <p className="text-center text-sm text-muted">
          <Link href="/login" className="font-medium text-primary hover:underline">
            ログイン画面へ戻る
          </Link>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {formError && (
        <p
          role="alert"
          className="rounded-xl bg-accent-light px-4 py-3 text-sm text-accent"
        >
          {formError}
        </p>
      )}

      <FormField>
        <Label htmlFor="email" required>
          登録メールアドレス
        </Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          hasError={!!errors.email}
          placeholder="example@email.com"
          {...register("email")}
        />
        <InputErrorMessage message={errors.email?.message} />
      </FormField>

      <Button type="submit" fullWidth disabled={isSubmitting}>
        {isSubmitting ? "送信中..." : "再設定メールを送信"}
      </Button>
    </form>
  );
}
