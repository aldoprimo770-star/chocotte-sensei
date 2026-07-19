import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/common/page-header";
import { AnnouncementList } from "@/components/home/announcement-list";
import { getAllPublishedAnnouncements } from "@/lib/announcement";

export const metadata: Metadata = buildMetadata({
  title: "お知らせ",
  description: "チョコット先生からのお知らせ一覧です。",
  path: "/news",
});

/** DB 参照のためリクエストごとに描画 */
export const dynamic = "force-dynamic";

/** お知らせ一覧ページ（簡易版） */
export default async function NewsPage() {
  const announcements = await getAllPublishedAnnouncements();

  return (
    <div>
      <PageHeader
        title="お知らせ"
        subtitle="管理者からのお知らせ一覧"
      />
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <AnnouncementList items={announcements} />
        <p className="mt-8 text-center text-sm text-muted">
          <Link href="/" className="font-medium text-primary hover:underline">
            トップへ戻る
          </Link>
        </p>
      </div>
    </div>
  );
}
