import type { Metadata } from "next";
import { SITE } from "@/constants/site";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/common/page-header";
import {
  LegalSections,
  type LegalSection,
} from "@/components/common/legal-sections";

export const metadata: Metadata = buildMetadata({
  title: "利用規約",
  description: `${SITE.name}の利用規約です。本サービスをご利用いただく前に必ずお読みください。`,
  path: "/terms",
});

const SECTIONS: readonly LegalSection[] = [
  {
    heading: "本規約への同意",
    paragraphs: [
      `本利用規約（以下「本規約」）は、${SITE.name}（以下「本サービス」）の利用条件を定めるものです。利用者は、本規約に同意のうえ本サービスを利用するものとします。`,
    ],
  },
  {
    heading: "サービスの内容",
    paragraphs: [
      "本サービスは、先生（教える人）と生徒（学ぶ人）をつなぐマッチングの場を提供します。",
      "本サービスは、先生と生徒の間で行われるレッスンの実施・レッスン料金の授受には関与しません。",
    ],
  },
  {
    heading: "会員登録",
    paragraphs: [
      "利用者は、正確かつ最新の情報で登録するものとします。",
      "登録情報に虚偽があった場合、運営は登録の取り消しや利用停止を行うことがあります。",
    ],
  },
  {
    heading: "料金",
    paragraphs: [
      `生徒が先生の連絡先を確認する際、先生1名につき${SITE.contactPrice.toLocaleString()}円（税込）の利用料が発生します。`,
      "レッスン料金は先生と生徒の間で直接取り決め、直接授受するものとします。",
    ],
  },
  {
    heading: "禁止事項",
    paragraphs: [
      "法令または公序良俗に違反する行為、他の利用者や第三者の権利を侵害する行為、虚偽の情報を登録する行為、その他運営が不適切と判断する行為を禁止します。",
    ],
  },
  {
    heading: "免責事項",
    paragraphs: [
      "本サービスは、先生と生徒の間で生じたトラブルについて一切の責任を負いません。",
      "本サービスの提供の中断・停止等によって利用者に生じた損害について、運営は責任を負いません。",
    ],
  },
  {
    heading: "規約の変更",
    paragraphs: [
      "運営は、必要と判断した場合、利用者への通知のうえ本規約を変更できるものとします。",
    ],
  },
];

/** 利用規約ページ */
export default function TermsPage() {
  return (
    <div>
      <PageHeader title="利用規約" />
      <LegalSections sections={SECTIONS} />
    </div>
  );
}
