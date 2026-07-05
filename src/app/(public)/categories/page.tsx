import type { Metadata } from "next";
import { SITE } from "@/constants/site";
import { getActiveCategories } from "@/lib/categories";
import { CategoryCard } from "@/components/category/category-card";

export const metadata: Metadata = {
  title: "カテゴリー一覧",
  description:
    "英語・プログラミング・音楽など、チョコット先生で学べる全カテゴリーの一覧です。",
  alternates: { canonical: `${SITE.url}/categories` },
};

/** カテゴリー一覧ページ */
export default async function CategoriesPage() {
  const categories = await getActiveCategories();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          カテゴリー一覧
        </h1>
        <p className="mt-2 text-sm text-muted">
          学びたいジャンルを選んで先生を探しましょう
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {categories.map((category) => (
          <CategoryCard key={category.slug} category={category} />
        ))}
      </div>
    </div>
  );
}
