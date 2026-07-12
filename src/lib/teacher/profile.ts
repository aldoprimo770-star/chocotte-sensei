import { cache } from "react";
import type { Prisma } from "@prisma/client";
import { getDb } from "@/lib/db";

/**
 * 先生プロフィールのデータ取得層（サーバー専用）
 *
 * カテゴリー・地域などのリレーションを含めて取得します。
 * React の cache でラップし、同一リクエスト内の重複クエリを防ぎます。
 */

/** カテゴリー・地域を含めた先生プロフィールの型 */
export type TeacherProfileWithRelations = Prisma.TeacherProfileGetPayload<{
  include: {
    categories: { include: { category: true } };
    areas: true;
  };
}>;

/** ユーザーIDから先生プロフィールを取得（存在しなければ null） */
export const getTeacherProfileByUserId = cache(
  async (userId: string): Promise<TeacherProfileWithRelations | null> => {
    return getDb().teacherProfile.findUnique({
      where: { userId },
      include: {
        categories: { include: { category: true } },
        areas: true,
      },
    });
  },
);

/**
 * slug から「公開中」の先生プロフィールを取得（公開ページ用）
 * 非公開・未承認・存在しない場合は null を返す。
 */
export const getPublishedTeacherBySlug = cache(
  async (slug: string): Promise<TeacherProfileWithRelations | null> => {
    return getDb().teacherProfile.findFirst({
      where: {
        slug,
        isPublic: true,
        status: "APPROVED",
      },
      include: {
        categories: { include: { category: true } },
        areas: true,
      },
    });
  },
);
