/**
 * Prisma Client 生成
 *
 * Cloudflare CI (WORKERS_CI / CF_PAGES) では Accelerate 前提の --no-engine を使い、
 * query_engine WASM (~2.2 MiB) を node_modules に含めない。
 * ローカル開発は通常の prisma generate（DB 直接接続用エンジン付き）。
 */
import { execSync } from "node:child_process";

const isCloudflareCi =
  process.env.WORKERS_CI === "1" ||
  process.env.CF_PAGES === "1" ||
  process.env.CF_PAGES_URL != null;

const cmd = isCloudflareCi ? "prisma generate --no-engine" : "prisma generate";

execSync(`npx ${cmd}`, { stdio: "inherit" });
