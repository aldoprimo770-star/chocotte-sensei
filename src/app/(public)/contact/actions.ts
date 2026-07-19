"use server";

import { headers } from "next/headers";
import { getDb } from "@/lib/db";
import { contactSchema, type ContactInput } from "@/schemas/contact.schema";
import type { FormActionResult } from "@/types/action";
import {
  sendContactAdminNotification,
  sendContactAutoReply,
} from "@/lib/email/contact-email";
import { verifyTurnstileToken } from "@/lib/turnstile/verify";

/** スパム対策の認証失敗時に返す共通メッセージ */
const TURNSTILE_ERROR_MESSAGE =
  "スパム対策の認証に失敗しました。もう一度お試しください。";

/**
 * 管理者への通知先メールアドレスを決定する。
 * ADMIN_EMAIL（カンマ区切りで複数可）が設定されていればそれを優先し、
 * 無ければ DB の管理者ユーザーのメールアドレスを使う。
 */
async function resolveAdminEmails(): Promise<string[]> {
  const fromEnv = process.env.ADMIN_EMAIL?.trim();
  if (fromEnv) {
    return fromEnv
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }

  const admins = await getDb().user.findMany({
    where: { role: "ADMIN" },
    select: { email: true },
  });
  return admins.map((a) => a.email);
}

/**
 * お問い合わせ受信時のメール送信（管理者通知 + 送信者への自動返信）。
 * メール送信の失敗はお問い合わせ保存の成否に影響させない（ログのみ）。
 */
async function notifyContact(payload: ContactInput): Promise<void> {
  try {
    const adminEmails = await resolveAdminEmails();

    if (adminEmails.length === 0) {
      console.error("[contact] no admin email recipient found");
    }

    const results = await Promise.allSettled([
      adminEmails.length > 0
        ? sendContactAdminNotification(adminEmails, payload)
        : Promise.resolve({ ok: false as const, error: "no admin recipient" }),
      sendContactAutoReply(payload.email, payload.name),
    ]);

    results.forEach((result, index) => {
      const label = index === 0 ? "admin notification" : "auto reply";
      if (result.status === "rejected") {
        console.error(`[contact] ${label} threw:`, result.reason);
      } else if (!result.value.ok) {
        console.error(`[contact] ${label} failed:`, result.value.error);
      }
    });
  } catch (error) {
    // メール送信の失敗はお問い合わせ保存の成否に影響させない
    console.error("[contact] notifyContact failed:", error);
  }
}

/**
 * お問い合わせ送信 Server Action
 *
 * 入力をサーバー側で再検証し、Inquiry として保存します。
 * ログイン不要（公開フォーム）です。
 */
export async function submitContactAction(
  input: ContactInput,
  turnstileToken?: string,
): Promise<FormActionResult> {
  const parsed = contactSchema.safeParse(input);

  if (!parsed.success) {
    // フィールド単位のエラーへ変換して返す
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

  // スパム対策: Turnstile トークンをサーバー側で必ず検証する。
  // 検証に失敗した場合は保存・メール送信を一切行わない。
  const remoteIp = (await headers()).get("cf-connecting-ip") ?? undefined;
  const verification = await verifyTurnstileToken(turnstileToken, remoteIp);
  if (!verification.success) {
    return { success: false, error: TURNSTILE_ERROR_MESSAGE };
  }

  try {
    await getDb().inquiry.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        subject: parsed.data.subject,
        message: parsed.data.message,
      },
    });

    // 保存に成功したら管理者通知と自動返信メールを送る（失敗しても送信は成功扱い）
    await notifyContact(parsed.data);

    return { success: true };
  } catch {
    return {
      success: false,
      error:
        "送信中にエラーが発生しました。時間をおいて再度お試しください。",
    };
  }
}
