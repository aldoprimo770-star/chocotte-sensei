import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/session";
import { getActiveCategories } from "@/lib/categories";
import { getTeacherProfileByUserId } from "@/lib/teacher/profile";
import type { TeacherProfileFormInput } from "@/schemas/teacher.schema";
import { resolveTeachingMethods } from "@/lib/teacher/teaching-methods";
import { ProfileForm } from "./profile-form";

export const metadata: Metadata = {
  title: "プロフィール編集",
};

/**
 * 先生プロフィール編集ページ
 * DBの現在値をフォーム初期値に変換して編集フォームを表示します。
 */
export default async function ProfileEditPage() {
  const session = await requireRole("TEACHER");

  const [profile, categories] = await Promise.all([
    getTeacherProfileByUserId(session.user.id),
    getActiveCategories(),
  ]);

  // 先生には登録時にプロフィールが作られるため通常は存在する
  if (!profile) {
    notFound();
  }

  const teachingMethodsDefault = resolveTeachingMethods(profile).filter(
    (m): m is "IN_PERSON" | "ONLINE" | "PHONE" =>
      m === "IN_PERSON" || m === "ONLINE" || m === "PHONE",
  );

  // DBの値をフォーム入力形式（文字列・配列）へ変換
  const defaultValues: TeacherProfileFormInput = {
    displayName: profile.displayName,
    catchphrase: profile.catchphrase ?? "",
    bio: profile.bio ?? "",
    lessonContent: profile.lessonContent ?? "",
    profileImageUrl: profile.profileImageUrl ?? "",
    youtubeUrl: profile.youtubeUrl ?? "",
    websiteUrl: profile.websiteUrl ?? "",
    snsUrl: profile.snsUrl ?? "",
    phone: profile.phone ?? "",
    lineId: profile.lineId ?? "",
    gender: profile.gender ?? "",
    ageRange: profile.ageRange ?? "",
    teachingYears: profile.teachingYears?.toString() ?? "",
    teachingMethods: teachingMethodsDefault,
    priceMin: profile.priceMin?.toString() ?? "",
    priceMax: profile.priceMax?.toString() ?? "",
    targetAges: profile.targetAges,
    skillLevels: profile.skillLevels,
    categoryIds: profile.categories.map((c) => c.categoryId),
    areas: profile.areas.map((a) => ({
      prefecture: a.prefecture,
      city: a.city ?? "",
    })),
    isAcceptingStudents: profile.isAcceptingStudents,
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">
          プロフィール編集
        </h1>
        <p className="mt-1 text-sm text-muted">
          入力後、「公開する」で検索結果に掲載されます
        </p>
      </div>

      <ProfileForm defaultValues={defaultValues} categories={categories} />
    </div>
  );
}
