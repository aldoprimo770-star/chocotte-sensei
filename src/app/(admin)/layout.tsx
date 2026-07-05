import type { Metadata } from "next";
import Link from "next/link";
import { requireRole } from "@/lib/auth/session";
import { AdminNav } from "@/components/admin/admin-nav";
import { LogoutButton } from "@/components/layout/logout-button";

/** 管理画面は検索エンジンにインデックスさせない */
export const metadata: Metadata = {
  title: {
    default: "管理画面",
    template: "%s | 管理画面",
  },
  robots: { index: false, follow: false },
};

/**
 * 管理画面 共通レイアウト
 * このグループ配下は管理者(ADMIN)のみアクセス可能です。
 * 公開サイトとは切り離した、白＋グレー基調のシンプルなシェルです。
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 管理者以外はここでリダイレクトされる
  await requireRole("ADMIN");

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 bg-white shadow-sm">
        <div className="flex items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/admin" className="font-bold text-gray-800">
            チョコット先生{" "}
            <span className="text-primary">管理画面</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-sm text-gray-500 transition-colors hover:text-gray-800"
            >
              サイトを見る
            </Link>
            <LogoutButton />
          </div>
        </div>
        <AdminNav />
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}
