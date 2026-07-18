import type { Metadata } from "next";
import Link from "next/link";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ResetPasswordForm } from "./reset-password-form";

export const metadata: Metadata = {
  title: "新しいパスワードの設定",
};

/** 新しいパスワード設定ページ */
export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token?.trim()) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>リンクが無効です</CardTitle>
          <CardDescription>
            パスワード再設定リンクが正しくないか、期限切れの可能性があります。
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

      <ResetPasswordForm token={token} />
    </Card>
  );
}
