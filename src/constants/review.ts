import type { ReviewStatus } from "@prisma/client";

/** 評価の範囲 */
export const RATING_MIN = 1;
export const RATING_MAX = 5;

/** 選択肢用の評価値（5→1の降順で表示することが多い） */
export const RATING_VALUES = [5, 4, 3, 2, 1] as const;

/** 入力上限 */
export const REVIEW_TITLE_MAX = 100;
export const REVIEW_COMMENT_MAX = 1000;

/** レビューの審査ステータス表示（ラベル + 配色） */
export const REVIEW_STATUS_LABELS: Record<
  ReviewStatus,
  { label: string; className: string }
> = {
  PENDING: { label: "承認待ち", className: "bg-secondary-light text-foreground" },
  APPROVED: { label: "公開中", className: "bg-primary-light text-primary" },
  REJECTED: { label: "非公開", className: "bg-gray-100 text-gray-600" },
};
