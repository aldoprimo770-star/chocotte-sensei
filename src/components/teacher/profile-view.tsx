import type { SkillLevel, TargetAge } from "@prisma/client";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { VerifiedBadge } from "@/components/teacher/verified-badge";
import { RatingSummary } from "@/components/review/star-rating";
import { getSkillLevelLabel, getTargetAgeLabel } from "@/constants/teacher";
import { extractYouTubeId } from "@/lib/validation";
import { formatPriceRange } from "@/lib/teacher/format";
import type { TeacherContactInfo } from "@/lib/teacher/profile";

/**
 * プロフィール表示に必要な「無料公開」項目のみを表す型。
 * 公開ページ用（TeacherPublicProfile）と先生本人用（TeacherProfileWithRelations）の
 * どちらからも渡せるよう、必要な項目だけを緩く定義している。
 */
export interface ProfileViewData {
  displayName: string;
  catchphrase: string | null;
  bio: string | null;
  lessonContent: string | null;
  profileImageUrl: string | null;
  priceMin: number | null;
  priceMax: number | null;
  targetAges: TargetAge[];
  skillLevels: SkillLevel[];
  isOnline: boolean;
  isAcceptingStudents: boolean;
  isVerified: boolean;
  ratingAverage: number;
  reviewCount: number;
  categories: { category: { name: string } }[];
  areas: { prefecture: string }[];
}

/**
 * 先生プロフィールの表示コンポーネント（表示専用）
 *
 * 無料公開項目は常に表示します。
 * 連絡先系（YouTube・ホームページ・SNS・電話・メール・LINE）は
 * canViewContact が true のとき（先生本人 / 管理者 / 購入済み生徒）のみ
 * contact を渡して表示し、それ以外は「🔒 連絡先購入後に表示されます」を出します。
 */
export function TeacherProfileView({
  profile,
  canViewContact = false,
  contact = null,
}: {
  profile: ProfileViewData;
  canViewContact?: boolean;
  contact?: TeacherContactInfo | null;
}) {
  return (
    <div className="space-y-6">
      {/* ヘッダー：写真・名前・キャッチコピー */}
      <Card className="text-center">
        {profile.profileImageUrl ? (
          // 外部の任意URLを表示するため next/image ではなく img を使用
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.profileImageUrl}
            alt={`${profile.displayName}のプロフィール写真`}
            className="mx-auto mb-4 h-28 w-28 rounded-full border border-border object-cover"
          />
        ) : (
          <div className="mx-auto mb-4 flex h-28 w-28 items-center justify-center rounded-full bg-surface text-3xl">
            🍫
          </div>
        )}

        <h2 className="text-xl font-bold text-foreground">
          {profile.displayName}
        </h2>
        {profile.catchphrase && (
          <p className="mt-2 text-primary">{profile.catchphrase}</p>
        )}

        {/* 平均評価 */}
        <div className="mt-2 flex justify-center">
          <RatingSummary
            average={profile.ratingAverage}
            count={profile.reviewCount}
          />
        </div>

        {/* バッジ */}
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {profile.isVerified && <VerifiedBadge />}
          {profile.isOnline && <Badge color="accent">オンライン対応</Badge>}
          {profile.isAcceptingStudents ? (
            <Badge color="primary">新規受付中</Badge>
          ) : (
            <Badge color="muted">現在受付停止中</Badge>
          )}
        </div>
      </Card>

      {/* カテゴリー・地域・価格などの詳細 */}
      <Card>
        <CardHeader>
          <CardTitle>レッスン情報</CardTitle>
        </CardHeader>
        <dl className="space-y-4 text-sm">
          <InfoRow label="カテゴリー">
            {profile.categories.length > 0
              ? profile.categories.map((c) => c.category.name).join("、")
              : "未設定"}
          </InfoRow>
          <InfoRow label="対応地域">
            {profile.areas.length > 0
              ? profile.areas.map((a) => a.prefecture).join("、")
              : profile.isOnline
                ? "オンラインのみ"
                : "未設定"}
          </InfoRow>
          <InfoRow label="参考価格">
            {formatPriceRange(profile.priceMin, profile.priceMax)}
          </InfoRow>
          <InfoRow label="対象年齢">
            {profile.targetAges.length > 0
              ? profile.targetAges.map(getTargetAgeLabel).join("、")
              : "未設定"}
          </InfoRow>
          <InfoRow label="対応レベル">
            {profile.skillLevels.length > 0
              ? profile.skillLevels.map(getSkillLevelLabel).join("、")
              : "未設定"}
          </InfoRow>
        </dl>
      </Card>

      {/* 自己紹介 */}
      {profile.bio && (
        <Card>
          <CardHeader>
            <CardTitle>自己紹介</CardTitle>
          </CardHeader>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
            {profile.bio}
          </p>
        </Card>
      )}

      {/* レッスン内容 */}
      {profile.lessonContent && (
        <Card>
          <CardHeader>
            <CardTitle>レッスン内容</CardTitle>
          </CardHeader>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
            {profile.lessonContent}
          </p>
        </Card>
      )}

      {/* 連絡先・外部リンク（連絡先購入後のみ公開） */}
      <ContactSection canViewContact={canViewContact} contact={contact} />
    </div>
  );
}

