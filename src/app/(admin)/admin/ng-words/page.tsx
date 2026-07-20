import type { Metadata } from "next";
import { getAdminNgWords } from "@/lib/admin/queries";
import { ensureDefaultNgWords } from "@/lib/consultation/ng-words";
import { NgWordCreateForm } from "./ng-word-create-form";
import { NgWordRow } from "./ng-word-row";

export const metadata: Metadata = { title: "NGワード管理" };

/** NGワード管理（追加・編集・削除） */
export default async function AdminNgWordsPage() {
  await ensureDefaultNgWords();
  const words = await getAdminNgWords();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-800">NGワード管理</h1>
        <p className="mt-1 text-sm text-gray-500">
          事前相談の送信時に検知する禁止ワードです。部分一致・大文字小文字を無視して判定します。
        </p>
      </div>

      <NgWordCreateForm />

      {words.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center text-gray-500">
          NGワードがありません。
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-xs text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">ワード</th>
                <th className="px-4 py-3 font-medium">カテゴリ</th>
                <th className="px-4 py-3 font-medium">状態</th>
                <th className="px-4 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {words.map((w) => (
                <NgWordRow key={w.id} word={w} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
