import { auth } from "@/auth";
import { getDb } from "@/lib/db";
import { extractIdentityDocumentKey } from "@/lib/r2/identity-document";
import {
  getObjectFromR2,
  getProfileImagesBucket,
} from "@/lib/r2/storage";

/**
 * 本人確認書類画像の管理者専用配信。
 *
 * - ADMIN のみアクセス可
 * - R2 内部参照はバケットから直接取得（公開 URL は使わない）
 * - 旧データの外部 HTTP URL はリダイレクト
 */
export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return new Response("Forbidden", { status: 403 });
  }

  const { id } = await context.params;
  const verification = await getDb().identityVerification.findUnique({
    where: { id },
    select: { documentUrl: true },
  });

  if (!verification?.documentUrl) {
    return new Response("Not Found", { status: 404 });
  }

  const r2Key = extractIdentityDocumentKey(verification.documentUrl);
  if (!r2Key) {
    // 既存互換: 外部 URL の場合はリダイレクト
    if (
      verification.documentUrl.startsWith("http://") ||
      verification.documentUrl.startsWith("https://")
    ) {
      return Response.redirect(verification.documentUrl, 302);
    }
    return new Response("Not Found", { status: 404 });
  }

  const bucket = await getProfileImagesBucket();
  if (!bucket) {
    return new Response("Storage unavailable", { status: 503 });
  }

  const object = await getObjectFromR2(bucket, r2Key);
  if (!object) {
    return new Response("Not Found", { status: 404 });
  }

  const headers = new Headers();
  headers.set(
    "Content-Type",
    object.httpMetadata?.contentType ?? "application/octet-stream",
  );
  headers.set("Cache-Control", "private, no-store");
  headers.set("X-Content-Type-Options", "nosniff");

  return new Response(object.body, { status: 200, headers });
}
