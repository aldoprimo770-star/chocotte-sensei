"use client";

import { ErrorDisplay } from "@/components/common/error-display";

/** 生徒マイページのエラーページ */
export default function StudentMypageError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <ErrorDisplay
        title="データの取得に失敗しました"
        description="ページの読み込み中にエラーが発生しました。再度お試しください。"
        reset={reset}
      />
    </div>
  );
}
