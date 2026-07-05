import type { Metadata } from "next";
import { SITE } from "@/constants/site";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/common/page-header";
import {
  LegalSections,
  type LegalSection,
} from "@/components/common/legal-sections";

export const metadata: Metadata = buildMetadata({
  title: "プライバシーポリシー",
  description: `${SITE.name}における個人情報の取り扱いについて定めたプライバシーポリシーです。`,
  path: "/privacy",
});

const SECTIONS: readonly LegalSection[] = [
  {
    heading: "取得する情報",
    paragraphs: [
      "本サービスは、氏名・メールアドレス・プロフィール情報など、利用者が入力した情報を取得します。",
      "サービス改善のため、アクセス状況等の情報を取得する場合があります。",
    ],
  },
  {
    heading: "利用目的",
    paragraphs: [
      "取得した情報は、本サービスの提供・本人確認・お問い合わせ対応・サービス改善・重要なお知らせの通知のために利用します。",
    ],
  },
  {
    heading: "第三者提供",
    paragraphs: [
      "運営は、法令に基づく場合等を除き、本人の同意なく個人情報を第三者に提供しません。",
    ],
  },
  {
    heading: "安全管理",
    paragraphs: [
      "運営は、個人情報の漏えい・滅失・毀損の防止に努め、適切な安全管理措置を講じます。",
      "通信は暗号化（SSL）され、パスワードは暗号化して保存されます。",
    ],
  },
  {
    heading: "開示・訂正・削除",
    paragraphs: [
      "利用者は、自己の個人情報について、開示・訂正・削除を求めることができます。お問い合わせ窓口までご連絡ください。",
    ],
  },
  {
    heading: "お問い合わせ",
    paragraphs: [
      "個人情報の取り扱いに関するお問い合わせは、お問い合わせフォームよりご連絡ください。",
    ],
  },
];

/** プライバシーポリシーページ */
export default function PrivacyPage() {
  return (
    <div>
      <PageHeader title="プライバシーポリシー" />
      <LegalSections sections={SECTIONS} />
    </div>
  );
}
