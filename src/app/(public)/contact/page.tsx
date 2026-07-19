import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/common/page-header";
import { getTurnstileSiteKey } from "@/lib/turnstile/env";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = buildMetadata({
  title: "お問い合わせ",
  description:
    "チョコット先生に関するご質問・ご要望はこちらのフォームからお問い合わせください。",
  path: "/contact",
});

// Workers 実行時の環境変数からサイトキーを読むため、静的プリレンダーしない
export const dynamic = "force-dynamic";

/** お問い合わせページ */
export default function ContactPage() {
  const turnstileSiteKey = getTurnstileSiteKey();

  if (!turnstileSiteKey) {
    console.error(
      "[turnstile] site key missing. Set NEXT_PUBLIC_TURNSTILE_SITE_KEY or TURNSTILE_SITE_KEY as a Workers runtime Variable",
    );
  } else {
    console.info(
      `[turnstile] site key loaded (len=${turnstileSiteKey.length})`,
    );
  }

  return (
    <div>
      <PageHeader
        title="お問い合わせ"
        subtitle="サービスに関するご質問・ご要望をお気軽にお寄せください"
      />
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <ContactForm turnstileSiteKey={turnstileSiteKey} />
      </div>
    </div>
  );
}
