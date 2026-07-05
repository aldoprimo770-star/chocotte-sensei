import type { Metadata } from "next";
import { SITE } from "@/constants/site";
import { buildMetadata } from "@/lib/seo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/common/page-header";

export const metadata: Metadata = buildMetadata({
  title: "ご利用の流れ",
  description:
    "チョコット先生の使い方をご紹介します。先生を探して、プロフィールを見て、連絡先を確認し、直接やり取りするだけの簡単4ステップです。",
  path: "/flow",
});

/** 生徒向けの利用ステップ */
const STUDENT_STEPS = [
  {
    title: "先生を探す",
    desc: "カテゴリー・地域・キーワードから、気になる先生を検索します。オンライン対応や料金で絞り込めます。",
  },
  {
    title: "プロフィールを見る",
    desc: "自己紹介・レッスン内容・対応エリアなどを無料でじっくり確認できます。",
  },
  {
    title: "連絡先を見る",
    desc: `気に入った先生が見つかったら、${SITE.contactPrice.toLocaleString()}円で連絡先を確認できます。`,
  },
  {
    title: "直接やり取り",
    desc: "先生と直接連絡を取り、日程や料金を相談してレッスンを始めましょう。",
  },
] as const;

/** ご利用の流れページ */
export default function FlowPage() {
  return (
    <div>
      <PageHeader
        title="ご利用の流れ"
        subtitle="はじめての方でも安心。かんたん4ステップで先生と出会えます"
      />

      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <ol className="mx-auto grid max-w-4xl gap-5 sm:grid-cols-2">
          {STUDENT_STEPS.map((step, index) => (
            <li key={step.title}>
              <Card className="flex h-full gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-base font-bold text-white">
                  {index + 1}
                </span>
                <div>
                  <h2 className="mb-1 font-bold text-foreground">
                    {step.title}
                  </h2>
                  <p className="text-sm leading-relaxed text-muted">
                    {step.desc}
                  </p>
                </div>
              </Card>
            </li>
          ))}
        </ol>
      </section>

      {/* 補足 */}
      <section className="bg-surface px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm leading-relaxed text-muted">
            レッスン料金は先生と生徒の間で直接やり取りします。
            {SITE.name}はレッスン料金には関与しません。
            安心してご利用いただけるよう、プロフィール閲覧はすべて無料です。
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-16 text-center sm:px-6 lg:px-8">
        <Button href="/teachers" size="lg">
          先生を探す
        </Button>
      </section>
    </div>
  );
}
