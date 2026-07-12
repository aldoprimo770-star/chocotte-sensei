"use client";

import { useEffect } from "react";
import { ErrorDisplay } from "@/components/common/error-display";

/** 500 / 実行時エラー用ページ（公開サイト） */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main id="main-content" className="flex flex-1 flex-col">
      <ErrorDisplay
        title="問題が発生しました"
        description="データの取得中にエラーが発生しました。しばらくしてから再度お試しください。"
        reset={reset}
      />
    </main>
  );
}
