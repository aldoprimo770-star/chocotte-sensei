import type {
  IdentityDocumentType,
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

/** 本人確認ステータスの表示（ラベル + 配色） */
export const VERIFICATION_STATUS_LABELS: Record<
  VerificationStatus,
  { label: string; className: string }
> = {
  PENDING: { label: "審査中", className: "bg-secondary-light text-foreground" },
  APPROVED: { label: "承認済み", className: "bg-blue-50 text-blue-600" },
  REJECTED: { label: "却下", className: "bg-accent-light text-accent" },
};
