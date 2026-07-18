"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  resetPasswordSchema,
  type ResetPasswordInput,
} from "@/schemas/auth.schema";
import { resetPasswordAction } from "./actions";
import { Button } from "@/components/ui/button";
import { FormField, Input, InputErrorMessage } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/** 新しいパスワード設定フォーム */
export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token },
  });

  async function onSubmit(values: ResetPasswordInput) {
    setFormError(null);
    const result = await resetPasswordAction(values);

    if (result.success) {
      router.push("/login?reset=success");
      return;
    }

    if (result.fieldErrors) {
      for (const [field, message] of Object.entries(result.fieldErrors)) {
        setError(field as keyof ResetPasswordInput, { message });
      }
    }
    setFormError(result.error ?? "パスワードの更新に失敗しました");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <input type="hidden" {...register("token")} />

      {formError && (
        <p
          role="alert"
          className="rounded-xl bg-accent-light px-4 py-3 text-sm text-accent"
        >
          {formError}
        </p>
      )}

      <FormField>
        <Label htmlFor="password" required>
          新しいパスワード
        </Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          hasError={!!errors.password}
          placeholder="8文字以上・英字と数字を含む"
          {...register("password")}
        />
        <InputErrorMessage message={errors.password?.message} />
      </FormField>

      <FormField>
        <Label htmlFor="passwordConfirm" required>
          新しいパスワード（確認）
        </Label>
        <Input
          id="passwordConfirm"
          type="password"
          autoComplete="new-password"
          hasError={!!errors.passwordConfirm}
          placeholder="もう一度入力"
          {...register("passwordConfirm")}
        />
        <InputErrorMessage message={errors.passwordConfirm?.message} />
      </FormField>

      <Button type="submit" fullWidth disabled={isSubmitting}>
        {isSubmitting ? "更新中..." : "パスワードを更新する"}
      </Button>

      <p className="text-center text-sm text-muted">
        <Link
          href="/forgot-password"
          className="font-medium text-primary hover:underline"
        >
          再設定メールを再送する
        </Link>
      </p>
    </form>
  );
}
