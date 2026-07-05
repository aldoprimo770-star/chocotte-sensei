import type { UserRole } from "@prisma/client";
import type { DefaultSession } from "next-auth";

/**
 * NextAuth の型拡張
 *
 * デフォルトの session / JWT に、アプリ独自のフィールド
 * （ユーザーID・ロール）を型安全に追加します。
 * これにより session.user.role などを any なしで扱えます。
 */
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
    } & DefaultSession["user"];
  }

  interface User {
    role: UserRole;
  }
}

// JWT の実体は @auth/core/jwt で定義されているため、そちらを拡張する
declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
  }
}
