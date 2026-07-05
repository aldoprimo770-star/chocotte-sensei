import { z } from "zod";
import { IdentityDocumentType } from "@prisma/client";
import { isHttpUrl } from "@/lib/validation";

/**
 * 本人確認申請の入力スキーマ
 * クライアント(RHF)とサーバー(Server Action)で共用します。
 */
export const verificationSchema = z.object({
  documentType: z.nativeEnum(IdentityDocumentType, {
    message: "書類の種類を選択してください",
  }),
  documentUrl: z
    .string()
    .trim()
    .min(1, { message: "書類画像のURLを入力してください" })
    .max(500, { message: "URLが長すぎます" })
    .refine((v) => isHttpUrl(v), {
      message: "正しい画像URLを入力してください",
    }),
  note: z
    .string()
    .trim()
    .max(500, { message: "備考は500文字以内で入力してください" })
    .transform((v) => (v === "" ? undefined : v)),
});

export type VerificationInput = z.input<typeof verificationSchema>;
export type VerificationValues = z.output<typeof verificationSchema>;
