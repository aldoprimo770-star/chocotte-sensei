/**
 * 初期カテゴリーデータ
 * npx prisma db seed で投入されます
 */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const INITIAL_CATEGORIES = [
  { name: "英語", slug: "english", sortOrder: 1 },
  { name: "フランス語", slug: "french", sortOrder: 2 },
  { name: "中国語", slug: "chinese", sortOrder: 3 },
  { name: "韓国語", slug: "korean", sortOrder: 4 },
  { name: "スペイン語", slug: "spanish", sortOrder: 5 },
  { name: "家庭教師", slug: "tutor", sortOrder: 6 },
  { name: "プログラミング", slug: "programming", sortOrder: 7 },
  { name: "AI・ChatGPT", slug: "ai-chatgpt", sortOrder: 8 },
  { name: "Canva", slug: "canva", sortOrder: 9 },
  { name: "デザイン", slug: "design", sortOrder: 10 },
  { name: "動画編集", slug: "video-editing", sortOrder: 11 },
  { name: "写真", slug: "photography", sortOrder: 12 },
  { name: "ピアノ", slug: "piano", sortOrder: 13 },
  { name: "ギター", slug: "guitar", sortOrder: 14 },
  { name: "ボーカル", slug: "vocal", sortOrder: 15 },
  { name: "資格試験", slug: "certification", sortOrder: 16 },
  { name: "趣味・教養", slug: "hobby", sortOrder: 17 },
] as const;

async function main(): Promise<void> {
  console.log("🌱 シードデータを投入中...");

  for (const category of INITIAL_CATEGORIES) {
    await db.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name, sortOrder: category.sortOrder },
      create: category,
    });
  }

  console.log(`✅ ${INITIAL_CATEGORIES.length} 件のカテゴリーを登録しました`);
}

main()
  .catch((error: unknown) => {
    console.error("シード投入に失敗しました:", error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
