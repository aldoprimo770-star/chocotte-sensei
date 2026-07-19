"use server";

import { AuthError } from "next-auth";
import { headers } from "next/headers";
import type { UserRole } from "@prisma/client";
import { getDb } from "@/lib/db";
import { signIn, signOut } from "@/auth";
import { hashPassword } from "@/lib/auth/password";
import { generateTeacherSlug } from "@/lib/slug";
import { verifyTurnstileToken } from "@/lib/turnstile/verify";
import { TURNSTILE_ERROR_MESSAGE } from "@/constants/turnstile";
import {
  loginSchema,
  teacherRegisterSchema,
  type LoginInput,
  type TeacherRegisterInput,
} from "@/schemas/auth.schema";
import {
  studentRegisterSchema,
  type StudentRegisterInput,
} from "@/schemas/student.schema";

/**
 * Turnstile トークンをサーバー側で検証する共通処理。
 * 検証に成功した場合のみ true を返す。
 */
async function isTurnstileValid(token: string | undefined): Promise<boolean> {
  const remoteIp = (await headers()).get("cf-connecting-ip") ?? undefined;
  const result = await verifyTurnstileToken(token, remoteIp);
  return result.success;
}

/**
 * Server Action の共通の戻り値型
 * success で成否を、error に画面表示用のメッセージを返します。
 */
export type ActionResult =
  | { success: true }
  | { success: false; error: string };

/** ログインの戻り値（成功時はロールを返し、遷移先の判定に使う） */
export type LoginResult =
  | { success: true; role: UserRole }
  | { success: false; error: string };

/**
 * 先生の新規登録
 *
 * 1. サーバー側で入力値を再検証
 * 2. メールアドレスの重複チェック
 * 3. パスワードをハッシュ化して User と TeacherProfile を作成
 * 4. そのままログイン状態にする
 */
export async function registerTeacherAction(
  input: TeacherRegisterInput,
  turnstileToken?: string,
): Promise<ActionResult> {
  // 1. サーバー側バリデーション（クライアントを信用しない）
  const parsed = teacherRegisterSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "入力内容に誤りがあります" };
  }

  // スパム対策: Turnstile を必ずサーバー側で検証（成功時のみ続行）
  if (!(await isTurnstileValid(turnstileToken))) {
    return { success: false, error: TURNSTILE_ERROR_MESSAGE };
  }

  const { displayName, email, password } = parsed.data;

  // 2. メールアドレス重複チェック
  const existing = await getDb().user.findUnique({ where: { email } });
  if (existing) {
    return {
      success: false,
      error: "このメールアドレスは既に登録されています",
    };
  }

  // 3. ユーザー + 先生プロフィールを同時作成（トランザクション）
  const passwordHash = await hashPassword(password);
  try {
    await getDb().user.create({
      data: {
        email,
        passwordHash,
        role: "TEACHER",
        teacherProfile: {
          create: {
            slug: generateTeacherSlug(),
            displayName,
          },
        },
      },
    });
  } catch {
    return {
      success: false,
      error: "登録処理に失敗しました。時間をおいて再度お試しください",
    };
  }

  // 4. 作成後、そのままログイン（セッション確立のみ・リダイレクトはクライアント側）
  try {
    await signIn("credentials", { email, password, redirect: false });
  } catch {
    // ログインに失敗してもアカウント作成自体は成功しているため、
    // ログイン画面へ誘導する
    return {
      success: false,
      error: "登録は完了しましたが自動ログインに失敗しました。ログインしてください",
    };
  }

  return { success: true };
}

/**
 * 生徒の新規登録
 * 先生登録とほぼ同じ流れ。作成するプロフィールが StudentProfile である点が異なる。
 */
export async function registerStudentAction(
  input: StudentRegisterInput,
  turnstileToken?: string,
): Promise<ActionResult> {
  const parsed = studentRegisterSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "入力内容に誤りがあります" };
  }

  // スパム対策: Turnstile を必ずサーバー側で検証（成功時のみ続行）
  if (!(await isTurnstileValid(turnstileToken))) {
    return { success: false, error: TURNSTILE_ERROR_MESSAGE };
  }

  const { displayName, email, password } = parsed.data;

  // メールアドレス重複チェック
  const existing = await getDb().user.findUnique({ where: { email } });
  if (existing) {
    return {
      success: false,
      error: "このメールアドレスは既に登録されています",
    };
  }

  // ユーザー + 生徒プロフィールを同時作成
  const passwordHash = await hashPassword(password);
  try {
    await getDb().user.create({
      data: {
        email,
        passwordHash,
        role: "STUDENT",
        studentProfile: {
          create: { displayName },
        },
      },
    });
  } catch {
    return {
      success: false,
      error: "登録処理に失敗しました。時間をおいて再度お試しください",
    };
  }

  // そのままログイン
  try {
    await signIn("credentials", { email, password, redirect: false });
  } catch {
    return {
      success: false,
      error:
        "登録は完了しましたが自動ログインに失敗しました。ログインしてください",
    };
  }

  return { success: true };
}

/**
 * ログイン
 * NextAuth の signIn を呼び出し、認証失敗を画面表示用に変換します。
 * 成功時はロールを返し、クライアント側でロール別ページへ遷移させます。
 */
export async function loginAction(input: LoginInput): Promise<LoginResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "入力内容に誤りがあります" };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });
  } catch (error) {
    // 認証情報が正しくない場合
    if (error instanceof AuthError) {
      return {
        success: false,
        error: "メールアドレスまたはパスワードが正しくありません",
      };
    }
    throw error;
  }

  // 遷移先判定のためロールを取得
  const user = await getDb().user.findUnique({
    where: { email: parsed.data.email },
    select: { role: true },
  });

  return { success: true, role: user?.role ?? "STUDENT" };
}

/** ログアウト */
export async function logoutAction(): Promise<void> {
  await signOut({ redirectTo: "/" });
}
