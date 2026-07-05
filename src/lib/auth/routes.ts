import type { UserRole } from "@prisma/client";

/**
 * ロール別のログイン後リダイレクト先
 *
 * クライアント・サーバーどちらからも使える純粋な関数として
 * ここに集約し、遷移先の分岐を一元管理します。
 */
export function getLandingPathByRole(role: UserRole): string {
  switch (role) {
    case "TEACHER":
      return "/dashboard";
    case "STUDENT":
      return "/mypage";
    case "ADMIN":
      return "/admin";
    default:
      return "/";
  }
}