/**
 * 連絡先・外部リンクのセクション。
 * 未購入の閲覧者にはロック表示のみを返し、値は一切描画しない。
 */
function ContactSection({
  canViewContact,
  contact,
}: {
  canViewContact: boolean;
  contact: TeacherContactInfo | null;
}) {
  if (!canViewContact || !contact) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>連絡先・外部リンク</CardTitle>
        </CardHeader>
        <p className="rounded-xl bg-surface px-4 py-3 text-sm text-muted">
          🔒 連絡先購入後に表示されます
        </p>
      </Card>
    );
  }

  const youtubeId = contact.youtubeUrl
    ? extractYouTubeId(contact.youtubeUrl)
    : null;

  const hasAny =
    youtubeId ||
    contact.websiteUrl ||
    contact.snsUrl ||
    contact.phone ||
    contact.email ||
    contact.lineId;

  return (
    <Card>
      <CardHeader>
        <CardTitle>連絡先・外部リンク</CardTitle>
      </CardHeader>

      {!hasAny ? (
        <p className="text-sm text-muted">連絡先は登録されていません。</p>
      ) : (
        <div className="space-y-4">
          {youtubeId && (
            <div className="aspect-video overflow-hidden rounded-xl">
              <iframe
                className="h-full w-full"
                src={`https://www.youtube.com/embed/${youtubeId}`}
                title="紹介動画"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}

          <dl className="space-y-4 text-sm">
            {contact.email && (
              <InfoRow label="メール">
                <a
                  href={`mailto:${contact.email}`}
                  className="break-all text-primary hover:underline"
                >
                  {contact.email}
                </a>
              </InfoRow>
            )}
            {contact.phone && (
              <InfoRow label="電話番号">
                <a
                  href={`tel:${contact.phone}`}
                  className="text-primary hover:underline"
                >
                  {contact.phone}
                </a>
              </InfoRow>
            )}
            {contact.lineId && (
              <InfoRow label="LINE ID">{contact.lineId}</InfoRow>
            )}
            {contact.websiteUrl && (
              <InfoRow label="ホームページ">
                <ExternalLink href={contact.websiteUrl}>
                  {contact.websiteUrl}
                </ExternalLink>
              </InfoRow>
            )}
            {contact.snsUrl && (
              <InfoRow label="SNS">
                <ExternalLink href={contact.snsUrl}>
                  {contact.snsUrl}
                </ExternalLink>
              </InfoRow>
            )}
          </dl>
        </div>
      )}
    </Card>
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
      <dt className="w-24 shrink-0 font-medium text-muted">{label}</dt>
      <dd className="flex-1 text-foreground">{children}</dd>
    </div>
  );
}

/** バッジ */
function Badge({
  children,
  color,
}: {
  children: React.ReactNode;
  color: "primary" | "secondary" | "accent" | "muted";
}) {
  const colorClass = {
    primary: "bg-primary-light text-primary",
    secondary: "bg-secondary-light text-foreground",
    accent: "bg-accent-light text-accent",
    muted: "bg-surface text-muted",
  }[color];

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium ${colorClass}`}
    >
      {children}
    </span>
  );
}

/** 外部リンク（安全のため noopener を付与） */
function ExternalLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium text-primary hover:underline"
    >
      {children}
    </a>
  );
}
