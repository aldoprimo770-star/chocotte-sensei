import { getDb } from "@/lib/db";
import { DEFAULT_NG_WORDS } from "@/constants/consultation";

/** デフォルト NG ワードを DB に投入（既存はスキップ） */
export async function ensureDefaultNgWords(): Promise<void> {
  const count = await getDb().ngWord.count();
  if (count > 0) return;

  await getDb().ngWord.createMany({
    data: DEFAULT_NG_WORDS.map((w) => ({
      word: w.word,
      category: w.category,
      isActive: true,
    })),
    skipDuplicates: true,
  });
}

/** 有効な NG ワード一覧を取得 */
export async function getActiveNgWords(): Promise<string[]> {
  await ensureDefaultNgWords();
  const rows = await getDb().ngWord.findMany({
    where: { isActive: true },
    select: { word: true },
  });
  return rows.map((r) => r.word);
}

/**
 * 本文に NG ワードが含まれるか検査する。
 * 大文字小文字を無視し、部分一致で判定する。
 */
export function findNgWordInText(
  body: string,
  ngWords: readonly string[],
): string | null {
  const normalized = body.toLowerCase();
  for (const word of ngWords) {
    if (!word) continue;
    if (normalized.includes(word.toLowerCase())) {
      return word;
    }
  }
  return null;
}

/** 送信本文を NG ワード検査する（ヒットしたらそのワードを返す） */
export async function detectNgWord(body: string): Promise<string | null> {
  const words = await getActiveNgWords();
  return findNgWordInText(body, words);
}
