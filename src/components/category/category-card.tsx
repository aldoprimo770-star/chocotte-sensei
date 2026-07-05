import Link from "next/link";

/** カテゴリーカードに渡すデータ */
export interface CategoryCardData {
  name: string;
  slug: string;
  icon: string | null;
}

/**
 * カテゴリーカード（トップの人気カテゴリー・カテゴリー一覧で共通利用）
 * タップしやすい大きめの角丸カードにしています。
 */
export function CategoryCard({ category }: { category: CategoryCardData }) {
  return (
    <Link
      href={`/categories/${category.slug}`}
      className="group flex flex-col items-center justify-center gap-2 rounded-2xl border border-border bg-background px-4 py-6 text-center transition-colors hover:border-primary/40 hover:bg-primary-light"
    >
      <span className="text-3xl" aria-hidden="true">
        {category.icon ?? "📚"}
      </span>
      <span className="text-sm font-medium text-foreground group-hover:text-primary">
        {category.name}
      </span>
    </Link>
  );
}
