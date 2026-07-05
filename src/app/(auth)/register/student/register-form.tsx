"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  studentRegisterSchema,
  type StudentRegisterInput,
} from "@/schemas/student.schema";
import { registerStudentAction } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { FormField, Input, InputErrorMessage } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * 生徒 新規登録フォーム（クライアントコンポーネント）
 * 先生登録フォームと同じ構成で、送信先の Server Action のみ異なります。
 */
export function StudentRegisterForm() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<StudentRegisterInput>({
    resolver: zodResolver(studentRegisterSchema),
  });

  async function onSubmit(values: StudentRegisterInput) {
    setFormError(null);
    const result = await registerStudentAction(values);

    if (result.success) {
      router.refresh();
      router.push("/mypage");
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
          表示名（ニックネーム）
        </Label>
        <Input
          id="displayName"
          type="text"
          autoComplete="nickname"
          hasError={!!errors.displayName}
          placeholder="ちょこ"
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
          パスワード(確認)
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
        {isSubmitting ? "登録中..." : "会員登録（無料）"}
      </Button>
    </form>
  );
}
