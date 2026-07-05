"use client";

import { useState } from "react";
import Link from "next/link";
import { NAV_LINKS } from "@/constants/site";
import { Button } from "@/components/ui/button";

/**
 * スマートフォン用ナビゲーションメニュー
 * 768px未満でハンバーガーメニューを表示します。
 */
export function MobileNav({
  isLoggedIn,
  myPagePath,
}: {
  isLoggedIn: boolean;
  myPagePath: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        aria-label={open ? "メニューを閉じる" : "メニューを開く"}
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        <span className="sr-only">{open ? "閉じる" : "メニュー"}</span>
        {open ? (
          <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
            <path
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              d="M6 6l12 12M6 18L18 6"
            />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
            <path
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              d="M4 7h16M4 12h16M4 17h16"
            />
          </svg>
        )}
      </button>

      {open && (
        <nav
          id="mobile-nav-panel"
          aria-label="モバイルナビゲーション"
          className="absolute left-0 right-0 top-16 border-b border-border bg-background px-4 py-4 shadow-sm"
        >
          <ul className="space-y-1">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-4 space-y-2 border-t border-border pt-4">
            {isLoggedIn ? (
              <Link
                href={myPagePath}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-surface"
              >
                マイページ
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-surface"
                >
                  ログイン
                </Link>
                <Button href="/register/teacher" variant="primary" size="sm" fullWidth>
                  先生登録（無料）
                </Button>
              </>
            )}
          </div>
        </nav>
      )}
    </div>
  );
}
