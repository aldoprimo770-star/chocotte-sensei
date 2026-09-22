import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/session";
import { getActiveCategories } from "@/lib/categories";
import { getTeacherProfileByUserId } from "@/lib/teacher/profile";
import { ProfilePreviewClient } from "./preview-client";

export const metadata: Metadata = {
  title: "プロフィールプレビュー",
};

/**
 * プロフィール閲覧（確認）画面
 * 未保存の編集内容がある場合はクライアント側でフォーム入力を重ねて表示する。
 * DB への仮保存は行わない。
 */
export default async function ProfilePreviewPage() {
  const session = await requireRole("TEACHER");
  const [profile, categories] = await Promise.all([
    getTeacherProfileByUserId(session.user.id),
    getActiveCategories(),
  ]);

  if (!profile) {
    notFound();
  }

  return (
    <ProfilePreviewClient
      savedProfile={{
        displayName: profile.displayName,
        catchphrase: profile.catchphrase,
        bio: profile.bio,
        lessonContent: profile.lessonContent,
        profileImageUrl: profile.profileImageUrl,
        priceMin: profile.priceMin,
        priceMax: profile.priceMax,
        targetAges: profile.targetAges,
        skillLevels: profile.skillLevels,
        gender: profile.gender,
        ageRange: profile.ageRange,
        teachingYears: profile.teachingYears,
        teachingMethods: profile.teachingMethods,
        teachingMethod: profile.teachingMethod,
        isOnline: profile.isOnline,
        isAcceptingStudents: profile.isAcceptingStudents,
        isVerified: profile.isVerified,
        identityVerificationStatus: profile.identityVerificationStatus,
        ratingAverage: profile.ratingAverage,
        reviewCount: profile.reviewCount,
        categories: profile.categories.map((c) => ({
          category: { name: c.category.name },
        })),
        areas: profile.areas.map((a) => ({
          prefecture: a.prefecture,
          city: a.city,
        })),
      }}
      savedContact={{
        youtubeUrl: profile.youtubeUrl,
        websiteUrl: profile.websiteUrl,
        snsUrl: profile.snsUrl,
        phone: profile.phone,
        lineId: profile.lineId,
        email: session.user.email ?? null,
      }}
      categories={categories.map((c) => ({ id: c.id, name: c.name }))}
      isPublic={profile.isPublic}
    />
  );
}
