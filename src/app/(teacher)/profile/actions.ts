"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/session";
import {
  teacherProfileDraftSchema,
  teacherProfilePublishSchema,
  type TeacherProfileFormInput,
} from "@/schemas/teacher.schema";
import { calculateProfileCompletion } from "@/lib/teacher/profile-completion";
import type { FormActionResult } from "@/types/action";

/**
 * プロフィール保存 Server Action
 *
 * mode によって検証レベルと公開状態を切り替えます。
 * - "draft": 形式チェックのみ。status=DRAFT / 非公開
 * - "publish": 必須項目チェック。status=APPROVED / 公開
 *   （※本来は管理者承認フローを挟むが、MVPでは即公開とする）
 */

/** 保存モード */
export type SaveMode = "draft" | "publish";

/** Server Action の戻り値（共通型を利用） */
export type SaveProfileResult = FormActionResult;

export async function saveTeacherProfileAction(
  input: TeacherProfileFormInput,
  mode: SaveMode,
): Promise<SaveProfileResult> {
  // 認証・権限チェック（先生のみ）
  const session = await requireRole("TEACHER");

  // 対象プロフィールを取得
  const profile = await db.teacherProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!profile) {
    return { success: false, error: "プロフィールが見つかりません" };
  }

  // モードに応じたスキーマで検証
  const schema =
    mode === "publish"
      ? teacherProfilePublishSchema
      : teacherProfileDraftSchema;
  const parsed = schema.safeParse(input);

  if (!parsed.success) {
    // Zodのエラーをフィールド単位に整形
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fieldErrors[key]) {
        fieldErrors[key] = issue.message;
      }
    }
    return {
      success: false,
      error:
        mode === "publish"
          ? "公開に必要な項目が不足しています"
          : "入力内容を確認してください",
      fieldErrors,
    };
  }

  const data = parsed.data;

  // 完成率を計算
  const profileCompletion = calculateProfileCompletion({
    profileImageUrl: data.profileImageUrl,
    catchphrase: data.catchphrase,
    bio: data.bio,
    lessonContent: data.lessonContent,
    priceMin: data.priceMin,
    isOnline: data.isOnline,
    categoryCount: data.categoryIds.length,
    areaCount: data.prefectures.length,
    targetAgeCount: data.targetAges.length,
    skillLevelCount: data.skillLevels.length,
  });

  // プロフィール本体 + カテゴリー + 地域をまとめて更新（トランザクション）
  await db.$transaction([
    db.teacherProfile.update({
      where: { id: profile.id },
      data: {
        displayName: data.displayName,
        catchphrase: data.catchphrase ?? null,
        bio: data.bio ?? null,
        lessonContent: data.lessonContent ?? null,
        profileImageUrl: data.profileImageUrl ?? null,
        youtubeUrl: data.youtubeUrl ?? null,
        websiteUrl: data.websiteUrl ?? null,
        snsUrl: data.snsUrl ?? null,
        phone: data.phone ?? null,
        lineId: data.lineId ?? null,
        priceMin: data.priceMin ?? null,
        priceMax: data.priceMax ?? null,
        targetAges: data.targetAges,
        skillLevels: data.skillLevels,
        isOnline: data.isOnline,
        isAcceptingStudents: data.isAcceptingStudents,
        // 公開時のみ状態を更新（下書きは非公開のまま）
        isPublic: mode === "publish",
        status: mode === "publish" ? "APPROVED" : "DRAFT",
        profileCompletion,
      },
    }),
    // カテゴリーは一旦削除して作り直す（差分管理より単純で安全）
    db.teacherCategory.deleteMany({ where: { teacherId: profile.id } }),
    db.teacherCategory.createMany({
      data: data.categoryIds.map((categoryId) => ({
        teacherId: profile.id,
        categoryId,
      })),
    }),
    // 地域も同様に作り直す
    db.teacherArea.deleteMany({ where: { teacherId: profile.id } }),
    db.teacherArea.createMany({
      data: data.prefectures.map((prefecture) => ({
        teacherId: profile.id,
        prefecture,
      })),
    }),
  ]);

  // 関連ページのキャッシュを更新
  revalidatePath("/dashboard");
  revalidatePath("/profile");
  revalidatePath("/profile/preview");

  return { success: true };
}
