/**
 * 先生プロフィールの表示整形ユーティリティ
 * カード・詳細ページの両方で使い回します。
 */

/** 参考価格の表示を整形する（例: "2,000円 〜 5,000円"） */
export function formatPriceRange(
  priceMin: number | null,
  priceMax: number | null,
): string {
  if (priceMin === null && priceMax === null) return "応相談";
  if (priceMin !== null && priceMax !== null) {
    return `${priceMin.toLocaleString()}円 〜 ${priceMax.toLocaleString()}円`;
  }
  if (priceMin !== null) return `${priceMin.toLocaleString()}円 〜`;
  return `〜 ${priceMax?.toLocaleString()}円`;
}
