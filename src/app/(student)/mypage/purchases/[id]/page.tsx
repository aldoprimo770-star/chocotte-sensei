import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/session";
import {
  canRevealContact,
  getPurchaseForStudent,
} from "@/lib/purchase/purchase";
import {
  PAYMENT_METHOD_LABELS,
  PURCHASE_STATUS_LABELS,
} from "@/constants/purchase";
import { BANK_TRANSFER_DEADLINE_DAYS } from "@/constants/bank-transfer";
import { SITE } from "@/constants/site";
import { formatDate, formatDateTime } from "@/lib/date";
import {
  getBankAccountInfo,
  isBankAccountConfigured,
} from "@/lib/settings/bank-account";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/admin/status-badge";
import { ContactDetails } from "@/components/purchase/contact-details";
import { BankAccountCard } from "@/components/purchase/bank-account-card";
import { PaymentReportForm } from "@/components/purchase/payment-report-form";

interface PurchaseDetailPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = { title: "購入詳細" };

/** 購入詳細（PAID のときのみ連絡先を表示） */
export default async function PurchaseDetailPage({
  params,
}: PurchaseDetailPageProps) {
  const { id } = await params;
  const session = await requireRole("STUDENT");

  const purchase = await getPurchaseForStudent(id, session.user.id);
  if (!purchase) {
    notFound();
  }

  const statusStyle = PURCHASE_STATUS_LABELS[purchase.status];
  const { teacher } = purchase;
  const revealed = canRevealContact(purchase.status);

  const bank = await getBankAccountInfo();
  const bankConfigured = isBankAccountConfigured(bank);
  const deadline = new Date(purchase.createdAt);
  deadline.setDate(deadline.getDate() + BANK_TRANSFER_DEADLINE_DAYS);

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

      {revealed ? (
        <ContactDetails
          displayName={teacher.displayName}
          email={teacher.user.email}
          phone={teacher.phone}
          lineId={teacher.lineId}
          youtubeUrl={teacher.youtubeUrl}
          websiteUrl={teacher.websiteUrl}
          snsUrl={teacher.snsUrl}
        />
      ) : purchase.status === "PENDING_PAYMENT" ? (
        <>
          {bankConfigured ? (
            <BankAccountCard
              account={bank}
              amount={purchase.amount}
              teacherName={teacher.displayName}
              deadlineLabel={formatDate(deadline)}
            />
          ) : null}

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>振込後の手続き</CardTitle>
            </CardHeader>
            <p className="mb-4 text-sm text-muted">
              上記口座へお振込み後、振込名義などを入力して「振込しました」を押してください。
              入金確認後、先生の連絡先が表示されます。
            </p>
            <PaymentReportForm
              purchaseId={purchase.id}
              defaultName={purchase.bankTransferName}
            />
          </Card>
        </>
      ) : purchase.status === "PAYMENT_REPORTED" ? (
        <Card>
          <CardHeader>
            <CardTitle>入金確認待ちです</CardTitle>
          </CardHeader>
          <div className="space-y-3 text-sm text-muted">
            <p>
              振込報告を受け付けました。運営が銀行口座への入金を確認でき次第、こちらのページで連絡先を表示します。
            </p>
            <p className="rounded-xl bg-primary-light/50 px-4 py-3 text-foreground">
              入金確認後、先生の連絡先が表示されます。
            </p>
            <dl className="space-y-1">
              {purchase.bankTransferName ? (
                <div>
                  <dt className="inline text-muted">振込名義：</dt>
                  <dd className="inline font-medium text-foreground">
                    {purchase.bankTransferName}
                  </dd>
                </div>
              ) : null}
              {purchase.transferDate ? (
                <div>
                  <dt className="inline text-muted">振込日：</dt>
                  <dd className="inline font-medium text-foreground">
                    {formatDate(purchase.transferDate)}
                  </dd>
                </div>
              ) : null}
              {purchase.paymentReportedAt ? (
                <div>
                  <dt className="inline text-muted">報告日時：</dt>
                  <dd className="inline font-medium text-foreground">
                    {formatDateTime(purchase.paymentReportedAt)}
                  </dd>
                </div>
              ) : null}
            </dl>
            <p>
              ご不明な点は
              <Link href="/contact" className="text-primary hover:underline">
                お問い合わせ
              </Link>
              ください。
            </p>
          </div>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>この購入はキャンセルされています</CardTitle>
          </CardHeader>
          <p className="mb-4 text-sm text-muted">
            再度購入する場合は、先生のプロフィールからお申し込みください。
          </p>
          <Button href={`/teachers/${teacher.slug}/purchase`} variant="outline">
            購入ページへ
          </Button>
        </Card>
      )}

      <p className="mt-6 text-center text-xs text-muted">
        レッスン料金は先生と直接やり取りします（{SITE.name}は関与しません）。
      </p>
    </div>
  );
}
