import type { Metadata } from "next";
import Link from "next/link";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ForgotPasswordForm } from "./forgot-password-form";

export const metadata: Metadata = {
  title: "パスワード再設定",
};

// ビルド時プリレンダーではなく毎リクエスト実行させ、SSR ログを確認可能にする
export const dynamic = "force-dynamic";

/** パスワード再設定メール送信ページ */
export default function ForgotPasswordPage() {
  console.info("[password-reset] forgot-password PAGE rendered (SSR)");
  return (
    <Card>
      <CardHeader>
        <CardTitle>パスワードを忘れた方</CardTitle>
        <CardDescription>
          登録済みのメールアドレスを入力してください。パスワード再設定用のリンクをお送りします。
        </CardDescription>
      </CardHeader>

      <ForgotPasswordForm />

      <p className="mt-6 text-center text-sm text-muted">
        <Link href="/login" className="font-medium text-primary hover:underline">
          ログイン画面へ戻る
        </Link>
      </p>
    </Card>
  );
}
