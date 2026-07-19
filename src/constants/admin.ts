import type { InquiryStatus, ProfileStatus } from "@prisma/client";

/** 管理画面ナビゲーション */
export const ADMIN_NAV_LINKS: ReadonlyArray<{ href: string; label: string }> = [
  { href: "/admin", label: "ダッシュボード" },
  { href: "/admin/teachers", label: "先生管理" },
  { href: "/admin/students", label: "生徒管理" },
  { href: "/admin/categories", label: "カテゴリー管理" },
  { href: "/admin/verifications", label: "本人確認" },
  { href: "/admin/reviews", label: "レビュー" },
  { href: "/admin/purchases", label: "購入管理" },
  { href: "/admin/inquiries", label: "お問い合わせ" },
];

/** 先生プロフィールの審査ステータス表示 */
export const PROFILE_STATUS_LABELS: Record<
  ProfileStatus,
  { label: string; className: string }
> = {
  DRAFT: { label: "下書き", className: "bg-gray-100 text-gray-600" },
  PENDING: { label: "承認待ち", className: "bg-secondary-light text-foreground" },
  APPROVED: { label: "承認済み", className: "bg-primary-light text-primary" },
  REJECTED: { label: "却下", className: "bg-accent-light text-accent" },
};

/** お問い合わせの対応ステータス表示 */
export const INQUIRY_STATUS_LABELS: Record<
  InquiryStatus,
  { label: string; className: string }
> = {
  NEW: { label: "新規", className: "bg-accent-light text-accent" },
  REPLIED: { label: "返信済み", className: "bg-secondary-light text-foreground" },
  CLOSED: { label: "対応完了", className: "bg-gray-100 text-gray-600" },
};
