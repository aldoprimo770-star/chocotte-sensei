import type { Metadata } from "next";
import type { Session } from "next-auth";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import {
  getPublishedTeacherBySlug,
  getTeacherContactInfo,
  type TeacherContactInfo,
} from "@/lib/teacher/profile";
import { getActivePurchase } from "@/lib/purchase/purchase";
import {
  getApprovedReviews,
  getStudentReviewForTeacher,
} from "@/lib/review/review";
import {
  getFavoriteButtonContext,
  isTeacherFavorited,
} from "@/lib/student/favorites";
import { recordRecentlyViewed } from "@/lib/student/recently-viewed";
import { JsonLd } from "@/components/seo/json-ld";
import {
  buildBreadcrumbJsonLd,
  buildPersonJsonLd,
  buildReviewJsonLd,
} from "@/lib/seo/structured-data";
import { SITE } from "@/constants/site";
import { TeacherProfileView } from "@/components/teacher/profile-view";
import { FavoriteButton } from "@/components/student/favorite-button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { ReviewList } from "@/components/review/review-list";
import { REVIEW_STATUS_LABELS } from "@/constants/review";
import { StatusBadge } from "@/components/admin/status-badge";
import { ReviewForm } from "./review-form";
import {
  ContactPurchaseCard,
  type ContactCtaState,
} from "@/components/purchase/contact-purchase-card";

/** ページのパラメータ型 */
interface TeacherPageProps {
  params: Promise<{ slug: string }>;
}

/** 説明文を組み立てる（キャッチコピー優先、なければ自己紹介の冒頭） */
function buildDescription(
  catchphrase: string | null,
  bio: string | null,
): string {
  const source = catchphrase || bio || SITE.description;
  return source.replace(/\s+/g, " ").slice(0, 120);
}

/**
 * 公開プロフィールの SEO メタデータ（title / description / OGP）
 * 公開中の先生のみメタデータを生成します。
 */
