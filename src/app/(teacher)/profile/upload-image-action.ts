"use server";

import { revalidatePath } from "next/cache";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/lib/db";
import { requireRole } from "@/lib/auth/session";
import {
  buildProfileImageKey,
  buildPublicImageUrl,
  extractR2KeyFromPublicUrl,
  validateProfileImageBytes,
  validateProfileImageFile,
} from "@/lib/r2/profile-image";
import {
  deleteProfileImageFromR2,
  getProfileImagesBucket,
  getR2PublicBaseUrl,
  putProfileImageToR2,
} from "@/lib/r2/storage";

/** プロフィール画像アップロードの戻り値 */
export type UploadProfileImageResult =
  | { success: true; url: string }
  | { success: false; error: string };

/**
 * プロフィール画像を Cloudflare R2 にアップロードし、
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

  const validation = validateProfileImageFile(file);
  if (!validation.ok) {
    return { success: false, error: validation.error };
  }

  const profile = await getDb().teacherProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true, profileImageUrl: true },
  });
  if (!profile) {
    return { success: false, error: "プロフィールが見つかりません" };
  }

  const { env } = await getCloudflareContext({ async: true });
  const publicBaseUrl = getR2PublicBaseUrl() ?? env.R2_PUBLIC_URL?.trim();
  if (!publicBaseUrl) {
    return {
      success: false,
      error: "画像の公開URLが設定されていません（R2_PUBLIC_URL）",
    };
  }

  const bucket = await getProfileImagesBucket();
  if (!bucket) {
    return {
      success: false,
      error: "画像ストレージが設定されていません（R2バケット）",
    };
  }

  const buffer = await file.arrayBuffer();
  if (!validateProfileImageBytes(buffer, validation.mimeType)) {
    return {
      success: false,
      error: "画像ファイルの形式が正しくありません",
    };
  }

  const key = buildProfileImageKey(profile.id, validation.extension);
  const imageUrl = buildPublicImageUrl(publicBaseUrl, key);

  try {
    await putProfileImageToR2(
      bucket,
      key,
      buffer,
      validation.mimeType,
    );

    await getDb().teacherProfile.update({
      where: { id: profile.id },
      data: { profileImageUrl: imageUrl },
    });

    // 以前の自バケット画像があれば削除
    if (profile.profileImageUrl) {
      const oldKey = extractR2KeyFromPublicUrl(
        profile.profileImageUrl,
        publicBaseUrl,
      );
      if (oldKey) {
        await deleteProfileImageFromR2(bucket, oldKey);
      }
    }
  } catch {
    return { success: false, error: "画像のアップロードに失敗しました" };
  }

  revalidatePath("/dashboard");
  revalidatePath("/profile");
  revalidatePath("/profile/preview");

  return { success: true, url: imageUrl };
}
