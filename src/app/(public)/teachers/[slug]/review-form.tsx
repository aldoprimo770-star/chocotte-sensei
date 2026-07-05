"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { reviewSchema, type ReviewInput } from "@/schemas/review.schema";
import { submitReviewAction, deleteReviewAction } from "./review-actions";
import { RATING_VALUES } from "@/constants/review";
import { Button } from "@/components/ui/button";
import { FormField, Input, InputErrorMessage } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ReviewFormProps {
  slug: string;
  reviewId?: string;
  defaultValues?: Partial<ReviewInput>;
}

/** レビュー投稿・編集フォーム（購入済み生徒のみ表示される） */
export function ReviewForm({ slug, reviewId, defaultValues }: ReviewFormProps) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const isEdit = !!reviewId;

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ReviewInput>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: defaultValues?.rating ?? 0,
      title: defaultValues?.title ?? "",
      comment: defaultValues?.comment ?? "",
    },
  });

  // rating は数値のため register で hidden 管理し、星ボタンで setValue する
  register("rating", { valueAsNumber: true });
  const rating = watch("rating");

  async function onSubmit(values: ReviewInput) {
    setFormError(null);
    const result = await submitReviewAction(slug, values);
    if (result.success) {
      router.refresh();
      return;
    }
    if (result.fieldErrors) {
      for (const [field, message] of Object.entries(result.fieldErrors)) {
        setError(field as keyof ReviewInput, { message });
      }
    }
    setFormError(result.error ?? "送信に失敗しました。");
  }

  async function onDelete() {
    if (!reviewId) return;
    if (!confirm("このレビューを削除しますか？")) return;
    setDeleting(true);
    setFormError(null);
    const result = await deleteReviewAction(reviewId);
    setDeleting(false);
    if (result.success) {
      router.refresh();
      return;
    }
    setFormError(result.error ?? "削除に失敗しました。");
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

      {/* 星評価 */}
      <FormField>
        <Label required>評価</Label>
        <div className="flex items-center gap-1" role="radiogroup" aria-label="評価">
          {RATING_VALUES.slice()
            .reverse()
            .map((v) => (
              <button
                key={v}
                type="button"
                aria-label={`${v}点`}
                aria-pressed={rating >= v}
                onClick={() =>
                  setValue("rating", v, { shouldValidate: true })
                }
                className={`text-2xl transition-colors ${
                  rating >= v ? "text-yellow-400" : "text-gray-300"
                } hover:text-yellow-400`}
              >
                ★
              </button>
            ))}
        </div>
        <InputErrorMessage message={errors.rating?.message} />
      </FormField>

      <FormField>
        <Label htmlFor="title" required>
          タイトル
        </Label>
        <Input
          id="title"
          placeholder="例：とても丁寧に教えてくれました"
          hasError={!!errors.title}
          {...register("title")}
        />
        <InputErrorMessage message={errors.title?.message} />
      </FormField>

      <FormField>
        <Label htmlFor="comment" required>
          レビュー本文
        </Label>
        <Textarea
          id="comment"
          rows={5}
          placeholder="レッスンの感想を教えてください"
          hasError={!!errors.comment}
          {...register("comment")}
        />
        <InputErrorMessage message={errors.comment?.message} />
      </FormField>

      <p className="text-xs text-muted">
        投稿されたレビューは運営の確認後に公開されます。編集した場合も再度確認が行われます。
      </p>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={isSubmitting || deleting}>
          {isSubmitting
            ? "送信中..."
            : isEdit
              ? "レビューを更新"
              : "レビューを投稿"}
        </Button>
        {isEdit && (
          <Button
            type="button"
            variant="outline"
            onClick={onDelete}
            disabled={isSubmitting || deleting}
          >
            {deleting ? "削除中..." : "削除"}
          </Button>
        )}
      </div>
    </form>
  );
}
