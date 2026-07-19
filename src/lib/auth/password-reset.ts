import { getDb } from "@/lib/db";
import { hashToken } from "@/lib/auth/token";

/**
 * パスワード再設定トークンが「使用可能」か判定する。
 * 見つからない・使用済み・期限切れのいずれかなら false。
 */
export async function isPasswordResetTokenUsable(
  rawToken: string,
): Promise<boolean> {
  const trimmed = rawToken.trim();
  if (!trimmed) {
    return false;
  }

  const tokenHash = await hashToken(trimmed);
  const record = await getDb().passwordResetToken.findUnique({
    where: { tokenHash },
    select: { expiresAt: true, usedAt: true },
  });

  if (!record) {
    return false;
  }
  if (record.usedAt) {
    return false;
  }
  if (record.expiresAt < new Date()) {
    return false;
  }
  return true;
}
