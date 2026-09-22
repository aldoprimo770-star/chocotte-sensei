import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { SITE } from "@/constants/site";
import { BANK_TRANSFER_DEADLINE_DAYS } from "@/constants/bank-transfer";
import {
  ADDRESS_PHONE_DISCLOSURE_HOW_TO,
  ADDRESS_PHONE_DISCLOSURE_NOTICE,
} from "@/constants/legal";
import { getOperatorLegalInfoPublic } from "@/lib/settings/operator-legal";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/common/page-header";

export const metadata: Metadata = buildMetadata({
  title: "特定商取引法に基づく表記",
  description: `${SITE.name}の特定商取引法に基づく表記です。`,
  path: "/legal",
});

export const dynamic = "force-dynamic";

function DisclosureValue() {
  return (
    <>
      <p>{ADDRESS_PHONE_DISCLOSURE_NOTICE}</p>
      <p className="mt-2">
        {ADDRESS_PHONE_DISCLOSURE_HOW_TO}（
        <Link
          href="/contact?topic=disclosure"
          className="text-primary hover:underline"
        >
          開示請求フォームへ
        </Link>
        ）
      </p>
    </>
  );
}

/**
 * 特定商取引法に基づく表記
 *
 * 販売事業者名は Q16 に基づき正式氏名（サイト名のみ不可）。
 * 住所・電話は管理画面の方針に従い、請求時開示または一般公開。
 */
export default async function LegalPage() {
  const op = await getOperatorLegalInfoPublic();
  const priceLabel = `${SITE.contactPrice.toLocaleString()}円（税込）`;
  const showAddressPhone = op.addressPhoneDisclosure === "public";

  const addressValue: ReactNode = showAddressPhone
    ? (op.publicAddress ?? "（未設定）")
    : (
        <DisclosureValue />
      );
  const phoneValue: ReactNode = showAddressPhone
    ? (op.publicPhone ?? "（未設定）")
    : (
        <DisclosureValue />
      );

  const items: readonly { label: string; value: ReactNode }[] = [
    {
      label: "販売事業者",
      value: (
        <>
          <span>{op.legalNameDisplay}</span>
          <span className="mt-1 block text-xs text-muted">
            ※個人事業主の場合は戸籍上の氏名を表示します（サイト名「
            {op.serviceName}
            」のみの表示では足りません）。
          </span>
        </>
      ),
    },
    {
      label: "サービス名",
      value: op.serviceName,
    },
    {
      label: "住所",
      value: addressValue,
    },
    {
      label: "電話番号",
      value: phoneValue,
    },
    {
      label: "連絡先（メール等）",
      value: op.hasPublicEmail ? (
        op.email
      ) : (
        <>
          サイト内のお問い合わせフォームよりご連絡ください（
          <Link href="/contact" className="text-primary hover:underline">
            お問い合わせ
          </Link>
          ）
        </>
      ),
    },
    {
      label: "販売価格（役務の対価）",
      value: `先生の連絡先閲覧：1名につき${priceLabel}`,
    },
    {
      label: "販売価格以外に必要な料金",
      value:
        "インターネット接続に係る通信料、銀行振込手数料（振込時に金融機関等へお支払いいただく場合）。当サービスが別途徴収する追加料金はありません。",
    },
    {
      label: "支払方法",
      value: "銀行振込",
    },
    {
      label: "支払時期",
      value: `前払い（銀行振込）です。生徒会員が連絡先購入の手続きを開始した後、画面に表示する振込先へ、原則として${BANK_TRANSFER_DEADLINE_DAYS}日以内にお振り込みください。振込後はサイト上で振込報告を行ってください。`,
    },
    {
      label: "サービス提供時期",
      value:
        "運営者による入金確認後、直ちに、生徒会員のマイページ等において対象先生の連絡先を表示します。振込報告のみでは連絡先は表示されません。",
    },
    {
      label: "申込みの有効期限",
      value: `購入手続き開始から${BANK_TRANSFER_DEADLINE_DAYS}日以内のお振込みをお願いしています。期限を過ぎた場合、手続きが無効となることがあります。`,
    },
    {
      label: "返品・キャンセル・返金",
      value:
        "連絡先購入（デジタル情報の提供）の性質上、購入手続き開始後のキャンセルおよび返金は、原則としてお受けできません。ただし、システム障害など運営者の責めに帰すべき事由がある場合、その他法令上認められる場合は、個別に対応することがあります。",
    },
    {
      label: "役務の内容",
      value:
        "当サービスは、先生と生徒のマッチングおよび、入金確認後の先生連絡先の閲覧機会の提供を内容とします。レッスンの実施およびレッスン料金の授受は、原則として先生と生徒の間で直接行われます。",
    },
  ];

  return (
    <div>
      <PageHeader title="特定商取引法に基づく表記" />
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <p className="mb-8 text-sm leading-relaxed text-muted">
          本ページは、特定商取引法に基づき、通信販売（役務の提供）に関する表示事項を掲載するものです。
          {showAddressPhone
            ? " 住所及び電話番号は本ページに表示しています。"
            : " 住所及び電話番号については、消費者庁の通信販売広告に関する公式Q＆Aを踏まえ、請求があった場合に遅滞なく電子メール等により提供する方式としています。"}
        </p>

        <dl className="divide-y divide-border overflow-hidden rounded-2xl border border-border">
          {items.map((item) => (
            <div
              key={item.label}
              className="grid gap-1 bg-background px-5 py-4 sm:grid-cols-[11rem_1fr] sm:gap-4"
            >
              <dt className="text-sm font-medium text-foreground">
                {item.label}
              </dt>
              <dd className="text-sm leading-relaxed text-muted">
                {item.value}
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-8 space-y-3 text-sm text-muted">
          <p>
            個人情報の取り扱いについては
            <Link href="/privacy" className="text-primary hover:underline">
              プライバシーポリシー
            </Link>
            、ご利用条件については
            <Link href="/terms" className="text-primary hover:underline">
              利用規約
            </Link>
            をご確認ください。
          </p>
          {showAddressPhone ? (
            <p>
              ご質問は
              <Link href="/contact" className="text-primary hover:underline">
                お問い合わせフォーム
              </Link>
              よりご連絡ください。
            </p>
          ) : (
            <p>
              住所・電話番号の開示請求、その他のご質問は
              <Link
                href="/contact?topic=disclosure"
                className="text-primary hover:underline"
              >
                お問い合わせフォーム
              </Link>
              よりご連絡ください。請求を受けた場合、遅滞なく電子メール等により回答いたします。
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
