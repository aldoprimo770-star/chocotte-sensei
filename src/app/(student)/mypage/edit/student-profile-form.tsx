"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  studentProfileSchema,
  type StudentProfileFormInput,
  type StudentProfileFormValues,
} from "@/schemas/student.schema";
import { saveStudentProfileAction } from "@/app/(student)/mypage/actions";
import { PREFECTURES } from "@/constants/prefectures";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { FormField, Input, InputErrorMessage } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface StudentProfileFormProps {
  defaultValues: StudentProfileFormInput;
  categories: ReadonlyArray<{ id: string; name: string }>;
}

/**
 * 生徒プロフィール編集フォーム
 * 先生フォームと同じ設計方針（RHF + Zod、送信は生値→サーバー再検証）です。
 */
export function StudentProfileForm({
  defaultValues,
  categories,
}: StudentProfileFormProps) {
  const router = useRouter();
  const [formMessage, setFormMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    getValues,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<StudentProfileFormInput, unknown, StudentProfileFormValues>({
    resolver: zodResolver(studentProfileSchema),
    defaultValues,
  });

  const avatarUrl = watch("avatarUrl")?.trim();

  const onSubmit = handleSubmit(async () => {
    setFormMessage(null);
    const raw = getValues();
    const result = await saveStudentProfileAction(raw);

    if (result.success) {
      setFormMessage({ type: "success", text: "プロフィールを保存しました" });
      router.refresh();
      return;
    }

    if (result.fieldErrors) {
      for (const [field, message] of Object.entries(result.fieldErrors)) {
        setError(field as keyof StudentProfileFormInput, { message });
      }
    }
    setFormMessage({
      type: "error",
      text: result.error ?? "保存に失敗しました",
    });
  });

  return (
    <form onSubmit={onSubmit} className="space-y-8" noValidate>
      {formMessage && (
        <p
          role="alert"
          className={
            formMessage.type === "error"
              ? "rounded-xl bg-accent-light px-4 py-3 text-sm text-accent"
              : "rounded-xl bg-primary-light px-4 py-3 text-sm text-primary"
          }
        >
          {formMessage.text}
        </p>
      )}

      {/* 基本情報 */}
      <Card>
        <CardHeader>
          <CardTitle>基本情報</CardTitle>
        </CardHeader>
        <div className="space-y-5">
          <FormField>
            <Label htmlFor="avatarUrl">プロフィール画像（画像URL・任意）</Label>
            {avatarUrl && (
              // 外部の任意URLを表示するため next/image ではなく img を使用
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt="プロフィール画像プレビュー"
                className="mb-3 h-24 w-24 rounded-full border border-border object-cover"
              />
            )}
            <Input
              id="avatarUrl"
              type="url"
              placeholder="https://example.com/avatar.jpg"
              hasError={!!errors.avatarUrl}
              {...register("avatarUrl")}
            />
            <InputErrorMessage message={errors.avatarUrl?.message} />
          </FormField>

          <FormField>
            <Label htmlFor="displayName" required>
              表示名（ニックネーム）
            </Label>
            <Input
              id="displayName"
              type="text"
              hasError={!!errors.displayName}
              {...register("displayName")}
            />
            <InputErrorMessage message={errors.displayName?.message} />
          </FormField>

          <FormField>
            <Label htmlFor="prefecture" required>
              居住都道府県
            </Label>
            <Select
              id="prefecture"
              hasError={!!errors.prefecture}
              {...register("prefecture")}
            >
              <option value="">選択してください</option>
              {PREFECTURES.map((pref) => (
                <option key={pref} value={pref}>
                  {pref}
                </option>
              ))}
            </Select>
            <InputErrorMessage message={errors.prefecture?.message} />
          </FormField>

          <FormField>
            <Label htmlFor="bio">自己紹介（任意・1000文字以内）</Label>
            <Textarea
              id="bio"
              rows={5}
              hasError={!!errors.bio}
              {...register("bio")}
            />
            <InputErrorMessage message={errors.bio?.message} />
          </FormField>
        </div>
      </Card>

      {/* 興味・希望 */}
      <Card>
        <CardHeader>
          <CardTitle>興味・希望</CardTitle>
        </CardHeader>
        <div className="space-y-6">
          <div>
            <Label>興味のあるカテゴリー（複数選択可）</Label>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Checkbox
                  key={category.id}
                  label={category.name}
                  value={category.id}
                  {...register("interestCategoryIds")}
                />
              ))}
            </div>
            <InputErrorMessage message={errors.interestCategoryIds?.message} />
          </div>

          <div>
            <Checkbox
              label="オンラインレッスンを希望する"
              {...register("isOnlinePreferred")}
            />
          </div>
        </div>
      </Card>

      {/* アクション */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? "保存中..." : "保存する"}
        </Button>
        <Link
          href="/mypage"
          className="text-sm font-medium text-primary hover:underline sm:ml-auto"
        >
          マイページに戻る
        </Link>
      </div>
    </form>
  );
}
