import {
  PROFILE_IMAGE_ALLOWED_TYPES,
  PROFILE_IMAGE_KEY_PREFIX,
  PROFILE_IMAGE_MAX_BYTES,
  type ProfileImageMimeType,
} from "@/lib/r2/constants";

const EXT_BY_MIME: Record<ProfileImageMimeType, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

/** アップロード対象ファイルの検証結果 */
export type ProfileImageValidationResult =
  | { ok: true; mimeType: ProfileImageMimeType; extension: string }
  | { ok: false; error: string };

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

/** MIME タイプに対応するファイル先頭バイトか簡易検証 */
function matchesImageMagicBytes(
  bytes: Uint8Array,
  mimeType: ProfileImageMimeType,
): boolean {
  switch (mimeType) {
    case "image/jpeg":
      return bytes[0] === 0xff && bytes[1] === 0xd8;
    case "image/png":
      return (
        bytes[0] === 0x89 &&
        bytes[1] === 0x50 &&
        bytes[2] === 0x4e &&
        bytes[3] === 0x47
      );
    case "image/webp":
      return (
        bytes.length >= 12 &&
        bytes[0] === 0x52 &&
        bytes[1] === 0x49 &&
        bytes[2] === 0x46 &&
        bytes[3] === 0x46 &&
        bytes[8] === 0x57 &&
        bytes[9] === 0x45 &&
        bytes[10] === 0x42 &&
        bytes[11] === 0x50
      );
    default:
      return false;
  }
}

/** プロフィール画像ファイルを検証 */
export function validateProfileImageFile(file: File): ProfileImageValidationResult {
  if (file.size === 0) {
    return { ok: false, error: "画像ファイルを選択してください" };
  }
  if (file.size > PROFILE_IMAGE_MAX_BYTES) {
    return { ok: false, error: "画像は5MB以内にしてください" };
  }

  const mimeType = file.type as ProfileImageMimeType;
  if (!(PROFILE_IMAGE_ALLOWED_TYPES as readonly string[]).includes(mimeType)) {
    return {
      ok: false,
      error: "JPEG・PNG・WebP形式の画像を選択してください",
    };
  }

  return { ok: true, mimeType, extension: EXT_BY_MIME[mimeType] };
}

/** バイナリ内容が宣言 MIME と一致するか検証 */
export function validateProfileImageBytes(
  buffer: ArrayBuffer,
  mimeType: ProfileImageMimeType,
): boolean {
  return matchesImageMagicBytes(new Uint8Array(buffer), mimeType);
}
