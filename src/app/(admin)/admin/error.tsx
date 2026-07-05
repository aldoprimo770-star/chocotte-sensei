"use client";

import { ErrorDisplay } from "@/components/common/error-display";

/** 管理画面のエラーページ */
export default function AdminError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorDisplay
      title="データの取得に失敗しました"
      description="管理画面の読み込み中にエラーが発生しました。再度お試しください。"
      reset={reset}
      showHomeLink={false}
    />
  );
}
