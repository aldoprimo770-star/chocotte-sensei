"use server";

import { getDb } from "@/lib/db";
import { requireRole } from "@/lib/auth/session";
import {
  buildIdentityDocumentKey,
  toIdentityDocumentRef,
  validateIdentityDocumentBytes,
  validateIdentityDocumentFile,
} from "@/lib/r2/identity-document";
import {
  getProfileImagesBucket,
  putImageToR2,
} from "@/lib/r2/storage";

/** 本人確認書類アップロードの戻り値（url は内部参照 r2:…） */
export type UploadIdentityDocumentResult =
  | { success: true; url: string }
  | { success: false; error: string };

/**
 * 本人確認書類を R2 に保存し、公開 URL ではなく内部参照を返す。
 * 画像本体は管理者専用ルート経由でのみ配信する。
 */
export async function uploadIdentityDocumentAction(
  formData: FormData,
): Promise<UploadIdentityDocumentResult> {
  const session = await requireRole("TEACHER");

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { success: false, error: "画像ファイルを選択してください" };
  }

  const validation = validateIdentityDocumentFile(file);
  if (!validation.ok) {
    return { success: false, error: validation.error };
  }

  const profile = await getDb().teacherProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!profile) {
    return { success: false, error: "プロフィールが見つかりません" };
  }

  // 承認済みの場合はアップロード自体を拒否
  const existing = await getDb().identityVerification.findUnique({
    where: { teacherId: profile.id },
    select: { status: true },
  });
  if (existing?.status === "APPROVED") {
    return { success: false, error: "すでに本人確認は承認済みです。" };
  }

  const bucket = await getProfileImagesBucket();
  if (!bucket) {
    return {
      success: false,
      error: "画像ストレージが設定されていません（R2バケット）",
    };
  }

  const buffer = await file.arrayBuffer();
  if (!validateIdentityDocumentBytes(buffer, validation.mimeType)) {
    return {
      success: false,
      error: "画像ファイルの形式が正しくありません",
    };
  }

  const key = buildIdentityDocumentKey(profile.id, validation.extension);
  const documentRef = toIdentityDocumentRef(key);

  try {
    await putImageToR2(bucket, key, buffer, validation.mimeType);
  } catch {
    return { success: false, error: "画像のアップロードに失敗しました" };
  }

  return { success: true, url: documentRef };
}
