import type { Metadata } from "next";
import { SITE } from "@/constants/site";
import { TEACHER_FAQS } from "@/constants/faq";
import { buildMetadata } from "@/lib/seo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/common/page-header";
import { FaqAccordion } from "@/components/common/faq-accordion";

export const metadata: Metadata = buildMetadata({
  title: "先生募集（登録無料）",
  description:
    "チョコット先生では先生を募集しています。登録・掲載無料、全国・オンライン対応。あなたの専門知識を活かして好きな時間に教えられます。",
  path: "/teachers/register",
});

/** 先生募集ページのメリット一覧 */
const BENEFITS = [
  { icon: "💰", title: "登録・掲載無料", desc: "初期費用・月額費用は一切かかりません。" },
  { icon: "🗾", title: "全国対応", desc: "お住まいの地域を問わず、全国の生徒とつながれます。" },
  { icon: "💻", title: "オンライン対応可", desc: "対面・オンライン、どちらでも教えられます。" },
  { icon: "🕒", title: "好きな時間に", desc: "本業・副業どちらでもOK。自分のペースで教えられます。" },
  { icon: "🎓", title: "専門知識を活かせる", desc: "語学・音楽・IT・趣味など、得意分野で活躍できます。" },
  { icon: "🌸", title: "安心のしくみ", desc: "料金設定もレッスン内容も、すべてご自身で決められます。" },
] as const;

/** 登録までの流れ */
const REGISTER_STEPS = [
  { title: "無料登録", desc: "メールアドレスで先生アカウントを作成します。" },
  { title: "プロフィール作成", desc: "自己紹介・レッスン内容・料金などを入力します。" },
  { title: "公開", desc: "内容を確認して公開すると、生徒から見つけてもらえます。" },
  { title: "生徒とやり取り", desc: "興味を持った生徒から連絡が届きます。" },
] as const;

/** 先生募集ページ */
export default function TeacherRecruitPage() {
  return (
    <div>
      <PageHeader
        title="あなたの「教えたい」を仕事に"
        subtitle="登録無料・掲載無料。専門知識やスキルを活かして、好きな時間に教えられます。"
      />

      {/* 登録CTA（上部） */}
      <section className="px-4 py-10 text-center sm:px-6 lg:px-8">
        <Button href="/register/teacher" size="lg">
          先生登録（無料）
        </Button>
        <p className="mt-3 text-sm text-muted">
          登録は1分で完了。費用は一切かかりません。
        </p>
      </section>

      {/* メリット */}
      <section className="bg-surface px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-8 text-center text-2xl font-bold text-foreground sm:text-3xl">
            {SITE.name}で教えるメリット
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {BENEFITS.map((b) => (
              <Card key={b.title} className="h-full text-center">
                <span className="mb-3 inline-block text-4xl" aria-hidden="true">
                  {b.icon}
                </span>
                <h3 className="mb-2 font-bold text-foreground">{b.title}</h3>
                <p className="text-sm leading-relaxed text-muted">{b.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 安心して利用できる説明 */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-2xl font-bold text-foreground sm:text-3xl">
            安心して始められます
          </h2>
          <p className="text-sm leading-relaxed text-muted sm:text-base">
            {SITE.name}は、レッスン料金のやり取りに関与しません。
            料金やレッスン内容はすべて先生ご自身が決められるため、
            無理なく自分のスタイルで続けられます。
            公開・非公開はいつでも切り替えでき、まずは気軽にプロフィールを
            作成するところから始められます。
          </p>
        </div>
      </section>

      {/* 登録までの流れ */}
      <section className="bg-surface px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-8 text-center text-2xl font-bold text-foreground sm:text-3xl">
            登録までの流れ
          </h2>
          <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {REGISTER_STEPS.map((step, index) => (
              <li key={step.title}>
                <Card className="h-full">
                  <span className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                    {index + 1}
                  </span>
                  <h3 className="mb-1 font-bold text-foreground">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted">{step.desc}</p>
                </Card>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* よくある質問 */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-8 text-center text-2xl font-bold text-foreground sm:text-3xl">
            よくある質問
          </h2>
          <FaqAccordion items={TEACHER_FAQS} />
        </div>
      </section>

      {/* 登録CTA（下部） */}
      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl rounded-2xl bg-gradient-to-r from-primary to-accent px-6 py-12 text-center text-white">
          <h2 className="mb-3 text-2xl font-bold">今すぐ先生を始めよう</h2>
          <p className="mb-6 text-white/90">
            登録は無料。あなたの知識や経験を待っている生徒がいます。
          </p>
          <Button href="/register/teacher" variant="secondary" size="lg">
            先生登録（無料）
          </Button>
        </div>
      </section>
    </div>
  );
}
