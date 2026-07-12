"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db";
import { requireRole } from "@/lib/auth/session";
import { recalcTeacherRating } from "@/lib/review/review";
import { reviewSchema, type ReviewInput } from "@/schemas/review.schema";
import type { FormActionResult } from "@/types/action";

/**
 * レビューの投稿 / 編集 Server Action
 *
 * セキュリティ：
 *  - STUDENT ロード本人のみ
 *  - 対象先生の連絡先を「購入完了(COMPLETED)」している生徒のみ
 *  - 1生徒1先生1件（teacherId_studentId が unique）→ upsert で扱う
 *  - 編集時は status を PENDING に戻し、再審査する
 */
export async function submitReviewAction(
  slug: string,
  input: ReviewInput,
): Promise<FormActionResult> {
  const session = await requireRole("STUDENT");
  const studentId = session.user.id;

  // 公開中の先生のみレビュー可能
  const teacher = await getDb().teacherProfile.findFirst({
    where: { slug, isPublic: true, status: "APPROVED" },
    select: { id: true },
  });
  if (!teacher) {
    return { success: false, error: "先生が見つかりません。" };
  }

  // 購入完了していない生徒はレビュー不可
  const purchased = await getDb().purchase.findFirst({
    where: { studentId, teacherId: teacher.id, status: "COMPLETED" },
    select: { id: true },
  });
  if (!purchased) {
    return {
      success: false,
      error: "レビューは連絡先を購入した方のみ投稿できます。",
    };
  }

  const parsed = reviewSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fieldErrors[key]) {
        fieldErrors[key] = issue.message;
      }
    }
    return {
      success: false,
      error: "入力内容をご確認ください。",
      fieldErrors,
    };
  }

  const { rating, title, comment } = parsed.data;

  try {
    await getDb().review.upsert({
      where: { teacherId_studentId: { teacherId: teacher.id, studentId } },
      create: {
        teacherId: teacher.id,
        studentId,
        rating,
        title,
        comment,
        status: "PENDING",
      },
      update: {
        rating,
        title,
        comment,
        // 編集時は再審査（承認済みでも一旦非公開に戻る）
        status: "PENDING",
      },
    });

    // 承認済み件数が変わり得るため再集計（編集で APPROVED→PENDING になる場合など）
    await recalcTeacherRating(teacher.id);

    revalidatePath(`/teachers/${slug}`);
    revalidatePath("/mypage/reviews");
    revalidatePath("/admin/reviews");
    return { success: true };
  } catch {
    return { success: false, error: "レビューの送信に失敗しました。" };
  }
}

/** レビュー削除（投稿者本人のみ） */
export async function deleteReviewAction(
  reviewId: string,
): Promise<FormActionResult> {
  const session = await requireRole("STUDENT");

  const review = await getDb().review.findUnique({
    where: { id: reviewId },
    select: { id: true, studentId: true, teacherId: true, teacher: { select: { slug: true } } },
  });
  if (!review || review.studentId !== session.user.id) {
    return { success: false, error: "レビューが見つかりません。" };
  }

  try {
    await getDb().review.delete({ where: { id: reviewId } });
    await recalcTeacherRating(review.teacherId);

    revalidatePath(`/teachers/${review.teacher.slug}`);
    revalidatePath("/mypage/reviews");
    revalidatePath("/admin/reviews");
    return { success: true };
  } catch {
    return { success: false, error: "削除に失敗しました。" };
  }
}
