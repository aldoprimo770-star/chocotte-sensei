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
  | { ok: true; id?: string }
  | { ok: false; error: string; status?: number; details?: string };

/** トランザクションメールを送信する */
export async function sendEmail(
  params: SendEmailParams,
): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.EMAIL_FROM?.trim();

  // 設定不足を明確に切り分ける（どちらが欠けているかもログに残す）
  if (!apiKey || !from) {
    const missing = [
      !apiKey ? "RESEND_API_KEY" : null,
      !from ? "EMAIL_FROM" : null,
    ]
      .filter(Boolean)
      .join(", ");
    console.error(`[email] not configured. missing env: ${missing}`);
    return {
      ok: false,
      error: "メール送信が設定されていません",
      details: `missing env: ${missing}`,
    };
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

    // 成否に関わらず本文を読み、失敗時は原因をログへ
    const bodyText = await response.text();

    if (!response.ok) {
      console.error(
        `[email] Resend responded ${response.status}: ${bodyText}`,
      );
      return {
        ok: false,
        error: "メールの送信に失敗しました",
        status: response.status,
        details: bodyText,
      };
    }

    let id: string | undefined;
    try {
      id = (JSON.parse(bodyText) as { id?: string }).id;
    } catch {
      // 本文が JSON でなくても送信成功なら問題なし
    }

    console.info(`[email] sent via Resend. id=${id ?? "(unknown)"}`);
    return { ok: true, id };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[email] fetch to Resend threw: ${message}`);
    return {
      ok: false,
      error: "メールの送信に失敗しました",
      details: message,
    };
  }
}
