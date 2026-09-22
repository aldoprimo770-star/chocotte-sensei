import type { Metadata } from "next";
import { SITE } from "@/constants/site";
import {
  PRIVACY_EFFECTIVE_DATE,
  PRIVACY_VERSION,
  getPrivacySections,
} from "@/constants/legal";
import { getOperatorLegalInfoPublic } from "@/lib/settings/operator-legal";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/common/page-header";
import { LegalSections } from "@/components/common/legal-sections";

export const metadata: Metadata = buildMetadata({
  title: "プライバシーポリシー",
  description: `${SITE.name}における個人情報の取り扱いについて定めたプライバシーポリシーです。`,
  path: "/privacy",
});

export const dynamic = "force-dynamic";

/** プライバシーポリシーページ */
export default async function PrivacyPage() {
  const op = await getOperatorLegalInfoPublic();
  return (
    <div>
      <PageHeader
        title="プライバシーポリシー"
        subtitle="個人情報の取り扱いについて"
      />
      <LegalSections
        sections={getPrivacySections(op)}
        updatedAt={PRIVACY_EFFECTIVE_DATE}
        version={PRIVACY_VERSION}
      />
    </div>
  );
}
