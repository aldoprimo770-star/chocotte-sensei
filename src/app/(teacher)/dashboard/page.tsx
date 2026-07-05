import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/session";
import { getTeacherProfileByUserId } from "@/lib/teacher/profile";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CompletionBar } from "@/components/teacher/completion-bar";
import { VerifiedBadge } from "@/components/teacher/verified-badge";

export const metadata: Metadata = {
  title: "先生ダッシュボード",
};

/**
 * 先生ダッシュボード
 * プロフィール完成率・公開状態を表示し、編集/プレビューへ誘導します。
 */
export default async function TeacherDashboardPage() {
  const session = await requireRole("TEACHER");
  const profile = await getTeacherProfileByUserId(session.user.id);

  if (!profile) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="mb-2 text-2xl font-bold text-foreground">マイページ</h1>
      <p className="mb-8 text-sm text-muted">{session.user.email}</p>

      {/* 公開状態 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>公開状態</CardTitle>
          <CardDescription>
            {profile.isPublic
              ? "現在、プロフィールは公開されています"
              : "現在、プロフィールは非公開です。公開すると検索結果に掲載されます"}
          </CardDescription>
        </CardHeader>
        <span
          className={
            profile.isPublic
              ? "inline-block rounded-full bg-primary-light px-3 py-1 text-sm font-medium text-primary"
              : "inline-block rounded-full bg-surface px-3 py-1 text-sm font-medium text-muted"
          }
        >
          {profile.isPublic ? "公開中" : "非公開"}
        </span>
      </Card>

      {/* 完成率 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>プロフィールの充実度</CardTitle>
          <CardDescription>
            項目を埋めるほど生徒に見つけてもらいやすくなります
          </CardDescription>
        </CardHeader>
        <CompletionBar percent={profile.profileCompletion} />
      </Card>

      {/* 本人確認 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>本人確認</CardTitle>
          <CardDescription>
            {profile.isVerified
              ? "本人確認が完了しています"
              : "本人確認を行うと「本人確認済み」バッジが表示され、信頼性が高まります"}
          </CardDescription>
        </CardHeader>
        <div className="flex items-center gap-3">
          {profile.isVerified && <VerifiedBadge />}
          <Button href="/verification" variant="outline" size="sm">
            {profile.isVerified ? "確認状況を見る" : "本人確認を申請する"}
          </Button>
        </div>
      </Card>

      {/* アクション */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button href="/profile" variant="primary">
          プロフィールを編集
        </Button>
        <Button href="/profile/preview" variant="outline">
          プレビューを見る
        </Button>
      </div>
    </div>
  );
}
