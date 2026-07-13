"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  teacherProfileDraftSchema,
  type TeacherProfileFormInput,
  type TeacherProfileFormValues,
} from "@/schemas/teacher.schema";
import {
  saveTeacherProfileAction,
  type SaveMode,
} from "@/app/(teacher)/profile/actions";
import { calculateProfileCompletion } from "@/lib/teacher/profile-completion";
import {
  SKILL_LEVEL_OPTIONS,
  TARGET_AGE_OPTIONS,
} from "@/constants/teacher";
import { PREFECTURES } from "@/constants/prefectures";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { FormField, Input, InputErrorMessage } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CompletionBar } from "@/components/teacher/completion-bar";
import { ProfileImageUpload } from "@/components/teacher/profile-image-upload";

interface ProfileFormProps {
  /** フォーム初期値 */
  defaultValues: TeacherProfileFormInput;
  /** カテゴリー選択肢 */
  categories: ReadonlyArray<{ id: string; name: string }>;
}

/**
 * 先生プロフィール編集フォーム
 *
 * React Hook Form + Zod でクライアント検証し、
 * 「下書き保存」「公開する」で Server Action を呼び分けます。
 * 公開に必要な必須項目チェックはサーバー側が最終判定し、
 * 返ってきたエラーを各フィールドに反映します。
 */
