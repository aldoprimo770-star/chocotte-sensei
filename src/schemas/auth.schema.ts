import { z } from "zod";

/**
 * 認証まわりの Zod スキーマ
 *
 * クライアント（React Hook Form）とサーバー（Server Action）の
 * 両方で同じスキーマを使い、二重にバリデーションします。
 * これにより入力チェックのロジックを一元管理できます。
 */

/**
 * メールアドレスのバリデーション（共通部品）
 * 生徒登録スキーマなど他ファイルからも再利用します。
 */
export const emailSchema = z
  .string()
  .min(1, { message: "メールアドレスを入力してください" })
  .email({ message: "正しいメールアドレスの形式で入力してください" });

/**
 * パスワードのバリデーション（新規登録用・共通部品）
 * - 8文字以上
 * - 英字を1文字以上含む
 * - 数字を1文字以上含む
 */
export const passwordSchema = z
  .string()
  .min(8, { message: "パスワードは8文字以上で入力してください" })
  .regex(/[a-zA-Z]/, { message: "英字を1文字以上含めてください" })
  .regex(/[0-9]/, { message: "数字を1文字以上含めてください" });

/** 先生 新規登録フォームのスキーマ */
export const teacherRegisterSchema = z
  .object({
    displayName: z
      .string()
      .min(1, { message: "お名前を入力してください" })
      .max(50, { message: "お名前は50文字以内で入力してください" }),
    email: emailSchema,
    password: passwordSchema,
    passwordConfirm: z
      .string()
      .min(1, { message: "確認用パスワードを入力してください" }),
  })
  // パスワードと確認用パスワードの一致チェック
  .refine((data) => data.password === data.passwordConfirm, {
    message: "パスワードが一致しません",
    path: ["passwordConfirm"],
  });

/** ログインフォームのスキーマ（登録時ほど厳密にしない） */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, { message: "パスワードを入力してください" }),
});

/** パスワード再設定メール送信フォーム */
export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

/** 新しいパスワード設定フォーム */
export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, { message: "再設定リンクが無効です" }),
    password: passwordSchema,
    passwordConfirm: z
      .string()
      .min(1, { message: "確認用パスワードを入力してください" }),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "パスワードが一致しません",
    path: ["passwordConfirm"],
  });

/** フォームから受け取る入力値の型（型安全のため schema から導出） */
export type TeacherRegisterInput = z.infer<typeof teacherRegisterSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
