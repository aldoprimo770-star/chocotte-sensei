import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import type { UserRole } from "@prisma/client";
import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";
import { loginSchema } from "@/schemas/auth.schema";

/**
 * NextAuth(Auth.js) の設定
 *
 * - 認証方式: Credentials（メールアドレス + パスワード）
 * - セッション: JWT（DBにセッションを持たないステートレス方式）
 * - ロール(role)を JWT / session に含め、権限判定に利用する
 */
export const {
  handlers, // ルートハンドラ用（/api/auth/[...nextauth]）
  auth, // サーバー側でセッションを取得する関数
  signIn, // ログイン処理
  signOut, // ログアウト処理
} = NextAuth({
  trustHost: true, // Cloudflare 等のリバースプロキシ背後でも HOST 検証を通す
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 30, // 30日
  },
  pages: {
    signIn: "/login", // 未ログイン時のリダイレクト先
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "メールアドレス", type: "email" },
        password: { label: "パスワード", type: "password" },
      },
      /**
       * 認証の中核。入力値を検証し、ユーザーが正しければ
       * セッションに載せる最小情報を返す。失敗時は null。
       */
      async authorize(credentials) {
        // 入力値をサーバー側でも検証（クライアントを信用しない）
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const { email, password } = parsed.data;

        const user = await db.user.findUnique({
          where: { email },
        });
        if (!user) {
          return null;
        }

        // パスワード照合
        const isValid = await verifyPassword(password, user.passwordHash);
        if (!isValid) {
          return null;
        }

        // 最終ログイン日時を更新
        await db.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        // ここで返した値が jwt コールバックの user に渡る
        return {
          id: user.id,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    /** ログイン時に user 情報を JWT へ格納 */
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role as UserRole;
      }
      return token;
    },
    /** JWT の情報を session.user に反映 */
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
});
