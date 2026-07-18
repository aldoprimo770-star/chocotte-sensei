import { SITE } from "@/constants/site";

/** メール内リンク等で使うアプリの公開 URL（末尾スラッシュなし） */
export function getAppBaseUrl(): string {
  const fromEnv =
    process.env.AUTH_URL?.trim() || process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) {
    return fromEnv.replace(/\/$/, "");
  }
  return SITE.url.replace(/\/$/, "");
}
