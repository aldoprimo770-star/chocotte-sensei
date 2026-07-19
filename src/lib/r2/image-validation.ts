/**
 * 画像ファイル検証（プロフィール写真・本人確認書類で共用）
 */

export const IMAGE_ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type ImageMimeType = (typeof IMAGE_ALLOWED_TYPES)[number];

const EXT_BY_MIME: Record<ImageMimeType, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

/** アップロード対象ファイルの検証結果 */
export type ImageValidationResult =
  | { ok: true; mimeType: ImageMimeType; extension: string }
  | { ok: false; error: string };

/** MIME タイプに対応するファイル先頭バイトか簡易検証 */
export function matchesImageMagicBytes(
  bytes: Uint8Array,
  mimeType: ImageMimeType,
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

/**
 * 画像ファイルを検証する。
 * @param maxBytes 上限バイト数
 * @param maxLabel エラーメッセージ用（例: "5MB" / "10MB"）
 */
export function validateImageFile(
  file: File,
  maxBytes: number,
  maxLabel: string,
): ImageValidationResult {
  if (file.size === 0) {
    return { ok: false, error: "画像ファイルを選択してください" };
  }
  if (file.size > maxBytes) {
    return { ok: false, error: `画像は${maxLabel}以内にしてください` };
  }

  const mimeType = file.type as ImageMimeType;
  if (!(IMAGE_ALLOWED_TYPES as readonly string[]).includes(mimeType)) {
    return {
      ok: false,
      error: "JPEG・PNG・WebP形式の画像を選択してください",
    };
  }

  return { ok: true, mimeType, extension: EXT_BY_MIME[mimeType] };
}

/** バイナリ内容が宣言 MIME と一致するか検証 */
export function validateImageBytes(
  buffer: ArrayBuffer,
  mimeType: ImageMimeType,
): boolean {
  return matchesImageMagicBytes(new Uint8Array(buffer), mimeType);
}
