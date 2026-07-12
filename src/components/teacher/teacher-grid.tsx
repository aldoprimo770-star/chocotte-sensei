import { TeacherCard } from "@/components/teacher/teacher-card";
import { EmptyState } from "@/components/common/empty-state";
import type { EmptyStatePreset } from "@/components/common/empty-state";
import type { FavoriteButtonContext } from "@/lib/student/favorites";
import type { TeacherCardData } from "@/lib/teacher/search";

/**
 * 先生カードのグリッド表示（検索・カテゴリー・地域ページで共通利用）
 */
export function TeacherGrid({
  teachers,
  emptyPreset = "search",
  emptyMessage,
  favoriteContext,
}: {
  teachers: TeacherCardData[];
  /** 0件時の Empty State プリセット */
  emptyPreset?: EmptyStatePreset;
  /** 0件時の説明文を上書き（省略時はプリセットの説明） */
  emptyMessage?: string;
  favoriteContext?: FavoriteButtonContext;
}) {
  if (teachers.length === 0) {
    return (
      <EmptyState
        preset={emptyPreset}
        description={emptyMessage}
      />
    );
  }
  const favoriteProps = resolveFavoriteProps(favoriteContext);

  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {teachers.map((teacher) => (
        <TeacherCard
          key={teacher.id}
          teacher={teacher}
          {...favoriteProps}
          isFavorited={
            favoriteContext?.mode === "student"
              ? favoriteContext.favoriteIds.includes(teacher.id)
              : false
          }
        />
      ))}
    </div>
  );
}

/** FavoriteButtonContext を TeacherCard の props に変換 */
function resolveFavoriteProps(context?: FavoriteButtonContext) {
  if (!context || context.mode === "hidden") {
    return {};
  }

  if (context.mode === "guest") {
    return {
      favoriteInteraction: "login" as const,
      favoriteCallbackUrl: context.callbackUrl,
    };
  }

  return {
    favoriteInteraction: "toggle" as const,
    favoriteCallbackUrl: context.callbackUrl,
  };
}
