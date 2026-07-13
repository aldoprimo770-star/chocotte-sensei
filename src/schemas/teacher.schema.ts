import { z } from "zod";
import { SkillLevel, TargetAge } from "@prisma/client";
import { isHttpUrl, isYouTubeUrl } from "@/lib/validation";

/**
 * 先生プロフィール入力の Zod スキーマ
 *
 * 「下書き保存」と「公開」で必要な検証レベルが異なるため、
 * 1) baseSchema … 形式チェック（文字数・URL・数値など。常に適用）
 * 2) publishSchema … 公開に必要な必須項目チェック
 * の2段構えにしています。
 *
 * フォーム(React Hook Form)からは全項目を文字列/配列で受け取り、
 * transform で「空文字→undefined」「価格文字列→数値」に正規化します。
 * これにより入力型(z.input)はシンプルなまま、出力型は型安全になります。
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

/** フォーム共通の base スキーマ（形式チェック） */
export const teacherProfileBaseSchema = z.object({
  // 表示名は登録時に必ず存在するため下書きでも必須
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

  // R2 アップロード後に自動設定（手入力 URL は廃止）
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

  // 連絡先情報（購入した生徒にのみ開示される）
  phone: z
    .string()
    .trim()
    .max(20, { message: "電話番号は20文字以内で入力してください" })
    .refine((v) => v === "" || /^[0-9+\-() ]+$/.test(v), {
      message: "電話番号は数字と記号（+ - ( )）で入力してください",
    })
    .transform((v) => (v === "" ? undefined : v)),
  lineId: optionalText(50, "LINE IDは50文字以内で入力してください"),

  priceMin: optionalPrice,
  priceMax: optionalPrice,

  // 複数選択（enum は Prisma の値に一致することを保証）
  targetAges: z.array(z.nativeEnum(TargetAge)).default([]),
  skillLevels: z.array(z.nativeEnum(SkillLevel)).default([]),
  categoryIds: z.array(z.string()).default([]),
  prefectures: z.array(z.string()).default([]),

  isOnline: z.boolean().default(false),
  isAcceptingStudents: z.boolean().default(true),
});

/** 正規化後のデータ型（priceは数値、任意項目はstring|undefined） */
type NormalizedProfile = z.output<typeof teacherProfileBaseSchema>;

/** 価格の下限・上限が逆転していないかの共通チェック */
function checkPriceRange(
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
}

/** 下書き保存用スキーマ（形式チェック + 価格レンジのみ） */
export const teacherProfileDraftSchema =
  teacherProfileBaseSchema.superRefine(checkPriceRange);

/** 公開用スキーマ（必須項目を追加チェック） */
export const teacherProfilePublishSchema = teacherProfileBaseSchema.superRefine(
  (data, ctx) => {
    checkPriceRange(data, ctx);

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
    if (data.prefectures.length === 0 && !data.isOnline) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "対応地域を選択するか、オンライン対応を有効にしてください",
        path: ["prefectures"],
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
        message: "対象年齢を1つ以上選択してください",
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
