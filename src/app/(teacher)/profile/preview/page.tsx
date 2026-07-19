import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/session";
import { getTeacherProfileByUserId } from "@/lib/teacher/profile";
import { TeacherProfileView } from "@/components/teacher/profile-view";

export const metadata: Metadata = {
  title: "プロフィールプレビュー",
};

/**
 * プロフィール閲覧（確認）画面
 * 生徒から見える形でプロフィールを確認できます。
 */
export default async function ProfilePreviewPage() {
  const session = await requireRole("TEACHER");
  const profile = await getTeacherProfileByUserId(session.user.id);

  if (!profile) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">プレビュー</h1>
          <p className="mt-1 text-sm text-muted">
            生徒に表示される内容の確認画面です
            {!profile.isPublic && "（現在は非公開です）"}
          </p>
        </div>
        <Link
          href="/profile"
          className="text-sm font-medium text-primary hover:underline"
        >
          編集に戻る
        </Link>
      </div>

      <TeacherProfileView
        profile={profile}
        canViewContact
        contact={{
          youtubeUrl: profile.youtubeUrl,
          websiteUrl: profile.websiteUrl,
          snsUrl: profile.snsUrl,
          phone: profile.phone,
          lineId: profile.lineId,
          email: session.user.email ?? null,
        }}
      />
    </div>
  );
}
