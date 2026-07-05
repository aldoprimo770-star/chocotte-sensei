import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/session";
import { getPurchaseForStudent } from "@/lib/purchase/purchase";
import {
  PAYMENT_METHOD_LABELS,
  PURCHASE_STATUS_LABELS,
} from "@/constants/purchase";
import { SITE } from "@/constants/site";
import { formatDateTime } from "@/lib/date";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/admin/status-badge";
import { ContactDetails } from "@/components/purchase/contact-details";

interface PurchaseDetailPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = { title: "購入詳細" };

/** 購入詳細ページ（COMPLETED のときのみ連絡先を表示） */
export default async function PurchaseDetailPage({
  params,
}: PurchaseDetailPageProps) {
  const { id } = await params;
  const session = await requireRole("STUDENT");

  // 本人の購入のみ取得。他人の購入IDでは null になり連絡先は漏れない
  const purchase = await getPurchaseForStudent(id, session.user.id);
  if (!purchase) {
    notFound();
  }

  const statusStyle = PURCHASE_STATUS_LABELS[purchase.status];
  const { teacher } = purchase;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link
          href="/mypage/purchases"
          className="text-sm text-primary hover:underline"
        >
          ← 購入履歴へ戻る
        </Link>
      </div>

      {/* 概要 */}
      <Card className="mb-6">
        <div className="flex items-center gap-4">
          <div>
            <p className="font-bold text-foreground">{teacher.displayName}</p>
            <p className="mt-1 text-xs text-muted">
              {formatDateTime(purchase.createdAt)}・
              {PAYMENT_METHOD_LABELS[purchase.paymentMethod]}・¥
              {purchase.amount.toLocaleString()}
            </p>
          </div>
          <StatusBadge
            label={statusStyle.label}
            className={`${statusStyle.className} ml-auto`}
          />
        </div>
      </Card>

      {/* 状態別の本文 */}
      {purchase.status === "COMPLETED" ? (
        // セキュリティ: COMPLETED かつ本人のときのみ連絡先を表示
        <ContactDetails
          displayName={teacher.displayName}
          email={teacher.user.email}
          phone={teacher.phone}
          websiteUrl={teacher.websiteUrl}
          snsUrl={teacher.snsUrl}
        />
      ) : purchase.status === "PENDING" ? (
        <Card>
          <CardHeader>
            <CardTitle>現在入金確認中です。</CardTitle>
          </CardHeader>
          {purchase.paymentMethod === "BANK_TRANSFER" ? (
            <div className="space-y-3 text-sm text-muted">
              <p>
                銀行振込のお申し込みを受け付けました。運営が入金を確認でき次第、
                こちらのページで連絡先を表示します。
              </p>
              <p>
                お振込先は運営からのご案内をご確認ください。ご不明な点は
                <Link href="/contact" className="text-primary hover:underline">
                  お問い合わせ
                </Link>
                ください。
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted">
              決済処理を確認しています。しばらくお待ちください。
            </p>
          )}
        </Card>
      ) : purchase.status === "FAILED" ? (
        <Card>
          <CardHeader>
            <CardTitle>決済に失敗しました</CardTitle>
          </CardHeader>
          <p className="mb-4 text-sm text-muted">
            お手数ですが、もう一度お試しください。
          </p>
          <Button href={`/teachers/${teacher.slug}/purchase`} variant="outline">
            もう一度購入する
          </Button>
        </Card>
      ) : (
        <Card>
          <p className="text-sm text-muted">
            この購入は返金済みです。ご不明な点は
            <Link href="/contact" className="text-primary hover:underline">
              お問い合わせ
            </Link>
            ください。
          </p>
        </Card>
      )}

      <p className="mt-6 text-center text-xs text-muted">
        レッスン料金は先生と直接やり取りします（{SITE.name}は関与しません）。
      </p>
    </div>
  );
}
