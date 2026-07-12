import { getDb } from "@/lib/db";

/** ダッシュボードに表示する集計値 */
export interface AdminStats {
  teacherCount: number;
  studentCount: number;
  publicTeacherCount: number;
  pendingTeacherCount: number;
  inquiryCount: number;
  purchaseCount: number;
  pendingVerifications: number;
  pendingReviews: number;
  // ダッシュボードの簡易統計
  registeredToday: number;
  registeredThisMonth: number;
  unhandledInquiries: number;
}

/** 日本時間（UTC+9）での「今日」「今月」の開始時刻を UTC で求める */
function getJstRangeStarts(): { startOfToday: Date; startOfMonth: Date } {
  const JST_OFFSET_MS = 9 * 60 * 60 * 1000;
  const nowJst = new Date(Date.now() + JST_OFFSET_MS);

  const startOfTodayJst = Date.UTC(
    nowJst.getUTCFullYear(),
    nowJst.getUTCMonth(),
    nowJst.getUTCDate(),
  );
  const startOfMonthJst = Date.UTC(
    nowJst.getUTCFullYear(),
    nowJst.getUTCMonth(),
    1,
  );

  return {
    startOfToday: new Date(startOfTodayJst - JST_OFFSET_MS),
    startOfMonth: new Date(startOfMonthJst - JST_OFFSET_MS),
  };
}

/**
 * 管理ダッシュボード用の集計をまとめて取得する。
 * 件数のみを並列取得するため軽量です。
 */
export async function getAdminStats(): Promise<AdminStats> {
  const { startOfToday, startOfMonth } = getJstRangeStarts();

  const [
    teacherCount,
    studentCount,
    publicTeacherCount,
    pendingTeacherCount,
    inquiryCount,
    purchaseCount,
    pendingVerifications,
    pendingReviews,
    registeredToday,
    registeredThisMonth,
    unhandledInquiries,
  ] = await Promise.all([
    getDb().user.count({ where: { role: "TEACHER" } }),
    getDb().user.count({ where: { role: "STUDENT" } }),
    getDb().teacherProfile.count({ where: { isPublic: true, status: "APPROVED" } }),
    getDb().teacherProfile.count({ where: { status: "PENDING" } }),
    getDb().inquiry.count(),
    getDb().purchase.count({ where: { status: "COMPLETED" } }),
    getDb().identityVerification.count({ where: { status: "PENDING" } }),
    getDb().review.count({ where: { status: "PENDING" } }),
    getDb().user.count({ where: { createdAt: { gte: startOfToday } } }),
    getDb().user.count({ where: { createdAt: { gte: startOfMonth } } }),
    getDb().inquiry.count({ where: { status: "NEW" } }),
  ]);

  return {
    teacherCount,
    studentCount,
    publicTeacherCount,
    pendingTeacherCount,
    inquiryCount,
    purchaseCount,
    pendingVerifications,
    pendingReviews,
    registeredToday,
    registeredThisMonth,
    unhandledInquiries,
  };
}
