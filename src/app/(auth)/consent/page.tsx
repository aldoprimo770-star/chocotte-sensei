import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import {
  PRIVACY_VERSION,
  TERMS_VERSION,
} from "@/constants/legal";
import { getDb } from "@/lib/db";
import { hasCurrentLegalConsent } from "@/lib/legal/consent";
import { getLandingPathByRole } from "@/lib/auth/routes";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { ConsentForm } from "./consent-form";

export const metadata: Metadata = {
  title: "利用規約への同意",
  robots: { index: false, follow: false },
};

/**
 * 既存会員向けの再同意ページ。
 * ログインは可能だが、保護ページ利用前に現行版への同意を求める。
 */
export default async function ConsentPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/consent");
  }

  // 管理者は再同意不要（運営作業を妨げない）
  if (session.user.role === "ADMIN") {
    redirect(getLandingPathByRole("ADMIN"));
  }

  const user = await getDb().user.findUnique({
    where: { id: session.user.id },
    select: { termsVersion: true, privacyVersion: true },
  });

  if (user && hasCurrentLegalConsent(user)) {
    redirect(getLandingPathByRole(session.user.role));
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>利用規約・プライバシーポリシーへの同意</CardTitle>
      </CardHeader>
      <div className="space-y-4 text-sm text-muted">
        <p>
          サービス改善および法令対応のため、利用規約・プライバシーポリシーを整備しました。
          引き続きご利用いただくには、現行版への同意が必要です。
        </p>
        <p>
          現行版：利用規約 {TERMS_VERSION} ／ プライバシーポリシー{" "}
          {PRIVACY_VERSION}
        </p>
        <ConsentForm />
      </div>
    </Card>
  );
}
