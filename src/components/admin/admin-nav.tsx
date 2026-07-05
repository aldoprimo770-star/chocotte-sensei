"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADMIN_NAV_LINKS } from "@/constants/admin";
import { cn } from "@/lib/utils";

/**
 * 管理画面ナビゲーション（クライアントコンポーネント）
 * 現在のパスに応じてアクティブなリンクを強調します。
 * モバイルでは横スクロール、デスクトップでは横並び表示です。
 */
export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 overflow-x-auto border-t border-gray-200 px-2 sm:px-4">
      {ADMIN_NAV_LINKS.map((link) => {
        // /admin は完全一致、それ以外は前方一致でアクティブ判定
        const isActive =
          link.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition-colors",
              isActive
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-800",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
