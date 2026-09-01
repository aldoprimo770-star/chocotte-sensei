/** お問い合わせの種別（件名プリセット・開示請求の識別に使用） */
export const CONTACT_TOPICS = [
  {
    value: "general",
    label: "一般のお問い合わせ",
    subject: "",
  },
  {
    value: "disclosure",
    label: "住所・電話番号の開示請求（特定商取引法）",
    subject: "住所・電話番号の開示請求（特定商取引法）",
  },
  {
    value: "purchase",
    label: "連絡先購入・振込について",
    subject: "連絡先購入・振込について",
  },
  {
    value: "other",
    label: "その他",
    subject: "",
  },
] as const;

export type ContactTopicValue = (typeof CONTACT_TOPICS)[number]["value"];

export function isContactTopicValue(value: string): value is ContactTopicValue {
  return CONTACT_TOPICS.some((t) => t.value === value);
}

export function getContactTopic(value: string | undefined) {
  if (!value || !isContactTopicValue(value)) {
    return CONTACT_TOPICS[0];
  }
  return CONTACT_TOPICS.find((t) => t.value === value) ?? CONTACT_TOPICS[0];
}
