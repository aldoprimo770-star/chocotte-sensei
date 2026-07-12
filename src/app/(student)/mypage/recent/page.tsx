import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/session";
import { getStudentRecentlyViewedTeachers } from "@/lib/student/recently-viewed";
import { getStudentFavoriteTeacherIds } from "@/lib/student/favorites";
import { TeacherGrid } from "@/components/teacher/teacher-grid";

export const metadata: Metadata = { title: "最近見た先生" };

/** 生徒の最近見た先生一覧 */
export default async function StudentRecentPage() {
  const session = await requireRole("STUDENT");
  const [teachers, favoriteIds] = await Promise.all([
    getStudentRecentlyViewedTeachers(session.user.id),
    getStudentFavoriteTeacherIds(session.user.id),
  ]);

  const favoriteContext = {
    mode: "student" as const,
    callbackUrl: "/mypage/recent",
    favoriteIds: [...favoriteIds],
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="mb-2 text-2xl font-bold text-foreground">
        最近見た先生
      </h1>
      <p className="mb-8 text-sm text-muted">
        最近閲覧した先生の一覧です（最大20件）。
      </p>

      <TeacherGrid
        teachers={teachers}
        emptyPreset="recent"
        favoriteContext={favoriteContext}
      />
    </div>
  );
}
