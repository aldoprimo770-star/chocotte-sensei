/**
 * 本人確認済みバッジ
 *
 * 青色系・チェックマーク付きで、安心感がありつつ目立ちすぎない
 * デザインに統一します。検索カード・公開プロフィールで再利用します。
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
      <svg
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
        className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"}
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
      本人確認済み
    </span>
  );
}
