import type { Metadata } from "next";
import { SITE } from "@/constants/site";
import { GENERAL_FAQS } from "@/constants/faq";
import { getActiveCategories } from "@/lib/categories";
import { getLatestPublishedTeachers } from "@/lib/teacher/search";
import { getFavoriteButtonContext } from "@/lib/student/favorites";
import { JsonLd } from "@/components/seo/json-ld";
import {
  buildOrganizationJsonLd,
  buildWebSiteJsonLd,
} from "@/lib/seo/structured-data";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CategoryCard } from "@/components/category/category-card";
import { TeacherGrid } from "@/components/teacher/teacher-grid";
import { FaqAccordion } from "@/components/common/faq-accordion";
import { HeroSearch } from "@/components/home/hero-search";

/** トップページの SEO メタデータ */
export const metadata: Metadata = {
  title: `${SITE.name} | ${SITE.tagline}`,
  description: SITE.description,
  alternates: { canonical: SITE.url },
  openGraph: {
    type: "website",
    url: SITE.url,
    title: `${SITE.name} | ${SITE.tagline}`,
    description: SITE.description,
    siteName: SITE.name,
  },
};

/** ご利用の流れ（生徒向け） */
const FLOW_STEPS = [
  { title: "先生を探す", desc: "カテゴリーや地域から、気になる先生を検索します。" },
  { title: "プロフィールを見る", desc: "自己紹介やレッスン内容を無料で閲覧できます。" },
  {
    title: "連絡先を見る",
    desc: `気に入った先生がいたら、${SITE.contactPrice.toLocaleString()}円で連絡先を確認できます。`,
  },
  { title: "直接やり取り", desc: "先生と直接連絡を取り、レッスンを始めましょう。" },
] as const;

/** 利用者の声（ダミーデータ） */
const TESTIMONIALS = [
  {
    name: "30代・女性",
    role: "英語を受講",
    text: "近所で英会話の先生が見つかりました。マンツーマンで質問しやすく、続けられています。",
  },
  {
    name: "40代・男性",
    role: "プログラミングを受講",
    text: "オンラインで丁寧に教えてもらえました。自分のペースで学べるのが良かったです。",
  },
  {
    name: "小学生の保護者",
    role: "ピアノを受講",
    text: "子どもに合う先生を探せました。優しく指導してくださり感謝しています。",
  },
] as const;

/**
 * トップページ
 * サービスの第一印象を担う各セクションを配置します。
 */
