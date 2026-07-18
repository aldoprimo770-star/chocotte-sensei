import type { Metadata } from "next";
import Link from "next/link";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "ログイン",
};

/** ログインページ */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; reset?: string }>;
}) {
  const { callbackUrl, reset } = await searchParams;

  return (
    <Card>
      <CardHeader>
        <CardTitle>ログイン</CardTitle>
        <CardDescription>
          メールアドレスとパスワードでログインしてください
        </CardDescription>
      </CardHeader>

      {reset === "success" && (
        <p className="mb-4 rounded-xl bg-primary-light px-4 py-3 text-sm text-primary">
          パスワードを更新しました。新しいパスワードでログインしてください。
        </p>
      )}

      <LoginForm callbackUrl={callbackUrl} />

      <div className="mt-6 space-y-1 text-center text-sm text-muted">
        <p>
          生徒として登録する方は{" "}
          <Link
            href="/register/student"
            className="font-medium text-primary hover:underline"
          >
            会員登録（無料）
          </Link>
        </p>
        <p>
          先生として登録する方は{" "}
          <Link
            href="/register/teacher"
            className="font-medium text-primary hover:underline"
          >
            先生登録（無料）
          </Link>
        </p>
      </div>
    </Card>
  );
}
