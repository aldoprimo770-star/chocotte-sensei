import type { Metadata } from "next";
import { getAdminStudents } from "@/lib/admin/queries";
import { formatDate, formatDateTime } from "@/lib/date";

export const metadata: Metadata = { title: "生徒管理" };

/** 生徒管理ページ（一覧） */
export default async function AdminStudentsPage() {
  const students = await getAdminStudents();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-800">生徒管理</h1>
        <p className="mt-1 text-sm text-gray-500">
          登録されている生徒の一覧です（新しい順・最大100件）。
        </p>
      </div>

      {students.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center text-gray-500">
          まだ生徒が登録されていません。
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-xs text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">表示名</th>
                <th className="px-4 py-3 font-medium">メールアドレス</th>
                <th className="px-4 py-3 font-medium">登録日</th>
                <th className="px-4 py-3 font-medium">最終ログイン</th>
                <th className="px-4 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {students.map((student) => (
                <tr key={student.id}>
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {student.displayName}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {student.user.email}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                    {formatDate(student.user.createdAt)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                    {formatDateTime(student.user.lastLoginAt)}
                  </td>
                  <td className="px-4 py-3">
                    <details className="group">
                      <summary className="cursor-pointer list-none text-xs font-medium text-primary hover:underline">
                        詳細
                      </summary>
                      <dl className="mt-2 space-y-1 text-xs text-gray-600">
                        <div>
                          <dt className="inline text-gray-500">都道府県：</dt>
                          <dd className="inline">
                            {student.prefecture ?? "未設定"}
                          </dd>
                        </div>
                        <p className="text-gray-400">
                          ※生徒情報の編集機能は今後のアップデートで追加予定です。
                        </p>
                      </dl>
                    </details>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
