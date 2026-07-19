import {
  IDENTITY_DOCUMENT_KEY_PREFIX,
  IDENTITY_DOCUMENT_MAX_BYTES,
  IDENTITY_DOCUMENT_REF_PREFIX,
} from "@/lib/r2/constants";
import {
  validateImageBytes,
  validateImageFile,
  type ImageMimeType,
  type ImageValidationResult,
} from "@/lib/r2/image-validation";
import { isHttpUrl } from "@/lib/validation";

/** 本人確認書類ファイルの検証結果 */
export type IdentityDocumentValidationResult = ImageValidationResult;

/** 本人確認書類用の一意な R2 キーを生成 */
export function buildIdentityDocumentKey(
  teacherProfileId: string,
  extension: string,
): string {
  const suffix = crypto.randomUUID();
  return `${IDENTITY_DOCUMENT_KEY_PREFIX}/${teacherProfileId}/${Date.now()}-${suffix}.${extension}`;
}

/** R2 キーを DB 保存用参照文字列へ変換 */
export function toIdentityDocumentRef(key: string): string {
  return `${IDENTITY_DOCUMENT_REF_PREFIX}${key}`;
}

/**
 * DB の documentUrl から R2 キーを取り出す。
 * 旧データ（外部 HTTP URL）の場合は null。
 */
export function extractIdentityDocumentKey(
  documentUrl: string,
): string | null {
  if (!documentUrl.startsWith(IDENTITY_DOCUMENT_REF_PREFIX)) {
    return null;
  }
  const key = documentUrl.slice(IDENTITY_DOCUMENT_REF_PREFIX.length);
  if (!key.startsWith(`${IDENTITY_DOCUMENT_KEY_PREFIX}/`)) {
    return null;
  }
  // パストラバーサル防止
  if (key.includes("..") || key.startsWith("/")) {
    return null;
  }
  return key;
}

/** 本人確認書類として有効な documentUrl / 参照か */
export function isValidIdentityDocumentRef(value: string): boolean {
  if (extractIdentityDocumentKey(value)) return true;
  // 既存データ互換: 外部 HTTP(S) URL
  return isHttpUrl(value);
}

/** 本人確認書類ファイルを検証（10MB まで） */
export function validateIdentityDocumentFile(
  file: File,
): IdentityDocumentValidationResult {
  return validateImageFile(file, IDENTITY_DOCUMENT_MAX_BYTES, "10MB");
}

/** バイナリ内容が宣言 MIME と一致するか検証 */
export function validateIdentityDocumentBytes(
  buffer: ArrayBuffer,
  mimeType: ImageMimeType,
): boolean {
  return validateImageBytes(buffer, mimeType);
}
