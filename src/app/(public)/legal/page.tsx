import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/constants/site";
import { getOperatorPublicFields, OPERATOR_TODOS } from "@/constants/legal";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/common/page-header";

export const metadata: Metadata = buildMetadata({
  title: "特定商取引法に基づく表記・運営者情報",
  description: `${SITE.name}の特定商取引法に基づく表記および運営者情報です。`,
  path: "/legal",
});

/** 特定商取引法に基づく表記 + 運営者情報 */
export default function LegalPage() {
  const op = getOperatorPublicFields();

  const items: readonly { label: string; value: string }[] = [
    { label: "販売事業者", value: op.legalName },
    { label: "運営責任者", value: op.representative },
    { label: "所在地", value: op.address },
    { label: "電話番号", value: op.phone },
    { label: "連絡先", value: op.contact },
    {
      label: "販売価格",
      value: `先生の連絡先閲覧：1名につき${SITE.contactPrice.toLocaleString()}円（税込）`,
    },
    {
      label: "商品代金以外の必要料金",
      value: "インターネット接続に係る通信料等",
    },
    { label: "支払方法", value: "銀行振込" },
    {
      label: "支払時期",
      value:
        "購入手続き開始後、案内する振込先へお振り込みください。振込後、サイト上で振込報告を行ってください。",
    },
    {
      label: "サービス提供時期",
      value:
        "運営者が入金を確認し、購入を完了とした後に、先生の連絡先を表示します。",
    },
    {
      label: "返品・キャンセル",
      value:
        "サービスの性質上、連絡先購入後の返金・キャンセルは原則としてお受けできません。ただし、システム障害など運営者の責めに帰すべき事由がある場合、その他法令により認められる場合は個別に対応することがあります。",
    },
  ];

  const missing = OPERATOR_TODOS.filter((t) => {
    const raw =
      t.key === "legalName"
        ? op.legalName
        : t.key === "representative"
          ? op.representative
          : "";
    return raw.includes("未設定");
  });

  return (
    <div>
      <PageHeader title="特定商取引法に基づく表記" subtitle="運営者情報" />
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <dl className="divide-y divide-border overflow-hidden rounded-2xl border border-border">
          {items.map((item) => (
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

        <p className="mt-6 text-sm text-muted">
          個人情報の取り扱いについては
          <Link href="/privacy" className="text-primary hover:underline">
            プライバシーポリシー
          </Link>
          、ご利用条件については
          <Link href="/terms" className="text-primary hover:underline">
            利用規約
          </Link>
          をご確認ください。ご不明点は
          <Link href="/contact" className="text-primary hover:underline">
            お問い合わせ
          </Link>
          ください。
        </p>

        {missing.length > 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-border bg-surface px-5 py-4">
            <p className="text-sm font-medium text-foreground">
              運営者記入待ち（TODO）
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted">
              {OPERATOR_TODOS.map((t) => (
                <li key={t.key}>{t.label}</li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-muted">
              設定場所: <code className="text-xs">src/constants/legal.ts</code>{" "}
              の <code className="text-xs">OPERATOR</code>
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
