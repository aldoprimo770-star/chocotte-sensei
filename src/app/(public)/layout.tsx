import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

/**
 * 公開ページ共通レイアウト
 *
 * トップページ・先生一覧・静的ページなど、
 * 一般ユーザー向けページで Header / Footer を表示します。
 */
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:block focus:h-auto focus:w-auto focus:overflow-visible focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white focus:[clip:auto]"
      >
        メインコンテンツへスキップ
      </a>
      <Header />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer />
    </>
  );
}