import { SITE } from "@/constants/site";
import { PASSWORD_RESET_TOKEN_TTL_MS } from "@/constants/auth";
import { sendEmail } from "@/lib/email/send-email";

const TTL_HOURS = PASSWORD_RESET_TOKEN_TTL_MS / (60 * 60 * 1000);

/** パスワード再設定メールを送信する */
export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const subject = `【${SITE.name}】パスワード再設定のご案内`;

  const text = [
    `${SITE.name}をご利用いただきありがとうございます。`,
    "",
    "以下のリンクから、新しいパスワードを設定してください。",
    resetUrl,
    "",
    `※このリンクの有効期限は${TTL_HOURS}時間です。`,
    "※リンクは一度のみ使用できます。",
    "",
    "心当たりがない場合は、このメールを破棄してください。",
  ].join("\n");

  const html = [
    `<p>${SITE.name}をご利用いただきありがとうございます。</p>`,
    "<p>以下のボタンから、新しいパスワードを設定してください。</p>",
    `<p><a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#7c3aed;color:#fff;text-decoration:none;border-radius:8px;">パスワードを再設定する</a></p>`,
    `<p style="word-break:break-all;font-size:14px;color:#666;">${resetUrl}</p>`,
    `<p style="font-size:14px;color:#666;">※有効期限は${TTL_HOURS}時間です。リンクは一度のみ使用できます。</p>`,
    "<p style=\"font-size:14px;color:#666;\">心当たりがない場合は、このメールを破棄してください。</p>",
  ].join("");

  return sendEmail({ to, subject, text, html });
}
