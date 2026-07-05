import Link from "next/link";
import { FOOTER_LINKS, SITE } from "@/constants/site";

/**
 * サイト共通フッター
 * サービスリンク・先生向けリンク・法的情報を表示します
 */
export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* ブランド */}
          <div className="space-y-3">
            <p className="text-lg font-bold text-foreground">
              <span className="text-primary" aria-hidden="true">
                🍫
              </span>{" "}
              {SITE.name}
            </p>
            <p className="text-sm text-muted leading-relaxed">
              {SITE.description}
            </p>
          </div>

          {/* サービス */}
          <FooterLinkGroup title="サービス" links={FOOTER_LINKS.service} />

          {/* 先生の方へ */}
          <FooterLinkGroup title="先生の方へ" links={FOOTER_LINKS.teacher} />

          {/* 法的情報 */}
          <FooterLinkGroup title="法的情報" links={FOOTER_LINKS.legal} />
        </div>

        <div className="mt-10 border-t border-border pt-6 text-center text-sm text-muted">
          © {currentYear} {SITE.name}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

/** フッターのリンクグループ（内部用） */
function FooterLinkGroup({
  title,
  links,
}: {
  title: string;
  links: ReadonlyArray<{ href: string; label: string }>;
}) {
  return (
    <div>
      <h4 className="mb-3 text-sm font-bold text-foreground">{title}</h4>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm text-muted transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
