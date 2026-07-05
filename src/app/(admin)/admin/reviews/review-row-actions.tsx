"use client";

import { useState, useTransition } from "react";
import type { ReviewStatus } from "@prisma/client";
import {
  setReviewStatusAction,
  deleteReviewAdminAction,
} from "@/app/(admin)/admin/actions";

/** レビューの操作（承認・非公開・削除） */
export function ReviewRowActions({
  reviewId,
  status,
}: {
  reviewId: string;
  status: ReviewStatus;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function run(fn: () => Promise<{ success: boolean; error?: string }>) {
    setError(null);
    startTransition(async () => {
      const result = await fn();
      if (!result.success) setError(result.error ?? "失敗しました。");
    });
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={isPending || status === "APPROVED"}
          onClick={() => run(() => setReviewStatusAction(reviewId, "APPROVED"))}
          className="rounded-lg border border-primary bg-primary px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-40"
        >
          承認
        </button>
        <button
          type="button"
          disabled={isPending || status === "REJECTED"}
          onClick={() => run(() => setReviewStatusAction(reviewId, "REJECTED"))}
          className="rounded-lg border border-gray-300 px-2.5 py-1 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          非公開
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => {
            if (confirm("このレビューを削除しますか？")) {
              run(() => deleteReviewAdminAction(reviewId));
            }
          }}
          className="rounded-lg border border-accent px-2.5 py-1 text-xs font-medium text-accent transition-colors hover:bg-accent-light disabled:opacity-40"
        >
          削除
        </button>
      </div>
      {error && <p className="text-xs text-accent">{error}</p>}
    </div>
  );
}
