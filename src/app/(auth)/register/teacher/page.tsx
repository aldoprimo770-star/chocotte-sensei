import type { Metadata } from "next";
import Link from "next/link";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TeacherRegisterForm } from "./register-form";

export const metadata: Metadata = {
  title: "先生登録（無料）",
};

/** 先生 新規登録ページ */
export default function TeacherRegisterPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>先生登録（無料）</CardTitle>
        <CardDescription>
          アカウントを作成して、プロフィールを掲載しましょう
        </CardDescription>
      </CardHeader>

      <TeacherRegisterForm />

      <p className="mt-6 text-center text-sm text-muted">
        すでにアカウントをお持ちの方は{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          ログイン
        </Link>
      </p>
    </Card>
  );
}
