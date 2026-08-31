import type { Metadata } from "next";
import { SITE } from "@/constants/site";
import {
  PRIVACY_EFFECTIVE_DATE,
  PRIVACY_SECTIONS,
  PRIVACY_VERSION,
} from "@/constants/legal";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/common/page-header";
import { LegalSections } from "@/components/common/legal-sections";

export const metadata: Metadata = buildMetadata({
  title: "プライバシーポリシー",
  description: `${SITE.name}における個人情報の取り扱いについて定めたプライバシーポリシーです。`,
  path: "/privacy",
});

/** プライバシーポリシーページ */
export default function PrivacyPage() {
  return (
    <div>
      <PageHeader
        title="プライバシーポリシー"
        subtitle="個人情報の取り扱いについて"
      />
      <LegalSections
        sections={PRIVACY_SECTIONS}
        updatedAt={PRIVACY_EFFECTIVE_DATE}
        version={PRIVACY_VERSION}
      />
    </div>
  );
}
