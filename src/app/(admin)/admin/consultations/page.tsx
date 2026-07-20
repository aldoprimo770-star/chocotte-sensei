import type { Metadata } from "next";
import { getAdminConsultations } from "@/lib/admin/queries";
import { CONVERSATION_STATUS_LABELS } from "@/constants/consultation";
import { formatDate } from "@/lib/date";
import { StatusBadge } from "@/components/admin/status-badge";

export const metadata: Metadata = { title: "相談履歴" };

/** 管理画面：事前相談履歴一覧 */
export default async function AdminConsultationsPage() {
  const items = await getAdminConsultations();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-800">相談履歴</h1>
        <p className="mt-1 text-sm text-gray-500">
          生徒と先生の事前相談スレッド一覧です（新しい順・最大100件）。
        </p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center text-gray-500">
          相談履歴はまだありません。
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((c) => {
            const status = CONVERSATION_STATUS_LABELS[c.status];
            const studentName =
              c.student.studentProfile?.displayName ?? c.student.email;
            return (
              <details
                key={c.id}
                className="rounded-2xl border border-gray-200 bg-white open:shadow-sm"
              >
                <summary className="cursor-pointer list-none px-4 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-medium text-gray-800">
                        {studentName} ↔ {c.teacher.displayName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(c.lastMessageAt ?? c.createdAt)} ／ メッセージ
                        {c._count.messages}件
                        {c._count.reports > 0
                          ? ` ／ 通報${c._count.reports}件`
                          : ""}
                      </p>
                    </div>
                    <StatusBadge
                      label={status.label}
                      className={status.className}
                    />
                  </div>
                </summary>
                <div className="space-y-2 border-t border-gray-100 px-4 py-3">
                  {c.messages.map((m) => (
                    <div
                      key={m.id}
                      className="rounded-lg bg-gray-50 px-3 py-2 text-sm"
                    >
                      <p className="text-xs font-medium text-gray-500">
                        {m.senderRole === "STUDENT" ? "生徒" : "先生"} ／{" "}
                        {formatDate(m.createdAt)}
                      </p>
                      <p className="mt-1 whitespace-pre-wrap text-gray-800">
                        {m.body}
                      </p>
                    </div>
                  ))}
                </div>
              </details>
            );
          })}
        </div>
      )}
    </div>
  );
}
