import { cache } from "react";
import { auth } from "@/auth";
import { getDb } from "@/lib/db";
import { TEACHER_CARD_SELECT, type TeacherCardData } from "@/lib/teacher/search";

/**
 * お気に入りのデータ取得層（サーバー専用）
 *
 * お気に入り一覧は本人（STUDENT）のマイページでのみ表示する。
 * 他ユーザーのお気に入りは取得しない。
 */

/** 生徒がお気に入り登録した teacherId の集合 */
export const getStudentFavoriteTeacherIds = cache(async (studentId: string) => {
  const rows = await getDb().favorite.findMany({
    where: { studentId },
    select: { teacherId: true },
  });
  return new Set(rows.map((r) => r.teacherId));
});

/** 対象先生がお気に入り済みか */
export async function isTeacherFavorited(
  studentId: string,
  teacherId: string,
): Promise<boolean> {
  const row = await getDb().favorite.findUnique({
    where: { studentId_teacherId: { studentId, teacherId } },
    select: { teacherId: true },
  });
  return !!row;
}

/** お気に入り登録した先生一覧（公開中のみ・登録日の新しい順） */
export async function getStudentFavoriteTeachers(
  studentId: string,
): Promise<TeacherCardData[]> {
  const rows = await getDb().favorite.findMany({
    where: {
      studentId,
      teacher: { isPublic: true, status: "APPROVED" },
    },
    orderBy: { createdAt: "desc" },
    include: { teacher: { select: TEACHER_CARD_SELECT } },
  });
  return rows.map((r) => r.teacher);
}

/** 生徒がお気に入り登録した teacherId 一覧（RSC シリアライズ可能な配列） */
export type FavoriteButtonContext =
  | { mode: "hidden" }
  | { mode: "guest"; callbackUrl: string }
  | { mode: "student"; callbackUrl: string; favoriteIds: string[] };

/**
 * 閲覧者に応じたお気に入りボタンの表示モードを返す。
 * - 生徒: トグル可能 + 登録済みID一覧
 * - 未ログイン: ログイン誘導
 * - 先生/管理者: 非表示
 */
export async function getFavoriteButtonContext(
  callbackUrl: string,
): Promise<FavoriteButtonContext> {
  const session = await auth();

  if (session?.user?.role === "STUDENT") {
    const favoriteIdSet = await getStudentFavoriteTeacherIds(session.user.id);
    return {
      mode: "student",
      callbackUrl,
      favoriteIds: [...favoriteIdSet],
    };
  }

  if (!session?.user) {
    return { mode: "guest", callbackUrl };
  }

  return { mode: "hidden" };
}
