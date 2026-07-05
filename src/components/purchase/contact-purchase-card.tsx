import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

/** 公開プロフィールに出す購入導線の状態 */
export type ContactCtaState =
  | { kind: "guest" }
  | { kind: "not-student" }
  | { kind: "buy" }
  | { kind: "owned"; purchaseId: string }
  | { kind: "pending"; purchaseId: string };

/**
 * 連絡先購入カード（公開プロフィールページ用）
 * 閲覧者の状態に応じて、購入ボタン / 閲覧ボタン / 案内を出し分けます。
 */
export function ContactPurchaseCard({
  slug,
  price,
  state,
}: {
  slug: string;
  price: number;
  state: ContactCtaState;
}) {
  return (
    <Card className="border-primary/30 bg-primary-light/40">
      <CardHeader>
        <CardTitle>先生に連絡する</CardTitle>
      </CardHeader>

      {state.kind === "owned" ? (
        <>
          <p className="mb-4 text-sm text-foreground">
            連絡先を購入済みです。いつでも連絡先を確認できます。
          </p>
          <Button href={`/mypage/purchases/${state.purchaseId}`}>
            連絡先を見る
          </Button>
        </>
      ) : state.kind === "pending" ? (
        <>
          <p className="mb-4 text-sm text-foreground">
            お申し込みを受け付けました。現在入金確認中です。
          </p>
          <Button href={`/mypage/purchases/${state.purchaseId}`} variant="outline">
            購入状況を見る
          </Button>
        </>
      ) : state.kind === "not-student" ? (
        <p className="text-sm text-muted">
          連絡先の購入は生徒アカウントでご利用いただけます。
        </p>
      ) : (
        <>
          <div className="mb-4 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-primary">
              ¥{price.toLocaleString()}
            </span>
            <span className="text-sm text-muted">（税込）で連絡先を開示</span>
          </div>
          <p className="mb-4 text-sm text-muted">
            購入すると、メールアドレス・電話番号などの連絡先を確認できます。
          </p>
          <Button href={`/teachers/${slug}/purchase`}>連絡先を購入する</Button>
        </>
      )}
    </Card>
  );
}
