import { handlers } from "@/auth";

/**
 * NextAuth のルートハンドラ
 * /api/auth/* へのリクエストを NextAuth に委譲します。
 */
export const { GET, POST } = handlers;
