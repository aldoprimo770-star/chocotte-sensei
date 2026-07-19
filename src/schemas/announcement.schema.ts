import { z } from "zod";

/** 表示順（空欄可 → undefined） */
const optionalDisplayOrder = z
  .string()
  .trim()
  .refine((v) => v === "" || /^\d+$/.test(v), {
    message: "表示順は半角数字で入力してください",
  })
  .transform((v) => (v === "" ? undefined : Number(v)))
  .pipe(z.number().int().min(0).max(9999).optional());

/** 表示順（必須） */
const requiredDisplayOrder = z
  .string()
  .trim()
  .refine((v) => /^\d+$/.test(v), {
    message: "表示順は半角数字で入力してください",
  })
  .transform((v) => Number(v))
  .pipe(z.number().int().min(0).max(9999));

/** 管理画面: お知らせ新規作成 */
export const announcementCreateSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, { message: "タイトルを入力してください" })
    .max(100, { message: "タイトルは100文字以内で入力してください" }),
  content: z
    .string()
    .trim()
    .min(1, { message: "本文を入力してください" })
    .max(5000, { message: "本文は5000文字以内で入力してください" }),
  published: z.boolean().optional(),
  displayOrder: optionalDisplayOrder,
});

/** 管理画面: お知らせ編集 */
export const announcementUpdateSchema = z.object({
  id: z.string().min(1),
  title: z
    .string()
    .trim()
    .min(1, { message: "タイトルを入力してください" })
    .max(100, { message: "タイトルは100文字以内で入力してください" }),
  content: z
    .string()
    .trim()
    .min(1, { message: "本文を入力してください" })
    .max(5000, { message: "本文は5000文字以内で入力してください" }),
  displayOrder: requiredDisplayOrder,
});

export type AnnouncementCreateInput = z.infer<typeof announcementCreateSchema>;
export type AnnouncementUpdateInput = z.infer<typeof announcementUpdateSchema>;
