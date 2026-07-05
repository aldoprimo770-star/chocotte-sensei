import type { Metadata } from "next";
import Link from "next/link";
import { requireRole } from "@/lib/auth/session";
import { getStudentReviews } from "@/lib/review/review";
import { REVIEW_STATUS_LABELS } from "@/constants/review";
import { formatDate } from "@/lib/date";
import { EmptyState } from "@/components/common/empty-state";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/admin/status-badge";
import { StarRating } from "@/components/review/star-rating";

export const metadata: Metadata = { title: "レビュー履歴" };

/** 生徒のレビュー履歴ページ（投稿したレビューの確認・編集導線） */
export default async function StudentReviewsPage() {
  const session = await requireRole("STUDENT");
  const reviews = await getStudentReviews(session.user.id);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="mb-2 text-2xl font-bold text-foreground">レビュー履歴</h1>
      <p className="mb-8 text-sm text-muted">
        投稿したレビューの一覧です。編集・削除は各先生のページから行えます。
      </p>

      {reviews.length === 0 ? (
        <EmptyState preset="reviews" />
      ) : (
        <ul className="space-y-4">
          {reviews.map((review) => {
            const status = REVIEW_STATUS_LABELS[review.status];
            return (
              <li key={review.id}>
                <Card>
                  <div className="flex items-center justify-between gap-2">
                    <Link
                      href={`/teachers/${review.teacher.slug}`}
                      className="font-bold text-foreground hover:text-primary"
                    >
                      {review.teacher.displayName} 先生
                    </Link>
                    <StatusBadge
                      label={status.label}
                      className={status.className}
                    />
                  </div>
                  <div className="mt-2">
                    <StarRating value={review.rating} size="sm" />
                  </div>
                  <p className="mt-2 font-medium text-foreground">
                    {review.title}
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">
                    {review.comment}
                  </p>
                  <div className="mt-3 flex items-center justify-between text-xs text-muted">
                    <time>{formatDate(review.createdAt)}</time>
                    <Link
                      href={`/teachers/${review.teacher.slug}`}
                      className="font-medium text-primary hover:underline"
                    >
                      編集する →
                    </Link>
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
