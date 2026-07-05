"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  teacherRegisterSchema,
  type TeacherRegisterInput,
} from "@/schemas/auth.schema";
import { registerTeacherAction } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { FormField, Input, InputErrorMessage } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * 先生 新規登録フォーム（クライアントコンポーネント）
 *
 * React Hook Form + Zod でリアルタイムに入力チェックし、
 * 送信時に Server Action(registerTeacherAction) を呼び出します。
 * メール重複などサーバー側でしか分からないエラーは formError に表示します。
 */
export function TeacherRegisterForm() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TeacherRegisterInput>({
    resolver: zodResolver(teacherRegisterSchema),
  });

  async function onSubmit(values: TeacherRegisterInput) {
    setFormError(null);
    const result = await registerTeacherAction(values);

    if (result.success) {
      router.refresh();
      router.push("/dashboard");
      return;
    }

    setFormError(result.error);
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
        <Label htmlFor="displayName" required>
          お名前（表示名）
        </Label>
        <Input
          id="displayName"
          type="text"
          autoComplete="name"
          hasError={!!errors.displayName}
          placeholder="山田 太郎"
          {...register("displayName")}
        />
        <InputErrorMessage message={errors.displayName?.message} />
      </FormField>

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
          autoComplete="new-password"
          hasError={!!errors.password}
          placeholder="8文字以上（英字・数字を含む）"
          {...register("password")}
        />
        <InputErrorMessage message={errors.password?.message} />
      </FormField>

      <FormField>
        <Label htmlFor="passwordConfirm" required>
          パスワード（確認）
        </Label>
        <Input
          id="passwordConfirm"
          type="password"
          autoComplete="new-password"
          hasError={!!errors.passwordConfirm}
          placeholder="もう一度入力してください"
          {...register("passwordConfirm")}
        />
        <InputErrorMessage message={errors.passwordConfirm?.message} />
      </FormField>

      <Button type="submit" fullWidth disabled={isSubmitting}>
        {isSubmitting ? "登録中..." : "先生登録（無料）"}
      </Button>
    </form>
  );
}
