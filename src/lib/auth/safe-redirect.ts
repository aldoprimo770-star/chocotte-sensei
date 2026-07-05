/**
 * ログイン後リダイレクト先の安全な検証
 *
 * オープンリダイレクト攻撃を防ぐため、相対パスのみ許可します。
 */
export function getSafeRedirectPath(
  path: string | undefined | null,
  fallback: string,
): string {
  if (!path || typeof path !== "string") {
    return fallback;
  }

  const trimmed = path.trim();

  // 単一スラッシュ始まりの相対パスのみ許可
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return fallback;
  }

  // バックスラッシュ・NULLバイト・改行を拒否
  if (/[\0\\]/.test(trimmed) || /[\r\n]/.test(trimmed)) {
    return fallback;
  }

  // URLエンコードされた bypass を検出（例: /%2f%2fevil.com）
  try {
    const decoded = decodeURIComponent(trimmed);
    if (
      decoded.startsWith("//") ||
      decoded.includes("://") ||
      /[\0\\]/.test(decoded)
    ) {
      return fallback;
    }
  } catch {
    return fallback;
  }

  return trimmed;
}
