/// <reference types="@cloudflare/workers-types" />

import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { ImageMimeType } from "@/lib/r2/image-validation";

/** R2 公開ベース URL（環境変数 / Workers vars） */
export function getR2PublicBaseUrl(): string | undefined {
  return process.env.R2_PUBLIC_URL?.trim() || undefined;
}

/** プロフィール画像用 R2 バケットを取得（本人確認書類も同一バケット・非公開キーで保管） */
export async function getProfileImagesBucket(): Promise<R2Bucket | null> {
  const { env } = await getCloudflareContext({ async: true });
  return env.PROFILE_IMAGES ?? null;
}

/** R2 に画像を保存 */
export async function putImageToR2(
  bucket: R2Bucket,
  key: string,
  body: ArrayBuffer,
  contentType: ImageMimeType,
): Promise<void> {
  await bucket.put(key, body, {
    httpMetadata: {
      contentType,
      // 公開 CDN 経由でのキャッシュを避ける（本人確認書類向け）
      cacheControl: "private, no-store",
    },
  });
}

/** @deprecated putImageToR2 を使用 */
export async function putProfileImageToR2(
  bucket: R2Bucket,
  key: string,
  body: ArrayBuffer,
  contentType: ImageMimeType,
): Promise<void> {
  await putImageToR2(bucket, key, body, contentType);
}

/** R2 からオブジェクトを取得（管理者向け本人確認画像配信など） */
export async function getObjectFromR2(
  bucket: R2Bucket,
  key: string,
): Promise<R2ObjectBody | null> {
  return bucket.get(key);
}

/** 自バケット内の古い画像を削除（失敗しても処理は継続） */
export async function deleteObjectFromR2(
  bucket: R2Bucket,
  key: string,
): Promise<void> {
  try {
    await bucket.delete(key);
  } catch {
    // 削除失敗は無視（孤立オブジェクトは後で手動整理可能）
  }
}

/** @deprecated deleteObjectFromR2 を使用 */
export async function deleteProfileImageFromR2(
  bucket: R2Bucket,
  key: string,
): Promise<void> {
  await deleteObjectFromR2(bucket, key);
}
