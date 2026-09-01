import { z } from "zod";
import { CONTACT_TOPICS } from "@/constants/contact";

const topicValues = CONTACT_TOPICS.map((t) => t.value) as [
  (typeof CONTACT_TOPICS)[number]["value"],
  ...(typeof CONTACT_TOPICS)[number]["value"][],
];

/**
 * お問い合わせフォームのバリデーションスキーマ
 * クライアント（RHF）とサーバー（Server Action）で共用します。
 */
export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "お名前を入力してください")
    .max(50, "お名前は50文字以内で入力してください"),
  email: z
    .string()
    .trim()
    .min(1, "メールアドレスを入力してください")
    .email("正しいメールアドレスを入力してください")
    .max(255, "メールアドレスは255文字以内で入力してください"),
  topic: z.enum(topicValues, {
    message: "お問い合わせ種別を選択してください",
  }),
  subject: z
    .string()
    .trim()
    .min(1, "件名を入力してください")
    .max(100, "件名は100文字以内で入力してください"),
  message: z
    .string()
    .trim()
    .min(10, "お問い合わせ内容は10文字以上で入力してください")
    .max(2000, "お問い合わせ内容は2000文字以内で入力してください"),
});

export type ContactInput = z.infer<typeof contactSchema>;
