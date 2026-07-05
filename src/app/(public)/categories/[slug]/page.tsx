import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SITE } from "@/constants/site";
import { getCategoryBySlug } from "@/lib/categories";
import {
  parseTeacherSearchParams,
  searchTeachers,
  type RawSearchParams,
} from "@/lib/teacher/search";
import { getFavoriteButtonContext } from "@/lib/student/favorites";
import { TeacherGrid } from "@/components/teacher/teacher-grid";
import { Pagination } from "@/components/common/pagination";
import { SortSelect } from "@/app/(public)/teachers/sort-select";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<RawSearchParams>;
}

/** カテゴリーページの SEO メタデータ */
export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    return { title: "カテゴリーが見つかりません" };
  }

  const title = `${category.name}の先生を探す`;
  const description =
    category.description ??
    `${category.name}を教えている先生を${SITE.name}で探せます。`;
  const url = `${SITE.url}/categories/${category.slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { type: "website", url, title, description, siteName: SITE.name },
  };
}

/** カテゴリー別の先生一覧ページ */
export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const rawParams = await searchParams;
  // 検索条件を解釈しつつ、カテゴリーはこのページに固定
  const query = {
    ...parseTeacherSearchParams(rawParams),
    categoryId: category.id,
  };
  const result = await searchTeachers(query);
  const favoriteContext = await getFavoriteButtonContext(
    `/categories/${category.slug}`,
  );

  // ページネーション（sortを保持しつつページのみ変更・カテゴリーはパスで固定）
  const makeHref = (page: number): string => {
    const params = new URLSearchParams();
    if (query.sort !== "new") params.set("sort", query.sort);
    if (page > 1) params.set("page", String(page));
    const qs = params.toString();
    return qs
      ? `/categories/${category.slug}?${qs}`
      : `/categories/${category.slug}`;
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      {/* パンくず */}
      <nav className="mb-6 text-sm text-muted" aria-label="パンくずリスト">
        <ol className="flex flex-wrap items-center gap-1">
          <li>
            <Link href="/" className="hover:text-primary">
              ホーム
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href="/categories" className="hover:text-primary">
              カテゴリー
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-foreground">{category.name}</li>
        </ol>
      </nav>

      <header className="mb-8">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          {category.name}の先生
        </h1>
        {category.description && (
          <p className="mt-3 text-sm leading-relaxed text-muted">
            {category.description}
          </p>
        )}
      </header>

      <div className="mb-4 flex items-center justify-between gap-4">
        <p className="text-sm text-muted">{result.total}件の先生</p>
        <SortSelect current={query.sort} basePath={`/categories/${category.slug}`} />
      </div>

      <TeacherGrid teachers={result.items} favoriteContext={favoriteContext} />

      {result.items.length > 0 && (
        <Pagination
          page={result.page}
          totalPages={result.totalPages}
          makeHref={makeHref}
        />
      )}
    </div>
  );
}
