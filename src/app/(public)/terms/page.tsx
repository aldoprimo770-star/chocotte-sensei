import type { Metadata } from "next";
import { SITE } from "@/constants/site";
import {
  TERMS_EFFECTIVE_DATE,
  TERMS_SECTIONS,
  TERMS_VERSION,
} from "@/constants/legal";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/common/page-header";
import { LegalSections } from "@/components/common/legal-sections";

export const metadata: Metadata = buildMetadata({
  title: "利用規約",
  description: `${SITE.name}の利用規約です。本サービスをご利用いただく前に必ずお読みください。`,
  path: "/terms",
});

/** 利用規約ページ */
export default function TermsPage() {
  return (
    <div>
      <PageHeader
        title="利用規約"
        subtitle={`${SITE.name}のご利用条件です`}
      />
      <LegalSections
        sections={TERMS_SECTIONS}
        updatedAt={TERMS_EFFECTIVE_DATE}
        version={TERMS_VERSION}
      />
    </div>
  );
}
