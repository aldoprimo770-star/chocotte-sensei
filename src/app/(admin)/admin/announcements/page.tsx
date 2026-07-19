import type { Metadata } from "next";
import { getAdminAnnouncements } from "@/lib/admin/queries";
import { AnnouncementCreateForm } from "./announcement-create-form";
import { AnnouncementRow } from "./announcement-row";

export const metadata: Metadata = { title: "お知らせ管理" };

/** お知らせ管理ページ（一覧・追加・編集・公開切替・削除） */
export default async function AdminAnnouncementsPage() {
  const announcements = await getAdminAnnouncements();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-800">お知らせ管理</h1>
        <p className="mt-1 text-sm text-gray-500">
          トップページに表示する「管理者からのお知らせ」を追加・編集できます。表示順の数字が小さいほど上に表示されます。
        </p>
      </div>

      <AnnouncementCreateForm />

      {announcements.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center text-gray-500">
          お知らせがまだありません。上のフォームから追加してください。
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map((announcement) => (
            <AnnouncementRow
              key={`${announcement.id}-${announcement.updatedAt.toISOString()}`}
              announcement={announcement}
            />
          ))}
        </div>
      )}
    </div>
  );
}
