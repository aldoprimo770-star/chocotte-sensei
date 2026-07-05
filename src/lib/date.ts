/**
 * 日付フォーマット共通ユーティリティ
 *
 * 表示は日本時間（Asia/Tokyo）に固定し、
 * サーバー環境のタイムゾーンに依存しないようにします。
 */

const dateFormatter = new Intl.DateTimeFormat("ja-JP", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone: "Asia/Tokyo",
});

const dateTimeFormatter = new Intl.DateTimeFormat("ja-JP", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Tokyo",
});

/** 日付を「2026/07/04」形式で表示（null は「—」） */
export function formatDate(date: Date | null | undefined): string {
  return date ? dateFormatter.format(date) : "—";
}

/** 日時を「2026/07/04 15:30」形式で表示（null は「—」） */
export function formatDateTime(date: Date | null | undefined): string {
  return date ? dateTimeFormatter.format(date) : "—";
}
