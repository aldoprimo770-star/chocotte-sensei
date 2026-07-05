/**
 * OpenNext Cloudflare ビルド成果物のサイズを計測する。
 * Cloudflare の Worker 上限は gzip 圧縮後のサイズで判定される（OpenNext 公式）。
 */
import { execSync } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { gzipSync } from "node:zlib";

const ROOT = process.cwd();
const OPEN_NEXT = join(ROOT, ".open-next");

function formatKiB(bytes) {
  return `${(bytes / 1024).toFixed(2)} KiB`;
}

function formatMiB(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(2)} MiB`;
}

function reportFile(label, relativePath) {
  const path = join(ROOT, relativePath);
  if (!existsSync(path)) {
    console.log(`  ${label}: (なし) ${relativePath}`);
    return { raw: 0, gzip: 0, missing: true };
  }
  const buf = readFileSync(path);
  const gz = gzipSync(buf);
  console.log(
    `  ${label}: ${formatKiB(buf.length)} raw / ${formatKiB(gz.length)} gzip — ${relativePath}`,
  );
  return { raw: buf.length, gzip: gz.length, missing: false };
}

if (!existsSync(OPEN_NEXT)) {
  console.error(
    "❌ .open-next が見つかりません。先に npm run build:cloudflare を実行してください。",
  );
  process.exit(1);
}

console.log("\n📦 OpenNext Cloudflare バンドル分析\n");
console.log("主要ファイル（Cloudflare deploy ログと同じ内訳）:\n");

const entries = [
  ["Server handler", ".open-next/server-functions/default/handler.mjs"],
  [
    "Prisma WASM",
    ".open-next/server-functions/default/node_modules/.prisma/client/query_engine_bg.wasm",
  ],
  ["Middleware", ".open-next/middleware/handler.mjs"],
  ["Images handler", ".open-next/cloudflare/images.js"],
  ["Queue DO", ".open-next/.build/durable-objects/queue.js"],
  ["Worker entry", ".open-next/worker.js"],
];

let totalRaw = 0;
let totalGzip = 0;
for (const [label, rel] of entries) {
  const { raw, gzip, missing } = reportFile(label, rel);
  if (!missing) {
    totalRaw += raw;
    totalGzip += gzip;
  }
}

console.log(
  `\n  合計（個別 gzip の参考値）: ${formatKiB(totalRaw)} raw / ${formatKiB(totalGzip)} gzip`,
);
console.log(
  "  ※ Cloudflare の上限判定は wrangler がバンドルした全体の gzip サイズです。\n",
);

const wasmPath = join(
  ROOT,
  ".open-next/server-functions/default/node_modules/.prisma/client/query_engine_bg.wasm",
);
if (existsSync(wasmPath)) {
  console.log(
    "⚠️  query_engine_bg.wasm が含まれています。Prisma Accelerate 利用時は",
  );
  console.log("   `prisma generate --no-engine` をビルド前に必ず実行してください。\n");
} else {
  console.log("✅ Prisma WASM は含まれていません（--no-engine 適用済み）。\n");
}

console.log("Wrangler dry-run（公式の gzip サイズ確認）:\n");
try {
  execSync("npx wrangler deploy --dry-run", {
    stdio: "inherit",
    cwd: ROOT,
  });
} catch {
  console.log(
    "  wrangler deploy --dry-run を実行できませんでした（認証不要の環境で再試行してください）。",
  );
}
