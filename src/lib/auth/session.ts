import { redirect } from "next/navigation";
import type { UserRole } from "@prisma/client";
import { auth } from "@/auth";

/**
 * サーバー側で使う認証ガード（データアクセス層）
 *
 * ページやServer Actionの冒頭で呼び出し、
 * 未ログイン・権限不足の場合はリダイレクトします。
 * 権限チェックはUIの出し分けではなく、必ずサーバー側で行います。
 */

/** ログイン中のセッションを取得。未ログインならログイン画面へ */
export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  return session;
}

/** 指定ロールを持つユーザーのみ許可。権限がなければトップへ */
export async function requireRole(role: UserRole) {
  const session = await requireAuth();
  if (session.user.role !== role) {
    redirect("/");
  }
  return session;
}
