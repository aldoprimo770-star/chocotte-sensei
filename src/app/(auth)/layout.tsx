import Link from "next/link";
import { SITE } from "@/constants/site";

/**
 * 認証ページ共通レイアウト
 * ログイン・新規登録などで使う、中央寄せのシンプルな枠組みです。
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-4 py-12">
      {/* ロゴ（トップへ戻るリンク） */}
      <Link
        href="/"
        className="mb-8 flex items-center gap-2 text-2xl font-bold text-foreground"
      >
        <span className="text-primary" aria-hidden="true">
          🍫
        </span>
        {SITE.name}
      </Link>

      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
