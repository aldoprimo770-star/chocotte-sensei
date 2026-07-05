"use client";

import { Button } from "@/components/ui/button";

/**
 * エラー表示（error.tsx・データ取得失敗時に使用）
 * サイト全体の柔らかい雰囲気に合わせたデザイン
 */
export function ErrorDisplay({
  title = "問題が発生しました",
  description = "申し訳ございません。一時的なエラーが発生しました。しばらくしてから再度お試しください。",
  reset,
  showHomeLink = true,
  compact = false,
}: {
  title?: string;
  description?: string;
  reset?: () => void;
  showHomeLink?: boolean;
  compact?: boolean;
}) {
  return (
    <div
      className={`text-center ${compact ? "py-8" : "px-4 py-16 sm:py-24"}`}
      role="alert"
    >
      <p
        className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent-light text-3xl"
        aria-hidden="true"
      >
        😢
      </p>
      <h1 className="text-xl font-bold text-foreground sm:text-2xl">{title}</h1>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted">
        {description}
      </p>
      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        {reset && (
          <Button variant="primary" onClick={reset}>
            もう一度試す
          </Button>
        )}
        {showHomeLink && (
          <Button href="/" variant={reset ? "outline" : "primary"}>
            トップページへ
          </Button>
        )}
      </div>
    </div>
  );
}
