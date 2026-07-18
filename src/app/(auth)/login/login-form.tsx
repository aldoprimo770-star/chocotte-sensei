"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/schemas/auth.schema";
import { loginAction } from "@/app/(auth)/actions";
import { getLandingPathByRole } from "@/lib/auth/routes";
import { getSafeRedirectPath } from "@/lib/auth/safe-redirect";
import { Button } from "@/components/ui/button";
import { FormField, Input, InputErrorMessage } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * ログインフォーム（クライアントコンポーネント）
 *
 * React Hook Form + Zod でクライアント側の入力チェックを行い、
 * 送信時に Server Action(loginAction) を呼び出します。
 */
export function LoginForm({ callbackUrl }: { callbackUrl?: string }) {
  const router = useRouter();
  // フォーム全体に対するエラー（認証失敗など）
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(values: LoginInput) {
    setFormError(null);
    const result = await loginAction(values);

    if (result.success) {
      router.refresh();
      const redirectTo = getSafeRedirectPath(
        callbackUrl,
        getLandingPathByRole(result.role),
      );
      router.push(redirectTo);
      return;
    }

    setFormError(result.error);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {/* フォーム全体のエラー表示 */}
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
          メールアドレス
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

      <FormField>
        <Label htmlFor="password" required>
          パスワード
        </Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          hasError={!!errors.password}
          placeholder="パスワード"
          {...register("password")}
        />
        <InputErrorMessage message={errors.password?.message} />
        <p className="mt-1.5 text-right">
          <Link
            href="/forgot-password"
            className="text-sm font-medium text-primary hover:underline"
          >
            パスワードを忘れた方はこちら
          </Link>
        </p>
      </FormField>

      <Button type="submit" fullWidth disabled={isSubmitting}>
        {isSubmitting ? "ログイン中..." : "ログイン"}
      </Button>
    </form>
  );
}
