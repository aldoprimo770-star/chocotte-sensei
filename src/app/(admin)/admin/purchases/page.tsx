import type { Metadata } from "next";
import { getAdminPurchases } from "@/lib/admin/queries";
import {
  PAYMENT_METHOD_LABELS,
  PURCHASE_STATUS_LABELS,
} from "@/constants/purchase";
import { formatDateTime } from "@/lib/date";
import { StatusBadge } from "@/components/admin/status-badge";
import { PurchaseRowActions } from "./purchase-row-actions";

export const metadata: Metadata = { title: "購入管理" };

/** 購入管理ページ（連絡先購入の一覧 + 入金確認） */
export default async function AdminPurchasesPage() {
  const purchases = await getAdminPurchases();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-800">購入管理</h1>
        <p className="mt-1 text-sm text-gray-500">
          連絡先購入の一覧です（新しい順・最大100件）。銀行振込は「入金確認」で完了になります。
        </p>
      </div>

      {purchases.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center text-gray-500">
          まだ購入はありません。
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-xs text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">購入者</th>
                <th className="px-4 py-3 font-medium">先生</th>
                <th className="px-4 py-3 font-medium">購入日時</th>
                <th className="px-4 py-3 font-medium">支払い方法</th>
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
                  <tr key={purchase.id} className="align-top">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{buyerName}</p>
                      <p className="text-xs text-gray-500">
                        {purchase.student.email}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {purchase.teacher.displayName}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                      {formatDateTime(purchase.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {PAYMENT_METHOD_LABELS[purchase.paymentMethod]}
                      {purchase.bankTransferName && (
                        <span className="block text-xs text-gray-400">
                          名義：{purchase.bankTransferName}
                        </span>
                      )}
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
                        paymentMethod={purchase.paymentMethod}
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
