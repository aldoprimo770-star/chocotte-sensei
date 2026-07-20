import type { Metadata } from "next";
import { getAdminReports } from "@/lib/admin/queries";
import { REPORT_STATUS_LABELS } from "@/constants/consultation";
import { formatDate } from "@/lib/date";
import { StatusBadge } from "@/components/admin/status-badge";
import { ReportRowActions } from "./report-row-actions";

export const metadata: Metadata = { title: "通報一覧" };

/** 管理画面：通報一覧・対応 */
export default async function AdminReportsPage() {
  const reports = await getAdminReports();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-800">通報一覧</h1>
        <p className="mt-1 text-sm text-gray-500">
          事前相談に関する通報です。ステータスを更新して対応状況を管理できます。
        </p>
      </div>

      {reports.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center text-gray-500">
          通報はまだありません。
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-xs text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">日時</th>
                <th className="px-4 py-3 font-medium">通報者</th>
                <th className="px-4 py-3 font-medium">対象相談</th>
                <th className="px-4 py-3 font-medium">理由</th>
                <th className="px-4 py-3 font-medium">ステータス</th>
                <th className="px-4 py-3 font-medium">対応</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reports.map((r) => {
                const status = REPORT_STATUS_LABELS[r.status];
                const reporterName =
                  r.reporter.studentProfile?.displayName ??
                  r.reporter.teacherProfile?.displayName ??
                  r.reporter.email;
                const studentName =
                  r.conversation.student.studentProfile?.displayName ??
                  r.conversation.student.email;
                return (
                  <tr key={r.id} className="align-top">
                    <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                      {formatDate(r.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{reporterName}</p>
                      <p className="text-xs text-gray-500">{r.reporter.role}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      <p>
                        {studentName} ↔ {r.conversation.teacher.displayName}
                      </p>
                      {r.message && (
                        <p className="mt-1 line-clamp-2 text-xs text-gray-500">
                          対象メッセージ: {r.message.body}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p className="whitespace-pre-wrap text-gray-800">
                        {r.reason}
                      </p>
                      {r.adminNote && (
                        <p className="mt-1 text-xs text-gray-500">
                          管理者メモ: {r.adminNote}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        label={status.label}
                        className={status.className}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <ReportRowActions
                        reportId={r.id}
                        status={r.status}
                        adminNote={r.adminNote ?? ""}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
