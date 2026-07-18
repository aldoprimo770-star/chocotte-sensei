"use server";

import { getDb } from "@/lib/db";
import { getAppBaseUrl } from "@/lib/auth/app-url";
import { generateSecureToken, hashToken } from "@/lib/auth/token";
import {
  PASSWORD_RESET_REQUEST_SUCCESS_MESSAGE,
  PASSWORD_RESET_TOKEN_TTL_MS,
} from "@/constants/auth";
import { sendPasswordResetEmail } from "@/lib/email/password-reset-email";
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@/schemas/auth.schema";
import type { FormActionResult } from "@/types/action";

/**
 * パスワード再設定メールを送信する。
 * 登録の有無に関わらず同じ成功メッセージを返し、メール列挙を防ぐ。
 */
export async function requestPasswordResetAction(
  input: ForgotPasswordInput,
): Promise<FormActionResult & { message?: string }> {
  const parsed = forgotPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "入力内容をご確認ください" };
  }

  const user = await getDb().user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true, email: true },
  });

  if (user) {
    const rawToken = generateSecureToken();
    const tokenHash = await hashToken(rawToken);
    const expiresAt = new Date(Date.now() + PASSWORD_RESET_TOKEN_TTL_MS);

    await getDb().$transaction([
      // 未使用の旧トークンを無効化
      getDb().passwordResetToken.deleteMany({
        where: { userId: user.id, usedAt: null },
      }),
      getDb().passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt,
        },
      }),
    ]);

    const resetUrl = `${getAppBaseUrl()}/reset-password?token=${encodeURIComponent(rawToken)}`;
    const mailResult = await sendPasswordResetEmail(user.email, resetUrl);

    if (!mailResult.ok) {
      console.error("[password-reset] mail send failed:", mailResult.error);
    }
  }

  return {
    success: true,
    message: PASSWORD_RESET_REQUEST_SUCCESS_MESSAGE,
  };
}
