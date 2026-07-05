import type { Metadata, Viewport } from "next";
import { Noto_Sans_JP } from "next/font/google";
import { SITE } from "@/constants/site";
import "./globals.css";

/** 日本語フォント（Google Fonts） */
const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-noto-sans-jp",
  display: "swap",
});

/** サイト全体のデフォルト SEO メタデータ */
export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: SITE.name,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  openGraph: {
    type: "website",
    locale: "ja_JP",
    siteName: SITE.name,
    title: SITE.name,
    description: SITE.description,
  },
};

/** モバイル表示・テーマカラー（Lighthouse / PWA 向け） */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ff8c42",
};

/**
 * ルートレイアウト
 * HTML の骨格・フォント・SEO の基本設定を担当します
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${notoSansJP.variable} h-full`}>
      <body className="flex min-h-full flex-col font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
