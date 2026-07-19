import type {
  AgeRange,
  Gender,
  Prisma,
  SkillLevel,
  TargetAge,
  TeachingMethod,
} from "@prisma/client";
import { getDb } from "@/lib/db";
import {
  isAgeRange,
  isGender,
  isSkillLevel,
  isTargetAge,
  isTeachingMethod,
  type TeacherSort,
} from "@/constants/teacher";
import { PREFECTURES } from "@/constants/prefectures";
import { isCityInPrefecture } from "@/constants/cities-by-prefecture";

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
  city: string;
  online: boolean;
  accepting: boolean;
  verified: boolean;
  minPrice?: number;
  maxPrice?: number;
  targetAge?: TargetAge;
  skillLevel?: SkillLevel;
  gender?: Gender;
  ageRange?: AgeRange;
  /** 講師歴 N年以上 */
  teachingYearsMin?: number;
  teachingMethod?: TeachingMethod;
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
  const validPrefecture = (PREFECTURES as readonly string[]).includes(
    prefecture,
  )
    ? prefecture
    : "";

  const cityRaw = firstValue(params.city).trim();
  const city =
    validPrefecture && cityRaw && isCityInPrefecture(validPrefecture, cityRaw)
      ? cityRaw
      : "";

  const targetAgeRaw = firstValue(params.targetAge);
  const skillLevelRaw = firstValue(params.skillLevel);
  const genderRaw = firstValue(params.gender);
  const ageRangeRaw = firstValue(params.ageRange);
  const teachingMethodRaw = firstValue(params.teachingMethod);
  const pageNum = toPositiveInt(firstValue(params.page)) ?? 1;
  const teachingYearsMin = toPositiveInt(firstValue(params.teachingYearsMin));

  // teachingMethod 未指定時のみ、旧 online=1 を互換として ONLINE/BOTH に相当する isOnline 検索へ
  const teachingMethod = isTeachingMethod(teachingMethodRaw)
    ? teachingMethodRaw
    : undefined;

  return {
    keyword: firstValue(params.keyword).trim().slice(0, 100),
    categoryId: firstValue(params.categoryId),
    prefecture: validPrefecture,
    city,
    online: !teachingMethod && firstValue(params.online) === "1",
    accepting: firstValue(params.accepting) === "1",
    verified: firstValue(params.verified) === "1",
    minPrice: toPositiveInt(firstValue(params.minPrice)),
    maxPrice: toPositiveInt(firstValue(params.maxPrice)),
    targetAge: isTargetAge(targetAgeRaw) ? targetAgeRaw : undefined,
    skillLevel: isSkillLevel(skillLevelRaw) ? skillLevelRaw : undefined,
    gender: isGender(genderRaw) ? genderRaw : undefined,
    ageRange: isAgeRange(ageRangeRaw) ? ageRangeRaw : undefined,
    teachingYearsMin,
    teachingMethod,
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
  if (query.city) params.set("city", query.city);
  if (query.online) params.set("online", "1");
  if (query.accepting) params.set("accepting", "1");
  if (query.verified) params.set("verified", "1");
  if (query.minPrice !== undefined)
    params.set("minPrice", String(query.minPrice));
  if (query.maxPrice !== undefined)
    params.set("maxPrice", String(query.maxPrice));
  if (query.targetAge) params.set("targetAge", query.targetAge);
  if (query.skillLevel) params.set("skillLevel", query.skillLevel);
  if (query.gender) params.set("gender", query.gender);
  if (query.ageRange) params.set("ageRange", query.ageRange);
  if (query.teachingYearsMin !== undefined)
    params.set("teachingYearsMin", String(query.teachingYearsMin));
  if (query.teachingMethod)
    params.set("teachingMethod", query.teachingMethod);
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
  teachingMethod: true,
  isAcceptingStudents: true,
  isVerified: true,
  ratingAverage: true,
  reviewCount: true,
  categories: { select: { category: { select: { name: true } } } },
  areas: { select: { prefecture: true, city: true } },
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
  const and: Prisma.TeacherProfileWhereInput[] = [];

  if (query.keyword) {
    and.push({
      OR: [
        { displayName: { contains: query.keyword, mode: "insensitive" } },
        { catchphrase: { contains: query.keyword, mode: "insensitive" } },
        { bio: { contains: query.keyword, mode: "insensitive" } },
      ],
    });
  }

  if (query.categoryId) {
    where.categories = { some: { categoryId: query.categoryId } };
  }

  // 地域: 市町村指定時は「その市」または「都道府県全域（city null）」をマッチ
  if (query.prefecture) {
    if (query.city) {
      where.areas = {
        some: {
          prefecture: query.prefecture,
          OR: [{ city: query.city }, { city: null }],
        },
      };
    } else {
      where.areas = { some: { prefecture: query.prefecture } };
    }
  }

  // 指導方法（新）優先。未設定時は旧 online=1 を isOnline で互換検索
  if (query.teachingMethod === "ONLINE") {
    and.push({
      OR: [
        { teachingMethod: "ONLINE" },
        { teachingMethod: "BOTH" },
        { teachingMethod: null, isOnline: true },
      ],
    });
  } else if (query.teachingMethod === "IN_PERSON") {
    and.push({
      OR: [
        { teachingMethod: "IN_PERSON" },
        { teachingMethod: "BOTH" },
        { teachingMethod: null, isOnline: false },
      ],
    });
  } else if (query.teachingMethod === "BOTH") {
    where.teachingMethod = "BOTH";
  } else if (query.online) {
    where.isOnline = true;
  }

  if (query.accepting) where.isAcceptingStudents = true;
  if (query.verified) where.isVerified = true;
  if (query.targetAge) where.targetAges = { has: query.targetAge };
  if (query.skillLevel) where.skillLevels = { has: query.skillLevel };
  if (query.gender) where.gender = query.gender;
  if (query.ageRange) where.ageRange = query.ageRange;
  if (query.teachingYearsMin !== undefined) {
    where.teachingYears = { gte: query.teachingYearsMin };
  }

  // 参考価格（先生の下限価格 priceMin を基準に絞り込む）
  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    where.priceMin = {
      ...(query.minPrice !== undefined ? { gte: query.minPrice } : {}),
      ...(query.maxPrice !== undefined ? { lte: query.maxPrice } : {}),
    };
  }

  if (and.length > 0) {
    where.AND = and;
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
  return getDb().teacherProfile.findMany({
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
  return getDb().teacherProfile.findMany({
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

  const total = await getDb().teacherProfile.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  // ページ番号を有効範囲に丸める
  const page = Math.min(query.page, totalPages);

  const items = await getDb().teacherProfile.findMany({
    where,
    orderBy: buildOrderBy(query.sort),
    skip: (page - 1) * pageSize,
    take: pageSize,
    select: TEACHER_CARD_SELECT,
  });

  return { items, total, page, totalPages, pageSize };
}
