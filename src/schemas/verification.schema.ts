import { z } from "zod";
import { IdentityDocumentType } from "@prisma/client";
import { isValidIdentityDocumentRef } from "@/lib/r2/identity-document";

/**
 * 本人確認申請の入力スキーマ
 * クライアント(RHF)とサーバー(Server Action)で共用します。
 *
 * documentUrl は以下のいずれか:
 * - 新規: R2 内部参照（r2:identity-documents/...）
 * - 既存互換: 外部 HTTP(S) URL
 */
export const verificationSchema = z.object({
  documentType: z.nativeEnum(IdentityDocumentType, {
    message: "書類の種類を選択してください",
  }),
  documentUrl: z
    .string()
    .trim()
    .min(1, { message: "本人確認書類の画像をアップロードしてください" })
    .max(500, { message: "参照が長すぎます" })
    .refine((v) => isValidIdentityDocumentRef(v), {
      message: "本人確認書類の画像をアップロードしてください",
    }),
  note: z
    .string()
    .trim()
    .max(500, { message: "備考は500文字以内で入力してください" })
    .transform((v) => (v === "" ? undefined : v)),
});

export type VerificationInput = z.input<typeof verificationSchema>;
export type VerificationValues = z.output<typeof verificationSchema>;
