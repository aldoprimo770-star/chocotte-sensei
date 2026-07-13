/** R2 バケットの Workers バインディング名（wrangler.jsonc と一致） */
export const PROFILE_IMAGES_BINDING = "PROFILE_IMAGES" as const;

/** プロフィール画像の R2 オブジェクトキー接頭辞 */
export const PROFILE_IMAGE_KEY_PREFIX = "profile-images" as const;

/** 許可する MIME タイプ */
export const PROFILE_IMAGE_ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type ProfileImageMimeType = (typeof PROFILE_IMAGE_ALLOWED_TYPES)[number];

/** 最大ファイルサイズ（5MB） */
export const PROFILE_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
