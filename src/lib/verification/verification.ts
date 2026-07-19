import { cache } from "react";
import { getDb } from "@/lib/db";

/**
 * 本人確認のデータ取得層（サーバー専用）
 *
 * 書類画像(documentUrl)は管理者のみが扱う機密情報のため、
 * 先生本人向けクエリにも含めません（公開系にも絶対に含めない）。
 */

/** 先生（TeacherProfile.id）の本人確認申請を取得。無ければ null */
export const getVerificationByTeacherId = cache(async (teacherId: string) => {
  return getDb().identityVerification.findUnique({
    where: { teacherId },
    select: {
      id: true,
      documentType: true,
      note: true,
      status: true,
      rejectReason: true,
      createdAt: true,
      updatedAt: true,
    },
  });
});
