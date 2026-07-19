import {
  PROFILE_IMAGE_KEY_PREFIX,
  PROFILE_IMAGE_MAX_BYTES,
  type ProfileImageMimeType,
} from "@/lib/r2/constants";
import {
  validateImageBytes,
  validateImageFile,
  type ImageValidationResult,
} from "@/lib/r2/image-validation";

/** アップロード対象ファイルの検証結果 */
export type ProfileImageValidationResult = ImageValidationResult;

/** 公開 URL から R2 オブジェクトキーを抽出（自バケットの画像削除用） */
export function extractR2KeyFromPublicUrl(
  publicUrl: string,
  publicBaseUrl: string,
): string | null {
  const base = publicBaseUrl.replace(/\/$/, "");
  if (!publicUrl.startsWith(`${base}/`)) {
    return null;
  }
  const key = publicUrl.slice(base.length + 1);
  if (!key.startsWith(`${PROFILE_IMAGE_KEY_PREFIX}/`)) {
    return null;
  }
  return key;
}

/** プロフィール画像用の一意な R2 キーを生成 */
export function buildProfileImageKey(
  teacherProfileId: string,
  extension: string,
): string {
  const suffix = crypto.randomUUID();
  return `${PROFILE_IMAGE_KEY_PREFIX}/${teacherProfileId}/${Date.now()}-${suffix}.${extension}`;
}

/** 公開ベース URL とキーから画像 URL を組み立て */
export function buildPublicImageUrl(publicBaseUrl: string, key: string): string {
  return `${publicBaseUrl.replace(/\/$/, "")}/${key}`;
}

/** プロフィール画像ファイルを検証 */
export function validateProfileImageFile(file: File): ProfileImageValidationResult {
  return validateImageFile(file, PROFILE_IMAGE_MAX_BYTES, "5MB");
}

/** バイナリ内容が宣言 MIME と一致するか検証 */
export function validateProfileImageBytes(
  buffer: ArrayBuffer,
  mimeType: ProfileImageMimeType,
): boolean {
  return validateImageBytes(buffer, mimeType);
}
