import { z } from "zod";
import { NgWordCategory, ReportStatus } from "@prisma/client";

export const consultationMessageSchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, { message: "メッセージを入力してください" })
    .max(2000, { message: "メッセージは2000文字以内で入力してください" }),
});

export type ConsultationMessageInput = z.input<typeof consultationMessageSchema>;

export const consultationReportSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(1, { message: "通報理由を入力してください" })
    .max(1000, { message: "通報理由は1000文字以内で入力してください" }),
  messageId: z.string().optional(),
});

export const ngWordCreateSchema = z.object({
  word: z
    .string()
    .trim()
    .min(1, { message: "ワードを入力してください" })
    .max(100, { message: "ワードは100文字以内で入力してください" }),
  category: z.nativeEnum(NgWordCategory, {
    message: "カテゴリを選択してください",
  }),
});

export const ngWordUpdateSchema = z.object({
  id: z.string().min(1),
  word: z
    .string()
    .trim()
    .min(1, { message: "ワードを入力してください" })
    .max(100, { message: "ワードは100文字以内で入力してください" }),
  category: z.nativeEnum(NgWordCategory),
  isActive: z.boolean(),
});

export const reportStatusUpdateSchema = z.object({
  reportId: z.string().min(1),
  status: z.nativeEnum(ReportStatus),
  adminNote: z
    .string()
    .trim()
    .max(1000)
    .optional()
    .transform((v) => (v === "" || v === undefined ? undefined : v)),
});
