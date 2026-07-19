"use client";

import { useCallback, useState } from "react";

/**
 * フォームで Turnstile を扱うための共通フック。
 *
 * サイトキーは公開値のため NEXT_PUBLIC_TURNSTILE_SITE_KEY をクライアントで参照する。
 * （シークレットキーはサーバー専用で、クライアントには決して渡さない）
 */
export function useTurnstile() {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";
  const [token, setToken] = useState<string | null>(null);
  // 値を変えるとウィジェットをリセットする（トークンは単回利用のため）
  const [resetSignal, setResetSignal] = useState(0);

  const reset = useCallback(() => {
    setToken(null);
    setResetSignal((n) => n + 1);
  }, []);

  return { siteKey, token, setToken, resetSignal, reset };
}
