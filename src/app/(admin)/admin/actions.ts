"use server";

import { revalidatePath } from "next/cache";
import type { InquiryStatus } from "@prisma/client";
import { getDb } from "@/lib/db";
import { requireRole } from "@/lib/auth/session";
import { recalcTeacherRating } from "@/lib/review/review";
import { generateCategorySlug } from "@/lib/slug";
import {
  categoryCreateSchema,
  categoryUpdateSchema,
} from "@/schemas/category.schema";
import type { FormActionResult } from "@/types/action";

/** カテゴリー変更後に一覧・公開ページを再検証する */
function revalidateCategoryPaths() {
  revalidatePath("/admin/categories");
  revalidatePath("/categories");
  revalidatePath("/teachers");
  revalidatePath("/admin");
}

/** 一意なカテゴリー slug を確保する（衝突時はサフィックスを付ける） */
async function ensureUniqueCategorySlug(base: string): Promise<string> {
  let candidate = base;
  let attempt = 0;
  while (attempt < 20) {
    const existing = await getDb().category.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!existing) {
      return candidate;
    }
    attempt += 1;
    candidate = `${base}-${attempt}`;
  }
  return `${base}-${Date.now().toString(36)}`;
}

/**
 * 管理画面の操作用 Server Actions
 *
 * すべて冒頭で ADMIN 権限を検証し、権限のないアクセスを防ぎます。
 * 更新後は該当ページを再検証して一覧に即時反映します。
 */

/** 先生プロフィールの公開 / 非公開を切り替える */
export async function setTeacherVisibilityAction(
  teacherId: string,
  isPublic: boolean,
): Promise<FormActionResult> {
  await requireRole("ADMIN");

  try {
    await getDb().teacherProfile.update({
      where: { id: teacherId },
      data: { isPublic },
    });
    revalidatePath("/admin/teachers");
    revalidatePath("/admin");
    return { success: true };
  } catch {
    return { success: false, error: "更新に失敗しました。" };
  }
}

/** 先生プロフィールを承認する（審査ステータスを APPROVED に） */
export async function approveTeacherAction(
  teacherId: string,
): Promise<FormActionResult> {
  await requireRole("ADMIN");

  try {
    await getDb().teacherProfile.update({
      where: { id: teacherId },
      data: { status: "APPROVED" },
    });
    revalidatePath("/admin/teachers");
    revalidatePath("/admin");
    return { success: true };
  } catch {
    return { success: false, error: "承認に失敗しました。" };
  }
}

/** 先生プロフィールを却下する（却下時は公開も解除する） */
export async function rejectTeacherAction(
  teacherId: string,
): Promise<FormActionResult> {
  await requireRole("ADMIN");

  try {
    await getDb().teacherProfile.update({
      where: { id: teacherId },
      data: { status: "REJECTED", isPublic: false },
    });
    revalidatePath("/admin/teachers");
    revalidatePath("/admin");
    return { success: true };
  } catch {
    return { success: false, error: "却下に失敗しました。" };
  }
}

/**
 * 銀行振込の入金を確認し、購入を完了にする。
 * 完了と同時に連絡先を開示（contactRevealedAt を記録）します。
 */
export async function confirmPurchasePaymentAction(
  purchaseId: string,
): Promise<FormActionResult> {
  const session = await requireRole("ADMIN");

  try {
    await getDb().purchase.update({
      where: { id: purchaseId },
      data: {
        status: "COMPLETED",
        confirmedAt: new Date(),
        confirmedBy: session.user.id,
        contactRevealedAt: new Date(),
      },
    });
    revalidatePath("/admin/purchases");
    revalidatePath("/admin");
    return { success: true };
  } catch {
    return { success: false, error: "入金確認に失敗しました。" };
  }
}

/**
 * 連絡先を開示済みとしてマークする（COMPLETED の購入のみ対象）。
 * 通常は入金確認時に自動で開示されるため、補助的な操作です。
 */
export async function revealPurchaseContactAction(
  purchaseId: string,
): Promise<FormActionResult> {
  await requireRole("ADMIN");

  try {
    const purchase = await getDb().purchase.findUnique({
      where: { id: purchaseId },
      select: { status: true },
    });
    if (!purchase || purchase.status !== "COMPLETED") {
      return {
        success: false,
        error: "完了済みの購入のみ連絡先を公開できます。",
      };
    }
    await getDb().purchase.update({
      where: { id: purchaseId },
      data: { contactRevealedAt: new Date() },
    });
    revalidatePath("/admin/purchases");
    return { success: true };
  } catch {
    return { success: false, error: "連絡先の公開に失敗しました。" };
  }
}

