import { SITE } from "@/constants/site";
import { getAppBaseUrl } from "@/lib/auth/app-url";
import { sendEmail, type SendEmailResult } from "@/lib/email/send-email";

/** お問い合わせの内容（メール本文の組み立てに使う） */
export interface ContactMailPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
}

/** HTML メール用に危険な文字をエスケープする（入力値の埋め込み対策） */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** 改行を <br> に変換（エスケープ済み文字列に対して使う） */
function nl2br(escaped: string): string {
  return escaped.replace(/\n/g, "<br>");
}

/**
 * お問い合わせ受信を管理者へ通知するメールを送信する。
 * to には管理者アドレス（複数可）を渡す。
 */
export async function sendContactAdminNotification(
  to: string | string[],
  payload: ContactMailPayload,
): Promise<SendEmailResult> {
  const adminUrl = `${getAppBaseUrl()}/admin/inquiries`;
  const subject = `【${SITE.name}】新しいお問い合わせ`;

  const text = [
    "新しいお問い合わせが届きました。",
    "",
    `お名前: ${payload.name}`,
    `メールアドレス: ${payload.email}`,
    `件名: ${payload.subject}`,
    "",
    "お問い合わせ内容:",
    payload.message,
    "",
    "管理画面で確認する:",
    adminUrl,
  ].join("\n");

  const html = [
    "<p>新しいお問い合わせが届きました。</p>",
    "<table cellpadding=\"0\" cellspacing=\"0\" style=\"font-size:14px;line-height:1.6;\">",
    `<tr><td style="color:#666;padding:2px 12px 2px 0;">お名前</td><td>${escapeHtml(payload.name)}</td></tr>`,
    `<tr><td style="color:#666;padding:2px 12px 2px 0;">メールアドレス</td><td>${escapeHtml(payload.email)}</td></tr>`,
    `<tr><td style="color:#666;padding:2px 12px 2px 0;">件名</td><td>${escapeHtml(payload.subject)}</td></tr>`,
    "</table>",
    "<p style=\"color:#666;margin-bottom:4px;\">お問い合わせ内容:</p>",
    `<p style="white-space:pre-wrap;">${nl2br(escapeHtml(payload.message))}</p>`,
    `<p><a href="${adminUrl}" style="display:inline-block;padding:12px 24px;background:#7c3aed;color:#fff;text-decoration:none;border-radius:8px;">管理画面で確認する</a></p>`,
    `<p style="word-break:break-all;font-size:14px;color:#666;">${adminUrl}</p>`,
  ].join("");

  return sendEmail({ to, subject, text, html });
}

/**
 * お問い合わせ送信者への自動返信メールを送信する。
 */
export async function sendContactAutoReply(
  to: string,
  name: string,
): Promise<SendEmailResult> {
  const subject = `【${SITE.name}】お問い合わせありがとうございます`;

  const text = [
    `${name} 様`,
    "",
    "お問い合わせありがとうございます。",
    "内容を確認後、通常2営業日以内にご返信いたします。",
    "",
    "※このメールは自動送信です。",
  ].join("\n");

  const html = [
    `<p>${escapeHtml(name)} 様</p>`,
    "<p>お問い合わせありがとうございます。<br>内容を確認後、通常2営業日以内にご返信いたします。</p>",
    "<p style=\"font-size:14px;color:#666;\">※このメールは自動送信です。</p>",
  ].join("");

  return sendEmail({ to, subject, text, html });
}
