import type { SkillLevel, TargetAge } from "@prisma/client";

/** 検索結果の並び替えの種類 */
export type TeacherSort = "new" | "price_asc" | "price_desc";

/** 並び替えの選択肢（画面表示用） */
export const SORT_OPTIONS: ReadonlyArray<{
  value: TeacherSort;
  label: string;
}> = [
  { value: "new", label: "新着順" },
  { value: "price_asc", label: "価格が安い順" },
  { value: "price_desc", label: "価格が高い順" },
];

/**
 * 先生プロフィールで使う選択肢の定義
 *
 * Prisma の enum 値（英語）と、画面表示用の日本語ラベルを対応付けます。
 * value は必ず Prisma の enum 型に一致させ、型安全に扱います。
 */

/** 対象年齢層の選択肢 */
export const TARGET_AGE_OPTIONS: ReadonlyArray<{
  value: TargetAge;
  label: string;
}> = [
  { value: "PRESCHOOL", label: "未就学児" },
  { value: "ELEMENTARY", label: "小学生" },
  { value: "JUNIOR_HIGH", label: "中学生" },
  { value: "HIGH_SCHOOL", label: "高校生" },
  { value: "UNIVERSITY", label: "大学生・専門学生" },
  { value: "ADULT", label: "社会人・一般" },
  { value: "SENIOR", label: "シニア" },
];

/** 対応レベルの選択肢 */
export const SKILL_LEVEL_OPTIONS: ReadonlyArray<{
  value: SkillLevel;
  label: string;
}> = [
  { value: "BEGINNER", label: "初級" },
  { value: "INTERMEDIATE", label: "中級" },
  { value: "ADVANCED", label: "上級" },
];

/** enum 値から日本語ラベルを引く（表示用） */
export function getTargetAgeLabel(value: TargetAge): string {
  return TARGET_AGE_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

export function getSkillLevelLabel(value: SkillLevel): string {
  return SKILL_LEVEL_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

/** 文字列が有効な TargetAge かどうか（検索パラメータの検証用） */
export function isTargetAge(value: string): value is TargetAge {
  return TARGET_AGE_OPTIONS.some((o) => o.value === value);
}

/** 文字列が有効な SkillLevel かどうか（検索パラメータの検証用） */
export function isSkillLevel(value: string): value is SkillLevel {
  return SKILL_LEVEL_OPTIONS.some((o) => o.value === value);
}
