import type { Metadata } from "next";
import type { Session } from "next-auth";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { SITE } from "@/constants/site";
import { getPublishedTeacherBySlug } from "@/lib/teacher/profile";
import { getActivePurchase } from "@/lib/purchase/purchase";
import { isPayPalTestMode } from "@/lib/payments/paypal";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { PurchasePanel } from "./purchase-panel";

interface PurchasePageProps {
  params: Promise<{ slug: string }>;
}

export const metadata: Metadata = {
  title: "連絡先を購入する",
  robots: { index: false, follow: false },
};

/** 連絡先購入ページ */
export default async function PurchasePage({ params }: PurchasePageProps) {
  const { slug } = await params;
  const teacher = await getPublishedTeacherBySlug(slug);
  if (!teacher) {
    notFound();
  }

  const session = await auth();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-2xl font-bold text-foreground">連絡先を購入</h1>

      {/* 先生サマリー */}
      <Card className="mb-6">
        <div className="flex items-center gap-4">
          {teacher.profileImageUrl ? (
            // 外部URLのため next/image ではなく img を使用
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
            <p className="text-sm text-muted">
              {teacher.categories.length > 0
                ? teacher.categories.map((c) => c.category.name).join("、")
                : "カテゴリー未設定"}
            </p>
          </div>
        </div>

        <div className="mt-5 flex items-baseline justify-between border-t border-border pt-5">
          <span className="text-sm text-muted">連絡先の閲覧料金</span>
          <span className="text-2xl font-bold text-primary">
            ¥{SITE.contactPrice.toLocaleString()}
            <span className="ml-1 text-sm font-normal text-muted">
              （税込）
            </span>
          </span>
        </div>
      </Card>

      {/* 購入説明・注意事項 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>購入について</CardTitle>
        </CardHeader>
        <ul className="list-disc space-y-2 pl-5 text-sm text-muted">
          <li>
            購入すると、この先生の連絡先（メールアドレス・電話番号など）を閲覧できます。
          </li>
          <li>一度購入すれば、購入履歴からいつでも何度でも閲覧できます。</li>
          <li>レッスン料金は先生と直接やり取りします。本料金に含まれません。</li>
          <li>
            銀行振込の場合、入金確認が取れるまで連絡先は表示されません。
          </li>
          <li>購入後の返金はお受けできません。あらかじめご了承ください。</li>
        </ul>
      </Card>

      {/* 状態に応じた表示 */}
      <PurchaseArea teacherId={teacher.id} session={session} slug={slug} />
    </div>
  );
}

/**
 * ログイン状態・購入状態に応じて、購入パネルや案内を出し分ける。
 * サーバー側で判定し、購入資格のない相手には購入手段を見せない。
 */
async function PurchaseArea({
  teacherId,
  session,
  slug,
}: {
  teacherId: string;
  session: Session | null;
  slug: string;
}) {
  // 未ログイン
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

  // 生徒以外（先生・管理者）は購入不可
  if (session.user.role !== "STUDENT") {
    return (
      <Card>
        <p className="text-sm text-foreground">
          連絡先の購入は生徒アカウントでご利用いただけます。
        </p>
      </Card>
    );
  }

  // 既に有効な購入がある場合は購入詳細へ誘導
  const active = await getActivePurchase(session.user.id, teacherId);
  if (active) {
    redirect(`/mypage/purchases/${active.id}`);
  }

  return (
    <Card>
      <PurchasePanel
        teacherId={teacherId}
        price={SITE.contactPrice}
        paypalTestMode={isPayPalTestMode()}
      />
    </Card>
  );
}
