"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db";
import { requireRole } from "@/lib/auth/session";
import { calculateProfileCompletion } from "@/lib/teacher/profile-completion";
import {
  formValuesToInput,
  normalizeProfileFormValues,
} from "@/lib/teacher/normalize-profile-form";
import { prepareTeachingMethodsForSave } from "@/lib/teacher/teaching-methods";
import type { FormActionResult } from "@/types/action";
import {
  teacherProfileDraftSchema,
  teacherProfilePublishSchema,
  type TeacherProfileFormInput,
  type TeacherProfileFormValues,
} from "@/schemas/teacher.schema";

/**
 * プロフィール保存 Server Action
 *
 * mode によって検証レベルと公開状態を切り替えます。
 * - "draft": 形式チェックのみ。未公開なら DRAFT/非公開のまま。
 *           すでに公開中なら内容のみ更新し、公開状態は維持する。
 * - "publish": 必須項目チェックのうえ、内容を保存して即座に公開する。
 *   （※「公開する」だけで最新の編集内容が保存・公開される）
 */

/** 保存モード */
export type SaveMode = "draft" | "publish";

/** Server Action の戻り値（共通型を利用） */
export type SaveProfileResult = FormActionResult;

/** 1引数にまとめて Workers / Server Action シリアライズの取りこぼしを防ぐ */
export type SaveTeacherProfilePayload = {
  mode: SaveMode;
  /** クライアント検証済み、またはフォーム生値（サーバーで再正規化・再検証する） */
  values: TeacherProfileFormValues | TeacherProfileFormInput;
};

export async function saveTeacherProfileAction(
  payload: SaveTeacherProfilePayload,
): Promise<SaveProfileResult> {
  const mode = payload?.mode;
  if (mode !== "draft" && mode !== "publish") {
    return { success: false, error: "不正な保存リクエストです" };
  }
  if (!payload?.values || typeof payload.values !== "object") {
    return { success: false, error: "保存するプロフィールデータがありません" };
  }

  // 認証・権限チェック（先生のみ）
  const session = await requireRole("TEACHER");

  // 対象プロフィールを取得（公開状態の維持判定に使う）
  const profile = await getDb().teacherProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true, slug: true, isPublic: true, status: true },
  });
  if (!profile) {
    return { success: false, error: "プロフィールが見つかりません" };
  }

  // クライアントからの型ゆれを吸収し、サーバーでも再検証する
  const inputForValidation = normalizeProfileFormValues(
    formValuesToInput(payload.values as TeacherProfileFormValues),
  );
  const schema =
    mode === "publish"
      ? teacherProfilePublishSchema
      : teacherProfileDraftSchema;
  const parsed = schema.safeParse(inputForValidation);

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
      error:
        mode === "publish"
          ? "公開に必要な項目が不足しています。入力内容を確認してください"
          : "入力内容を確認してください",
      fieldErrors,
    };
  }

  const data = parsed.data;

  const teaching = prepareTeachingMethodsForSave(data.teachingMethods);
  const validAreas = data.areas.filter((a) => a.prefecture);

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

  // 公開状態:
  // - publish: 必ず公開
  // - draft: すでに公開中なら公開を維持（内容だけ更新）。未公開なら DRAFT のまま
  const keepPublished =
    mode === "draft" &&
    profile.isPublic === true &&
    profile.status === "APPROVED";
  const nextIsPublic = mode === "publish" ? true : keepPublished;
  const nextStatus =
    mode === "publish" ? "APPROVED" : keepPublished ? "APPROVED" : "DRAFT";

  // Cloudflare Workers + Prisma Accelerate では interactive $transaction が
  // 失敗しやすいため、逐次実行する
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
      teachingMethod: teaching.teachingMethod,
      isOnline: teaching.isOnline,
      priceMin: data.priceMin ?? null,
      priceMax: data.priceMax ?? null,
      targetAges: data.targetAges,
      skillLevels: data.skillLevels,
      isAcceptingStudents: data.isAcceptingStudents,
      isPublic: nextIsPublic,
      status: nextStatus,
      profileCompletion,
    },
  });

  await getDb().teacherCategory.deleteMany({ where: { teacherId: profile.id } });
  if (data.categoryIds.length > 0) {
    await getDb().teacherCategory.createMany({
      data: data.categoryIds.map((categoryId) => ({
        teacherId: profile.id,
        categoryId,
      })),
    });
  }

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
