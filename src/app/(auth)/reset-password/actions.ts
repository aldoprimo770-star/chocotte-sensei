"use server";

import { getDb } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { hashToken } from "@/lib/auth/token";
import {
  resetPasswordSchema,
  type ResetPasswordInput,
} from "@/schemas/auth.schema";
import type { FormActionResult } from "@/types/action";

/** トークンを使って新しいパスワードを設定する（単回利用） */
export async function resetPasswordAction(
  input: ResetPasswordInput,
): Promise<FormActionResult> {
  const parsed = resetPasswordSchema.safeParse(input);
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
      error: "入力内容をご確認ください",
      fieldErrors,
    };
  }

  const tokenHash = await hashToken(parsed.data.token);

  const record = await getDb().passwordResetToken.findUnique({
    where: { tokenHash },
    select: { id: true, userId: true, expiresAt: true, usedAt: true },
  });

  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return {
      success: false,
      error:
        "再設定リンクが無効または期限切れです。パスワード再設定を最初からやり直してください。",
    };
  }

  const passwordHash = await hashPassword(parsed.data.password);

  await getDb().$transaction([
    getDb().user.update({
      where: { id: record.userId },
      data: { passwordHash },
    }),
    getDb().passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
  ]);

  return { success: true };
}