/**
 * 本人確認を承認する。
 * 申請を APPROVED にし、対象先生の isVerified を true にする。
 */
export async function approveVerificationAction(
  verificationId: string,
): Promise<FormActionResult> {
  const session = await requireRole("ADMIN");

  try {
    const verification = await getDb().identityVerification.findUnique({
      where: { id: verificationId },
      select: { teacherId: true },
    });
    if (!verification) {
      return { success: false, error: "申請が見つかりません。" };
    }

    // 申請の承認と先生プロフィールの本人確認フラグを同時に更新
    await getDb().$transaction([
      getDb().identityVerification.update({
        where: { id: verificationId },
        data: {
          status: "APPROVED",
          rejectReason: null,
          reviewedAt: new Date(),
          reviewedBy: session.user.id,
        },
      }),
      getDb().teacherProfile.update({
        where: { id: verification.teacherId },
        data: { isVerified: true },
      }),
    ]);

    revalidatePath("/admin/verifications");
    revalidatePath("/admin");
    return { success: true };
  } catch {
    return { success: false, error: "承認に失敗しました。" };
  }
}

/**
 * 本人確認を却下する。
 * 却下理由を保存し、先生の isVerified を false に戻す。
 */
export async function rejectVerificationAction(
  verificationId: string,
  reason: string,
): Promise<FormActionResult> {
  const session = await requireRole("ADMIN");

  const trimmed = reason.trim();
  if (!trimmed) {
    return { success: false, error: "却下理由を入力してください。" };
  }

  try {
    const verification = await getDb().identityVerification.findUnique({
      where: { id: verificationId },
      select: { teacherId: true },
    });
    if (!verification) {
      return { success: false, error: "申請が見つかりません。" };
    }

    await getDb().$transaction([
      getDb().identityVerification.update({
        where: { id: verificationId },
        data: {
          status: "REJECTED",
          rejectReason: trimmed.slice(0, 500),
          reviewedAt: new Date(),
          reviewedBy: session.user.id,
        },
      }),
      getDb().teacherProfile.update({
        where: { id: verification.teacherId },
        data: { isVerified: false },
      }),
    ]);

    revalidatePath("/admin/verifications");
    revalidatePath("/admin");
    return { success: true };
  } catch {
    return { success: false, error: "却下に失敗しました。" };
  }
}

/**
 * レビューのステータスを変更する（承認 / 非公開）。
 * 承認済み件数が変わるため、対象先生の平均評価・件数を再集計する。
 */
export async function setReviewStatusAction(
  reviewId: string,
  status: "APPROVED" | "REJECTED",
): Promise<FormActionResult> {
  await requireRole("ADMIN");

  try {
    const review = await getDb().review.update({
      where: { id: reviewId },
      data: { status },
      select: { teacherId: true, teacher: { select: { slug: true } } },
    });

    await recalcTeacherRating(review.teacherId);

    revalidatePath("/admin/reviews");
    revalidatePath("/admin");
    revalidatePath(`/teachers/${review.teacher.slug}`);
    return { success: true };
  } catch {
    return { success: false, error: "更新に失敗しました。" };
  }
}

/** レビューを削除する（管理者による削除）。削除後に集計を更新する。 */
export async function deleteReviewAdminAction(
  reviewId: string,
): Promise<FormActionResult> {
  await requireRole("ADMIN");

  try {
    const review = await getDb().review.findUnique({
      where: { id: reviewId },
      select: { teacherId: true, teacher: { select: { slug: true } } },
    });
    if (!review) {
      return { success: false, error: "レビューが見つかりません。" };
    }

    await getDb().review.delete({ where: { id: reviewId } });
    await recalcTeacherRating(review.teacherId);

    revalidatePath("/admin/reviews");
    revalidatePath("/admin");
    revalidatePath(`/teachers/${review.teacher.slug}`);
    return { success: true };
  } catch {
    return { success: false, error: "削除に失敗しました。" };
  }
}

