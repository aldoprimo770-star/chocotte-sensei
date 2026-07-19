import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/common/page-header";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = buildMetadata({
  title: "お問い合わせ",
  description:
    "チョコット先生に関するご質問・ご要望はこちらのフォームからお問い合わせください。",
  path: "/contact",
});

/** お問い合わせページ */
export default function ContactPage() {
  return (
    <div>
      <PageHeader
        title="お問い合わせ"
        subtitle="サービスに関するご質問・ご要望をお気軽にお寄せください"
      />
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <ContactForm />
      </div>
    </div>
  );
}
