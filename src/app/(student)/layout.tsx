import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { requireRole } from "@/lib/auth/session";
import { requireCurrentLegalConsent } from "@/lib/legal/consent";

/**
 * 生徒用ページ共通レイアウト
 * このグループ配下は生徒(STUDENT)のみアクセス可能です。
 */
export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireRole("STUDENT");
  await requireCurrentLegalConsent(session.user.id);

  return (
    <>
      <Header />
      <main className="flex-1 bg-surface">{children}</main>
      <Footer />
    </>
  );
}