/** お問い合わせの対応ステータスを変更する */
export async function updateInquiryStatusAction(
  inquiryId: string,
  status: InquiryStatus,
): Promise<FormActionResult> {
  await requireRole("ADMIN");

  try {
    await getDb().inquiry.update({
      where: { id: inquiryId },
      data: { status },
    });
    revalidatePath("/admin/inquiries");
    revalidatePath("/admin");
    return { success: true };
  } catch {
    return { success: false, error: "ステータスの更新に失敗しました。" };
  }
}

/** カテゴリーを新規作成する */
export async function createCategoryAction(input: {
  name: string;
  sortOrder?: string;
}): Promise<FormActionResult> {
  await requireRole("ADMIN");

  const parsed = categoryCreateSchema.safeParse(input);
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

  const { name, sortOrder } = parsed.data;

  const duplicate = await getDb().category.findFirst({
    where: { name },
    select: { id: true },
  });
  if (duplicate) {
    return {
      success: false,
      error: "同じ名前のカテゴリーが既に存在します。",
      fieldErrors: { name: "このカテゴリー名は既に使われています" },
    };
  }

  try {
    let nextSort = sortOrder;
    if (nextSort === undefined) {
      const max = await getDb().category.aggregate({ _max: { sortOrder: true } });
      nextSort = (max._max.sortOrder ?? 0) + 1;
    }

    const slug = await ensureUniqueCategorySlug(generateCategorySlug(name));

    await getDb().category.create({
      data: {
        name,
        slug,
        sortOrder: nextSort,
        isActive: true,
      },
    });

    revalidateCategoryPaths();
    return { success: true };
  } catch {
    return { success: false, error: "カテゴリーの作成に失敗しました。" };
  }
}

/** カテゴリー名と表示順を更新する（slug は公開URLのため変更しない） */
export async function updateCategoryAction(input: {
  id: string;
  name: string;
  sortOrder: string;
}): Promise<FormActionResult> {
  await requireRole("ADMIN");

  const parsed = categoryUpdateSchema.safeParse(input);
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

  const { id, name, sortOrder } = parsed.data;

  const existing = await getDb().category.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!existing) {
    return { success: false, error: "カテゴリーが見つかりません。" };
  }

  const duplicate = await getDb().category.findFirst({
    where: { name, NOT: { id } },
    select: { id: true },
  });
  if (duplicate) {
    return {
      success: false,
      error: "同じ名前のカテゴリーが既に存在します。",
      fieldErrors: { name: "このカテゴリー名は既に使われています" },
    };
  }

  try {
    await getDb().category.update({
      where: { id },
      data: { name, sortOrder },
    });
    revalidateCategoryPaths();
    return { success: true };
  } catch {
    return { success: false, error: "カテゴリーの更新に失敗しました。" };
  }
}

/**
 * カテゴリーの表示/非表示を切り替える。
 * 非表示（isActive=false）にすると検索・選択候補から除外されるが、
 * 既存の先生・生徒との関連は残る。
 */
export async function setCategoryActiveAction(
  categoryId: string,
  isActive: boolean,
): Promise<FormActionResult> {
  await requireRole("ADMIN");

  try {
    await getDb().category.update({
      where: { id: categoryId },
      data: { isActive },
    });
    revalidateCategoryPaths();
    return { success: true };
  } catch {
    return { success: false, error: "表示状態の更新に失敗しました。" };
  }
}

/**
 * カテゴリーを物理削除する。
 * 先生・生徒のいずれかに紐づいている場合は削除せず、非表示を案内する。
 */
export async function deleteCategoryAction(
  categoryId: string,
): Promise<FormActionResult> {
  await requireRole("ADMIN");

  try {
    const category = await getDb().category.findUnique({
      where: { id: categoryId },
      select: {
        id: true,
        _count: { select: { teachers: true, students: true } },
      },
    });

    if (!category) {
      return { success: false, error: "カテゴリーが見つかりません。" };
    }

    if (category._count.teachers > 0 || category._count.students > 0) {
      return {
        success: false,
        error:
          "先生または生徒に紐づいているため削除できません。非表示にしてください。",
      };
    }

    await getDb().category.delete({ where: { id: categoryId } });
    revalidateCategoryPaths();
    return { success: true };
  } catch {
    return { success: false, error: "カテゴリーの削除に失敗しました。" };
  }
}
