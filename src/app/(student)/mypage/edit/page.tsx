import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/session";
import { getActiveCategories } from "@/lib/categories";
import { getStudentProfileByUserId } from "@/lib/student/profile";
import type { StudentProfileFormInput } from "@/schemas/student.schema";
import { StudentProfileForm } from "./student-profile-form";

export const metadata: Metadata = {
  title: "プロフィール編集",
};

/** 生徒プロフィール編集ページ */
export default async function StudentProfileEditPage() {
  const session = await requireRole("STUDENT");

  const [profile, categories] = await Promise.all([
    getStudentProfileByUserId(session.user.id),
    getActiveCategories(),
  ]);

  if (!profile) {
    notFound();
  }

  // DBの値をフォーム入力形式へ変換
  const defaultValues: StudentProfileFormInput = {
    displayName: profile.displayName,
    bio: profile.bio ?? "",
    avatarUrl: profile.avatarUrl ?? "",
    prefecture: profile.prefecture ?? "",
    interestCategoryIds: profile.interests.map((i) => i.categoryId),
    isOnlinePreferred: profile.isOnlinePreferred,
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">
          プロフィール編集
        </h1>
        <p className="mt-1 text-sm text-muted">
          プロフィールは公開されません。あなたの学び探しに利用されます
        </p>
      </div>

      <StudentProfileForm defaultValues={defaultValues} categories={categories} />
    </div>
  );
}
