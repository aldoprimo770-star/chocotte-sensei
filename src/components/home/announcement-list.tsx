import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/date";

export type AnnouncementListItem = {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
};

/**
 * お知らせカード一覧（トップ・一覧ページ共用）
 * 投稿日・タイトル・本文をシンプルなカードで表示します。
 */
export function AnnouncementList({
  items,
}: {
  items: AnnouncementListItem[];
}) {
  if (items.length === 0) {
    return (
      <p className="rounded-2xl border border-border bg-surface px-6 py-10 text-center text-sm text-muted">
        現在、お知らせはありません。
      </p>
    );
  }

  return (
    <ul className="mx-auto grid max-w-3xl gap-4">
      {items.map((item) => (
        <li key={item.id}>
          <Card className="h-full text-left">
            <time
              dateTime={item.createdAt.toISOString()}
              className="text-xs font-medium text-muted"
            >
              {formatDate(item.createdAt)}
            </time>
            <h3 className="mt-2 text-base font-bold text-foreground sm:text-lg">
              {item.title}
            </h3>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-muted">
              {item.content}
            </p>
          </Card>
        </li>
      ))}
    </ul>
  );
}
