import type { Metadata } from "next";
import { getAdminInquiries } from "@/lib/admin/queries";
import { INQUIRY_STATUS_LABELS } from "@/constants/admin";
import { formatDateTime } from "@/lib/date";
import { EmptyState } from "@/components/common/empty-state";
import { StatusBadge } from "@/components/admin/status-badge";import { InquiryRowActions } from "./inquiry-row-actions";

export const metadata: Metadata = { title: "お問い合わせ管理" };

/** お問い合わせ管理ページ（一覧 + 詳細 + ステータス変更） */
export default async function AdminInquiriesPage() {
  const inquiries = await getAdminInquiries();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-800">お問い合わせ管理</h1>
        <p className="mt-1 text-sm text-gray-500">
          受信したお問い合わせの一覧です（新しい順・最大100件）。
        </p>
      </div>

      {inquiries.length === 0 ? (
        <EmptyState preset="inquiries" />
      ) : (        <div className="space-y-3">
          {inquiries.map((inquiry) => {
            const statusStyle = INQUIRY_STATUS_LABELS[inquiry.status];

            return (
              <details
                key={inquiry.id}
                className="group rounded-2xl border border-gray-200 bg-white"
              >
                {/* サマリー行（詳細表示のトリガー） */}
                <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
                  <StatusBadge
                    label={statusStyle.label}
                    className={statusStyle.className}
                  />
                  <span className="text-xs text-gray-500">
                    {formatDateTime(inquiry.createdAt)}
                  </span>
                  <span className="font-medium text-gray-800">
                    {inquiry.name}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm text-gray-600">
                    {inquiry.subject}
                  </span>
                  <span className="text-xs text-primary group-open:hidden">
                    詳細を見る
                  </span>
                  <span className="hidden text-xs text-primary group-open:inline">
                    閉じる
                  </span>
                </summary>

                {/* 詳細 */}
                <div className="space-y-4 border-t border-gray-100 px-4 py-4">
                  <dl className="grid gap-2 text-sm sm:grid-cols-[8rem_1fr]">
                    <dt className="text-gray-500">氏名</dt>
                    <dd className="text-gray-800">{inquiry.name}</dd>
                    <dt className="text-gray-500">メールアドレス</dt>
                    <dd className="text-gray-800">
                      <a
                        href={`mailto:${inquiry.email}`}
                        className="text-primary hover:underline"
                      >
                        {inquiry.email}
                      </a>
                    </dd>
                    <dt className="text-gray-500">件名</dt>
                    <dd className="text-gray-800">{inquiry.subject}</dd>
                    <dt className="text-gray-500">内容</dt>
                    <dd className="whitespace-pre-wrap text-gray-800">
                      {inquiry.message}
                    </dd>
                  </dl>

                  <InquiryRowActions
                    inquiryId={inquiry.id}
                    status={inquiry.status}
                  />
                </div>
              </details>
            );
          })}
        </div>
      )}
    </div>
  );
}
