import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/session";
import { getStudentProfileByUserId } from "@/lib/student/profile";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "マイページ",
};

/**
 * 生徒マイページ
 * プロフィール概要を表示し、未実装の機能は「準備中」として枠を用意します。
 */
export default async function StudentMyPage() {
  const session = await requireRole("STUDENT");
  const profile = await getStudentProfileByUserId(session.user.id);

  if (!profile) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="mb-2 text-2xl font-bold text-foreground">マイページ</h1>
      <p className="mb-8 text-sm text-muted">{session.user.email}</p>

      {/* プロフィール概要 */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>プロフィール</CardTitle>
            <Button href="/mypage/edit" variant="outline" size="sm">
              編集
            </Button>
          </div>
        </CardHeader>

        <div className="flex items-start gap-4">
          {profile.avatarUrl ? (
            // 外部の任意URLを表示するため next/image ではなく img を使用
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatarUrl}
              alt="プロフィール画像"
              className="h-20 w-20 rounded-full border border-border object-cover"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-surface text-2xl">
              🍫
            </div>
          )}

          <dl className="flex-1 space-y-3 text-sm">
            <InfoRow label="表示名">{profile.displayName}</InfoRow>
            <InfoRow label="居住地">
              {profile.prefecture ?? "未設定"}
            </InfoRow>
            <InfoRow label="オンライン希望">
              {profile.isOnlinePreferred ? "希望する" : "指定なし"}
            </InfoRow>
            <InfoRow label="興味カテゴリー">
              {profile.interests.length > 0
                ? profile.interests.map((i) => i.category.name).join("、")
                : "未設定"}
            </InfoRow>
            {profile.bio && (
              <InfoRow label="自己紹介">
                <span className="whitespace-pre-wrap">{profile.bio}</span>
              </InfoRow>
            )}
          </dl>
        </div>
      </Card>

      {/* 機能カード */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>お気に入り</CardTitle>
          </CardHeader>
          <p className="mb-4 text-sm text-muted">
            気になる先生を保存できます。
          </p>
          <Button href="/mypage/favorites" variant="outline" size="sm">
            お気に入りを見る
          </Button>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>最近見た先生</CardTitle>
          </CardHeader>
          <p className="mb-4 text-sm text-muted">
            最近閲覧した先生を確認できます。
          </p>
          <Button href="/mypage/recent" variant="outline" size="sm">
            履歴を見る
          </Button>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>購入履歴</CardTitle>
          </CardHeader>
          <p className="mb-4 text-sm text-muted">
            購入した連絡先の確認ができます。
          </p>
          <Button href="/mypage/purchases" variant="outline" size="sm">
            購入履歴を見る
          </Button>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>レビュー履歴</CardTitle>
          </CardHeader>
          <p className="mb-4 text-sm text-muted">
            投稿したレビューの確認・編集ができます。
          </p>
          <Button href="/mypage/reviews" variant="outline" size="sm">
            レビュー履歴を見る
          </Button>
        </Card>
      </div>
    </div>
  );
}

/** 情報行（ラベル + 内容） */
function InfoRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-4">
      <dt className="w-28 shrink-0 font-medium text-muted">{label}</dt>
      <dd className="flex-1 text-foreground">{children}</dd>
    </div>
  );
}
