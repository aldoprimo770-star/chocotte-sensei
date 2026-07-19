import type { Metadata } from "next";
import Link from "next/link";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getTurnstileSiteKey } from "@/lib/turnstile/env";
import { StudentRegisterForm } from "./register-form";

export const metadata: Metadata = {
  title: "会員登録（無料）",
};

// Workers 実行時の環境変数からサイトキーを読むため、静的プリレンダーしない
export const dynamic = "force-dynamic";

/** 生徒 会員登録ページ */
export default function StudentRegisterPage() {
  const turnstileSiteKey = getTurnstileSiteKey();

  return (
    <Card>
      <CardHeader>
        <CardTitle>会員登録（無料）</CardTitle>
        <CardDescription>
          登録すると、気になる先生をお気に入り登録できます
        </CardDescription>
      </CardHeader>

      <StudentRegisterForm turnstileSiteKey={turnstileSiteKey} />

      <p className="mt-6 text-center text-sm text-muted">
        すでにアカウントをお持ちの方は{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          ログイン
        </Link>
      </p>
    </Card>
  );
}
