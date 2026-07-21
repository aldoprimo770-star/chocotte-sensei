import { z } from "zod";
import {
  AgeRange,
  Gender,
  SkillLevel,
  TargetAge,
} from "@prisma/client";
import { isHttpUrl, isYouTubeUrl } from "@/lib/validation";
import { PREFECTURES } from "@/constants/prefectures";
import { isCityInPrefecture } from "@/constants/cities-by-prefecture";
import { teachingMethodsIncludeOnline } from "@/lib/teacher/teaching-methods";

/**
 * 先生プロフィール入力の Zod スキーマ
 *
 * 「下書き保存」と「公開」で必要な検証レベルが異なるため、
 * 1) baseSchema … 形式チェック（文字数・URL・数値など。常に適用）
 * 2) publishSchema … 公開に必要な必須項目チェック
 * の2段構えにしています。
 */

/** 任意テキスト（空欄OK・最大文字数チェック） */
const optionalText = (max: number, message: string) =>
  z
    .string()
    .max(max, { message })
    .transform((v) => {
      const trimmed = v.trim();
      return trimmed === "" ? undefined : trimmed;
    });

/** 任意の http(s) URL（空欄OK） */
const optionalUrl = (message: string) =>
  z
    .string()
    .trim()
    .max(500, { message: "URLが長すぎます" })
    .refine((v) => v === "" || isHttpUrl(v), { message })
    .transform((v) => (v === "" ? undefined : v));

/** 任意の価格（空欄OK・半角数字のみ・0以上100万以下） */
const optionalPrice = z
  .string()
  .trim()
  .refine((v) => v === "" || /^\d+$/.test(v), {
    message: "半角数字で入力してください",
  })
  .transform((v) => (v === "" ? undefined : Number(v)))
  .pipe(z.number().int().min(0).max(1_000_000).optional());

/** 任意の講師歴（年） */
const optionalTeachingYears = z
  .string()
  .trim()
  .refine((v) => v === "" || /^\d+$/.test(v), {
    message: "講師歴は半角数字で入力してください",
  })
  .transform((v) => (v === "" ? undefined : Number(v)))
  .pipe(z.number().int().min(0).max(80).optional());

/** 対応地域1件（都道府県 + 任意の市町村）。都道府県未選択の行は後段で除外 */
const areaRowSchema = z.object({
  prefecture: z.string().trim(),
  city: z
    .string()
    .trim()
    .transform((v) => (v === "" ? "" : v)),
});

/** 空文字→undefined に変換する任意 enum */
const optionalEnum = <T extends z.ZodTypeAny>(schema: T) =>
  z
    .union([schema, z.literal("")])
    .transform((v) => (v === "" ? undefined : v));

/**
 * チェックボックス群の正規化。
 * react-hook-form は「1つだけ選択」時に string、「未選択」時に undefined/false
 * を返すため、常に配列へ揃えてから検証する。
 */
function checkboxArray<T extends z.ZodTypeAny>(itemSchema: T) {
  return z.preprocess((val) => {
    if (val == null || val === false || val === "") return [];
    if (Array.isArray(val)) return val;
    return [val];
  }, z.array(itemSchema));
}

/**
 * 単一チェックボックスの正規化。
 * 未チェック時の undefined を false にする（.default(true) だと OFF にできない）。
 */
const checkboxBoolean = z.preprocess((val) => {
  if (typeof val === "boolean") return val;
  if (val === "true" || val === "on" || val === 1 || val === "1") return true;
  return false;
}, z.boolean());

