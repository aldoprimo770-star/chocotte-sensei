import type { Metadata } from "next";
import { getAdminVerifications } from "@/lib/admin/queries";
import {
  getDocumentTypeLabel,
  VERIFICATION_STATUS_LABELS,
} from "@/constants/verification";
import { formatDate } from "@/lib/date";
import { StatusBadge } from "@/components/admin/status-badge";
import { VerificationRowActions } from "./verification-row-actions";

export const metadata: Metadata = { title: "本人確認管理" };

/** 本人確認管理ページ（一覧 + 画像表示 + 承認/却下） */
export default async function AdminVerificationsPage() {
  const verifications = await getAdminVerifications();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-800">本人確認管理</h1>
        <p className="mt-1 text-sm text-gray-500">
          先生からの本人確認申請の一覧です（審査中を優先・最大100件）。
          提出画像は管理者のみが確認できます。
        </p>
      </div>

      {verifications.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center text-gray-500">
          本人確認の申請はまだありません。
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-xs text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">先生</th>
                <th className="px-4 py-3 font-medium">提出日</th>
                <th className="px-4 py-3 font-medium">書類種類</th>
                <th className="px-4 py-3 font-medium">画像</th>
                <th className="px-4 py-3 font-medium">ステータス</th>
                <th className="px-4 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {verifications.map((v) => {
                const statusStyle = VERIFICATION_STATUS_LABELS[v.status];
                const documentSrc = `/admin/verifications/${v.id}/document`;
                return (
                  <tr key={v.id} className="align-top">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">
                        {v.teacher.displayName}
                      </p>
                      {v.note && (
                        <p className="mt-1 text-xs text-gray-500">
                          備考：{v.note}
                        </p>
                      )}
                      {v.status === "REJECTED" && v.rejectReason && (
                        <p className="mt-1 text-xs text-accent">
                          却下理由：{v.rejectReason}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                      {formatDate(v.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {getDocumentTypeLabel(v.documentType)}
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={documentSrc}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-28"
                        title="クリックで拡大表示"
                      >
                        {/* 管理者専用ルート経由。公開ページには出さない */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={documentSrc}
                          alt={`${v.teacher.displayName}の本人確認書類`}
                          className="h-20 w-28 rounded-lg border border-gray-200 object-cover bg-gray-50"
                        />
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        label={statusStyle.label}
                        className={statusStyle.className}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <VerificationRowActions
                        verificationId={v.id}
                        status={v.status}
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
