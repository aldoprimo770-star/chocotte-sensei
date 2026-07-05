import Link from "next/link";
import { NAV_LINKS, SITE } from "@/constants/site";
import { Button } from "@/components/ui/button";
import { auth } from "@/auth";
import { getLandingPathByRole } from "@/lib/auth/routes";
import { LogoutButton } from "@/components/layout/logout-button";
import { MobileNav } from "@/components/layout/mobile-nav";
/**
 * サイト共通ヘッダー
 *
 * ログイン状態をサーバー側で判定し、
 * - 未ログイン: ログイン / 先生登録（無料）
 * - ログイン中: マイページ / ログアウト
 * を出し分けます。「先生登録（無料）」ボタンは未ログイン時に常に表示します。
 */
export async function Header() {
  const session = await auth();
  const isLoggedIn = !!session?.user;
  // ログイン中はロールに応じたマイページへのリンクを表示
  const myPagePath = session?.user
    ? getLandingPathByRole(session.user.role)
    : "/login";

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="relative mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* ロゴ */}
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-bold text-foreground transition-opacity hover:opacity-80 sm:text-xl"
          aria-label={`${SITE.name} トップページ`}
        >
          <span className="text-primary" aria-hidden="true">
            🍫
          </span>
          {SITE.name}
        </Link>

        {/* PC用ナビゲーション */}
        <nav
          className="hidden items-center gap-6 lg:gap-8 md:flex"
          aria-label="メインナビゲーション"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* アクションボタン + モバイルメニュー */}
        <div className="flex items-center gap-2 sm:gap-3">
          <MobileNav isLoggedIn={isLoggedIn} myPagePath={myPagePath} />

          {isLoggedIn ? (
            <>
              <Link
                href={myPagePath}
                className="hidden text-sm font-medium text-muted transition-colors hover:text-primary md:block"
              >
                マイページ
              </Link>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden text-sm font-medium text-muted transition-colors hover:text-primary md:block"
              >
                ログイン
              </Link>
              <Button variant="primary" size="sm" href="/register/teacher">
                <span className="hidden sm:inline">先生登録（無料）</span>
                <span className="sm:hidden">先生登録</span>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );}
