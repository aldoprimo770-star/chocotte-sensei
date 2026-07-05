import type { Metadata } from "next";
import { GENERAL_FAQS } from "@/constants/faq";
import { buildMetadata } from "@/lib/seo";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/page-header";
import { FaqAccordion } from "@/components/common/faq-accordion";

export const metadata: Metadata = buildMetadata({
  title: "よくある質問",
  description:
    "チョコット先生のよくある質問をまとめました。料金・支払い方法・利用方法などについてご確認いただけます。",
  path: "/faq",
});

/** よくある質問ページ */
export default function FaqPage() {
  return (
    <div>
      <PageHeader
        title="よくある質問"
        subtitle="ご利用にあたってよくいただくご質問をまとめました"
      />

      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <FaqAccordion items={GENERAL_FAQS} />
      </section>

      {/* お問い合わせ導線 */}
      <section className="px-4 pb-16 text-center sm:px-6 lg:px-8">
        <p className="mb-4 text-sm text-muted">
          解決しない場合はお気軽にお問い合わせください
        </p>
        <Button href="/contact" variant="outline">
          お問い合わせ
        </Button>
      </section>
    </div>
  );
}
