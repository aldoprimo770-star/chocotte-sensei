import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/session";
import { getTeacherProfileByUserId } from "@/lib/teacher/profile";
import { getVerificationByTeacherId } from "@/lib/verification/verification";
import { IDENTITY_VERIFICATION_STATUS_LABELS } from "@/constants/verification";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CompletionBar } from "@/components/teacher/completion-bar";
import { VerifiedBadge } from "@/components/teacher/verified-badge";
import { StatusBadge } from "@/components/admin/status-badge";
import {
  resolveIdentityVerificationStatus,
  showVerifiedBadge,
} from "@/lib/verification/status";

export const metadata: Metadata = {
  title: "先生ダッシュボード",
};

/**
 * 先生ダッシュボード
 * プロフィール完成率・公開状態・本人確認状況を表示します。
 */
export default async function TeacherDashboardPage() {
  const session = await requireRole("TEACHER");
  const profile = await getTeacherProfileByUserId(session.user.id);

  if (!profile) {
    notFound();
  }

  const verification = await getVerificationByTeacherId(profile.id);
  const identityStatus = resolveIdentityVerificationStatus({
    identityVerificationStatus: profile.identityVerificationStatus,
    isVerified: profile.isVerified,
    applicationStatus: verification?.status,
  });
  const identityStyle = identityStatus
    ? IDENTITY_VERIFICATION_STATUS_LABELS[identityStatus]
    : null;

  const identityDescription = (() => {
    switch (identityStatus) {
      case "VERIFIED":
        return "本人確認が完了しています。公開プロフィールにバッジが表示されます。";
      case "PENDING":
        return "現在審査中です。承認までしばらくお待ちください。";
      case "REJECTED":
        return "差し戻しになりました。内容を確認のうえ再申請してください。";
      default:
        return "本人確認を行うと「本人確認済み」バッジが表示され、信頼性が高まります";
    }
  })();

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
          <CardDescription>{identityDescription}</CardDescription>
        </CardHeader>
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            {identityStyle ? (
              <StatusBadge
                label={identityStyle.label}
                className={identityStyle.className}
              />
            ) : (
              <span className="text-sm text-muted">未申請</span>
            )}
            {showVerifiedBadge(profile) && <VerifiedBadge />}
          </div>

          {identityStatus === "REJECTED" && verification?.rejectReason && (
            <div className="rounded-xl bg-accent-light px-4 py-3 text-sm text-accent">
              <p className="font-medium">管理者コメント</p>
              <p className="mt-1 whitespace-pre-wrap">
                {verification.rejectReason}
              </p>
            </div>
          )}

          <Button href="/verification" variant="outline" size="sm">
            {identityStatus === "VERIFIED"
              ? "確認状況を見る"
              : identityStatus === "PENDING"
                ? "申請状況を見る"
                : identityStatus === "REJECTED"
                  ? "再申請する"
                  : "本人確認を申請する"}
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
