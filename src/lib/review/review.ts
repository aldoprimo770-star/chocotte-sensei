import { cache } from "react";
import { getDb } from "@/lib/db";

/**
 * レビューのデータ取得層 + 集計ヘルパー（サーバー専用）
 *
 * 集計は「非正規化」方式を採用。承認済みレビューから平均・件数を再計算し、
 * TeacherProfile.ratingAverage / reviewCount に保持することで、
 * 多数の先生カードを描画する検索画面で O(1) 読み取りを実現する。
 */

/** 公開プロフィール用：承認済みレビュー一覧（新しい順・投稿者名付き） */
export const getApprovedReviews = cache(async (teacherId: string) => {
  return getDb().review.findMany({
    where: { teacherId, status: "APPROVED" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      rating: true,
      title: true,
      comment: true,
      createdAt: true,
      student: {
        select: { studentProfile: { select: { displayName: true } } },
      },
    },
  });
});

/** 生徒本人が対象先生に投稿済みのレビュー（ステータス問わず。無ければ null） */
export const getStudentReviewForTeacher = cache(
  async (studentId: string, teacherId: string) => {
    return getDb().review.findUnique({
      where: { teacherId_studentId: { teacherId, studentId } },
      select: {
        id: true,
        rating: true,
        title: true,
        comment: true,
        status: true,
        createdAt: true,
      },
    });
  },
);

/** 生徒のレビュー履歴（マイページ用・新しい順・先生情報付き） */
export async function getStudentReviews(studentId: string) {
  return getDb().review.findMany({
    where: { studentId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      rating: true,
      title: true,
      comment: true,
      status: true,
      createdAt: true,
      teacher: { select: { displayName: true, slug: true } },
    },
  });
}

/**
 * 承認済みレビューから平均評価・件数を再計算し、TeacherProfile に反映する。
 * レビューの作成・更新・承認・非公開・削除の各操作後に必ず呼び出す。
 */
export async function recalcTeacherRating(teacherId: string): Promise<void> {
  const agg = await getDb().review.aggregate({
    where: { teacherId, status: "APPROVED" },
    _avg: { rating: true },
    _count: true,
  });

  await getDb().teacherProfile.update({
    where: { id: teacherId },
    data: {
      reviewCount: agg._count,
      // 小数第1位に丸めて保持（表示は★4.3 のような形）
      ratingAverage: agg._avg.rating
        ? Math.round(agg._avg.rating * 10) / 10
        : 0,
    },
  });
}
