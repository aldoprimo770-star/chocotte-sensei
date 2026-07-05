/**
 * サイト全体で使う定数
 * URL・名称・SEO情報をここに集約し、変更を1箇所で済ませます
 */
export const SITE = {
  /** サービス名 */
  name: "チョコット先生",
  /** キャッチコピー */
  tagline: "あなたにぴったりの先生が見つかる",
  /** 本番ドメイン */
  url: "https://chocotte-sensei.com",
  /** 連絡先購入価格（円） */
  contactPrice: 800,
  /** デフォルトのOGP説明文 */
  description:
    "日本人の先生と生徒をつなぐ学びのマッチングサービス。語学・プログラミング・音楽など、あなたに合った先生を検索できます。",
} as const;

/** ヘッダーナビゲーション */
export const NAV_LINKS = [
  { href: "/teachers", label: "先生を探す" },
  { href: "/categories", label: "カテゴリー" },
  { href: "/about", label: "チョコット先生とは" },
  { href: "/faq", label: "FAQ" },
] as const;

/** フッターリンク */
export const FOOTER_LINKS = {
  service: [
    { href: "/teachers", label: "先生を探す" },
    { href: "/about", label: "チョコット先生とは" },
    { href: "/flow", label: "ご利用の流れ" },
    { href: "/faq", label: "FAQ" },
  ],
  teacher: [
    { href: "/register/teacher", label: "先生登録（無料）" },
    { href: "/contact", label: "お問い合わせ" },
  ],
  legal: [
    { href: "/terms", label: "利用規約" },
    { href: "/privacy", label: "プライバシーポリシー" },
    { href: "/legal", label: "特定商取引法" },
  ],
} as const;
