"use client";

import { useCallback, useState } from "react";

/**
 * フォームで Turnstile を扱うための共通フック。
 *
 * サイトキーは Server Component から props で渡すこと。
 * （クライアントで process.env.NEXT_PUBLIC_* を直接読むと、
 * Cloudflare Workers の実行時変数が空になるため）
 * シークレットキーはサーバー専用で、クライアントには決して渡さない。
 */
export function useTurnstile(siteKey: string) {
  const [token, setToken] = useState<string | null>(null);
  // 値を変えるとウィジェットをリセットする（トークンは単回利用のため）
  const [resetSignal, setResetSignal] = useState(0);

  const reset = useCallback(() => {
    setToken(null);
    setResetSignal((n) => n + 1);
  }, []);

  return { siteKey, token, setToken, resetSignal, reset };
}
