"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/session";
import type { FormActionResult } from "@/types/action";

/** お気に入りトグル結果 */
export type ToggleFavoriteResult = FormActionResult & {
  favorited?: boolean;
};

/**
 * お気に入りの登録 / 解除 Server Action
 *
 * セキュリティ：
 *  - STUDENT ロール本人のみ
 *  - 公開中の先生のみ対象
 */
export async function toggleFavoriteAction(
  teacherId: string,
): Promise<ToggleFavoriteResult> {
  const session = await requireRole("STUDENT");
  const studentId = session.user.id;

  const teacher = await db.teacherProfile.findFirst({
    where: { id: teacherId, isPublic: true, status: "APPROVED" },
    select: { id: true, slug: true },
  });
  if (!teacher) {
    return { success: false, error: "先生が見つかりません。" };
  }

  try {
    const existing = await db.favorite.findUnique({
      where: { studentId_teacherId: { studentId, teacherId } },
      select: { teacherId: true },
    });

    if (existing) {
      await db.favorite.delete({
        where: { studentId_teacherId: { studentId, teacherId } },
      });
      revalidateFavoritePaths(teacher.slug);
      return { success: true, favorited: false };
    }

    await db.favorite.create({ data: { studentId, teacherId } });
    revalidateFavoritePaths(teacher.slug);
    return { success: true, favorited: true };
  } catch {
    return { success: false, error: "お気に入りの更新に失敗しました。" };
  }
}

/** お気に入り変更後にキャッシュを更新するパス */
function revalidateFavoritePaths(teacherSlug: string) {
  revalidatePath("/mypage/favorites");
  revalidatePath("/mypage");
  revalidatePath("/teachers");
  revalidatePath(`/teachers/${teacherSlug}`);
}
