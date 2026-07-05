import { cache } from "react";
import { db } from "@/lib/db";

/**
 * 本人確認のデータ取得層（サーバー専用）
 *
 * 書類画像URL(documentUrl)は管理者・本人のみが扱う機密情報のため、
 * 公開系のクエリには絶対に含めません。
 */

/** 先生（TeacherProfile.id）の本人確認申請を取得。無ければ null */
export const getVerificationByTeacherId = cache(async (teacherId: string) => {
  return db.identityVerification.findUnique({
    where: { teacherId },
    select: {
      id: true,
      documentType: true,
      documentUrl: true,
      note: true,
      status: true,
      rejectReason: true,
      createdAt: true,
      updatedAt: true,
    },
  });
});
