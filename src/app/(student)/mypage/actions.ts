"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db";
import { requireRole } from "@/lib/auth/session";
import { studentProfileSchema } from "@/schemas/student.schema";
import type { StudentProfileFormInput } from "@/schemas/student.schema";
import type { FormActionResult } from "@/types/action";

/**
 * 生徒プロフィール保存 Server Action
 *
 * 認証・権限チェック後、サーバー側で再検証し、
 * プロフィール本体と興味カテゴリーをまとめて更新します。
 */
export async function saveStudentProfileAction(
  input: StudentProfileFormInput,
): Promise<FormActionResult> {
  const session = await requireRole("STUDENT");

  const profile = await getDb().studentProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!profile) {
    return { success: false, error: "プロフィールが見つかりません" };
  }

  // サーバー側バリデーション
  const parsed = studentProfileSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fieldErrors[key]) {
        fieldErrors[key] = issue.message;
      }
    }
    return {
      success: false,
      error: "入力内容を確認してください",
      fieldErrors,
    };
  }

  const data = parsed.data;

  // プロフィール本体 + 興味カテゴリーを更新（トランザクション）
  await getDb().$transaction([
    getDb().studentProfile.update({
      where: { id: profile.id },
      data: {
        displayName: data.displayName,
        bio: data.bio ?? null,
        avatarUrl: data.avatarUrl ?? null,
        prefecture: data.prefecture,
        isOnlinePreferred: data.isOnlinePreferred,
      },
    }),
    // 興味カテゴリーは一旦削除して作り直す（差分管理より単純で安全）
    getDb().studentCategory.deleteMany({ where: { studentId: profile.id } }),
    getDb().studentCategory.createMany({
      data: data.interestCategoryIds.map((categoryId) => ({
        studentId: profile.id,
        categoryId,
      })),
    }),
  ]);

  revalidatePath("/mypage");
  revalidatePath("/mypage/edit");

  return { success: true };
}
