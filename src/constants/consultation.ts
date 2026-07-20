import type {
  ConversationStatus,
  NgWordCategory,
  ReportStatus,
} from "@prisma/client";

/** 事前相談の無料往復上限（生徒・先生それぞれこの回数まで送信可） */
export const PRE_CONSULTATION_MAX_ROUND_TRIPS = 3;

/** 無料枠終了時に表示する案内 */
export const CONSULTATION_LIMIT_MESSAGE =
  "続きのやり取りには連絡先の購入が必要です。";

/** NGワード検知時のエラーメッセージ */
export const NG_WORD_BLOCK_MESSAGE = "禁止されている内容が含まれています。";

/** 初期 NG ワード（DB 未投入時のシード用） */
export const DEFAULT_NG_WORDS: ReadonlyArray<{
  word: string;
  category: NgWordCategory;
}> = [
  // 連絡先交換
  { word: "LINE", category: "CONTACT_EXCHANGE" },
  { word: "line", category: "CONTACT_EXCHANGE" },
  { word: "LINE ID", category: "CONTACT_EXCHANGE" },
  { word: "メール", category: "CONTACT_EXCHANGE" },
  { word: "Gmail", category: "CONTACT_EXCHANGE" },
  { word: "Yahooメール", category: "CONTACT_EXCHANGE" },
  { word: "電話", category: "CONTACT_EXCHANGE" },
  { word: "携帯", category: "CONTACT_EXCHANGE" },
  { word: "090", category: "CONTACT_EXCHANGE" },
  { word: "080", category: "CONTACT_EXCHANGE" },
  { word: "070", category: "CONTACT_EXCHANGE" },
  { word: "@", category: "CONTACT_EXCHANGE" },
  { word: "Instagram", category: "CONTACT_EXCHANGE" },
  { word: "Facebook", category: "CONTACT_EXCHANGE" },
  { word: "Discord", category: "CONTACT_EXCHANGE" },
  { word: "URL", category: "CONTACT_EXCHANGE" },
  { word: "https", category: "CONTACT_EXCHANGE" },
  { word: "www", category: "CONTACT_EXCHANGE" },
  // X は単独文字だと誤検知しやすいが要件どおり登録
  { word: "X", category: "CONTACT_EXCHANGE" },
  // 勧誘・詐欺防止
  { word: "投資", category: "SOLICITATION" },
  { word: "FX", category: "SOLICITATION" },
  { word: "仮想通貨", category: "SOLICITATION" },
  { word: "暗号資産", category: "SOLICITATION" },
  { word: "Bitcoin", category: "SOLICITATION" },
  { word: "ビットコイン", category: "SOLICITATION" },
  { word: "NFT", category: "SOLICITATION" },
  { word: "副業", category: "SOLICITATION" },
  { word: "ネットワークビジネス", category: "SOLICITATION" },
  { word: "MLM", category: "SOLICITATION" },
  { word: "マルチ", category: "SOLICITATION" },
  { word: "勧誘", category: "SOLICITATION" },
  { word: "出会い", category: "SOLICITATION" },
];

export const NG_WORD_CATEGORY_LABELS: Record<NgWordCategory, string> = {
  CONTACT_EXCHANGE: "連絡先交換",
  SOLICITATION: "勧誘・詐欺防止",
  CUSTOM: "カスタム",
};

export const CONVERSATION_STATUS_LABELS: Record<
  ConversationStatus,
  { label: string; className: string }
> = {
  OPEN: { label: "対応中", className: "bg-primary-light text-primary" },
  LOCKED: {
    label: "無料枠終了",
    className: "bg-secondary-light text-foreground",
  },
  CLOSED: { label: "終了", className: "bg-gray-100 text-gray-600" },
};

export const REPORT_STATUS_LABELS: Record<
  ReportStatus,
  { label: string; className: string }
> = {
  NEW: { label: "未対応", className: "bg-accent-light text-accent" },
  REVIEWING: {
    label: "対応中",
    className: "bg-secondary-light text-foreground",
  },
  RESOLVED: { label: "対応完了", className: "bg-primary-light text-primary" },
  DISMISSED: { label: "対応不要", className: "bg-gray-100 text-gray-600" },
};
