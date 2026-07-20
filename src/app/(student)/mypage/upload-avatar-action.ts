"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db";
import { requireRole } from "@/lib/auth/session";
import {
  deletePreviousProfileImageFromR2,
  uploadProfileImageToR2,
  type UploadProfileImageResult,
} from "@/lib/r2/upload-profile-image";

/**
 * 生徒プロフィール画像を Cloudflare R2 にアップロードし、
 * StudentProfile.avatarUrl を自動更新します（先生と同じストレージ・検証）。
 */
export async function uploadStudentAvatarAction(
  formData: FormData,
): Promise<UploadProfileImageResult> {
  const session = await requireRole("STUDENT");

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { success: false, error: "画像ファイルを選択してください" };
  }

  const profile = await getDb().studentProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true, avatarUrl: true },
  });
  if (!profile) {
    return { success: false, error: "プロフィールが見つかりません" };
  }

  const result = await uploadProfileImageToR2({
    file,
    ownerProfileId: profile.id,
  });

  if (!result.success) {
    return result;
  }

  try {
    await getDb().studentProfile.update({
      where: { id: profile.id },
      data: { avatarUrl: result.url },
    });
    // 旧 URL が自バケットの場合のみ削除（外部 URL の既存データは残す）
    await deletePreviousProfileImageFromR2(profile.avatarUrl);
  } catch {
    return { success: false, error: "画像のアップロードに失敗しました" };
  }

  revalidatePath("/mypage");
  revalidatePath("/mypage/edit");

  return result;
}
