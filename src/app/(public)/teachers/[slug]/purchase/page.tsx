import type { Metadata } from "next";
import type { Session } from "next-auth";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { SITE } from "@/constants/site";
import {
  BANK_TRANSFER_DEADLINE_DAYS,
  type BankAccountInfo,
} from "@/constants/bank-transfer";
import { getPublishedTeacherBySlug } from "@/lib/teacher/profile";
import { getActivePurchase } from "@/lib/purchase/purchase";
import {
  getBankAccountInfoForStudent,
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

/** 連絡先購入ページ（銀行振込）。口座情報は生徒ログイン時のみ取得・表示する。 */
export default async function PurchasePage({ params }: PurchasePageProps) {
  const { slug } = await params;
  const teacher = await getPublishedTeacherBySlug(slug);
  if (!teacher) {
    notFound();
  }

  const session = await auth();
  const isStudent = session?.user?.role === "STUDENT";

  // 未ログイン・非生徒には口座情報を一切載せない（サーバー側で取得しない）
  const bank: BankAccountInfo | null = isStudent
    ? await getBankAccountInfoForStudent()
    : null;
  const bankConfigured = bank ? isBankAccountConfigured(bank) : false;

  const deadline = new Date();
  deadline.setDate(deadline.getDate() + BANK_TRANSFER_DEADLINE_DAYS);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-2xl font-bold text-foreground">
        銀行振込で連絡先を購入
      </h1>

      {/* 先生・金額の概要（口座番号などは含めない） */}
      <Card className="mb-6">
        <div className="flex items-center gap-4">
          {teacher.profileImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={teacher.profileImageUrl}
              alt={teacher.displayName}
              className="h-16 w-16 rounded-full border border-border object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface text-2xl">
              🍫
            </div>
          )}
          <div>
            <p className="font-bold text-foreground">{teacher.displayName}</p>
            <p className="mt-1 text-sm text-muted">
              連絡先の閲覧料金 ¥{SITE.contactPrice.toLocaleString()}（税込）
            </p>
          </div>
        </div>
      </Card>

      {isStudent && bankConfigured && bank ? (
        <BankAccountCard
          account={bank}
          amount={SITE.contactPrice}
          teacherName={teacher.displayName}
          deadlineLabel={formatDate(deadline)}
        />
      ) : null}

      {isStudent && !bankConfigured ? (
        <Card className="mb-6">
          <p className="text-sm text-muted">
            現在、振込先口座の準備中です。しばらくしてから再度お試しください。
          </p>
        </Card>
      ) : null}

      {isStudent ? (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>ご注意</CardTitle>
          </CardHeader>
          <ul className="list-disc space-y-2 pl-5 text-sm text-muted">
            <li>振込後、サイト上で「振込しました」を報告してください。</li>
            <li>
              「振込しました」を押しただけでは連絡先は表示されません。運営が入金を確認した後に表示されます。
            </li>
            <li>一度購入すれば、購入履歴からいつでも連絡先を確認できます。</li>
            <li>レッスン料金は本料金に含まれません。</li>
            <li>購入後の返金はお受けできません。</li>
          </ul>
        </Card>
      ) : null}

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
          連絡先の購入には生徒アカウントでのログインが必要です。振込先口座情報はログイン後の購入画面でのみ表示されます。
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
