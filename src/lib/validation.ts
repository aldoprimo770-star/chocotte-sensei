/**
 * 入力値の形式チェックに使う共通ユーティリティ
 */

/** http(s) の URL かどうか */
export function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * YouTube 動画の URL かどうか
 * 対応形式: youtube.com/watch?v=... / youtu.be/... / youtube.com/embed/...
 */
export function isYouTubeUrl(value: string): boolean {
  if (!isHttpUrl(value)) return false;
  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./, "");
    return host === "youtube.com" || host === "youtu.be" || host === "m.youtube.com";
  } catch {
    return false;
  }
}

/**
 * YouTube URL から動画IDを抽出する（埋め込み表示用）
 * 取得できない場合は null を返す。
 */
export function extractYouTubeId(value: string): string | null {
  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./, "");
    if (host === "youtu.be") {
      return url.pathname.slice(1) || null;
    }
    if (url.pathname.startsWith("/embed/")) {
      return url.pathname.split("/embed/")[1] || null;
    }
    return url.searchParams.get("v");
  } catch {
    return null;
  }
}
