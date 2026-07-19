import { z } from "zod";

/** 表示順（空欄可 → undefined、半角数字のみ） */
const optionalSortOrder = z
  .string()
  .trim()
  .refine((v) => v === "" || /^\d+$/.test(v), {
    message: "表示順は半角数字で入力してください",
  })
  .transform((v) => (v === "" ? undefined : Number(v)))
  .pipe(z.number().int().min(0).max(9999).optional());

/** 表示順（必須・半角数字） */
const requiredSortOrder = z
  .string()
  .trim()
  .refine((v) => /^\d+$/.test(v), {
    message: "表示順は半角数字で入力してください",
  })
  .transform((v) => Number(v))
  .pipe(z.number().int().min(0).max(9999));

/** 管理画面: カテゴリー新規作成 */
export const categoryCreateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: "カテゴリー名を入力してください" })
    .max(50, { message: "カテゴリー名は50文字以内で入力してください" }),
  sortOrder: optionalSortOrder,
});

/** 管理画面: カテゴリー編集 */
export const categoryUpdateSchema = z.object({
  id: z.string().min(1),
  name: z
    .string()
    .trim()
    .min(1, { message: "カテゴリー名を入力してください" })
    .max(50, { message: "カテゴリー名は50文字以内で入力してください" }),
  sortOrder: requiredSortOrder,
});

export type CategoryCreateInput = z.infer<typeof categoryCreateSchema>;
export type CategoryUpdateInput = z.infer<typeof categoryUpdateSchema>;
