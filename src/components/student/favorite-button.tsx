"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleFavoriteAction } from "@/app/(student)/favorites/actions";

/** お気に入りボタンの表示モード */
export type FavoriteInteraction = "toggle" | "login";

/**
 * お気に入りボタン
 *
 * - 登録済み: オレンジ色の塗りつぶしハート
 * - 未登録: 白抜き（アウトライン）ハート
 * - 未ログイン: ログイン画面へ誘導
 */
export function FavoriteButton({
  teacherId,
  initialFavorited,
  callbackUrl,
  interaction,
  variant = "icon",
}: {
  teacherId: string;
  initialFavorited: boolean;
  callbackUrl: string;
  interaction: FavoriteInteraction;
  variant?: "icon" | "button";
}) {
  const router = useRouter();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [isPending, startTransition] = useTransition();

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (interaction === "login") {
      router.push(
        `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`,
      );
      return;
    }

    startTransition(async () => {
      const result = await toggleFavoriteAction(teacherId);
      if (result.success && result.favorited !== undefined) {
        setFavorited(result.favorited);
        router.refresh();
      }
    });
  }

  const label = favorited ? "お気に入り解除" : "お気に入りに追加";
  const iconClass = variant === "icon" ? "h-6 w-6" : "h-5 w-5";

  if (variant === "button") {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        aria-pressed={favorited}
        aria-label={label}
        className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${
          favorited
            ? "border-primary bg-primary-light text-primary"
            : "border-border bg-background text-foreground hover:border-primary/40"
        }`}
      >
        <HeartIcon filled={favorited} className={iconClass} />
        {favorited ? "お気に入り済み" : "♡ お気に入り"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-pressed={favorited}
      aria-label={label}
      title={label}
      className="rounded-full bg-background/90 p-1.5 shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50"
    >
      <HeartIcon filled={favorited} className={iconClass} />
    </button>
  );
}

/** ハートアイコン（塗りつぶし / アウトライン） */
function HeartIcon({
  filled,
  className,
}: {
  filled: boolean;
  className?: string;
}) {
  if (filled) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
        className={`text-primary ${className ?? ""}`}
      >
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
      className={`text-muted ${className ?? ""}`}
    >
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  );
}
