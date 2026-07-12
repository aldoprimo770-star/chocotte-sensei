import type { Metadata } from "next";
import { getActiveCategories } from "@/lib/categories";
import {
  parseTeacherSearchParams,
  searchTeachers,
  serializeSearchQuery,
  type RawSearchParams,
} from "@/lib/teacher/search";
import { SITE } from "@/constants/site";
import { getFavoriteButtonContext } from "@/lib/student/favorites";
import { TeacherGrid } from "@/components/teacher/teacher-grid";
import { Pagination } from "@/components/common/pagination";
import { SearchForm } from "./search-form";
import { SortSelect } from "./sort-select";

/** searchParams + DB 参照のため動的描画 */
export const dynamic = "force-dynamic";

/** 検索ページの SEO メタデータ */
export const metadata: Metadata = {
  title: "先生を探す",
  description:
    "語学・プログラミング・音楽など、カテゴリーや地域から自分に合った先生を検索できます。",
};

/**
 * 先生検索ページ
 *
 * 検索条件は URL のクエリパラメータで管理し、
 * サーバー側で絞り込み・並び替え・ページングを実行します。
 */
export default async function TeachersSearchPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const rawParams = await searchParams;
  const query = parseTeacherSearchParams(rawParams);

  const [categories, result, favoriteContext] = await Promise.all([
    getActiveCategories(),
    searchTeachers(query),
    getFavoriteButtonContext("/teachers"),
  ]);

  // ページネーションのリンク生成（現在条件を保持しつつページのみ変更）
  const makeHref = (page: number): string => {
    const params = serializeSearchQuery({ ...query, page });
    const qs = params.toString();
    return qs ? `/teachers?${qs}` : "/teachers";
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          先生を探す
        </h1>
        <p className="mt-2 text-sm text-muted">
          {SITE.name}に登録している先生を検索できます
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
        {/* 検索フォーム */}
        <aside>
          <SearchForm
            categories={categories}
            initial={{
              keyword: query.keyword,
              categoryId: query.categoryId,
              prefecture: query.prefecture,
              targetAge: query.targetAge ?? "",
              skillLevel: query.skillLevel ?? "",
              minPrice: query.minPrice?.toString() ?? "",
              maxPrice: query.maxPrice?.toString() ?? "",
              online: query.online,
              accepting: query.accepting,
              verified: query.verified,
            }}
          />
        </aside>

        {/* 検索結果 */}
        <section>
          <div className="mb-4 flex items-center justify-between gap-4">
            <p className="text-sm text-muted">
              {result.total}件の先生が見つかりました
            </p>
            <SortSelect current={query.sort} />
          </div>

          <TeacherGrid teachers={result.items} favoriteContext={favoriteContext} />

          {result.items.length > 0 && (
            <Pagination
              page={result.page}
              totalPages={result.totalPages}
              makeHref={makeHref}
            />
          )}
        </section>
      </div>
    </div>
  );
}
