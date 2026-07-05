/**
 * 星評価の表示（読み取り専用）
 *
 * value（0〜5）を★で表現します。半端値は四捨五入して整数の星数で表示。
 * 入力用のインタラクティブ星は投稿フォーム側に用意します。
 */
export function StarRating({
  value,
  size = "md",
}: {
  value: number;
  size?: "sm" | "md";
}) {
  const rounded = Math.round(value);
  const starClass = size === "sm" ? "text-sm" : "text-base";

  return (
    <span
      className={`inline-flex items-center ${starClass}`}
      role="img"
      aria-label={`5段階中 ${value} の評価`}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          aria-hidden="true"
          className={i <= rounded ? "text-yellow-400" : "text-gray-300"}
        >
          ★
        </span>
      ))}
    </span>
  );
}

/**
 * 平均評価サマリー（星 + 数値 + 件数）。
 * 件数0のときは「レビューなし」を表示します。
 */
export function RatingSummary({
  average,
  count,
  size = "md",
}: {
  average: number;
  count: number;
  size?: "sm" | "md";
}) {
  const textClass = size === "sm" ? "text-xs" : "text-sm";

  if (count === 0) {
    return <span className={`text-muted ${textClass}`}>レビューなし</span>;
  }

  return (
    <span className={`inline-flex items-center gap-1 ${textClass}`}>
      <StarRating value={average} size={size} />
      <span className="font-medium text-foreground">{average.toFixed(1)}</span>
      <span className="text-muted">（{count}件）</span>
    </span>
  );
}
