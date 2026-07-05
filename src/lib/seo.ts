import type { Metadata } from "next";
import { SITE } from "@/constants/site";

/**
 * 静的・動的ページ共通の SEO メタデータ生成ヘルパー
 *
 * canonical / OpenGraph / description を一括で組み立て、
 * 各ページでの記述の重複を防ぎます。
 * title はルートレイアウトのテンプレート（`%s | サービス名`）に
 * 乗るよう、ページ名のみを渡してください。
 */
export function buildMetadata({
  title,
  description,
  path = "",
}: {
  title: string;
  description: string;
  /** 先頭スラッシュ付きのパス（例: "/about"）。トップは空文字 */
  path?: string;
}): Metadata {
  const url = `${SITE.url}${path}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title: `${title} | ${SITE.name}`,
      description,
      siteName: SITE.name,
    },
  };
}
