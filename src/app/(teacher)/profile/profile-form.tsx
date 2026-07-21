"use client";

import { useRef, useState } from "react";
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
import { normalizeProfileFormValues } from "@/lib/teacher/normalize-profile-form";
import {
  AGE_RANGE_OPTIONS,
  GENDER_OPTIONS,
  SKILL_LEVEL_OPTIONS,
  TARGET_AGE_OPTIONS,
  TEACHING_METHOD_OPTIONS,
} from "@/constants/teacher";
import { teachingMethodsIncludeOnline } from "@/lib/teacher/teaching-methods";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { FormField, Input, InputErrorMessage } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CompletionBar } from "@/components/teacher/completion-bar";
import { ProfileImageUpload } from "@/components/teacher/profile-image-upload";
import { AreaFieldsEditor } from "@/components/teacher/area-fields-editor";

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
  const messageRef = useRef<HTMLParagraphElement>(null);
  const [formMessage, setFormMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);
  const [savingMode, setSavingMode] = useState<SaveMode | null>(null);

  // 入力型(Input) と 変換後の型(Values) を明示。
  // resolver は検証のみに使い、送信時は生の入力値(getValues)をサーバーへ渡す。
  const {
    register,
    control,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<TeacherProfileFormInput, unknown, TeacherProfileFormValues>({
    resolver: zodResolver(teacherProfileDraftSchema),
    defaultValues: normalizeProfileFormValues(defaultValues),
  });

  // 入力状況に応じて完成率をリアルタイム計算
  const values = watch();
  const filledAreas =
    values.areas?.filter((a) => a.prefecture?.trim()) ?? [];
  const livePercent = calculateProfileCompletion({
    profileImageUrl: values.profileImageUrl,
    catchphrase: values.catchphrase,
    bio: values.bio,
    lessonContent: values.lessonContent,
    priceMin:
      typeof values.priceMin === "string" && values.priceMin.trim() !== ""
        ? Number(values.priceMin)
        : typeof values.priceMin === "number"
          ? values.priceMin
          : null,
    isOnline: teachingMethodsIncludeOnline(
      Array.isArray(values.teachingMethods) ? values.teachingMethods : [],
    ),
    categoryCount: Array.isArray(values.categoryIds)
      ? values.categoryIds.length
      : 0,
    areaCount: filledAreas.length,
    targetAgeCount: Array.isArray(values.targetAges)
      ? values.targetAges.length
      : 0,
    skillLevelCount: Array.isArray(values.skillLevels)
      ? values.skillLevels.length
      : 0,
  });

  function showMessage(message: { type: "error" | "success"; text: string }) {
    setFormMessage(message);
    // レンダー後にメッセージへスクロール（sticky ヘッダー分を考慮）
    window.setTimeout(() => {
      messageRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 0);
  }

  async function submit(mode: SaveMode, data: TeacherProfileFormValues) {
    setSavingMode(mode);
    setFormMessage(null);
    try {
      // handleSubmit の検証済み data をそのまま送る（getValues は使わない）
      const result = await saveTeacherProfileAction(data, mode);

      if (result.success) {
        showMessage({
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
      showMessage({
        type: "error",
        text: result.error ?? "保存に失敗しました",
      });
    } catch (error) {
      // Server Action の redirect() は再スローする
      if (
        typeof error === "object" &&
        error &&
        "digest" in error &&
        String((error as { digest?: unknown }).digest).startsWith(
          "NEXT_REDIRECT",
        )
      ) {
        throw error;
      }
      showMessage({
        type: "error",
        text: "保存中にエラーが発生しました。時間をおいて再度お試しください。",
      });
    } finally {
      setSavingMode(null);
    }
  }

  // 検証済み data を submit へ渡す（getValues は使わない）
  const onSaveDraft = handleSubmit(
    (data) => submit("draft", data),
    () =>
      showMessage({
        type: "error",
        text: "入力内容を確認してください",
      }),
  );
  const onPublish = handleSubmit(
    (data) => submit("publish", data),
    () =>
      showMessage({
        type: "error",
        text: "公開に必要な項目を確認してください",
      }),
  );

  const busy = isSubmitting || savingMode !== null;

  return (
    <form className="space-y-8" noValidate>
      {/* フォーム全体メッセージ */}
      <div aria-live="polite">
        {formMessage && (
          <p
            ref={messageRef}
            role="alert"
            className={
              formMessage.type === "error"
                ? "scroll-mt-24 rounded-xl bg-accent-light px-4 py-3 text-sm text-accent"
                : "scroll-mt-24 rounded-xl bg-primary-light px-4 py-3 text-sm text-primary"
            }
          >
            {formMessage.text}
          </p>
        )}
      </div>

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
                disabled={busy}
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

          <div className="grid gap-4 sm:grid-cols-3">
            <FormField>
              <Label htmlFor="gender">性別</Label>
              <Select id="gender" {...register("gender")}>
                <option value="">未設定</option>
                {GENDER_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
              <InputErrorMessage message={errors.gender?.message} />
            </FormField>

            <FormField>
              <Label htmlFor="ageRange">年代</Label>
              <Select id="ageRange" {...register("ageRange")}>
                <option value="">未設定</option>
                {AGE_RANGE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
              <InputErrorMessage message={errors.ageRange?.message} />
            </FormField>

            <FormField>
              <Label htmlFor="teachingYears">講師歴（年）</Label>
              <Input
                id="teachingYears"
                type="text"
                inputMode="numeric"
                placeholder="例: 5"
                hasError={!!errors.teachingYears}
                {...register("teachingYears")}
              />
              <InputErrorMessage message={errors.teachingYears?.message} />
            </FormField>
          </div>
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
            <Controller
              name="categoryIds"
              control={control}
              render={({ field }) => {
                const selected = Array.isArray(field.value) ? field.value : [];
                return (
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <Checkbox
                        key={category.id}
                        label={category.name}
                        checked={selected.includes(category.id)}
                        onChange={(e) => {
                          const next = new Set(selected);
                          if (e.target.checked) next.add(category.id);
                          else next.delete(category.id);
                          field.onChange([...next]);
                        }}
                      />
                    ))}
                  </div>
                );
              }}
            />
            <InputErrorMessage message={errors.categoryIds?.message} />
          </div>

          {/* 指導方法（複数選択・チェックボックス） */}
          <div>
            <Label>指導方法（複数選択可）</Label>
            <p className="mb-2 text-xs text-muted">
              対応する方法をすべてチェックしてください（対面・オンライン・電話）。
            </p>
            <Controller
              name="teachingMethods"
              control={control}
              render={({ field }) => {
                const selected = Array.isArray(field.value) ? field.value : [];
                return (
                  <div
                    className="flex flex-wrap gap-2"
                    role="group"
                    aria-label="指導方法（複数選択）"
                  >
                    {TEACHING_METHOD_OPTIONS.map((option) => (
                      <Checkbox
                        key={option.value}
                        label={`${option.emoji} ${option.label}`}
                        checked={selected.includes(option.value)}
                        onChange={(e) => {
                          const next = new Set(selected);
                          if (e.target.checked) next.add(option.value);
                          else next.delete(option.value);
                          field.onChange([...next]);
                        }}
                      />
                    ))}
                  </div>
                );
              }}
            />
            <InputErrorMessage message={errors.teachingMethods?.message} />
          </div>

          {/* 対応地域 */}
          <div>
            <Label>対応地域</Label>
            <p className="mb-2 text-xs text-muted">
              都道府県を選ぶと市町村の候補が切り替わります。市町村未選択は「都道府県全域」として登録されます。
            </p>
            <Controller
              name="areas"
              control={control}
              render={({ field }) => (
                <AreaFieldsEditor
                  value={field.value ?? []}
                  onChange={field.onChange}
                  disabled={busy}
                />
              )}
            />
            <InputErrorMessage message={errors.areas?.message} />
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

          {/* 指導対象 */}
          <div>
            <Label>指導対象（複数選択可）</Label>
            <Controller
              name="targetAges"
              control={control}
              render={({ field }) => {
                const selected = Array.isArray(field.value) ? field.value : [];
                return (
                  <div className="flex flex-wrap gap-2">
                    {TARGET_AGE_OPTIONS.map((option) => (
                      <Checkbox
                        key={option.value}
                        label={option.label}
                        checked={selected.includes(option.value)}
                        onChange={(e) => {
                          const next = new Set(selected);
                          if (e.target.checked) next.add(option.value);
                          else next.delete(option.value);
                          field.onChange([...next]);
                        }}
                      />
                    ))}
                  </div>
                );
              }}
            />
            <InputErrorMessage message={errors.targetAges?.message} />
          </div>

          {/* 対応レベル */}
          <div>
            <Label>対応レベル（複数選択可）</Label>
            <Controller
              name="skillLevels"
              control={control}
              render={({ field }) => {
                const selected = Array.isArray(field.value) ? field.value : [];
                return (
                  <div className="flex flex-wrap gap-2">
                    {SKILL_LEVEL_OPTIONS.map((option) => (
                      <Checkbox
                        key={option.value}
                        label={option.label}
                        checked={selected.includes(option.value)}
                        onChange={(e) => {
                          const next = new Set(selected);
                          if (e.target.checked) next.add(option.value);
                          else next.delete(option.value);
                          field.onChange([...next]);
                        }}
                      />
                    ))}
                  </div>
                );
              }}
            />
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
          <Controller
            name="isAcceptingStudents"
            control={control}
            render={({ field }) => (
              <Checkbox
                label="現在、新規の生徒を受け付ける"
                checked={field.value === true}
                onChange={(e) => field.onChange(e.target.checked)}
              />
            )}
          />
        </div>
      </Card>

      {/* アクション */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button
          type="button"
          variant="outline"
          onClick={onSaveDraft}
          disabled={busy}
        >
          {savingMode === "draft" ? "保存中..." : "下書き保存"}
        </Button>
        <Button
          type="button"
          variant="primary"
          onClick={onPublish}
          disabled={busy}
        >
          {savingMode === "publish" ? "公開中..." : "公開する"}
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
