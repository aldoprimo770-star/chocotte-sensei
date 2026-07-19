/**
 * Cloudflare Turnstile のサーバー側トークン検証（Siteverify API）
 *
 * スパム対策のため、フォーム送信時に取得した Turnstile トークンを
 * 必ずこの関数でサーバー側検証する。クライアント側の判定は信用しない。
 * @see https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
 */

const SITEVERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export interface TurnstileVerifyResult {
  success: boolean;
  errorCodes?: string[];
}

/** Turnstile が設定済みか（サイトキー・シークレットの両方が必要） */
export function isTurnstileConfigured(): boolean {
  const siteKey =
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() ||
    process.env.TURNSTILE_SITE_KEY?.trim();
  return Boolean(siteKey && process.env.TURNSTILE_SECRET_KEY?.trim());
}

/**
 * Turnstile トークンを Siteverify API で検証する。
 * シークレット未設定・トークン欠落・検証失敗はすべて success:false を返す。
 */
export async function verifyTurnstileToken(
  token: string | null | undefined,
  remoteIp?: string,
): Promise<TurnstileVerifyResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim();

  if (!secret) {
    console.error("[turnstile] TURNSTILE_SECRET_KEY not configured");
    return { success: false, errorCodes: ["missing-secret"] };
  }

  if (!token) {
    return { success: false, errorCodes: ["missing-input-response"] };
  }

  try {
    const body = new URLSearchParams();
    body.set("secret", secret);
    body.set("response", token);
    if (remoteIp) {
      body.set("remoteip", remoteIp);
    }

    const response = await fetch(SITEVERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });

    if (!response.ok) {
      console.error(`[turnstile] siteverify HTTP ${response.status}`);
      return { success: false, errorCodes: [`http-${response.status}`] };
    }

    const data = (await response.json()) as {
      success: boolean;
      "error-codes"?: string[];
    };

    if (!data.success) {
      console.warn(
        "[turnstile] verification failed:",
        (data["error-codes"] ?? []).join(", "),
      );
    }

    return { success: data.success, errorCodes: data["error-codes"] };
  } catch (error) {
    console.error("[turnstile] siteverify threw:", error);
    return { success: false, errorCodes: ["internal-error"] };
  }
}
