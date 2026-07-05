import type { Metadata } from "next";
import { SITE } from "@/constants/site";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/common/page-header";

export const metadata: Metadata = buildMetadata({
  title: "特定商取引法に基づく表記",
  description: `${SITE.name}の特定商取引法に基づく表記です。`,
  path: "/legal",
});

/**
 * 特定商取引法に基づく表記の項目
 * ※実際の事業者情報は開業時に確定した内容へ差し替えてください。
 */
const ITEMS: readonly { label: string; value: string }[] = [
  { label: "販売事業者", value: "（開業時に記載）" },
  { label: "運営責任者", value: "（開業時に記載）" },
  { label: "所在地", value: "（請求があれば遅滞なく開示します）" },
  { label: "連絡先", value: "お問い合わせフォームよりご連絡ください" },
  {
    label: "販売価格",
    value: `先生の連絡先閲覧：1名につき${SITE.contactPrice.toLocaleString()}円（税込）`,
  },
  { label: "商品代金以外の必要料金", value: "インターネット接続に係る通信料等" },
  { label: "支払方法", value: "PayPal・銀行振込（順次対応）" },
  { label: "支払時期", value: "各決済手段所定のタイミングでのお支払い" },
  {
    label: "サービス提供時期",
    value: "決済完了後、ただちに先生の連絡先を閲覧いただけます",
  },
  {
    label: "返品・キャンセル",
    value:
      "サービスの性質上、決済完了後の返金・キャンセルはお受けできません。",
  },
];

/** 特定商取引法に基づく表記ページ */
export default function LegalPage() {
  return (
    <div>
      <PageHeader title="特定商取引法に基づく表記" />
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <dl className="divide-y divide-border overflow-hidden rounded-2xl border border-border">
          {ITEMS.map((item) => (
            <div
              key={item.label}
              className="grid gap-1 bg-background px-5 py-4 sm:grid-cols-[10rem_1fr] sm:gap-4"
            >
              <dt className="text-sm font-medium text-foreground">
                {item.label}
              </dt>
              <dd className="text-sm leading-relaxed text-muted">
                {item.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
