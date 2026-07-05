import type { Metadata } from "next";
import Link from "next/link";
import { requireRole } from "@/lib/auth/session";
import { getStudentPurchases } from "@/lib/purchase/purchase";
import { PAYMENT_METHOD_LABELS, PURCHASE_STATUS_LABELS } from "@/constants/purchase";
import { formatDateTime } from "@/lib/date";
import { EmptyState } from "@/components/common/empty-state";
import { Card } from "@/components/ui/card";import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/admin/status-badge";

export const metadata: Metadata = { title: "購入履歴" };

/** 生徒の購入履歴ページ */
export default async function PurchasesPage() {
  const session = await requireRole("STUDENT");
  const purchases = await getStudentPurchases(session.user.id);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">購入履歴</h1>
        <Link href="/mypage" className="text-sm text-primary hover:underline">
          マイページへ
        </Link>
      </div>

      {purchases.length === 0 ? (
        <EmptyState preset="purchases" />
      ) : (        <ul className="space-y-3">
          {purchases.map((purchase) => {
            const statusStyle = PURCHASE_STATUS_LABELS[purchase.status];
            return (
              <li key={purchase.id}>
                <Card className="flex items-center gap-4">
                  {purchase.teacher.profileImageUrl ? (
                    // 外部URLのため next/image ではなく img を使用
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={purchase.teacher.profileImageUrl}
                      alt={purchase.teacher.displayName}
                      className="h-12 w-12 shrink-0 rounded-full border border-border object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-surface">
                      🍫
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground">
                      {purchase.teacher.displayName}
                    </p>
                    <p className="text-xs text-muted">
                      {formatDateTime(purchase.createdAt)}・
                      {PAYMENT_METHOD_LABELS[purchase.paymentMethod]}
                    </p>
                  </div>

                  <StatusBadge
                    label={statusStyle.label}
                    className={statusStyle.className}
                  />

                  <Button
                    href={`/mypage/purchases/${purchase.id}`}
                    variant={purchase.status === "COMPLETED" ? "primary" : "outline"}
                    size="sm"
                  >
                    {purchase.status === "COMPLETED" ? "連絡先を見る" : "詳細"}
                  </Button>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
