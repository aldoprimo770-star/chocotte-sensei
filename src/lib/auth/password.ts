/**
 * パスワードのハッシュ化・検証ユーティリティ
 *
 * 平文パスワードは絶対に保存せず、必ずこの関数を通して
 * ハッシュ化した値（passwordHash）のみを DB に保存します。
 *
 * bcryptjs はログイン/登録時のみ dynamic import し、Worker バンドルを分割する。
 *
 * Cloudflare Workers では bcrypt コストが高すぎると Error 1102
 * （CPU 超過）になるため、コストは 10 を採用する。
 */

/** Workers 向けに抑えたハッシュ強度（コスト10でも十分実用的） */
const SALT_ROUNDS = 10;

/** 平文パスワードをハッシュ化する */
export async function hashPassword(plainPassword: string): Promise<string> {
  const bcrypt = (await import("bcryptjs")).default;
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
}

/** 平文パスワードとハッシュを比較し、一致するか検証する */
export async function verifyPassword(
  plainPassword: string,
  passwordHash: string,
): Promise<boolean> {
  const bcrypt = (await import("bcryptjs")).default;
  return bcrypt.compare(plainPassword, passwordHash);
}

/** bcrypt ハッシュのコスト係数を取得（不明なら null） */
export function getBcryptCost(passwordHash: string): number | null {
  const parts = passwordHash.split("$");
  // $2a$10$... / $2b$12$...
  const cost = Number(parts[2]);
  return Number.isFinite(cost) ? cost : null;
}

/** 現行コストより高いハッシュなら再ハッシュが必要 */
export function needsPasswordRehash(passwordHash: string): boolean {
  const cost = getBcryptCost(passwordHash);
  return cost !== null && cost > SALT_ROUNDS;
}
