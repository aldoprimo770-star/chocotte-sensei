import { z } from "zod";
import {
  RATING_MAX,
  RATING_MIN,
  REVIEW_COMMENT_MAX,
  REVIEW_TITLE_MAX,
} from "@/constants/review";

/**
 * レビュー投稿・編集の入力スキーマ
 * クライアント(RHF)とサーバー(Server Action)で共用します。
 */
export const reviewSchema = z.object({
  rating: z
    .number({ message: "評価を選択してください" })
    .int()
    .min(RATING_MIN, { message: "評価を選択してください" })
    .max(RATING_MAX, { message: "評価は5段階で選択してください" }),
  title: z
    .string()
    .trim()
    .min(1, { message: "タイトルを入力してください" })
    .max(REVIEW_TITLE_MAX, {
      message: `タイトルは${REVIEW_TITLE_MAX}文字以内で入力してください`,
    }),
  comment: z
    .string()
    .trim()
    .min(1, { message: "レビュー本文を入力してください" })
    .max(REVIEW_COMMENT_MAX, {
      message: `本文は${REVIEW_COMMENT_MAX}文字以内で入力してください`,
    }),
});

export type ReviewInput = z.infer<typeof reviewSchema>;
