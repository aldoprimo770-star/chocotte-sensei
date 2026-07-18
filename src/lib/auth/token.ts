/**
 * ワンタイムトークンの生成・ハッシュ化
 * Web Crypto API を使用（Cloudflare Workers 対応）
 */

/** 推測困難なランダムトークン（16進64文字） */
export function generateSecureToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

/** トークンを SHA-256 でハッシュ化（DB にはハッシュのみ保存） */
export async function hashToken(rawToken: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(rawToken),
  );
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}
