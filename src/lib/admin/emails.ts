import { getDb } from "@/lib/db";

/**
 * 管理者への通知先メールアドレスを決定する。
 * ADMIN_EMAIL（カンマ区切りで複数可）が設定されていればそれを優先し、
 * 無ければ DB の管理者ユーザーのメールアドレスを使う。
 */
export async function resolveAdminEmails(): Promise<string[]> {
  const fromEnv = process.env.ADMIN_EMAIL?.trim();
  if (fromEnv) {
    return fromEnv
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }

  const admins = await getDb().user.findMany({
    where: { role: "ADMIN" },
    select: { email: true },
  });
  return admins.map((a) => a.email);
}
