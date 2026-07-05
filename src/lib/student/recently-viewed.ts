import { db } from "@/lib/db";
import { TEACHER_CARD_SELECT, type TeacherCardData } from "@/lib/teacher/search";

/**
 * 最近見た先生のデータ取得層（サーバー専用）
 *
 * 閲覧履歴は本人（STUDENT）のマイページでのみ表示する。
 */

/** 保持する最大件数 */
export const MAX_RECENT_VIEWS = 20;

/**
 * 閲覧履歴を記録する（生徒が公開プロフィールを閲覧したときに呼ぶ）。
 * 同じ先生は viewedAt を更新。20件を超えた古い履歴は自動削除する。
 */
export async function recordRecentlyViewed(
  studentId: string,
  teacherId: string,
): Promise<void> {
  await db.$transaction(async (tx) => {
    await tx.recentlyViewed.upsert({
      where: { studentId_teacherId: { studentId, teacherId } },
      create: { studentId, teacherId, viewedAt: new Date() },
      update: { viewedAt: new Date() },
    });

    const rows = await tx.recentlyViewed.findMany({
      where: { studentId },
      orderBy: { viewedAt: "desc" },
      select: { teacherId: true },
    });

    if (rows.length > MAX_RECENT_VIEWS) {
      const toDelete = rows.slice(MAX_RECENT_VIEWS).map((r) => r.teacherId);
      await tx.recentlyViewed.deleteMany({
        where: { studentId, teacherId: { in: toDelete } },
      });
    }
  });
}

/** 最近見た先生一覧（公開中のみ・閲覧日時の新しい順・最大20件） */
export async function getStudentRecentlyViewedTeachers(
  studentId: string,
): Promise<TeacherCardData[]> {
  const rows = await db.recentlyViewed.findMany({
    where: {
      studentId,
      teacher: { isPublic: true, status: "APPROVED" },
    },
    orderBy: { viewedAt: "desc" },
    take: MAX_RECENT_VIEWS,
    include: { teacher: { select: TEACHER_CARD_SELECT } },
  });
  return rows.map((r) => r.teacher);
}