export default async function HomePage() {
  const [categories, latestTeachers, favoriteContext] = await Promise.all([
    getActiveCategories(),
    getLatestPublishedTeachers(6),
    getFavoriteButtonContext("/"),
  ]);

  // 人気カテゴリー（先頭10件を表示）
  const popularCategories = categories.slice(0, 10);

  return (
    <div className="bg-background">
      <JsonLd
        data={[buildOrganizationJsonLd(), buildWebSiteJsonLd()]}
      />
      {/* ① ヒーローエリア + ② 検索フォーム */}
      <section className="bg-gradient-to-b from-primary-light to-surface px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-3 text-sm font-medium text-primary">
            学びたい人と教えたい人をつなぐ
          </p>
          <h1 className="mb-5 text-3xl font-bold leading-tight text-foreground sm:text-4xl">
            あなたにぴったりの
            <br className="sm:hidden" />
            先生が見つかる
          </h1>
          <p className="mb-8 text-base text-muted sm:text-lg">
            {SITE.description}
          </p>
        </div>
        <HeroSearch categories={categories} />
      </section>

      {/* ③ 人気カテゴリー */}
      <Section title="人気のカテゴリー" subtitle="学びたいジャンルから探す">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {popularCategories.map((category) => (
            <CategoryCard key={category.slug} category={category} />
          ))}
        </div>
        <div className="mt-8 text-center">
          <Button href="/categories" variant="outline">
            すべてのカテゴリーを見る
          </Button>
        </div>
      </Section>

      {/* ④ 新着先生 */}
      <Section title="新着の先生" subtitle="最近登録した先生" tinted>
        <TeacherGrid
          teachers={latestTeachers}
          emptyMessage="現在、公開中の先生はいません。もうしばらくお待ちください。"
          favoriteContext={favoriteContext}
        />
        {latestTeachers.length > 0 && (
          <div className="mt-8 text-center">
            <Button href="/teachers" variant="outline">
              先生をもっと見る
            </Button>
          </div>
        )}
      </Section>

      {/* ⑤ チョコット先生とは */}
      <Section title={`${SITE.name}とは`}>
        <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-3">
          <FeatureCard
            icon="🔍"
            title="無料で探せる"
            desc="先生のプロフィールは無料で閲覧できます。じっくり比較して選べます。"
          />
          <FeatureCard
            icon="🤝"
            title="直接つながる"
            desc="気に入った先生と直接やり取り。仲介手数料はレッスン料にかかりません。"
          />
          <FeatureCard
            icon="🌸"
            title="安心のしくみ"
            desc="幅広いジャンルの先生が登録。オンライン・対面どちらにも対応しています。"
          />
        </div>
      </Section>

      {/* ⑥ ご利用の流れ */}
      <Section title="ご利用の流れ" subtitle="かんたん4ステップ" tinted>
        <ol className="mx-auto grid max-w-4xl gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FLOW_STEPS.map((step, index) => (
            <li key={step.title}>
              <Card className="h-full">
                <span className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                  {index + 1}
                </span>
                <h3 className="mb-1 font-bold text-foreground">{step.title}</h3>
                <p className="text-sm text-muted">{step.desc}</p>
              </Card>
            </li>
          ))}
        </ol>
      </Section>

      {/* ⑦ 先生募集 */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl rounded-2xl bg-gradient-to-r from-primary to-accent px-6 py-12 text-center text-white">
          <h2 className="mb-3 text-2xl font-bold">先生を募集しています</h2>
          <p className="mb-6 text-white/90">
            あなたのスキルを活かして教えてみませんか？登録は無料です。
          </p>
          <Button href="/register/teacher" variant="secondary" size="lg">
            先生登録（無料）
          </Button>
        </div>
      </section>

      {/* ⑧ よくある質問 */}
      <Section title="よくある質問" tinted>
        <FaqAccordion items={GENERAL_FAQS.slice(0, 4)} />
        <div className="mt-8 text-center">
          <Button href="/faq" variant="outline">
            よくある質問をもっと見る
          </Button>
        </div>
      </Section>

      {/* ⑨ 利用者の声 */}
      <Section title="利用者の声">
        <div className="mx-auto grid max-w-5xl gap-5 sm:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <Card key={t.text} className="h-full">
              <p className="mb-4 text-sm leading-relaxed text-foreground">
                「{t.text}」
              </p>
              <p className="text-sm font-medium text-foreground">{t.name}</p>
              <p className="text-xs text-muted">{t.role}</p>
            </Card>
          ))}
        </div>
      </Section>

      {/* ⑩ お問い合わせ導線 */}
      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 text-muted">
            ご不明な点はお気軽にお問い合わせください
          </p>
          <Button href="/contact" variant="outline">
            お問い合わせ
          </Button>
        </div>
      </section>
    </div>
  );
}

/** セクションの共通枠（見出し + 余白） */
function Section({
  title,
  subtitle,
  tinted = false,
  children,
}: {
  title: string;
  subtitle?: string;
  tinted?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      className={`px-4 py-16 sm:px-6 lg:px-8 ${tinted ? "bg-surface" : ""}`}
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
            {title}
          </h2>
          {subtitle && <p className="mt-2 text-sm text-muted">{subtitle}</p>}
        </div>
        {children}
      </div>
    </section>
  );
}

/** 特徴カード（チョコット先生とは） */
function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: string;
  title: string;
  desc: string;
}) {
  return (
    <Card className="h-full text-center">
      <span className="mb-3 inline-block text-4xl" aria-hidden="true">
        {icon}
      </span>
      <h3 className="mb-2 font-bold text-foreground">{title}</h3>
      <p className="text-sm leading-relaxed text-muted">{desc}</p>
    </Card>
  );
}
