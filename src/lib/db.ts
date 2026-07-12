import { cache } from "react";
import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

/**
 * Prisma Client（Cloudflare Workers / Prisma Accelerate 向け）
 *
 * - グローバルシングルトンは Workers 上で I/O エラーの原因になるため使わない
 * - React cache() で同一リクエスト内のみ再利用（OpenNext 公式推奨）
 * - DATABASE_URL は prisma:// または prisma+postgres://（Accelerate）
 *
 * @see https://opennext.js.org/cloudflare/howtos/db
 * @see https://www.prisma.io/docs/accelerate/getting-started
 */
function createPrismaClient(): PrismaClient {
  const client = new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
  // $extends は型を狭めるため PrismaClient として扱う（include/select は従来通り）
  return client.$extends(withAccelerate()) as unknown as PrismaClient;
}

/** サーバーコンポーネント / Server Actions 用（リクエスト単位） */
export const getDb = cache(createPrismaClient);
