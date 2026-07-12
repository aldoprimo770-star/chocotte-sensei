import { cache } from "react";
import { getDb } from "@/lib/db";

/**
 * カテゴリー関連の共通データ取得（先生・生徒・公開ページで再利用）
 */

/** 表示・選択に使うカテゴリーの基本項目 */
const categorySelect = {
  id: true,
  name: true,
  slug: true,
  icon: true,
  description: true,
} as const;

/** 有効なカテゴリー一覧を表示順で取得 */
export const getActiveCategories = cache(async () => {
  return getDb().category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    select: categorySelect,
  });
});

/** slug から有効なカテゴリーを取得（カテゴリーページ用・なければ null） */
export const getCategoryBySlug = cache(async (slug: string) => {
  return getDb().category.findFirst({
    where: { slug, isActive: true },
    select: categorySelect,
  });
});

/** sitemap 用に、有効なカテゴリーの slug 一覧のみ取得 */
export const getActiveCategorySlugs = cache(async () => {
  return getDb().category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    select: { slug: true, updatedAt: true },
  });
});