export async function generateMetadata({
  params,
}: TeacherPageProps): Promise<Metadata> {
  const { slug } = await params;
  const teacher = await getPublishedTeacherBySlug(slug);

  if (!teacher) {
    return { title: "先生が見つかりません" };
  }

  const title = teacher.catchphrase
    ? `${teacher.displayName} | ${teacher.catchphrase}`
    : teacher.displayName;
  const description = buildDescription(teacher.catchphrase, teacher.bio);
  const url = `${SITE.url}/teachers/${teacher.slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "profile",
      url,
      title,
      description,
      siteName: SITE.name,
      images: teacher.profileImageUrl
        ? [{ url: teacher.profileImageUrl }]
        : undefined,
    },
  };
}

/** 公開プロフィールページ */
export default async function TeacherPublicProfilePage({
  params,
}: TeacherPageProps) {
  const { slug } = await params;
  const teacher = await getPublishedTeacherBySlug(slug);

  // 非公開・未承認・存在しない場合は404
  if (!teacher) {
    notFound();
  }

  // セッションは1回だけ取得し、各処理に渡す（重複 auth() 呼び出しを防ぐ）
  const session = await auth();
  const profilePath = `/teachers/${teacher.slug}`;

  const [reviews, favoriteContext, isFavorited, contactState] =
    await Promise.all([
      getApprovedReviews(teacher.id),
      getFavoriteButtonContext(profilePath),
      resolveIsFavorited(session, teacher.id),
      resolveContactState(session, teacher.id),
    ]);

  // 連絡先の閲覧可否（先生本人 / 管理者 / 購入済み生徒のみ true）
  const canViewContact =
    session?.user?.id === teacher.userId ||
    session?.user?.role === "ADMIN" ||
    contactState.kind === "owned";

  // 認可された場合のみ連絡先を取得（未認可なら HTML/レスポンスに一切含めない）
  const contact: TeacherContactInfo | null = canViewContact
    ? await getTeacherContactInfo(teacher.id)
    : null;

  const structuredData = [
    buildPersonJsonLd(teacher),
    buildBreadcrumbJsonLd([
      { name: "ホーム", path: "/" },
      { name: "先生を探す", path: "/teachers" },
      { name: teacher.displayName, path: profilePath },
    ]),
    ...buildReviewJsonLd(teacher, reviews),
  ];

  return (
    <>
      <JsonLd data={structuredData} />
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      {/* パンくずリスト（SEO・回遊性向上） */}
      <nav className="mb-6 text-sm text-muted" aria-label="パンくずリスト">
        <ol className="flex flex-wrap items-center gap-1">
          <li>
            <Link href="/" className="hover:text-primary">
              ホーム
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href="/teachers" className="hover:text-primary">
              先生を探す
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-foreground">{teacher.displayName}</li>
        </ol>
      </nav>

      {/* お気に入り（生徒・未ログインのみ表示） */}
      {favoriteContext.mode !== "hidden" && (
        <div className="mb-4 flex justify-end">
          <FavoriteButton
            teacherId={teacher.id}
            initialFavorited={isFavorited}
            callbackUrl={profilePath}
            interaction={
              favoriteContext.mode === "student" ? "toggle" : "login"
            }
            variant="button"
          />
        </div>
      )}

      <TeacherProfileView
        profile={teacher}
        canViewContact={canViewContact}
        contact={contact}
      />

      {/* 連絡先購入の導線 */}
      <div className="mt-6">
        <ContactPurchaseCard
          slug={teacher.slug}
          teacherId={teacher.id}
          price={SITE.contactPrice}
          state={contactState}
        />
      </div>

      {/* レビュー */}
      <div className="mt-6">
        <ReviewSection
          teacherId={teacher.id}
          slug={teacher.slug}
          reviews={reviews}
          session={session}
        />
      </div>
    </div>
    </>
  );
}

/**
 * レビューセクション（承認済み一覧 + 購入済み生徒の投稿/編集フォーム）
 */
async function ReviewSection({
  teacherId,
  slug,
  reviews,
  session,
}: {
  teacherId: string;
  slug: string;
  reviews: Awaited<ReturnType<typeof getApprovedReviews>>;
  session: Session | null;
}) {
  // 購入済み生徒には投稿・編集フォームを表示
  let formArea: React.ReactNode = null;
  if (session?.user?.role === "STUDENT") {
    const [active, myReview] = await Promise.all([
      getActivePurchase(session.user.id, teacherId),
      getStudentReviewForTeacher(session.user.id, teacherId),
    ]);
    const purchased = active?.status === "COMPLETED";

    if (purchased) {
      formArea = (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <CardTitle>
                {myReview ? "あなたのレビューを編集" : "レビューを投稿"}
              </CardTitle>
              {myReview && (
                <StatusBadge
                  label={REVIEW_STATUS_LABELS[myReview.status].label}
                  className={REVIEW_STATUS_LABELS[myReview.status].className}
                />
              )}
            </div>
          </CardHeader>
          <ReviewForm
            slug={slug}
            reviewId={myReview?.id}
            defaultValues={
              myReview
                ? {
                    rating: myReview.rating,
                    title: myReview.title,
                    comment: myReview.comment,
                  }
                : undefined
            }
          />
        </Card>
      );
    }
  }

  return (
    <div className="space-y-4">
      {formArea}
      <Card>
        <CardHeader>
          <CardTitle>レビュー（{reviews.length}件）</CardTitle>
        </CardHeader>
        <ReviewList reviews={reviews} />
      </Card>
    </div>
  );
}

/** 生徒がプロフィール閲覧時に履歴を記録し、お気に入り状態を返す */
async function resolveIsFavorited(
  session: Session | null,
  teacherId: string,
): Promise<boolean> {
  if (session?.user?.role !== "STUDENT") {
    return false;
  }

  await recordRecentlyViewed(session.user.id, teacherId);
  return isTeacherFavorited(session.user.id, teacherId);
}

/** 閲覧者の状態から購入導線の状態を決める */
async function resolveContactState(
  session: Session | null,
  teacherId: string,
): Promise<ContactCtaState> {
  if (!session?.user) {
    return { kind: "guest" };
  }
  if (session.user.role !== "STUDENT") {
    return { kind: "not-student" };
  }

  const active = await getActivePurchase(session.user.id, teacherId);
  if (!active) {
    return { kind: "buy" };
  }
  return active.status === "COMPLETED"
    ? { kind: "owned", purchaseId: active.id }
    : { kind: "pending", purchaseId: active.id };
}
