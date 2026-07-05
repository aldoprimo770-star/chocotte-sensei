import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/session";
import { getStudentFavoriteTeachers } from "@/lib/student/favorites";
import { TeacherGrid } from "@/components/teacher/teacher-grid";

export const metadata: Metadata = { title: "お気に入り" };

/** 生徒のお気に入り先生一覧 */
export default async function StudentFavoritesPage() {
  const session = await requireRole("STUDENT");
  const teachers = await getStudentFavoriteTeachers(session.user.id);

  const favoriteContext = {
    mode: "student" as const,
    callbackUrl: "/mypage/favorites",
    favoriteIds: new Set(teachers.map((t) => t.id)),
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="mb-2 text-2xl font-bold text-foreground">お気に入り</h1>
      <p className="mb-8 text-sm text-muted">
        お気に入りに登録した先生の一覧です。
      </p>

      <TeacherGrid
        teachers={teachers}
        emptyPreset="favorites"
        favoriteContext={favoriteContext}
      />
    </div>
  );
}