export function ProfileForm({ defaultValues, categories }: ProfileFormProps) {
  const router = useRouter();
  const [formMessage, setFormMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  // 入力型(Input) と 変換後の型(Values) を明示。
  // resolver は検証のみに使い、送信時は生の入力値(getValues)をサーバーへ渡す。
  const {
    register,
    control,
    handleSubmit,
    watch,
    getValues,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<TeacherProfileFormInput, unknown, TeacherProfileFormValues>({
    resolver: zodResolver(teacherProfileDraftSchema),
    defaultValues,
  });

  // 入力状況に応じて完成率をリアルタイム計算
  const values = watch();
  const livePercent = calculateProfileCompletion({
    profileImageUrl: values.profileImageUrl,
    catchphrase: values.catchphrase,
    bio: values.bio,
    lessonContent: values.lessonContent,
    priceMin:
      typeof values.priceMin === "string" && values.priceMin.trim() !== ""
        ? Number(values.priceMin)
        : null,
    isOnline: !!values.isOnline,
    categoryCount: values.categoryIds?.length ?? 0,
    areaCount: values.prefectures?.length ?? 0,
    targetAgeCount: values.targetAges?.length ?? 0,
    skillLevelCount: values.skillLevels?.length ?? 0,
  });

  async function submit(mode: SaveMode) {
    setFormMessage(null);
    // getValues() は変換前の生の入力値を返す。
    // サーバー側で改めて検証・変換するため、ここでは生値をそのまま送る。
    const raw = getValues();
    const result = await saveTeacherProfileAction(raw, mode);

    if (result.success) {
      setFormMessage({
        type: "success",
        text:
          mode === "publish"
            ? "プロフィールを公開しました"
            : "下書きを保存しました",
      });
      router.refresh();
      return;
    }

    // サーバーからのフィールドエラーを各入力に反映
    if (result.fieldErrors) {
      for (const [field, message] of Object.entries(result.fieldErrors)) {
        setError(field as keyof TeacherProfileFormInput, { message });
      }
    }
    setFormMessage({
      type: "error",
      text: result.error ?? "保存に失敗しました",
    });
  }

  // handleSubmit はクライアント検証の実行に使い、実際の値は submit 内で取得する
  const onSaveDraft = handleSubmit(() => submit("draft"));
  const onPublish = handleSubmit(() => submit("publish"));

  return (
    <form className="space-y-8" noValidate>
      {/* フォーム全体メッセージ */}
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

      {/* 完成率 */}
      <Card>
        <CompletionBar percent={livePercent} />
      </Card>

      {/* 基本情報 */}
      <Card>
        <CardHeader>
          <CardTitle>基本情報</CardTitle>
        </CardHeader>
        <div className="space-y-5">
          <Controller
            name="profileImageUrl"
            control={control}
            render={({ field }) => (
              <ProfileImageUpload
                value={field.value ?? ""}
                onChange={field.onChange}
                fieldError={errors.profileImageUrl?.message}
                disabled={isSubmitting}
              />
            )}
          />

          <FormField>
            <Label htmlFor="displayName" required>
              表示名
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
            <Label htmlFor="catchphrase">キャッチコピー（100文字以内）</Label>
            <Input
              id="catchphrase"
              type="text"
              placeholder="楽しく学べる英会話レッスン"
              hasError={!!errors.catchphrase}
              {...register("catchphrase")}
            />
            <InputErrorMessage message={errors.catchphrase?.message} />
          </FormField>
        </div>
      </Card>

      {/* 紹介 */}
      <Card>
        <CardHeader>
          <CardTitle>自己紹介・レッスン内容</CardTitle>
        </CardHeader>
        <div className="space-y-5">
          <FormField>
            <Label htmlFor="bio">自己紹介（2000文字以内）</Label>
            <Textarea
              id="bio"
              rows={6}
              hasError={!!errors.bio}
              {...register("bio")}
            />
            <InputErrorMessage message={errors.bio?.message} />
          </FormField>

          <FormField>
            <Label htmlFor="lessonContent">レッスン内容（2000文字以内）</Label>
            <Textarea
              id="lessonContent"
              rows={6}
              hasError={!!errors.lessonContent}
              {...register("lessonContent")}
            />
            <InputErrorMessage message={errors.lessonContent?.message} />
          </FormField>

          <FormField>
            <Label htmlFor="youtubeUrl">YouTube自己紹介動画（任意）</Label>
            <Input
              id="youtubeUrl"
              type="url"
              placeholder="https://youtu.be/xxxxxxxx"
              hasError={!!errors.youtubeUrl}
              {...register("youtubeUrl")}
            />
            <InputErrorMessage message={errors.youtubeUrl?.message} />
          </FormField>

          <FormField>
            <Label htmlFor="websiteUrl">ホームページURL（任意）</Label>
            <Input
              id="websiteUrl"
              type="url"
              placeholder="https://example.com"
              hasError={!!errors.websiteUrl}
              {...register("websiteUrl")}
            />
            <InputErrorMessage message={errors.websiteUrl?.message} />
          </FormField>

          <FormField>
            <Label htmlFor="snsUrl">SNSリンク（任意）</Label>
            <Input
              id="snsUrl"
              type="url"
              placeholder="https://x.com/xxxx"
              hasError={!!errors.snsUrl}
              {...register("snsUrl")}
            />
            <InputErrorMessage message={errors.snsUrl?.message} />
          </FormField>
        </div>
      </Card>

      {/* 連絡先情報（購入者のみに開示） */}
      <Card>
        <CardHeader>
          <CardTitle>連絡先情報</CardTitle>
        </CardHeader>
        <p className="mb-5 rounded-xl bg-surface px-4 py-3 text-sm text-muted">
          ここに入力した連絡先は、<strong>連絡先を購入した生徒にのみ</strong>
          表示されます。公開プロフィールには表示されません。
        </p>
        <div className="space-y-5">
          <FormField>
            <Label htmlFor="phone">電話番号（任意）</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="090-1234-5678"
              hasError={!!errors.phone}
              {...register("phone")}
            />
            <InputErrorMessage message={errors.phone?.message} />
          </FormField>

          <FormField>
            <Label htmlFor="lineId">LINE ID（任意）</Label>
            <Input
              id="lineId"
              type="text"
              placeholder="line_id_example"
              hasError={!!errors.lineId}
              {...register("lineId")}
            />
            <InputErrorMessage message={errors.lineId?.message} />
          </FormField>
        </div>
      </Card>

      {/* レッスン詳細 */}
      <Card>
        <CardHeader>
          <CardTitle>レッスン詳細</CardTitle>
        </CardHeader>
        <div className="space-y-6">
          {/* カテゴリー */}
          <div>
            <Label>カテゴリー（複数選択可）</Label>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Checkbox
                  key={category.id}
                  label={category.name}
                  value={category.id}
                  {...register("categoryIds")}
                />
              ))}
            </div>
            <InputErrorMessage message={errors.categoryIds?.message} />
          </div>

          {/* オンライン対応 */}
          <div>
            <Checkbox label="オンライン対応可能" {...register("isOnline")} />
          </div>

          {/* 対応地域 */}
          <div>
            <Label>対応地域（複数選択可）</Label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
              {PREFECTURES.map((pref) => (
                <Checkbox
                  key={pref}
                  label={pref}
                  value={pref}
                  {...register("prefectures")}
                />
              ))}
            </div>
            <InputErrorMessage message={errors.prefectures?.message} />
          </div>

          {/* 参考価格 */}
          <div>
            <Label>参考価格（円）</Label>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <Input
                  type="text"
                  inputMode="numeric"
                  placeholder="下限 例: 2000"
                  hasError={!!errors.priceMin}
                  {...register("priceMin")}
                />
              </div>
              <span className="text-muted">〜</span>
              <div className="flex-1">
                <Input
                  type="text"
                  inputMode="numeric"
                  placeholder="上限 例: 5000"
                  hasError={!!errors.priceMax}
                  {...register("priceMax")}
                />
              </div>
            </div>
            <InputErrorMessage message={errors.priceMin?.message} />
            <InputErrorMessage message={errors.priceMax?.message} />
          </div>

          {/* 対象年齢 */}
          <div>
            <Label>対象年齢（複数選択可）</Label>
            <div className="flex flex-wrap gap-2">
              {TARGET_AGE_OPTIONS.map((option) => (
                <Checkbox
                  key={option.value}
                  label={option.label}
                  value={option.value}
                  {...register("targetAges")}
                />
              ))}
            </div>
            <InputErrorMessage message={errors.targetAges?.message} />
          </div>

          {/* 対応レベル */}
          <div>
            <Label>対応レベル（複数選択可）</Label>
            <div className="flex flex-wrap gap-2">
              {SKILL_LEVEL_OPTIONS.map((option) => (
                <Checkbox
                  key={option.value}
                  label={option.label}
                  value={option.value}
                  {...register("skillLevels")}
                />
              ))}
            </div>
            <InputErrorMessage message={errors.skillLevels?.message} />
          </div>
        </div>
      </Card>

      {/* 公開設定 */}
      <Card>
        <CardHeader>
          <CardTitle>公開設定</CardTitle>
        </CardHeader>
        <div className="space-y-4">
          <Checkbox
            label="現在、新規の生徒を受け付ける"
            {...register("isAcceptingStudents")}
          />
        </div>
      </Card>

      {/* アクション */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button
          type="button"
          variant="outline"
          onClick={onSaveDraft}
          disabled={isSubmitting}
        >
          下書き保存
        </Button>
        <Button
          type="button"
          variant="primary"
          onClick={onPublish}
          disabled={isSubmitting}
        >
          公開する
        </Button>
        <Link
          href="/profile/preview"
          className="text-sm font-medium text-primary hover:underline sm:ml-auto"
        >
          プレビューを見る
        </Link>
      </div>
    </form>
  );
}
