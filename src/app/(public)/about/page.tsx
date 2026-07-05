import type { Metadata } from "next";
import { SITE } from "@/constants/site";
import { buildMetadata } from "@/lib/seo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/common/page-header";

export const metadata: Metadata = buildMetadata({
  title: "チョコット先生とは",
  description:
    "チョコット先生は、日本人の先生と生徒をつなぐ学びのマッチングサービスです。無料で先生を探し、気に入った先生と直接つながれます。",
  path: "/about",
});

/** サービスの特徴 */
const FEATURES = [
  {
    icon: "🔍",
    title: "無料で探せる",
    desc: "先生のプロフィールはすべて無料で閲覧できます。じっくり比較して、自分に合う先生を選べます。",
  },
  {
    icon: "🤝",
    title: "直接つながる",
    desc: "気に入った先生とは直接やり取り。レッスン料金に仲介手数料はかかりません。",
  },
  {
    icon: "🌸",
    title: "安心のしくみ",
    desc: "幅広いジャンルの先生が登録。オンライン・対面どちらにも対応しています。",
  },
] as const;

/** チョコット先生とは（サービス紹介ページ） */
export default function AboutPage() {
  return (
    <div>
      <PageHeader
        title={`${SITE.name}とは`}
        subtitle="学びたい人と教えたい人をつなぐ、学びのマッチングサービスです"
      />

      {/* リード文 */}
      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-base leading-relaxed text-foreground sm:text-lg">
            {SITE.name}は、語学・プログラミング・音楽・趣味など、
            さまざまなジャンルの「教えたい人」と「学びたい人」をつなぐ
            マッチングサービスです。
          </p>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            先生のプロフィール閲覧は無料。気に入った先生が見つかったら、
            {SITE.contactPrice.toLocaleString()}円で連絡先を確認し、
            あとは直接やり取りできます。運営はレッスン料金には関与しないため、
            先生も生徒も無理なく利用できます。
          </p>
        </div>
      </section>

      {/* 特徴 */}
      <section className="bg-surface px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-8 text-center text-2xl font-bold text-foreground sm:text-3xl">
            {SITE.name}の特徴
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {FEATURES.map((f) => (
              <Card key={f.title} className="h-full text-center">
                <span className="mb-3 inline-block text-4xl" aria-hidden="true">
                  {f.icon}
                </span>
                <h3 className="mb-2 font-bold text-foreground">{f.title}</h3>
                <p className="text-sm leading-relaxed text-muted">{f.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-3xl flex-col items-center justify-center gap-4 text-center sm:flex-row">
          <Button href="/teachers" size="lg">
            先生を探す
          </Button>
          <Button href="/teachers/register" variant="outline" size="lg">
            先生登録（無料）
          </Button>
        </div>
      </section>
    </div>
  );
}
