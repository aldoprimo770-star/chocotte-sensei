/**
 * 本人確認済みバッジ
 *
 * VERIFIED の先生のみ公開プロフィール・一覧カードに表示する。
 * PENDING / REJECTED では使わないこと。
 */
export function VerifiedBadge({
  size = "md",
}: {
  size?: "sm" | "md";
}) {
  const sizeClass =
    size === "sm"
      ? "px-2 py-0.5 text-xs gap-0.5"
      : "px-2.5 py-1 text-xs gap-1";

  return (
    <span
      className={`inline-flex items-center rounded-full border border-blue-200 bg-blue-50 font-medium text-blue-600 ${sizeClass}`}
    >
      <span aria-hidden="true">✅</span>
      本人確認済み
    </span>
  );
}
