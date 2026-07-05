import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SITE } from "@/constants/site";
import { PREFECTURES } from "@/constants/prefectures";
import {
  parseTeacherSearchParams,
  searchTeachers,
  type RawSearchParams,
} from "@/lib/teacher/search";
import { getFavoriteButtonContext } from "@/lib/student/favorites";
import { TeacherGrid } from "@/components/teacher/teacher-grid";
import { Pagination } from "@/components/common/pagination";
import { SortSelect } from "@/app/(public)/teachers/sort-select";

interface AreaPageProps {
  params: Promise<{ prefecture: string }>;
  searchParams: Promise<RawSearchParams>;
}

/** URLパラメータを都道府県名にデコードし、有効な値のみ返す */
function resolvePrefecture(param: string): string | null {
  const decoded = decodeURIComponent(param);
  return (PREFECTURES as readonly string[]).includes(decoded) ? decoded : null;
}

/** 地域ページの SEO メタデータ */
export async function generateMetadata({
  params,
}: AreaPageProps): Promise<Metadata> {
  const { prefecture: raw } = await params;
  const prefecture = resolvePrefecture(raw);

  if (!prefecture) {
    return { title: "地域が見つかりません" };
  }

  const title = `${prefecture}の先生を探す`;
  const description = `${prefecture}で活動している先生を${SITE.name}で探せます。対面・オンライン対応の先生が見つかります。`;
  const url = `${SITE.url}/areas/${encodeURIComponent(prefecture)}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { type: "website", url, title, description, siteName: SITE.name },
  };
}

/** 都道府県別の先生一覧ページ */
export default async function AreaPage({ params, searchParams }: AreaPageProps) {
  const { prefecture: raw } = await params;
  const prefecture = resolvePrefecture(raw);

  if (!prefecture) {
    notFound();
  }

  const rawParams = await searchParams;
  // 都道府県はこのページに固定
  const query = {
    ...parseTeacherSearchParams(rawParams),
    prefecture,
  };
  const result = await searchTeachers(query);
  const encoded = encodeURIComponent(prefecture);
  const favoriteContext = await getFavoriteButtonContext(
    `/areas/${encoded}`,
  );
  const makeHref = (page: number): string => {
    const params = new URLSearchParams();
    if (query.sort !== "new") params.set("sort", query.sort);
    if (page > 1) params.set("page", String(page));
    const qs = params.toString();
    return qs ? `/areas/${encoded}?${qs}` : `/areas/${encoded}`;
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
            <Link href="/teachers" className="hover:text-primary">
              先生を探す
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-foreground">{prefecture}</li>
        </ol>
      </nav>

      <header className="mb-8">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          {prefecture}の先生
        </h1>
        <p className="mt-2 text-sm text-muted">
          {prefecture}で活動している先生の一覧です
        </p>
      </header>

      <div className="mb-4 flex items-center justify-between gap-4">
        <p className="text-sm text-muted">{result.total}件の先生</p>
        <SortSelect current={query.sort} basePath={`/areas/${encoded}`} />
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
