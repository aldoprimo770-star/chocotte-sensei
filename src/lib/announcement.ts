import { cache } from "react";
import { getDb } from "@/lib/db";

/**
 * お知らせのデータ取得層
 *
 * 公開ページは published=true のみ。
 * 表示順: displayOrder 昇順 → createdAt 降順（新しいものほど上）。
 */

const publicSelect = {
  id: true,
  title: true,
  content: true,
  createdAt: true,
  updatedAt: true,
  displayOrder: true,
} as const;

/** 公開中のお知らせを取得（トップ用・件数指定） */
export const getPublishedAnnouncements = cache(async (limit = 5) => {
  return getDb().announcement.findMany({
    where: { published: true },
    orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
    take: limit,
    select: publicSelect,
  });
});

/** 公開中のお知らせ一覧（一覧ページ用） */
export const getAllPublishedAnnouncements = cache(async () => {
  return getDb().announcement.findMany({
    where: { published: true },
    orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
    take: 100,
    select: publicSelect,
  });
});
