/**
 * Resend API 経由のメール送信（fetch のみ・Cloudflare Workers 対応）
 * @see https://resend.com/docs/api-reference/emails/send-email
 */

export interface SendEmailParams {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export type SendEmailResult =
  | { ok: true }
  | { ok: false; error: string };

/** トランザクションメールを送信する */
export async function sendEmail(
  params: SendEmailParams,
): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.EMAIL_FROM?.trim();

  if (!apiKey || !from) {
    return { ok: false, error: "メール送信が設定されていません" };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: params.to,
        subject: params.subject,
        text: params.text,
        html: params.html,
      }),
    });

    if (!response.ok) {
      return { ok: false, error: "メールの送信に失敗しました" };
    }

    return { ok: true };
  } catch {
    return { ok: false, error: "メールの送信に失敗しました" };
  }
}
