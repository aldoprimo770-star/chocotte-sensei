import type { Metadata } from "next";
import { getAdminCategories } from "@/lib/admin/queries";
import { CategoryCreateForm } from "./category-create-form";
import { CategoryRow } from "./category-row";

export const metadata: Metadata = { title: "カテゴリー管理" };

/** カテゴリー管理ページ（一覧・追加・編集・表示切替・削除） */
export default async function AdminCategoriesPage() {
  const categories = await getAdminCategories();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-800">カテゴリー管理</h1>
        <p className="mt-1 text-sm text-gray-500">
          先生検索で使うカテゴリーを追加・編集できます。削除ではなく「非表示」にすると、既存の関連を保ったまま検索候補から外せます。
        </p>
      </div>

      <CategoryCreateForm />

      {categories.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center text-gray-500">
          カテゴリーがまだ登録されていません。上のフォームから追加してください。
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-xs text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">カテゴリー名</th>
                <th className="px-4 py-3 font-medium">表示順</th>
                <th className="px-4 py-3 font-medium">状態</th>
                <th className="px-4 py-3 font-medium">利用数</th>
                <th className="px-4 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {categories.map((category) => (
                <CategoryRow
                  key={`${category.id}-${category.updatedAt.toISOString()}`}
                  category={category}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
