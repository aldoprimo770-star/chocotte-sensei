import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { requireRole } from "@/lib/auth/session";

/**
 * 生徒用ページ共通レイアウト
 * このグループ配下は生徒(STUDENT)のみアクセス可能です。
 */
export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole("STUDENT");

  return (
    <>
      <Header />
      <main className="flex-1 bg-surface">{children}</main>
      <Footer />
    </>
  );
}
