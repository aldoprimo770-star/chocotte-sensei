import { StarRating } from "@/components/review/star-rating";
import { EmptyState } from "@/components/common/empty-state";
import { formatDate } from "@/lib/date";

/** 公開レビュー1件の表示に必要な形 */
export interface PublicReviewItem {
  id: string;
  rating: number;
  title: string;
  comment: string;
  createdAt: Date;
  student: { studentProfile: { displayName: string } | null };
}

/** 承認済みレビューの一覧表示（公開プロフィール用） */
export function ReviewList({
  reviews,
  variant = "public",
}: {
  reviews: PublicReviewItem[];
  variant?: "public" | "student";
}) {
  if (reviews.length === 0) {
    return (
      <EmptyState
        preset={variant === "student" ? "reviews" : "reviewsPublic"}
        compact
      />
    );
  }

  return (
    <ul className="space-y-4">
      {reviews.map((review) => (
        <li
          key={review.id}
          className="rounded-xl border border-border p-4"
        >
          <div className="flex items-center justify-between gap-2">
            <StarRating value={review.rating} size="sm" />
            <time className="text-xs text-muted">
              {formatDate(review.createdAt)}
            </time>
          </div>
          <h3 className="mt-2 font-bold text-foreground">{review.title}</h3>
          <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
            {review.comment}
          </p>
          <p className="mt-2 text-xs text-muted">
            {review.student.studentProfile?.displayName ?? "生徒"} さん
          </p>
        </li>
      ))}
    </ul>
  );
}
