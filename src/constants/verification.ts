import type {
  IdentityDocumentType,
  IdentityVerificationStatus,
  VerificationStatus,
} from "@prisma/client";

/** 本人確認書類の種類（選択肢・表示ラベル） */
export const DOCUMENT_TYPE_OPTIONS: ReadonlyArray<{
  value: IdentityDocumentType;
  label: string;
}> = [
  { value: "ID_CARD", label: "マイナンバーカード・住民基本台帳カード" },
  { value: "DRIVERS_LICENSE", label: "運転免許証" },
  { value: "PASSPORT", label: "パスポート" },
];

/** 書類種類の日本語ラベルを引く */
export function getDocumentTypeLabel(value: IdentityDocumentType): string {
  return DOCUMENT_TYPE_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

/** 申請レコード側ステータスの表示（ラベル + 配色） */
export const VERIFICATION_STATUS_LABELS: Record<
  VerificationStatus,
  { label: string; className: string }
> = {
  PENDING: { label: "審査中", className: "bg-secondary-light text-foreground" },
  APPROVED: {
    label: "本人確認済み",
    className: "bg-blue-50 text-blue-600",
  },
  REJECTED: { label: "差し戻し", className: "bg-accent-light text-accent" },
};

/** TeacherProfile 集約ステータスの表示（管理画面・先生マイページ） */
export const IDENTITY_VERIFICATION_STATUS_LABELS: Record<
  IdentityVerificationStatus,
  { label: string; className: string }
> = {
  PENDING: { label: "審査中", className: "bg-secondary-light text-foreground" },
  VERIFIED: {
    label: "本人確認済み",
    className: "bg-blue-50 text-blue-600",
  },
  REJECTED: { label: "差し戻し", className: "bg-accent-light text-accent" },
};

/** 管理画面で切り替え可能な本人確認ステータス */
export const IDENTITY_VERIFICATION_STATUS_OPTIONS: ReadonlyArray<{
  value: IdentityVerificationStatus;
  label: string;
}> = [
  { value: "PENDING", label: "PENDING（審査待ち）" },
  { value: "VERIFIED", label: "VERIFIED（本人確認済み）" },
  { value: "REJECTED", label: "REJECTED（差し戻し）" },
];
