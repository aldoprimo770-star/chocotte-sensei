"use server";

import { revalidatePath } from "next/cache";
import type { IdentityVerificationStatus, InquiryStatus } from "@prisma/client";
import { getDb } from "@/lib/db";
import { requireRole } from "@/lib/auth/session";
import { recalcTeacherRating } from "@/lib/review/review";
import { generateCategorySlug } from "@/lib/slug";
import {
  categoryCreateSchema,
  categoryUpdateSchema,
} from "@/schemas/category.schema";
import {
  announcementCreateSchema,
  announcementUpdateSchema,
} from "@/schemas/announcement.schema";
import {
  profileStatusToApplicationStatus,
  teacherIdentityFields,
} from "@/lib/verification/status";
import type { FormActionResult } from "@/types/action";

/** カテゴリー変更後に一覧・公開ページを再検証する */
function revalidateCategoryPaths() {
  revalidatePath("/admin/categories");
  revalidatePath("/categories");
  revalidatePath("/teachers");
  revalidatePath("/admin");
}

/** お知らせ変更後に管理・公開ページを再検証する */
function revalidateAnnouncementPaths() {
  revalidatePath("/admin/announcements");
  revalidatePath("/");
  revalidatePath("/news");
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
 * 申請を APPROVED、プロフィールを VERIFIED / isVerified=true にする。
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
        data: teacherIdentityFields("VERIFIED"),
      }),
    ]);

    revalidatePath("/admin/verifications");
    revalidatePath("/admin/teachers");
    revalidatePath("/admin");
    revalidatePath("/verification");
    revalidatePath("/dashboard");
    return { success: true };
  } catch {
    return { success: false, error: "承認に失敗しました。" };
  }
}

/**
 * 本人確認を却下する。
 * 却下理由を保存し、プロフィールを REJECTED / isVerified=false にする。
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
        data: teacherIdentityFields("REJECTED"),
      }),
    ]);

    revalidatePath("/admin/verifications");
    revalidatePath("/admin/teachers");
    revalidatePath("/admin");
    revalidatePath("/verification");
    revalidatePath("/dashboard");
    return { success: true };
  } catch {
    return { success: false, error: "却下に失敗しました。" };
  }
}

/**
 * 先生管理画面から本人確認ステータスを切り替える。
 * IdentityVerification がある場合は申請レコードも同期する。
 */
export async function setTeacherIdentityVerificationStatusAction(
  teacherId: string,
  status: IdentityVerificationStatus,
  rejectReason?: string,
): Promise<FormActionResult> {
  const session = await requireRole("ADMIN");

  if (
    status !== "PENDING" &&
    status !== "VERIFIED" &&
    status !== "REJECTED"
  ) {
    return { success: false, error: "不正なステータスです。" };
  }

  const trimmedReason = rejectReason?.trim() ?? "";
  if (status === "REJECTED" && !trimmedReason) {
    return {
      success: false,
      error: "差し戻しの場合は管理者コメントを入力してください。",
    };
  }

  try {
    const teacher = await getDb().teacherProfile.findUnique({
      where: { id: teacherId },
      select: {
        id: true,
        verification: { select: { id: true } },
      },
    });
    if (!teacher) {
      return { success: false, error: "先生が見つかりません。" };
    }

    await getDb().$transaction(async (tx) => {
      await tx.teacherProfile.update({
        where: { id: teacherId },
        data: teacherIdentityFields(status),
      });

      if (teacher.verification) {
        await tx.identityVerification.update({
          where: { id: teacher.verification.id },
          data: {
            status: profileStatusToApplicationStatus(status),
            rejectReason:
              status === "REJECTED" ? trimmedReason.slice(0, 500) : null,
            reviewedAt: new Date(),
            reviewedBy: session.user.id,
          },
        });
      }
    });

    revalidatePath("/admin/teachers");
    revalidatePath("/admin/verifications");
    revalidatePath("/admin");
    revalidatePath("/verification");
    revalidatePath("/dashboard");
    revalidatePath("/teachers");
    return { success: true };
  } catch {
    return { success: false, error: "本人確認ステータスの更新に失敗しました。" };
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

/** お知らせを新規作成する */
export async function createAnnouncementAction(input: {
  title: string;
  content: string;
  published?: boolean;
  displayOrder?: string;
}): Promise<FormActionResult> {
  await requireRole("ADMIN");

  const parsed = announcementCreateSchema.safeParse(input);
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

  const { title, content, published = false, displayOrder } = parsed.data;

  try {
    let nextOrder = displayOrder;
    if (nextOrder === undefined) {
      // 新しいお知らせは先頭（表示順 0）に出す
      nextOrder = 0;
    }

    await getDb().announcement.create({
      data: {
        title,
        content,
        published,
        displayOrder: nextOrder,
      },
    });

    revalidateAnnouncementPaths();
    return { success: true };
  } catch {
    return { success: false, error: "お知らせの作成に失敗しました。" };
  }
}

/** お知らせのタイトル・本文・表示順を更新する */
export async function updateAnnouncementAction(input: {
  id: string;
  title: string;
  content: string;
  displayOrder: string;
}): Promise<FormActionResult> {
  await requireRole("ADMIN");

  const parsed = announcementUpdateSchema.safeParse(input);
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

  const { id, title, content, displayOrder } = parsed.data;

  try {
    await getDb().announcement.update({
      where: { id },
      data: { title, content, displayOrder },
    });
    revalidateAnnouncementPaths();
    return { success: true };
  } catch {
    return { success: false, error: "お知らせの更新に失敗しました。" };
  }
}

/** お知らせの公開 / 非公開を切り替える */
export async function setAnnouncementPublishedAction(
  announcementId: string,
  published: boolean,
): Promise<FormActionResult> {
  await requireRole("ADMIN");

  try {
    await getDb().announcement.update({
      where: { id: announcementId },
      data: { published },
    });
    revalidateAnnouncementPaths();
    return { success: true };
  } catch {
    return { success: false, error: "公開状態の更新に失敗しました。" };
  }
}

/** お知らせを削除する */
export async function deleteAnnouncementAction(
  announcementId: string,
): Promise<FormActionResult> {
  await requireRole("ADMIN");

  try {
    await getDb().announcement.delete({ where: { id: announcementId } });
    revalidateAnnouncementPaths();
    return { success: true };
  } catch {
    return { success: false, error: "お知らせの削除に失敗しました。" };
  }
}
