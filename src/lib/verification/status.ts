import type {
  IdentityVerificationStatus,
  Prisma,
  VerificationStatus,
} from "@prisma/client";

/**
 * 本人確認ステータスの同期ヘルパー
 *
 * TeacherProfile.identityVerificationStatus（集約）と
 * IdentityVerification.status（申請レコード）と
 * isVerified（検索互換フラグ）を一貫して更新するための変換を提供する。
 *
 * 将来メール / 電話認証を追加する場合:
 * - チャネル別の結果は別テーブル（例: TeacherAuthFactor）に保存し
 * - 書類確認の結果のみを本ステータスへ反映する、または
 * - 全チャネルが満たされたとき VERIFIED にする、などの集約ルールをここに集約する
 */

/** 申請レコードの status → プロフィール集約 status */
export function applicationStatusToProfileStatus(
  status: VerificationStatus,
): IdentityVerificationStatus {
  switch (status) {
    case "APPROVED":
      return "VERIFIED";
    case "REJECTED":
      return "REJECTED";
    case "PENDING":
    default:
      return "PENDING";
  }
}

/** プロフィール集約 status → 申請レコードの status */
export function profileStatusToApplicationStatus(
  status: IdentityVerificationStatus,
): VerificationStatus {
  switch (status) {
    case "VERIFIED":
      return "APPROVED";
    case "REJECTED":
      return "REJECTED";
    case "PENDING":
    default:
      return "PENDING";
  }
}

/** 集約ステータスから isVerified を導出 */
export function isVerifiedFromStatus(
  status: IdentityVerificationStatus | null | undefined,
): boolean {
  return status === "VERIFIED";
}

/** TeacherProfile 更新用の本人確認フィールド一式 */
export function teacherIdentityFields(
  status: IdentityVerificationStatus,
): Pick<
  Prisma.TeacherProfileUpdateInput,
  "identityVerificationStatus" | "isVerified"
> {
  return {
    identityVerificationStatus: status,
    isVerified: isVerifiedFromStatus(status),
  };
}

/**
 * 公開表示用: VERIFIED（または互換の isVerified）のときのみ true。
 * PENDING / REJECTED / 未申請は false。
 */
export function showVerifiedBadge(profile: {
  identityVerificationStatus?: IdentityVerificationStatus | null;
  isVerified: boolean;
}): boolean {
  if (profile.identityVerificationStatus != null) {
    return profile.identityVerificationStatus === "VERIFIED";
  }
  // マイグレーション前データの互換
  return profile.isVerified;
}

/**
 * 表示用に本人確認ステータスを解決する（未同期データ互換）。
 * プロフィール集約 → 申請レコード → isVerified の順で判定。
 */
export function resolveIdentityVerificationStatus(input: {
  identityVerificationStatus?: IdentityVerificationStatus | null;
  isVerified?: boolean;
  applicationStatus?: VerificationStatus | null;
}): IdentityVerificationStatus | null {
  if (input.identityVerificationStatus) {
    return input.identityVerificationStatus;
  }
  if (input.applicationStatus) {
    return applicationStatusToProfileStatus(input.applicationStatus);
  }
  if (input.isVerified) {
    return "VERIFIED";
  }
  return null;
}
