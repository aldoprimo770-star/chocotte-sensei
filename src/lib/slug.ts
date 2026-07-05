/**
 * URL 用の slug（識別子）を生成するユーティリティ
 *
 * 先生プロフィールの公開URL（/teachers/[slug]）に使用します。
 * 日本語名などはそのまま URL に使えないため、
 * ランダムな英数字ベースの slug を生成します。
 */

/** 指定桁数のランダムな英数字文字列を生成 */
function randomToken(length: number): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

/**
 * 先生用の一意な slug を生成する（例: teacher-a1b2c3d4）
 * 呼び出し側で DB の一意制約と組み合わせて重複を防ぎます。
 */
export function generateTeacherSlug(): string {
  return `teacher-${randomToken(8)}`;
}
