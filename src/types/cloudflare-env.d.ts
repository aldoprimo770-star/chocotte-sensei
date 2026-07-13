/// <reference types="@cloudflare/workers-types" />

/**
 * OpenNext Cloudflare の Workers バインディング型拡張
 * wrangler.jsonc の r2_buckets / vars と一致させる
 */
declare global {
  interface CloudflareEnv {
    PROFILE_IMAGES?: R2Bucket;
    R2_PUBLIC_URL?: string;
  }
}

export {};
