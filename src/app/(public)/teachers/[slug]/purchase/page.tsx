import type { Metadata } from "next";
import type { Session } from "next-auth";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { SITE } from "@/constants/site";
import { BANK_TRANSFER_DEADLINE_DAYS } from "@/constants/bank-transfer";
import { getPublishedTeacherBySlug } from "@/lib/teacher/profile";
import { getActivePurchase } from "@/lib/purchase/purchase";
import {
  getBankAccountInfo,
  isBankAccountConfigured,
} from "@/lib/settings/bank-account";
import { formatDate } from "@/lib/date";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { BankAccountCard } from "@/components/purchase/bank-account-card";
import { PurchasePanel } from "./purchase-panel";

interface PurchasePageProps {
  params: Promise<{ slug: string }>;
}

export const metadata: Metadata = {
  title: "連絡先を購入する（銀行振込）",
  robots: { index: false, follow: false },
};

/** 連絡先購入ページ（銀行振込） */
export default async function PurchasePage({ params }: PurchasePageProps) {
  const { slug } = await params;
  const teacher = await getPublishedTeacherBySlug(slug);
  if (!teacher) {
    notFound();
  }

  const session = await auth();
  const bank = await getBankAccountInfo();
  const bankConfigured = isBankAccountConfigured(bank);

  const deadline = new Date();
  deadline.setDate(deadline.getDate() + BANK_TRANSFER_DEADLINE_DAYS);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-2xl font-bold text-foreground">
        銀行振込で連絡先を購入
      </h1>

      {bankConfigured ? (
        <BankAccountCard
          account={bank}
          amount={SITE.contactPrice}
          teacherName={teacher.displayName}
          deadlineLabel={formatDate(deadline)}
        />
      ) : (
        <Card className="mb-6">
          <p className="text-sm text-muted">
            現在、振込先口座の準備中です。しばらくしてから再度お試しください。
          </p>
        </Card>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>ご注意</CardTitle>
        </CardHeader>
        <ul className="list-disc space-y-2 pl-5 text-sm text-muted">
          <li>
            振込後、サイト上で「振込しました」を報告してください。
          </li>
          <li>
            「振込しました」を押しただけでは連絡先は表示されません。運営が入金を確認した後に表示されます。
          </li>
          <li>一度購入すれば、購入履歴からいつでも連絡先を確認できます。</li>
          <li>レッスン料金は本料金に含まれません。</li>
          <li>購入後の返金はお受けできません。</li>
        </ul>
      </Card>

      <PurchaseArea
        teacherId={teacher.id}
        session={session}
        slug={slug}
        bankConfigured={bankConfigured}
      />
    </div>
  );
}

async function PurchaseArea({
  teacherId,
  session,
  slug,
  bankConfigured,
}: {
  teacherId: string;
  session: Session | null;
  slug: string;
  bankConfigured: boolean;
}) {
  if (!session?.user) {
    return (
      <Card>
        <p className="mb-4 text-sm text-foreground">
          連絡先の購入にはログインが必要です。
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button href={`/login?callbackUrl=/teachers/${slug}/purchase`}>
            ログイン
          </Button>
          <Button href="/register/student" variant="outline">
            会員登録（無料）
          </Button>
        </div>
      </Card>
    );
  }

  if (session.user.role !== "STUDENT") {
    return (
      <Card>
        <p className="text-sm text-foreground">
          連絡先の購入は生徒アカウントでご利用いただけます。
        </p>
      </Card>
    );
  }

  const active = await getActivePurchase(session.user.id, teacherId);
  if (active) {
    if (active.status === "PAID") {
      redirect(`/mypage/purchases/${active.id}`);
    }
    redirect(`/mypage/purchases/${active.id}`);
  }

  return (
    <Card>
      <PurchasePanel
        teacherId={teacherId}
        price={SITE.contactPrice}
        bankConfigured={bankConfigured}
      />
    </Card>
  );
}
