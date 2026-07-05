import type { Prisma, SkillLevel, TargetAge } from "@prisma/client";
import { db } from "@/lib/db";
import { isSkillLevel, isTargetAge, type TeacherSort } from "@/constants/teacher";
import { PREFECTURES } from "@/constants/prefectures";

/**
 * 先生検索のロジック（サーバー専用）
 *
 * URLの検索パラメータを型安全なクエリに変換し、
 * Prisma で公開中の先生を絞り込み・並び替え・ページングします。
 * 数千件規模でもインデックス（isPublic/priceMin/カテゴリー/地域）が
 * 効くように where 条件を組み立てます。
 */

/** 1ページあたりの表示件数 */
export const TEACHERS_PAGE_SIZE = 12;

/** 検索条件（正規化済み） */
export interface TeacherSearchQuery {
  keyword: string;
  categoryId: string;
  prefecture: string;
  online: boolean;
  accepting: boolean;
  verified: boolean;
  minPrice?: number;
  maxPrice?: number;
  targetAge?: TargetAge;
  skillLevel?: SkillLevel;
  sort: TeacherSort;
  page: number;
}

/** URLのsearchParamsで受け取りうる生の型 */
export type RawSearchParams = Record<string, string | string[] | undefined>;

/** 配列で来る可能性のある値を単一文字列に正規化 */
function firstValue(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

/** 正の整数に変換（不正値は undefined） */
function toPositiveInt(value: string): number | undefined {
  if (!/^\d+$/.test(value)) return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

/**
 * URLの検索パラメータを型安全な検索条件に変換する。
 * 不正な値は無視し、常に安全な既定値を返す。
 */
export function parseTeacherSearchParams(
  params: RawSearchParams,
): TeacherSearchQuery {
  const sortRaw = firstValue(params.sort);
  const sort: TeacherSort =
    sortRaw === "price_asc" || sortRaw === "price_desc" ? sortRaw : "new";

  const prefecture = firstValue(params.prefecture);
  const targetAgeRaw = firstValue(params.targetAge);
  const skillLevelRaw = firstValue(params.skillLevel);
  const pageNum = toPositiveInt(firstValue(params.page)) ?? 1;

  return {
    keyword: firstValue(params.keyword).trim().slice(0, 100),
    categoryId: firstValue(params.categoryId),
    prefecture: (PREFECTURES as readonly string[]).includes(prefecture)
      ? prefecture
      : "",
    online: firstValue(params.online) === "1",
    accepting: firstValue(params.accepting) === "1",
    verified: firstValue(params.verified) === "1",
    minPrice: toPositiveInt(firstValue(params.minPrice)),
    maxPrice: toPositiveInt(firstValue(params.maxPrice)),
    targetAge: isTargetAge(targetAgeRaw) ? targetAgeRaw : undefined,
    skillLevel: isSkillLevel(skillLevelRaw) ? skillLevelRaw : undefined,
    sort,
    page: Math.max(1, pageNum),
  };
}

/**
 * 検索条件を URLSearchParams に変換する（既定値は省略）。
 * ページネーションのリンク生成や条件の保持に使用します。
 */
export function serializeSearchQuery(
  query: TeacherSearchQuery,
): URLSearchParams {
  const params = new URLSearchParams();
  if (query.keyword) params.set("keyword", query.keyword);
  if (query.categoryId) params.set("categoryId", query.categoryId);
  if (query.prefecture) params.set("prefecture", query.prefecture);
  if (query.online) params.set("online", "1");
  if (query.accepting) params.set("accepting", "1");
  if (query.verified) params.set("verified", "1");
  if (query.minPrice !== undefined)
    params.set("minPrice", String(query.minPrice));
  if (query.maxPrice !== undefined)
    params.set("maxPrice", String(query.maxPrice));
  if (query.targetAge) params.set("targetAge", query.targetAge);
  if (query.skillLevel) params.set("skillLevel", query.skillLevel);
  if (query.sort !== "new") params.set("sort", query.sort);
  if (query.page > 1) params.set("page", String(query.page));
  return params;
}

/** カード表示に必要な項目だけを取得する select（検索・お気に入り・閲覧履歴で共用） */
export const TEACHER_CARD_SELECT = {
  id: true,
  slug: true,
  displayName: true,
  catchphrase: true,
  profileImageUrl: true,
  priceMin: true,
  priceMax: true,
  isOnline: true,
  isAcceptingStudents: true,
  isVerified: true,
  ratingAverage: true,
  reviewCount: true,
  categories: { select: { category: { select: { name: true } } } },
  areas: { select: { prefecture: true } },
} satisfies Prisma.TeacherProfileSelect;

/** カード表示用の先生データ型 */
export type TeacherCardData = Prisma.TeacherProfileGetPayload<{
  select: typeof TEACHER_CARD_SELECT;
}>;

/** 検索結果 */
export interface TeacherSearchResult {
  items: TeacherCardData[];
  total: number;
  page: number;
  totalPages: number;
  pageSize: number;
}

/** 検索条件から Prisma の where 句を組み立てる */
function buildWhere(
  query: TeacherSearchQuery,
): Prisma.TeacherProfileWhereInput {
  const where: Prisma.TeacherProfileWhereInput = {
    // 公開中かつ承認済みのプロフィールのみ検索対象
    isPublic: true,
    status: "APPROVED",
  };

  if (query.keyword) {
    where.OR = [
      { displayName: { contains: query.keyword, mode: "insensitive" } },
      { catchphrase: { contains: query.keyword, mode: "insensitive" } },
      { bio: { contains: query.keyword, mode: "insensitive" } },
    ];
  }

  if (query.categoryId) {
    where.categories = { some: { categoryId: query.categoryId } };
  }

  if (query.prefecture) {
    where.areas = { some: { prefecture: query.prefecture } };
  }

  if (query.online) where.isOnline = true;
  if (query.accepting) where.isAcceptingStudents = true;
  if (query.verified) where.isVerified = true;
  if (query.targetAge) where.targetAges = { has: query.targetAge };
  if (query.skillLevel) where.skillLevels = { has: query.skillLevel };

  // 参考価格（先生の下限価格 priceMin を基準に絞り込む）
  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    where.priceMin = {
      ...(query.minPrice !== undefined ? { gte: query.minPrice } : {}),
      ...(query.maxPrice !== undefined ? { lte: query.maxPrice } : {}),
    };
  }

  return where;
}

/** 並び替え条件を組み立てる（価格は null を末尾に） */
function buildOrderBy(
  sort: TeacherSort,
): Prisma.TeacherProfileOrderByWithRelationInput {
  switch (sort) {
    case "price_asc":
      return { priceMin: { sort: "asc", nulls: "last" } };
    case "price_desc":
      return { priceMin: { sort: "desc", nulls: "last" } };
    default:
      return { createdAt: "desc" };
  }
}

/**
 * 新着の公開先生を取得する（トップページの新着セクション用）
 */
export async function getLatestPublishedTeachers(
  limit: number,
): Promise<TeacherCardData[]> {
  return db.teacherProfile.findMany({
    where: { isPublic: true, status: "APPROVED" },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: TEACHER_CARD_SELECT,
  });
}

/**
 * sitemap 用に、公開中の先生の slug 一覧のみ取得する
 */
export async function getPublishedTeacherSlugs(): Promise<
  { slug: string; updatedAt: Date }[]
> {
  return db.teacherProfile.findMany({
    where: { isPublic: true, status: "APPROVED" },
    orderBy: { updatedAt: "desc" },
    select: { slug: true, updatedAt: true },
  });
}

/**
 * 先生を検索する。
 * 総件数の取得と1ページ分の取得を同時に行い、ページ情報を返す。
 */
export async function searchTeachers(
  query: TeacherSearchQuery,
): Promise<TeacherSearchResult> {
  const where = buildWhere(query);
  const pageSize = TEACHERS_PAGE_SIZE;

  const total = await db.teacherProfile.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  // ページ番号を有効範囲に丸める
  const page = Math.min(query.page, totalPages);

  const items = await db.teacherProfile.findMany({
    where,
    orderBy: buildOrderBy(query.sort),
    skip: (page - 1) * pageSize,
    take: pageSize,
    select: TEACHER_CARD_SELECT,
  });

  return { items, total, page, totalPages, pageSize };
}
