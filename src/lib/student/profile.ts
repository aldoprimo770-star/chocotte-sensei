import { cache } from "react";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

/**
 * 生徒プロフィールのデータ取得層（サーバー専用）
 * 興味のあるカテゴリーを含めて取得します。
 */

/** 興味カテゴリーを含めた生徒プロフィールの型 */
export type StudentProfileWithRelations = Prisma.StudentProfileGetPayload<{
  include: {
    interests: { include: { category: true } };
  };
}>;

/** ユーザーIDから生徒プロフィールを取得（存在しなければ null） */
export const getStudentProfileByUserId = cache(
  async (userId: string): Promise<StudentProfileWithRelations | null> => {
    return db.studentProfile.findUnique({
      where: { userId },
      include: {
        interests: { include: { category: true } },
      },
    });
  },
);
