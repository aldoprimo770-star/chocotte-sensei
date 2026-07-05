import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * ページネーション（表示専用）
 *
 * 現在ページの前後を中心にリンクを表示します。
 * リンク先URLは makeHref(page) で親から受け取り、
 * 検索条件を保持したまま遷移できるようにします。
 */
export function Pagination({
  page,
  totalPages,
  makeHref,
}: {
  page: number;
  totalPages: number;
  makeHref: (page: number) => string;
}) {
  if (totalPages <= 1) return null;

  // 表示するページ番号（現在ページ ±2 の範囲）を計算
  const pages = getPageNumbers(page, totalPages);

  return (
    <nav
      className="mt-10 flex items-center justify-center gap-1"
      aria-label="ページ送り"
    >
      {/* 前へ */}
      {page > 1 && (
        <PageLink href={makeHref(page - 1)} label="前へ" />
      )}

      {pages.map((p) => (
        <PageLink
          key={p}
          href={makeHref(p)}
          label={String(p)}
          active={p === page}
        />
      ))}

      {/* 次へ */}
      {page < totalPages && (
        <PageLink href={makeHref(page + 1)} label="次へ" />
      )}
    </nav>
  );
}

/** 個々のページリンク */
function PageLink({
  href,
  label,
  active = false,
}: {
  href: string;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "inline-flex h-10 min-w-10 items-center justify-center rounded-xl px-3 text-sm font-medium transition-colors",
        active
          ? "bg-primary text-white"
          : "border border-border text-foreground hover:border-primary/40 hover:text-primary",
      )}
    >
      {label}
    </Link>
  );
}

/** 現在ページ周辺のページ番号配列を作る */
function getPageNumbers(page: number, totalPages: number): number[] {
  const range = 2;
  const start = Math.max(1, page - range);
  const end = Math.min(totalPages, page + range);
  const pages: number[] = [];
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  return pages;
}
