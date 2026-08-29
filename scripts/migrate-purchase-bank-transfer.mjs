/**
 * PurchaseStatus を新ステータスへ移行し、銀行振込用カラムを追加する。
 * Usage: node --env-file=.env scripts/migrate-purchase-bank-transfer.mjs
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function enumValues(name) {
  const rows = await prisma.$queryRawUnsafe(
    `SELECT e.enumlabel AS label
     FROM pg_type t
     JOIN pg_enum e ON t.oid = e.enumtypid
     WHERE t.typname = $1
     ORDER BY e.enumsortorder`,
    name,
  );
  return rows.map((r) => r.label);
}

async function columnExists(table, column) {
  const rows = await prisma.$queryRawUnsafe(
    `SELECT 1 AS ok FROM information_schema.columns
     WHERE table_name = $1 AND column_name = $2`,
    table,
    column,
  );
  return rows.length > 0;
}

async function main() {
  const current = await enumValues("PurchaseStatus");
  console.log("current PurchaseStatus:", current);

  const needsEnumMigrate =
    current.includes("PENDING") ||
    current.includes("COMPLETED") ||
    current.includes("FAILED") ||
    current.includes("REFUNDED") ||
    !current.includes("PENDING_PAYMENT");

  if (needsEnumMigrate) {
    await prisma.$executeRawUnsafe(
      `ALTER TYPE "PurchaseStatus" RENAME TO "PurchaseStatus_old"`,
    );
    await prisma.$executeRawUnsafe(`
      CREATE TYPE "PurchaseStatus" AS ENUM (
        'PENDING_PAYMENT',
        'PAYMENT_REPORTED',
        'PAID',
        'CANCELLED'
      )
    `);
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "purchases" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "purchases"
      ALTER COLUMN "status" TYPE "PurchaseStatus"
      USING (
        CASE "status"::text
          WHEN 'PENDING' THEN 'PENDING_PAYMENT'::"PurchaseStatus"
          WHEN 'COMPLETED' THEN 'PAID'::"PurchaseStatus"
          WHEN 'FAILED' THEN 'CANCELLED'::"PurchaseStatus"
          WHEN 'REFUNDED' THEN 'CANCELLED'::"PurchaseStatus"
          WHEN 'PENDING_PAYMENT' THEN 'PENDING_PAYMENT'::"PurchaseStatus"
          WHEN 'PAYMENT_REPORTED' THEN 'PAYMENT_REPORTED'::"PurchaseStatus"
          WHEN 'PAID' THEN 'PAID'::"PurchaseStatus"
          WHEN 'CANCELLED' THEN 'CANCELLED'::"PurchaseStatus"
          ELSE 'PENDING_PAYMENT'::"PurchaseStatus"
        END
      )
    `);
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "purchases" ALTER COLUMN "status" SET DEFAULT 'PENDING_PAYMENT'::"PurchaseStatus"`,
    );
    await prisma.$executeRawUnsafe(`DROP TYPE "PurchaseStatus_old"`);
    console.log("enum migrated");
  } else {
    console.log("enum already up to date");
  }

  const adds = [
    ["transfer_date", `ALTER TABLE "purchases" ADD COLUMN IF NOT EXISTS "transfer_date" TIMESTAMP(3)`],
    ["student_memo", `ALTER TABLE "purchases" ADD COLUMN IF NOT EXISTS "student_memo" TEXT`],
    ["admin_memo", `ALTER TABLE "purchases" ADD COLUMN IF NOT EXISTS "admin_memo" TEXT`],
    [
      "payment_reported_at",
      `ALTER TABLE "purchases" ADD COLUMN IF NOT EXISTS "payment_reported_at" TIMESTAMP(3)`,
    ],
  ];

  for (const [col, sql] of adds) {
    if (!(await columnExists("purchases", col))) {
      await prisma.$executeRawUnsafe(sql);
      console.log("added column", col);
    } else {
      console.log("column exists", col);
    }
  }

  try {
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "purchases"
      ALTER COLUMN "payment_method" SET DEFAULT 'BANK_TRANSFER'::"PaymentMethod"
    `);
  } catch {
    // ignore if already set
  }

  console.log("done. PurchaseStatus now:", await enumValues("PurchaseStatus"));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
