import { defineCloudflareConfig } from "@opennextjs/cloudflare";

/**
 * OpenNext Cloudflare アダプタ設定
 *
 * R2 インクリメンタルキャッシュは任意（本番安定後に有効化可）。
 * https://opennext.js.org/cloudflare/caching
 */
export default defineCloudflareConfig({
  /** コールドスタート時の CPU 増加を避ける（デフォルト "none" を明示） */
  routePreloadingBehavior: "none",
});
