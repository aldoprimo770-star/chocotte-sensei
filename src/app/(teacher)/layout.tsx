import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { requireRole } from "@/lib/auth/session";

/**
 * 先生用ページ共通レイアウト
 * このグループ配下は先生(TEACHER)のみアクセス可能です。
 */
export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 先生ロール以外はここでリダイレクトされる
  await requireRole("TEACHER");

  return (
    <>
      <Header />
      <main className="flex-1 bg-surface">{children}</main>
      <Footer />
    </>
  );
}
