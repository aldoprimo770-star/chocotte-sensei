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
  // ▼ デプロイされているコードを識別するためのバージョン標識
  console.info("[password-reset] BUILD=de10440+diag action invoked");

  // ▼ 環境変数が Worker 実行時に読めているか（値は出さず有無・長さのみ）
  const envReport = {
    RESEND_API_KEY: process.env.RESEND_API_KEY
      ? `set(len=${process.env.RESEND_API_KEY.trim().length})`
      : "MISSING",
    EMAIL_FROM: process.env.EMAIL_FROM
      ? `set(${process.env.EMAIL_FROM.trim()})`
      : "MISSING",
    EMAIL_REDIRECT_TO: process.env.EMAIL_REDIRECT_TO
      ? `set(${process.env.EMAIL_REDIRECT_TO.trim()})`
      : "MISSING",
    AUTH_URL: process.env.AUTH_URL
      ? `set(${process.env.AUTH_URL.trim()})`
      : "MISSING",
  };
  console.info("[password-reset] env:", JSON.stringify(envReport));

  const parsed = forgotPasswordSchema.safeParse(input);
  if (!parsed.success) {
    console.warn("[password-reset] input validation failed");
    return { success: false, error: "入力内容をご確認ください" };
  }

  console.info("[password-reset] looking up user for submitted email");
  const user = await getDb().user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true, email: true },
  });

  if (!user) {
    // メール列挙を防ぐため成功を返すが、診断のためログには残す
    console.info("[password-reset] no user matched the submitted email");
    return {
      success: true,
      message: PASSWORD_RESET_REQUEST_SUCCESS_MESSAGE,
    };
  }

  console.info("[password-reset] user found. proceeding to token + send");

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
  console.info("[password-reset] token stored. calling sendPasswordResetEmail. resetBase=", getAppBaseUrl());
  const mailResult = await sendPasswordResetEmail(user.email, resetUrl);

  if (mailResult.ok) {
    console.info("[password-reset] sendPasswordResetEmail returned ok");
  } else {
    console.error(
      "[password-reset] mail send failed:",
      mailResult.error,
      "status=",
      "status" in mailResult ? mailResult.status : undefined,
      "details=",
      "details" in mailResult ? mailResult.details : undefined,
    );
  }

  console.info("[password-reset] action complete, returning success");
  return {
    success: true,
    message: PASSWORD_RESET_REQUEST_SUCCESS_MESSAGE,
  };
}
