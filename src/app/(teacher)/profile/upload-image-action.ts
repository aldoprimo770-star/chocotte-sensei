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
 * 先生プロフィール画像を Cloudflare R2 にアップロードし、
 * TeacherProfile.profileImageUrl を自動更新します。
 */
export async function uploadProfileImageAction(
  formData: FormData,
): Promise<UploadProfileImageResult> {
  const session = await requireRole("TEACHER");

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { success: false, error: "画像ファイルを選択してください" };
  }

  const profile = await getDb().teacherProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true, profileImageUrl: true },
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
    await getDb().teacherProfile.update({
      where: { id: profile.id },
      data: { profileImageUrl: result.url },
    });
    await deletePreviousProfileImageFromR2(profile.profileImageUrl);
  } catch {
    return { success: false, error: "画像のアップロードに失敗しました" };
  }

  revalidatePath("/dashboard");
  revalidatePath("/profile");
  revalidatePath("/profile/preview");

  return result;
}
