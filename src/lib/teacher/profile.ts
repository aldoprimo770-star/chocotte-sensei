import { cache } from "react";
import type { Prisma } from "@prisma/client";
import { getDb } from "@/lib/db";

/**
 * 先生プロフィールのデータ取得層（サーバー専用）
 *
 * カテゴリー・地域などのリレーションを含めて取得します。
 * React の cache でラップし、同一リクエスト内の重複クエリを防ぎます。
 */

/** カテゴリー・地域を含めた先生プロフィールの型（先生本人用・全項目） */
export type TeacherProfileWithRelations = Prisma.TeacherProfileGetPayload<{
  include: {
    categories: { include: { category: true } };
    areas: true;
  };
}>;

/**
 * 公開ページで返してよい「無料公開」項目のみを列挙した select。
 *
 * セキュリティ上の重要ポイント:
 *   youtubeUrl / websiteUrl / snsUrl / phone / lineId や user.email などの
 *   連絡先につながる項目は、ここに含めない。
 *   これらは連絡先を購入済みの生徒・先生本人・管理者にのみ、
 *   getTeacherContactInfo() で別途取得する。
 */
export const TEACHER_PUBLIC_SELECT = {
  id: true,
  userId: true, // 先生本人かどうかの判定に使用（画面には出さない）
  slug: true,
  displayName: true,
  catchphrase: true,
  bio: true,
  lessonContent: true,
  profileImageUrl: true,
  priceMin: true,
  priceMax: true,
  targetAges: true,
  skillLevels: true,
  isOnline: true,
  hasTrial: true,
  isAcceptingStudents: true,
  isVerified: true,
  ratingAverage: true,
  reviewCount: true,
  viewCount: true,
  createdAt: true,
  updatedAt: true,
  categories: { select: { category: { select: { id: true, name: true } } } },
  areas: { select: { prefecture: true, city: true } },
} satisfies Prisma.TeacherProfileSelect;

/** 無料公開してよい項目のみを含む先生プロフィールの型 */
export type TeacherPublicProfile = Prisma.TeacherProfileGetPayload<{
  select: typeof TEACHER_PUBLIC_SELECT;
}>;

/** 連絡先購入後にのみ開示する項目（購入者・先生本人・管理者のみ取得可） */
export interface TeacherContactInfo {
  youtubeUrl: string | null;
  websiteUrl: string | null;
  snsUrl: string | null;
  phone: string | null;
  lineId: string | null;
  email: string | null;
}

/** ユーザーIDから先生プロフィールを取得（先生本人用・全項目。存在しなければ null） */
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
 * 連絡先系の項目は含めない（漏洩防止のため select で公開項目に限定）。
 */
export const getPublishedTeacherBySlug = cache(
  async (slug: string): Promise<TeacherPublicProfile | null> => {
    return getDb().teacherProfile.findFirst({
      where: {
        slug,
        isPublic: true,
        status: "APPROVED",
      },
      select: TEACHER_PUBLIC_SELECT,
    });
  },
);

/**
 * 先生の連絡先情報を取得する（サーバー専用・認可済み前提）。
 *
 * 必ず呼び出し側で「先生本人 / 管理者 / 連絡先購入済み(COMPLETED)の生徒」の
 * いずれかであることを確認してから呼び出すこと。
 * 認可されていない閲覧者には決して呼び出さない（呼び出さなければ
 * 連絡先が HTML / API レスポンスに一切含まれない）。
 */
export const getTeacherContactInfo = cache(
  async (teacherId: string): Promise<TeacherContactInfo | null> => {
    const teacher = await getDb().teacherProfile.findUnique({
      where: { id: teacherId },
      select: {
        youtubeUrl: true,
        websiteUrl: true,
        snsUrl: true,
        phone: true,
        lineId: true,
        user: { select: { email: true } },
      },
    });

    if (!teacher) {
      return null;
    }

    return {
      youtubeUrl: teacher.youtubeUrl,
      websiteUrl: teacher.websiteUrl,
      snsUrl: teacher.snsUrl,
      phone: teacher.phone,
      lineId: teacher.lineId,
      email: teacher.user.email,
    };
  },
);
