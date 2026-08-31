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
 * - 旧データの外部 HTTP URL も、サーバー側で取得して中継する（公開リダイレクトしない）
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
  if (r2Key) {
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

  // 既存互換: 外部 URL はブラウザへリダイレクトせず、サーバー側で取得して中継
  if (
    verification.documentUrl.startsWith("http://") ||
    verification.documentUrl.startsWith("https://")
  ) {
    try {
      const upstream = await fetch(verification.documentUrl, {
        redirect: "follow",
        headers: { Accept: "image/*,application/octet-stream" },
      });
      if (!upstream.ok) {
        return new Response("Not Found", { status: 404 });
      }
      const contentType =
        upstream.headers.get("content-type") ?? "application/octet-stream";
      const body = await upstream.arrayBuffer();
      return new Response(body, {
        status: 200,
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "private, no-store",
          "X-Content-Type-Options": "nosniff",
        },
      });
    } catch {
      return new Response("Not Found", { status: 404 });
    }
  }

  return new Response("Not Found", { status: 404 });
}