/** フォーム共通の base スキーマ（形式チェック） */
export const teacherProfileBaseSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(1, { message: "表示名を入力してください" })
    .max(50, { message: "表示名は50文字以内で入力してください" }),

  catchphrase: optionalText(
    100,
    "キャッチコピーは100文字以内で入力してください",
  ),
  bio: optionalText(2000, "自己紹介は2000文字以内で入力してください"),
  lessonContent: optionalText(
    2000,
    "レッスン内容は2000文字以内で入力してください",
  ),

  profileImageUrl: z
    .string()
    .trim()
    .transform((v) => (v === "" ? undefined : v))
    .optional(),
  youtubeUrl: z
    .string()
    .trim()
    .refine((v) => v === "" || isYouTubeUrl(v), {
      message: "YouTubeのURLを入力してください",
    })
    .transform((v) => (v === "" ? undefined : v)),
  websiteUrl: optionalUrl("正しいURL形式で入力してください"),
  snsUrl: optionalUrl("正しいURL形式で入力してください"),

  phone: z
    .string()
    .trim()
    .max(20, { message: "電話番号は20文字以内で入力してください" })
    .refine((v) => v === "" || /^[0-9+\-() ]+$/.test(v), {
      message: "電話番号は数字と記号（+ - ( )）で入力してください",
    })
    .transform((v) => (v === "" ? undefined : v)),
  lineId: optionalText(50, "LINE IDは50文字以内で入力してください"),

  // 基本情報（任意）
  gender: optionalEnum(z.nativeEnum(Gender)),
  ageRange: optionalEnum(z.nativeEnum(AgeRange)),
  teachingYears: optionalTeachingYears,
  /** 指導方法（複数選択: 対面 / オンライン / 電話） */
  teachingMethods: checkboxArray(z.enum(["IN_PERSON", "ONLINE", "PHONE"])),

  priceMin: optionalPrice,
  priceMax: optionalPrice,

  targetAges: checkboxArray(z.nativeEnum(TargetAge)),
  skillLevels: checkboxArray(z.nativeEnum(SkillLevel)),
  categoryIds: checkboxArray(z.string()),
  /** 対応地域（都道府県 + 市町村）。空の市町村は都道府県全域を意味する */
  areas: z
    .array(areaRowSchema)
    .default([])
    .transform((rows) => rows.filter((a) => a.prefecture !== "")),

  isAcceptingStudents: checkboxBoolean,
});

/** 正規化後のデータ型 */
type NormalizedProfile = z.output<typeof teacherProfileBaseSchema>;

/** 価格レンジ + 地域の妥当性 */
function checkCommonRules(
  data: NormalizedProfile,
  ctx: z.RefinementCtx,
): void {
  if (
    data.priceMin !== undefined &&
    data.priceMax !== undefined &&
    data.priceMin > data.priceMax
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "参考価格の下限が上限を上回っています",
      path: ["priceMax"],
    });
  }

  data.areas.forEach((area, index) => {
    if (!(PREFECTURES as readonly string[]).includes(area.prefecture)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "都道府県が不正です",
        path: ["areas", index, "prefecture"],
      });
      return;
    }
    if (area.city && !isCityInPrefecture(area.prefecture, area.city)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "市町村が都道府県と一致しません",
        path: ["areas", index, "city"],
      });
    }
  });
}

/** 下書き保存用スキーマ（形式チェック + 共通ルール） */
export const teacherProfileDraftSchema =
  teacherProfileBaseSchema.superRefine(checkCommonRules);

/** 公開用スキーマ（必須項目を追加チェック） */
export const teacherProfilePublishSchema = teacherProfileBaseSchema.superRefine(
  (data, ctx) => {
    checkCommonRules(data, ctx);

    const requireText = (
      value: string | undefined,
      path: string,
      label: string,
    ): void => {
      if (!value) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${label}は公開に必須です`,
          path: [path],
        });
      }
    };

    requireText(data.profileImageUrl, "profileImageUrl", "プロフィール写真");
    requireText(data.catchphrase, "catchphrase", "キャッチコピー");
    requireText(data.bio, "bio", "自己紹介");
    requireText(data.lessonContent, "lessonContent", "レッスン内容");

    if (data.categoryIds.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "カテゴリーを1つ以上選択してください",
        path: ["categoryIds"],
      });
    }

    const onlineCapable = teachingMethodsIncludeOnline(data.teachingMethods);
    const phoneOrOnline =
      onlineCapable || data.teachingMethods.includes("PHONE");
    if (data.areas.length === 0 && !phoneOrOnline) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "対応地域を選択するか、指導方法でオンラインまたは電話を選んでください",
        path: ["areas"],
      });
    }
    if (data.teachingMethods.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "指導方法を1つ以上選択してください",
        path: ["teachingMethods"],
      });
    }
    if (data.priceMin === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "参考価格は公開に必須です",
        path: ["priceMin"],
      });
    }
    if (data.targetAges.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "指導対象を1つ以上選択してください",
        path: ["targetAges"],
      });
    }
    if (data.skillLevels.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "対応レベルを1つ以上選択してください",
        path: ["skillLevels"],
      });
    }
  },
);

/** フォーム入力の型（React Hook Form と共有・生の文字列/配列） */
export type TeacherProfileFormInput = z.input<typeof teacherProfileBaseSchema>;

/** 検証・変換後の型（価格は数値、任意項目は string | undefined） */
export type TeacherProfileFormValues = z.output<
  typeof teacherProfileBaseSchema
>;
