import type { Metadata } from "next";
import { getAdminReviews } from "@/lib/admin/queries";
import { REVIEW_STATUS_LABELS } from "@/constants/review";
import { formatDate } from "@/lib/date";
import { StatusBadge } from "@/components/admin/status-badge";
import { StarRating } from "@/components/review/star-rating";
import { ReviewRowActions } from "./review-row-actions";

export const metadata: Metadata = { title: "レビュー管理" };

/** レビュー管理ページ（一覧 + 承認/非公開/削除） */
export default async function AdminReviewsPage() {
  const reviews = await getAdminReviews();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-800">レビュー管理</h1>
        <p className="mt-1 text-sm text-gray-500">
          レビューの一覧です（承認待ちを優先・最大100件）。承認したレビューのみ公開されます。
        </p>
      </div>

      {reviews.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center text-gray-500">
          まだレビューはありません。
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-xs text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">投稿者</th>
                <th className="px-4 py-3 font-medium">先生</th>
                <th className="px-4 py-3 font-medium">評価・内容</th>
                <th className="px-4 py-3 font-medium">投稿日</th>
                <th className="px-4 py-3 font-medium">公開状態</th>
                <th className="px-4 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reviews.map((review) => {
                const statusStyle = REVIEW_STATUS_LABELS[review.status];
                const author =
                  review.student.studentProfile?.displayName ?? "（未設定）";
                return (
                  <tr key={review.id} className="align-top">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{author}</p>
                      <p className="text-xs text-gray-500">
                        {review.student.email}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {review.teacher.displayName}
                    </td>
                    <td className="px-4 py-3">
                      <StarRating value={review.rating} size="sm" />
                      <p className="mt-1 font-medium text-gray-800">
                        {review.title}
                      </p>
                      <p className="mt-0.5 max-w-md text-xs text-gray-500">
                        {review.comment}
                      </p>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                      {formatDate(review.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        label={statusStyle.label}
                        className={statusStyle.className}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <ReviewRowActions
                        reviewId={review.id}
                        status={review.status}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
