import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { requireRole } from "@/lib/auth/session";
import { requireCurrentLegalConsent } from "@/lib/legal/consent";

/**
 * 先生用ページ共通レイアウト
 * このグループ配下は先生(TEACHER)のみアクセス可能です。
 */
export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireRole("TEACHER");
  await requireCurrentLegalConsent(session.user.id);

  return (
    <>
      <Header />
      <main className="flex-1 bg-surface">{children}</main>
      <Footer />
    </>
  );
}
