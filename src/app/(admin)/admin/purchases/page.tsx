import type { Metadata } from "next";
import { getAdminPurchases } from "@/lib/admin/queries";
import {
  PAYMENT_METHOD_LABELS,
  PURCHASE_STATUS_LABELS,
} from "@/constants/purchase";
import { formatDate, formatDateTime } from "@/lib/date";
import { StatusBadge } from "@/components/admin/status-badge";
import { PurchaseRowActions } from "./purchase-row-actions";
import Link from "next/link";

export const metadata: Metadata = { title: "購入管理" };

/** 購入管理ページ（連絡先購入の一覧 + 入金確認） */
export default async function AdminPurchasesPage() {
  const purchases = await getAdminPurchases();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">購入管理</h1>
          <p className="mt-1 text-sm text-gray-500">
            入金確認待ちを優先表示します。「入金確認済みにする」で連絡先が開示されます。
          </p>
        </div>
        <Link
          href="/admin/bank-account"
          className="text-sm font-medium text-primary hover:underline"
        >
          振込先口座の設定 →
        </Link>
      </div>

      {purchases.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center text-gray-500">
          まだ購入はありません。
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-xs text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">購入日時</th>
                <th className="px-4 py-3 font-medium">生徒</th>
                <th className="px-4 py-3 font-medium">先生</th>
                <th className="px-4 py-3 font-medium">金額</th>
                <th className="px-4 py-3 font-medium">振込名義</th>
                <th className="px-4 py-3 font-medium">振込報告</th>
                <th className="px-4 py-3 font-medium">ステータス</th>
                <th className="px-4 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {purchases.map((purchase) => {
                const statusStyle = PURCHASE_STATUS_LABELS[purchase.status];
                const buyerName =
                  purchase.student.studentProfile?.displayName ?? "（未設定）";

                return (
                  <tr
                    key={purchase.id}
                    className={`align-top ${
                      purchase.status === "PAYMENT_REPORTED"
                        ? "bg-amber-50/60"
                        : ""
                    }`}
                  >
                    <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                      {formatDateTime(purchase.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{buyerName}</p>
                      <p className="text-xs text-gray-500">
                        {purchase.student.email}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {purchase.teacher.displayName}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                      ¥{purchase.amount.toLocaleString()}
                      <span className="mt-0.5 block text-xs text-gray-400">
                        {PAYMENT_METHOD_LABELS[purchase.paymentMethod]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {purchase.bankTransferName ?? "—"}
                      {purchase.transferDate ? (
                        <span className="mt-0.5 block text-xs text-gray-400">
                          振込日: {formatDate(purchase.transferDate)}
                        </span>
                      ) : null}
                      {purchase.studentMemo ? (
                        <span className="mt-0.5 block text-xs text-gray-400">
                          メモ: {purchase.studentMemo}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                      {formatDateTime(purchase.paymentReportedAt)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        label={statusStyle.label}
                        className={statusStyle.className}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <PurchaseRowActions
                        purchaseId={purchase.id}
                        status={purchase.status}
                        contactRevealed={purchase.contactRevealedAt !== null}
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
