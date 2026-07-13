/// <reference types="@cloudflare/workers-types" />

import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { ProfileImageMimeType } from "@/lib/r2/constants";

/** R2 公開ベース URL（環境変数 / Workers vars） */
export function getR2PublicBaseUrl(): string | undefined {
  return process.env.R2_PUBLIC_URL?.trim() || undefined;
}

/** プロフィール画像用 R2 バケットを取得 */
export async function getProfileImagesBucket(): Promise<R2Bucket | null> {
  const { env } = await getCloudflareContext({ async: true });
  return env.PROFILE_IMAGES ?? null;
}

/** R2 にプロフィール画像を保存 */
export async function putProfileImageToR2(
  bucket: R2Bucket,
  key: string,
  body: ArrayBuffer,
  contentType: ProfileImageMimeType,
): Promise<void> {
  await bucket.put(key, body, {
    httpMetadata: { contentType },
  });
}

/** 自バケット内の古いプロフィール画像を削除（失敗してもアップロードは継続） */
export async function deleteProfileImageFromR2(
  bucket: R2Bucket,
  key: string,
): Promise<void> {
  try {
    await bucket.delete(key);
  } catch {
    // 削除失敗は無視（孤立オブジェクトは後で手動整理可能）
  }
}
