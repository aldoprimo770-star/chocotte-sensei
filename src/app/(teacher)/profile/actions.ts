"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db";
import { requireRole } from "@/lib/auth/session";
import { calculateProfileCompletion } from "@/lib/teacher/profile-completion";
import { formValuesToInput } from "@/lib/teacher/normalize-profile-form";
import { prepareTeachingMethodsForSave } from "@/lib/teacher/teaching-methods";
import type { FormActionResult } from "@/types/action";
import {
  teacherProfileDraftSchema,
  teacherProfilePublishSchema,
  type TeacherProfileFormValues,
} from "@/schemas/teacher.schema";

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
  /** zodResolver 検証済みの変換後データ（getValues の生値は渡さない） */
  values: TeacherProfileFormValues,
  mode: SaveMode,
): Promise<SaveProfileResult> {
  // 認証・権限チェック（先生のみ）
  const session = await requireRole("TEACHER");

  // 対象プロフィールを取得
  const profile = await getDb().teacherProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true, slug: true },
  });
  if (!profile) {
    return { success: false, error: "プロフィールが見つかりません" };
  }

  // クライアントで transform 済みの値を入力形へ戻し、サーバーでも再検証する
  const inputForValidation = formValuesToInput(values);
  const schema =
    mode === "publish"
      ? teacherProfilePublishSchema
      : teacherProfileDraftSchema;
  const parsed = schema.safeParse(inputForValidation);

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

  const teaching = prepareTeachingMethodsForSave(data.teachingMethods);
  const validAreas = data.areas.filter((a) => a.prefecture);

  // 完成率を計算
  const profileCompletion = calculateProfileCompletion({
    profileImageUrl: data.profileImageUrl,
    catchphrase: data.catchphrase,
    bio: data.bio,
    lessonContent: data.lessonContent,
    priceMin: data.priceMin,
    isOnline: teaching.isOnline,
    categoryCount: data.categoryIds.length,
    areaCount: validAreas.length,
    targetAgeCount: data.targetAges.length,
    skillLevelCount: data.skillLevels.length,
  });

  // プロフィール本体 + カテゴリー + 地域を更新
  // Cloudflare Workers + Prisma Accelerate では interactive $transaction が
  // 失敗しやすいため、逐次実行する（部分失敗時は次リクエストで再保存可能）
  await getDb().teacherProfile.update({
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
      gender: data.gender ?? null,
      ageRange: data.ageRange ?? null,
      teachingYears: data.teachingYears ?? null,
      teachingMethods: teaching.teachingMethods,
      // 旧単一カラム・isOnline を同期（検索互換）
      teachingMethod: teaching.teachingMethod,
      isOnline: teaching.isOnline,
      priceMin: data.priceMin ?? null,
      priceMax: data.priceMax ?? null,
      targetAges: data.targetAges,
      skillLevels: data.skillLevels,
      isAcceptingStudents: data.isAcceptingStudents,
      // 公開時のみ状態を更新（下書きは非公開のまま）
      isPublic: mode === "publish",
      status: mode === "publish" ? "APPROVED" : "DRAFT",
      profileCompletion,
    },
  });

  // カテゴリーは一旦削除して作り直す（差分管理より単純で安全）
  await getDb().teacherCategory.deleteMany({ where: { teacherId: profile.id } });
  if (data.categoryIds.length > 0) {
    await getDb().teacherCategory.createMany({
      data: data.categoryIds.map((categoryId) => ({
        teacherId: profile.id,
        categoryId,
      })),
    });
  }

  // 地域も同様に作り直す（市町村は任意）
  await getDb().teacherArea.deleteMany({ where: { teacherId: profile.id } });
  if (validAreas.length > 0) {
    await getDb().teacherArea.createMany({
      data: validAreas.map((area) => ({
        teacherId: profile.id,
        prefecture: area.prefecture,
        city: area.city || null,
      })),
    });
  }

  // 関連ページのキャッシュを更新（公開プロフィール含む）
  try {
    revalidatePath("/dashboard");
    revalidatePath("/profile");
    revalidatePath("/profile/preview");
    revalidatePath("/teachers");
    revalidatePath(`/teachers/${profile.slug}`);
  } catch (error) {
    console.error("[saveTeacherProfile] revalidatePath failed", error);
  }

  return { success: true };
}
