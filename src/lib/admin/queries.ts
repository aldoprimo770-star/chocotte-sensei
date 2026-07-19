import { getDb } from "@/lib/db";

/** 管理画面の一覧はまず新しい順に一定件数を表示する（初期版はページング無し） */
const ADMIN_LIST_LIMIT = 100;

/** 先生管理一覧の1行分のデータ */
export type AdminTeacherRow = Awaited<
  ReturnType<typeof getAdminTeachers>
>[number];

/** 先生一覧を取得（カテゴリー・対応地域を含む） */
export async function getAdminTeachers() {
  return getDb().teacherProfile.findMany({
    orderBy: { createdAt: "desc" },
    take: ADMIN_LIST_LIMIT,
    select: {
      id: true,
      slug: true,
      displayName: true,
      profileImageUrl: true,
      isPublic: true,
      status: true,
      isVerified: true,
      identityVerificationStatus: true,
      createdAt: true,
      categories: { select: { category: { select: { name: true } } } },
      areas: { select: { prefecture: true } },
      // 本人確認画像・差し戻しコメント（管理者のみ・一覧でインライン表示）
      verification: {
        select: {
          id: true,
          status: true,
          rejectReason: true,
        },
      },
    },
  });
}

/** 生徒管理一覧の1行分のデータ */
export type AdminStudentRow = Awaited<
  ReturnType<typeof getAdminStudents>
>[number];

/** 生徒一覧を取得（アカウントの登録日・最終ログインを含む） */
export async function getAdminStudents() {
  return getDb().studentProfile.findMany({
    orderBy: { createdAt: "desc" },
    take: ADMIN_LIST_LIMIT,
    select: {
      id: true,
      displayName: true,
      prefecture: true,
      user: {
        select: { email: true, createdAt: true, lastLoginAt: true },
      },
    },
  });
}

/** 本人確認一覧の1行分のデータ */
export type AdminVerificationRow = Awaited<
  ReturnType<typeof getAdminVerifications>
>[number];

/**
 * 本人確認申請の一覧を取得（審査中を先頭に、新しい順）。
 * documentUrl は管理者のみが扱う機密情報。この画面（ADMIN限定）でのみ使用する。
 */
export async function getAdminVerifications() {
  return getDb().identityVerification.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    take: ADMIN_LIST_LIMIT,
    select: {
      id: true,
      documentType: true,
      documentUrl: true,
      note: true,
      status: true,
      rejectReason: true,
      createdAt: true,
      teacher: { select: { displayName: true, slug: true } },
    },
  });
}

/** お問い合わせ一覧の1行分のデータ */
export type AdminInquiryRow = Awaited<
  ReturnType<typeof getAdminInquiries>
>[number];

/** 購入管理一覧の1行分のデータ */
export type AdminPurchaseRow = Awaited<
  ReturnType<typeof getAdminPurchases>
>[number];

/** 連絡先購入の一覧を取得（新しい順・購入者/先生情報付き） */
export async function getAdminPurchases() {
  return getDb().purchase.findMany({
    orderBy: { createdAt: "desc" },
    take: ADMIN_LIST_LIMIT,
    select: {
      id: true,
      status: true,
      paymentMethod: true,
      amount: true,
      bankTransferName: true,
      contactRevealedAt: true,
      createdAt: true,
      student: {
        select: {
          email: true,
          studentProfile: { select: { displayName: true } },
        },
      },
      teacher: { select: { displayName: true, slug: true } },
    },
  });
}

/** レビュー管理一覧の1行分のデータ */
export type AdminReviewRow = Awaited<
  ReturnType<typeof getAdminReviews>
>[number];

/** レビュー一覧を取得（承認待ちを先頭に、新しい順・投稿者/先生情報付き） */
export async function getAdminReviews() {
  return getDb().review.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    take: ADMIN_LIST_LIMIT,
    select: {
      id: true,
      rating: true,
      title: true,
      comment: true,
      status: true,
      createdAt: true,
      student: {
        select: {
          email: true,
          studentProfile: { select: { displayName: true } },
        },
      },
      teacher: { select: { displayName: true, slug: true } },
    },
  });
}

/** お問い合わせ一覧を取得（新しい順） */
export async function getAdminInquiries() {
  return getDb().inquiry.findMany({
    orderBy: { createdAt: "desc" },
    take: ADMIN_LIST_LIMIT,
    select: {
      id: true,
      name: true,
      email: true,
      subject: true,
      message: true,
      status: true,
      createdAt: true,
    },
  });
}

/** カテゴリー管理一覧の1行分のデータ */
export type AdminCategoryRow = Awaited<
  ReturnType<typeof getAdminCategories>
>[number];

/**
 * カテゴリー一覧を取得（表示順 → 名前順）。
 * 紐づく先生・生徒数も返し、削除可否の判定に使う。
 */
export async function getAdminCategories() {
  return getDb().category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      sortOrder: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: { teachers: true, students: true },
      },
    },
  });
}

/** お知らせ管理一覧の1行分のデータ */
export type AdminAnnouncementRow = Awaited<
  ReturnType<typeof getAdminAnnouncements>
>[number];

/** お知らせ一覧を取得（表示順 → 新しい順） */
export async function getAdminAnnouncements() {
  return getDb().announcement.findMany({
    orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
    take: ADMIN_LIST_LIMIT,
    select: {
      id: true,
      title: true,
      content: true,
      published: true,
      displayOrder: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}
