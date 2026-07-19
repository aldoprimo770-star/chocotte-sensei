import Link from "next/link";
import { Card } from "@/components/ui/card";
import { VerifiedBadge } from "@/components/teacher/verified-badge";
import { RatingSummary } from "@/components/review/star-rating";
import {
  FavoriteButton,
  type FavoriteInteraction,
} from "@/components/student/favorite-button";
import { formatPriceRange } from "@/lib/teacher/format";
import { showVerifiedBadge } from "@/lib/verification/status";
import type { TeacherCardData } from "@/lib/teacher/search";

/**
 * 先生カード（検索結果・新着一覧で使用）
 *
 * スマートフォンでも見やすいよう、写真＋情報を縦に積む
 * シンプルなレイアウトにしています。カード全体がリンクです。
 */
export function TeacherCard({
  teacher,
  favoriteInteraction,
  favoriteCallbackUrl,
  isFavorited = false,
}: {
  teacher: TeacherCardData;
  /** 未指定のときはお気に入りボタンを表示しない */
  favoriteInteraction?: FavoriteInteraction;
  favoriteCallbackUrl?: string;
  isFavorited?: boolean;
}) {
  const categoryNames = teacher.categories.map((c) => c.category.name);
  const areaLabels = teacher.areas.map((a) =>
    a.city ? `${a.prefecture} ${a.city}` : a.prefecture,
  );
  const showFavorite = favoriteInteraction && favoriteCallbackUrl;

  return (
    <div className="relative h-full">
      {showFavorite && (
        <div className="absolute right-3 top-3 z-10">
          <FavoriteButton
            teacherId={teacher.id}
            initialFavorited={isFavorited}
            callbackUrl={favoriteCallbackUrl}
            interaction={favoriteInteraction}
            variant="icon"
          />
        </div>
      )}

      <Link href={`/teachers/${teacher.slug}`} className="group block h-full">
        <Card className="flex h-full flex-col transition-shadow hover:shadow-md">
          {/* 写真 + 名前 */}
          <div className="flex items-center gap-4">
            {teacher.profileImageUrl ? (
              // 外部の任意URLを表示するため next/image ではなく img を使用
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={teacher.profileImageUrl}
                alt={`${teacher.displayName}のプロフィール写真`}
                className="h-16 w-16 shrink-0 rounded-full border border-border object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-surface text-2xl">
                🍫
              </div>
            )}
            <div className="min-w-0 pr-8">
              <h3 className="truncate font-bold text-foreground group-hover:text-primary">
                {teacher.displayName}
              </h3>
              {teacher.catchphrase && (
                <p className="mt-0.5 line-clamp-2 text-sm text-muted">
                  {teacher.catchphrase}
                </p>
              )}
              <div className="mt-1">
                <RatingSummary
                  average={teacher.ratingAverage}
                  count={teacher.reviewCount}
                  size="sm"
                />
              </div>
            </div>
          </div>

          {/* バッジ */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {showVerifiedBadge(teacher) && <VerifiedBadge size="sm" />}
            {teacher.isOnline && (
              <Badge color="accent">オンライン対応</Badge>
            )}
            {teacher.isAcceptingStudents ? (
              <Badge color="primary">新規受付中</Badge>
            ) : (
              <Badge color="muted">受付停止中</Badge>
            )}
          </div>

          {/* 情報 */}
          <dl className="mt-4 space-y-1.5 text-sm">
            {categoryNames.length > 0 && (
              <div className="flex gap-2">
                <dt className="shrink-0 text-muted">カテゴリー</dt>
                <dd className="line-clamp-1 text-foreground">
                  {categoryNames.join("、")}
                </dd>
              </div>
            )}
            <div className="flex gap-2">
              <dt className="shrink-0 text-muted">地域</dt>
              <dd className="line-clamp-1 text-foreground">
                {areaLabels.length > 0
                  ? areaLabels.join("、")
                  : teacher.isOnline
                    ? "オンラインのみ"
                    : "未設定"}
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="shrink-0 text-muted">参考価格</dt>
              <dd className="text-foreground">
                {formatPriceRange(teacher.priceMin, teacher.priceMax)}
              </dd>
            </div>
          </dl>

          {/* リンク誘導 */}
          <span className="mt-4 inline-block text-sm font-medium text-primary">
            プロフィールを見る →
          </span>
        </Card>
      </Link>
    </div>
  );
}

/** カード内バッジ */
function Badge({
  children,
  color,
}: {
  children: React.ReactNode;
  color: "primary" | "accent" | "muted";
}) {
  const colorClass = {
    primary: "bg-primary-light text-primary",
    accent: "bg-accent-light text-accent",
    muted: "bg-surface text-muted",
  }[color];

  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${colorClass}`}>
      {children}
    </span>
  );
}
