import { Button } from "@/components/ui/button";

/** Empty State のプリセット設定 */
type EmptyPresetConfig = {
  icon: string;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
};

/** Empty State のプリセット（アイコン + 文言） */
export const EMPTY_STATE_PRESETS: Record<string, EmptyPresetConfig> = {
  search: {
    icon: "🔍",
    title: "先生が見つかりませんでした",
    description:
      "検索条件を変更するか、カテゴリーから探してみてください。",
    actionLabel: "条件をリセット",
    actionHref: "/teachers",
  },
  favorites: {
    icon: "♡",
    title: "お気に入りはまだありません",
    description: "気になる先生を見つけたら、♡ボタンで保存できます。",
    actionLabel: "先生を探す",
    actionHref: "/teachers",
  },
  recent: {
    icon: "👀",
    title: "閲覧履歴はまだありません",
    description: "先生のプロフィールを見ると、ここに表示されます。",
    actionLabel: "先生を探す",
    actionHref: "/teachers",
  },
  reviews: {
    icon: "⭐",
    title: "レビューはまだありません",
    description:
      "連絡先を購入した先生のプロフィールから、レビューを投稿できます。",
    actionLabel: "購入履歴を見る",
    actionHref: "/mypage/purchases",
  },
  reviewsPublic: {
    icon: "⭐",
    title: "レビューはまだありません",
    description: "この先生へのレビューはまだ投稿されていません。",
  },
  purchases: {
    icon: "📋",
    title: "購入履歴はありません",
    description:
      "気に入った先生の連絡先を購入すると、ここから確認できます。",
    actionLabel: "先生を探す",
    actionHref: "/teachers",
  },
  inquiries: {
    icon: "✉️",
    title: "お問い合わせはありません",
    description: "受信したお問い合わせがここに表示されます。",
  },
  generic: {
    icon: "🍫",
    title: "データがありません",
    description: "表示できる内容がまだありません。",
  },
};

export type EmptyStatePreset = keyof typeof EMPTY_STATE_PRESETS;

/**
 * データ0件時の共通表示
 * イラスト風アイコン + 説明 + 次の行動ボタン
 */
export function EmptyState({
  preset,
  title,
  description,
  icon,
  actionLabel,
  actionHref,
  onAction,
  compact = false,
  className = "",
}: {
  preset?: EmptyStatePreset;
  title?: string;
  description?: string;
  icon?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  compact?: boolean;
  className?: string;
}) {
  const config = preset ? EMPTY_STATE_PRESETS[preset] : undefined;
  const resolvedIcon = icon ?? config?.icon ?? "🍫";
  const resolvedTitle = title ?? config?.title ?? "データがありません";
  const resolvedDescription = description ?? config?.description ?? "";
  const resolvedActionLabel = actionLabel ?? config?.actionLabel;
  const resolvedActionHref = actionHref ?? config?.actionHref;

  return (
    <div
      className={`rounded-2xl border border-border bg-surface text-center ${
        compact ? "px-4 py-8" : "px-6 py-12 sm:px-10 sm:py-16"
      } ${className}`}
      role="status"
    >
      <p
        className={`mx-auto mb-4 flex items-center justify-center rounded-full bg-background shadow-sm ${
          compact ? "h-12 w-12 text-2xl" : "h-16 w-16 text-3xl"
        }`}
        aria-hidden="true"
      >
        {resolvedIcon}
      </p>
      <h2 className="text-lg font-bold text-foreground">{resolvedTitle}</h2>
      {resolvedDescription && (
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted">
          {resolvedDescription}
        </p>
      )}
      {(resolvedActionHref || onAction) && resolvedActionLabel && (
        <div className="mt-6">
          {resolvedActionHref ? (
            <Button href={resolvedActionHref} variant="primary" size="md">
              {resolvedActionLabel}
            </Button>
          ) : (
            <Button variant="primary" size="md" onClick={onAction}>
              {resolvedActionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
