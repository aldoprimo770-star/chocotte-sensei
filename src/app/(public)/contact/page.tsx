import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/common/page-header";
import { getTurnstileSiteKey } from "@/lib/turnstile/env";
import {
  getContactTopic,
  isContactTopicValue,
  type ContactTopicValue,
} from "@/constants/contact";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = buildMetadata({
  title: "お問い合わせ",
  description:
    "チョコット先生に関するご質問・ご要望はこちらのフォームからお問い合わせください。住所・電話番号の開示請求もこちらから受け付けます。",
  path: "/contact",
});

export const dynamic = "force-dynamic";

/** お問い合わせページ */
export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string }>;
}) {
  const turnstileSiteKey = getTurnstileSiteKey();
  const params = await searchParams;
  const rawTopic = params.topic ?? "";
  const initialTopic: ContactTopicValue = isContactTopicValue(rawTopic)
    ? rawTopic
    : "general";
  const topicMeta = getContactTopic(initialTopic);

  if (!turnstileSiteKey) {
    console.error(
      "[turnstile] site key missing. Set NEXT_PUBLIC_TURNSTILE_SITE_KEY or TURNSTILE_SITE_KEY as a Workers runtime Variable",
    );
  }

  return (
    <div>
      <PageHeader
        title="お問い合わせ"
        subtitle={
          initialTopic === "disclosure"
            ? "住所・電話番号の開示請求（特定商取引法）"
            : "サービスに関するご質問・ご要望をお気軽にお寄せください"
        }
      />
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        {initialTopic === "disclosure" ? (
          <p className="mb-6 text-sm leading-relaxed text-muted">
            {topicMeta.label}
            を受け付けています。請求を受けた場合、申込みの意思決定に先立ち十分な余裕をもって、遅滞なく電子メール等により住所および電話番号をご案内します。
          </p>
        ) : null}
        <ContactForm
          turnstileSiteKey={turnstileSiteKey}
          initialTopic={initialTopic}
        />
      </div>
    </div>
  );
}
