/**
 * ページ読み込み中のスケルトン表示
 * loading.tsx から再利用します。
 */

/** 検索ページ用スケルトン */
export function SearchPageLoading() {
  return (
    <div
      className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8"
      aria-busy="true"
      aria-label="読み込み中"
    >
      <div className="mb-8 h-9 w-48 animate-pulse rounded-lg bg-surface" />
      <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
        <div className="hidden h-96 animate-pulse rounded-2xl bg-surface lg:block" />
        <div className="space-y-4">
          <div className="h-5 w-32 animate-pulse rounded bg-surface" />
          <TeacherCardGridSkeleton count={6} />
        </div>
      </div>
    </div>
  );
}

/** 公開プロフィール用スケルトン */
export function ProfilePageLoading() {
  return (
    <div
      className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8"
      aria-busy="true"
      aria-label="読み込み中"
    >
      <div className="mb-6 h-4 w-64 animate-pulse rounded bg-surface" />
      <div className="animate-pulse rounded-2xl border border-border bg-surface p-8">
        <div className="mx-auto mb-4 h-28 w-28 rounded-full bg-background" />
        <div className="mx-auto h-6 w-40 rounded bg-background" />
        <div className="mx-auto mt-3 h-4 w-56 rounded bg-background" />
      </div>
      <div className="mt-6 h-32 animate-pulse rounded-2xl bg-surface" />
      <div className="mt-6 h-48 animate-pulse rounded-2xl bg-surface" />
    </div>
  );
}

/** リストページ用スケルトン（購入履歴・管理画面など） */
export function ListPageLoading({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="読み込み中">
      <div className="h-8 w-40 animate-pulse rounded-lg bg-surface" />
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-20 animate-pulse rounded-2xl border border-border bg-surface"
        />
      ))}
    </div>
  );
}

/** 管理画面用スケルトン */
export function AdminPageLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="読み込み中">
      <div>
        <div className="h-7 w-48 animate-pulse rounded-lg bg-gray-200" />
        <div className="mt-2 h-4 w-72 animate-pulse rounded bg-gray-100" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-2xl border border-gray-200 bg-white"
          />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-2xl border border-gray-200 bg-white" />
    </div>
  );
}

/** 先生カードグリッドのスケルトン */
function TeacherCardGridSkeleton({ count }: { count: number }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="h-52 animate-pulse rounded-2xl border border-border bg-surface"
        />
      ))}
    </div>
  );
}
