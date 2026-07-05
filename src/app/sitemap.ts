import type { MetadataRoute } from "next";
import { SITE } from "@/constants/site";
import { PREFECTURES } from "@/constants/prefectures";
import { getActiveCategorySlugs } from "@/lib/categories";
import { getPublishedTeacherSlugs } from "@/lib/teacher/search";

/**
 * サイトマップ（/sitemap.xml）
 *
 * 静的ページ・カテゴリー・地域・公開中の先生を列挙します。
 * DBへ接続できない場合でもビルドが失敗しないよう、
 * 動的部分は try/catch で保護し、静的ページのみ返します。
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // 静的ページ
  const staticEntries: MetadataRoute.Sitemap = [
    { url: SITE.url, lastModified: now, priority: 1 },
    { url: `${SITE.url}/teachers`, lastModified: now, priority: 0.9 },
    { url: `${SITE.url}/categories`, lastModified: now, priority: 0.8 },
    { url: `${SITE.url}/about`, lastModified: now, priority: 0.5 },
    { url: `${SITE.url}/faq`, lastModified: now, priority: 0.5 },
    { url: `${SITE.url}/contact`, lastModified: now, priority: 0.4 },
  ];

  // 地域ページ（47都道府県）
  const areaEntries: MetadataRoute.Sitemap = PREFECTURES.map((pref) => ({
    url: `${SITE.url}/areas/${encodeURIComponent(pref)}`,
    lastModified: now,
    priority: 0.6,
  }));

  try {
    const [categories, teachers] = await Promise.all([
      getActiveCategorySlugs(),
      getPublishedTeacherSlugs(),
    ]);

    const categoryEntries: MetadataRoute.Sitemap = categories.map((c) => ({
      url: `${SITE.url}/categories/${c.slug}`,
      lastModified: c.updatedAt,
      priority: 0.7,
    }));

    const teacherEntries: MetadataRoute.Sitemap = teachers.map((t) => ({
      url: `${SITE.url}/teachers/${t.slug}`,
      lastModified: t.updatedAt,
      priority: 0.8,
    }));

    return [
      ...staticEntries,
      ...areaEntries,
      ...categoryEntries,
      ...teacherEntries,
    ];
  } catch {
    // DB未接続などの場合は静的分のみ返す
    return [...staticEntries, ...areaEntries];
  }
}
