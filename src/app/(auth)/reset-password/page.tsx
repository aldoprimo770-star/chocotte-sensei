import type { Metadata } from "next";
import Link from "next/link";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ResetPasswordForm } from "./reset-password-form";
import { isPasswordResetTokenUsable } from "@/lib/auth/password-reset";

export const metadata: Metadata = {
  title: "新しいパスワードの設定",
};

// トークンの有効性を毎回 DB で検証するためキャッシュしない
export const dynamic = "force-dynamic";

/** 新しいパスワード設定ページ */
export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  // トークンが無い・使用済み・期限切れの場合は無効メッセージを表示
  const isValid = token ? await isPasswordResetTokenUsable(token) : false;

  if (!isValid) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>このリンクは無効または期限切れです</CardTitle>
          <CardDescription>
            パスワード再設定リンクが正しくないか、すでに使用済み、または期限切れの可能性があります。お手数ですが、もう一度お手続きをやり直してください。
          </CardDescription>
        </CardHeader>
        <p className="text-center text-sm text-muted">
          <Link
            href="/forgot-password"
            className="font-medium text-primary hover:underline"
          >
            パスワード再設定を最初からやり直す
          </Link>
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>新しいパスワードの設定</CardTitle>
        <CardDescription>
          新しいパスワードを入力してください（8文字以上・英字と数字を含む）
        </CardDescription>
      </CardHeader>

      <ResetPasswordForm token={token ?? ""} />
    </Card>
  );
}
