/** R2 バケットの Workers バインディング名（wrangler.jsonc と一致） */
export const PROFILE_IMAGES_BINDING = "PROFILE_IMAGES" as const;

/** プロフィール画像の R2 オブジェクトキー接頭辞 */
export const PROFILE_IMAGE_KEY_PREFIX = "profile-images" as const;

/** 本人確認書類の R2 オブジェクトキー接頭辞（公開 URL では配信しない） */
export const IDENTITY_DOCUMENT_KEY_PREFIX = "identity-documents" as const;

/** DB に保存する本人確認書類参照の接頭辞（r2:{key}） */
export const IDENTITY_DOCUMENT_REF_PREFIX = "r2:" as const;

/** 許可する MIME タイプ（後方互換の再エクスポート） */
export {
  IMAGE_ALLOWED_TYPES as PROFILE_IMAGE_ALLOWED_TYPES,
  type ImageMimeType as ProfileImageMimeType,
} from "@/lib/r2/image-validation";

/** プロフィール画像の最大ファイルサイズ（5MB） */
export const PROFILE_IMAGE_MAX_BYTES = 5 * 1024 * 1024;

/** 本人確認書類の最大ファイルサイズ（10MB） */
export const IDENTITY_DOCUMENT_MAX_BYTES = 10 * 1024 * 1024;
