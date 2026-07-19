/**
 * Turnstile 環境変数の読み取り（サーバー専用）
 *
 * Cloudflare Workers では NEXT_PUBLIC_* をクライアントから直接読むと
 * 「ビルド時に埋め込まれていない」場合は空文字になる。
 * そのためサイトキーはサーバー側で読み取り、props でクライアントへ渡す。
 *
 * 対応する変数名（いずれかがあればよい）:
 * - NEXT_PUBLIC_TURNSTILE_SITE_KEY（推奨・ユーザー指定名）
 * - TURNSTILE_SITE_KEY（wrangler vars 向けの別名）
 */

/** 公開用サイトキーを取得する（未設定なら空文字） */
export function getTurnstileSiteKey(): string {
  return (
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() ||
    process.env.TURNSTILE_SITE_KEY?.trim() ||
    ""
  );
}

/** シークレットキーが設定されているか（値自体は返さない） */
export function hasTurnstileSecretKey(): boolean {
  return Boolean(process.env.TURNSTILE_SECRET_KEY?.trim());
}
