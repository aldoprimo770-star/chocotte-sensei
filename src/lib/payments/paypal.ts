import { randomUUID } from "crypto";

/**
 * PayPal 決済ゲートウェイ（本番移行しやすい薄い抽象化レイヤー）
 *
 * - 環境変数（PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET）が未設定の場合は
 *   「テストモード」として動作し、実際の通信なしに成功を返します。
 * - 設定済みの場合は PayPal REST API(v2 Orders) を呼び出します。
 *   PAYPAL_MODE=live で本番、それ以外は sandbox エンドポイントを使用します。
 *
 * 本番移行時は環境変数を設定するだけで、呼び出し側のコードは変更不要です。
 */

const CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const MODE = process.env.PAYPAL_MODE ?? "sandbox";

/** PayPal の資格情報が設定されているか（未設定ならテストモード） */
export function isPayPalConfigured(): boolean {
  return Boolean(CLIENT_ID && CLIENT_SECRET);
}

/** 現在テストモードで動作しているか（UI 表示用） */
export function isPayPalTestMode(): boolean {
  return !isPayPalConfigured();
}

/** API のベースURL（本番 / sandbox） */
function apiBase(): string {
  return MODE === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

/** OAuth2 アクセストークンを取得（本番接続時のみ利用） */
async function getAccessToken(): Promise<string> {
  const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString(
    "base64",
  );
  const res = await fetch(`${apiBase()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) {
    throw new Error("PayPal アクセストークンの取得に失敗しました");
  }
  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

/** 注文作成の結果 */
export interface CreatedOrder {
  orderId: string;
  /** 承認用URL（本番のリダイレクト方式で使用。テストモードでは null） */
  approveUrl: string | null;
}

/**
 * 決済注文を作成する。
 * テストモードではダミーの注文IDを払い出します。
 */
export async function createOrder(params: {
  amount: number;
  referenceId: string;
}): Promise<CreatedOrder> {
  if (!isPayPalConfigured()) {
    return { orderId: `TEST-${randomUUID()}`, approveUrl: null };
  }

  const token = await getAccessToken();
  const res = await fetch(`${apiBase()}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: params.referenceId,
          amount: { currency_code: "JPY", value: String(params.amount) },
        },
      ],
    }),
  });
  if (!res.ok) {
    throw new Error("PayPal 注文の作成に失敗しました");
  }
  const data = (await res.json()) as {
    id: string;
    links?: { rel: string; href: string }[];
  };
  const approveUrl =
    data.links?.find((l) => l.rel === "approve")?.href ?? null;
  return { orderId: data.id, approveUrl };
}

/** 決済確定（capture）の結果 */
export interface CaptureResult {
  ok: boolean;
}

/**
 * 決済を確定（capture）する。
 * テストモードでは常に成功を返します。
 */
export async function captureOrder(orderId: string): Promise<CaptureResult> {
  if (!isPayPalConfigured()) {
    return { ok: true };
  }

  const token = await getAccessToken();
  const res = await fetch(
    `${apiBase()}/v2/checkout/orders/${orderId}/capture`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
  );
  if (!res.ok) {
    return { ok: false };
  }
  const data = (await res.json()) as { status?: string };
  return { ok: data.status === "COMPLETED" };
}
