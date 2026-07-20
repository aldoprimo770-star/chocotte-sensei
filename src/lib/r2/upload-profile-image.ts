import { getCloudflareContext } from "@opennextjs/cloudflare";
import {
  buildProfileImageKey,
  buildPublicImageUrl,
  extractR2KeyFromPublicUrl,
  validateProfileImageBytes,
  validateProfileImageFile,
} from "@/lib/r2/profile-image";
import {
  deleteObjectFromR2,
  getProfileImagesBucket,
  getR2PublicBaseUrl,
  putImageToR2,
} from "@/lib/r2/storage";

export type UploadProfileImageResult =
  | { success: true; url: string }
  | { success: false; error: string };

/**
 * プロフィール画像を R2 に保存し、公開 URL を返す（先生・生徒で共用）。
 * DB 更新後に deletePreviousProfileImageFromR2 で古い画像を削除すること。
 */
export async function uploadProfileImageToR2(params: {
  file: File;
  ownerProfileId: string;
}): Promise<UploadProfileImageResult> {
  const validation = validateProfileImageFile(params.file);
  if (!validation.ok) {
    return { success: false, error: validation.error };
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

  const buffer = await params.file.arrayBuffer();
  if (!validateProfileImageBytes(buffer, validation.mimeType)) {
    return {
      success: false,
      error: "画像ファイルの形式が正しくありません",
    };
  }

  const key = buildProfileImageKey(params.ownerProfileId, validation.extension);
  const imageUrl = buildPublicImageUrl(publicBaseUrl, key);

  try {
    await putImageToR2(bucket, key, buffer, validation.mimeType);
  } catch {
    return { success: false, error: "画像のアップロードに失敗しました" };
  }

  return { success: true, url: imageUrl };
}

/** 自バケット内の古いプロフィール画像を削除（失敗しても無視） */
export async function deletePreviousProfileImageFromR2(
  previousPublicUrl: string | null | undefined,
): Promise<void> {
  if (!previousPublicUrl) return;

  const { env } = await getCloudflareContext({ async: true });
  const publicBaseUrl = getR2PublicBaseUrl() ?? env.R2_PUBLIC_URL?.trim();
  if (!publicBaseUrl) return;

  const oldKey = extractR2KeyFromPublicUrl(previousPublicUrl, publicBaseUrl);
  if (!oldKey) return;

  const bucket = await getProfileImagesBucket();
  if (!bucket) return;

  await deleteObjectFromR2(bucket, oldKey);
}
