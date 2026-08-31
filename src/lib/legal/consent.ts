import { redirect } from "next/navigation";
import {
  PRIVACY_VERSION,
  TERMS_VERSION,
} from "@/constants/legal";
import { getDb } from "@/lib/db";

/** 現行版への同意が完了しているか */
export function hasCurrentLegalConsent(user: {
  termsVersion: string | null;
  privacyVersion: string | null;
}): boolean {
  return (
    user.termsVersion === TERMS_VERSION &&
    user.privacyVersion === PRIVACY_VERSION
  );
}

/** 同意記録を保存するデータ */
export function buildConsentWriteData(acceptedAt = new Date()) {
  return {
    termsAcceptedAt: acceptedAt,
    privacyAcceptedAt: acceptedAt,
    termsVersion: TERMS_VERSION,
    privacyVersion: PRIVACY_VERSION,
  };
}

/**
 * 生徒・先生の保護ページ用。
 * 現行規約への同意がなければ再同意ページへ誘導する。
 * 既存会員を突然利用不能にせず、同意画面で継続できるようにする。
 */
export async function requireCurrentLegalConsent(userId: string) {
  const user = await getDb().user.findUnique({
    where: { id: userId },
    select: {
      termsVersion: true,
      privacyVersion: true,
    },
  });

  if (!user || !hasCurrentLegalConsent(user)) {
    redirect("/consent");
  }
}
