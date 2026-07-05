import bcrypt from "bcryptjs";

/**
 * パスワードのハッシュ化・検証ユーティリティ
 *
 * 平文パスワードは絶対に保存せず、必ずこの関数を通して
 * ハッシュ化した値（passwordHash）のみを DB に保存します。
 */

/** ハッシュ化の強度（コスト）。値が大きいほど安全だが計算に時間がかかる */
const SALT_ROUNDS = 12;

/** 平文パスワードをハッシュ化する */
export async function hashPassword(plainPassword: string): Promise<string> {
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
}

/** 平文パスワードとハッシュを比較し、一致するか検証する */
export async function verifyPassword(
  plainPassword: string,
  passwordHash: string,
): Promise<boolean> {
  return bcrypt.compare(plainPassword, passwordHash);
}
