import { z } from "zod";
import { PREFECTURES } from "@/constants/prefectures";
import { isHttpUrl } from "@/lib/validation";
import { emailSchema, passwordSchema } from "@/schemas/auth.schema";

/**
 * 生徒まわりの Zod スキーマ
 * メール・パスワードの検証は認証スキーマの共通部品を再利用します。
 */

/** 生徒 新規登録フォーム */
export const studentRegisterSchema = z
  .object({
    displayName: z
      .string()
      .trim()
      .min(1, { message: "表示名を入力してください" })
      .max(50, { message: "表示名は50文字以内で入力してください" }),
    email: emailSchema,
    password: passwordSchema,
    passwordConfirm: z
      .string()
      .min(1, { message: "確認用パスワードを入力してください" }),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "パスワードが一致しません",
    path: ["passwordConfirm"],
  });

/** 生徒プロフィール編集フォーム */
export const studentProfileSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(1, { message: "表示名を入力してください" })
    .max(50, { message: "表示名は50文字以内で入力してください" }),

  bio: z
    .string()
    .max(1000, { message: "自己紹介は1000文字以内で入力してください" })
    .transform((v) => {
      const trimmed = v.trim();
      return trimmed === "" ? undefined : trimmed;
    }),

  avatarUrl: z
    .string()
    .trim()
    .max(500, { message: "URLが長すぎます" })
    .refine((v) => v === "" || isHttpUrl(v), {
      message: "正しい画像URLを入力してください",
    })
    .transform((v) => (v === "" ? undefined : v)),

  // 居住都道府県（必須・一覧に含まれる値のみ許可）
  prefecture: z
    .string()
    .min(1, { message: "居住都道府県を選択してください" })
    .refine((v) => (PREFECTURES as readonly string[]).includes(v), {
      message: "正しい都道府県を選択してください",
    }),

  interestCategoryIds: z.array(z.string()).default([]),
  isOnlinePreferred: z.boolean().default(false),
});

/** フォーム入力の型（React Hook Form と共有） */
export type StudentRegisterInput = z.infer<typeof studentRegisterSchema>;
export type StudentProfileFormInput = z.input<typeof studentProfileSchema>;
export type StudentProfileFormValues = z.output<typeof studentProfileSchema>;
