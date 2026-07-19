import type {
  AgeRange,
  Gender,
  SkillLevel,
  TargetAge,
  TeachingMethod,
} from "@prisma/client";

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
 */

/** 指導対象（対象年齢層）の選択肢 */
export const TARGET_AGE_OPTIONS: ReadonlyArray<{
  value: TargetAge;
  label: string;
}> = [
  { value: "PRESCHOOL", label: "幼児" },
  { value: "ELEMENTARY", label: "小学生" },
  { value: "JUNIOR_HIGH", label: "中学生" },
  { value: "HIGH_SCHOOL", label: "高校生" },
  { value: "UNIVERSITY", label: "大学生" },
  { value: "ADULT", label: "社会人" },
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

/** 性別の選択肢 */
export const GENDER_OPTIONS: ReadonlyArray<{
  value: Gender;
  label: string;
}> = [
  { value: "MALE", label: "男性" },
  { value: "FEMALE", label: "女性" },
  { value: "OTHER", label: "その他" },
  { value: "NO_ANSWER", label: "回答しない" },
];

/** 年代の選択肢 */
export const AGE_RANGE_OPTIONS: ReadonlyArray<{
  value: AgeRange;
  label: string;
}> = [
  { value: "TEENS", label: "10代" },
  { value: "TWENTIES", label: "20代" },
  { value: "THIRTIES", label: "30代" },
  { value: "FORTIES", label: "40代" },
  { value: "FIFTIES", label: "50代" },
  { value: "SIXTIES_PLUS", label: "60代以上" },
];

/** 指導方法の選択肢 */
export const TEACHING_METHOD_OPTIONS: ReadonlyArray<{
  value: TeachingMethod;
  label: string;
}> = [
  { value: "IN_PERSON", label: "対面" },
  { value: "ONLINE", label: "オンライン" },
  { value: "BOTH", label: "対面・オンライン両方" },
];

/** 検索用：講師歴（年以上）の選択肢 */
export const TEACHING_YEARS_FILTER_OPTIONS: ReadonlyArray<{
  value: number;
  label: string;
}> = [
  { value: 1, label: "1年以上" },
  { value: 3, label: "3年以上" },
  { value: 5, label: "5年以上" },
  { value: 10, label: "10年以上" },
];

/** enum 値から日本語ラベルを引く（表示用） */
export function getTargetAgeLabel(value: TargetAge): string {
  return TARGET_AGE_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

export function getSkillLevelLabel(value: SkillLevel): string {
  return SKILL_LEVEL_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

export function getGenderLabel(value: Gender): string {
  return GENDER_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

export function getAgeRangeLabel(value: AgeRange): string {
  return AGE_RANGE_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

export function getTeachingMethodLabel(value: TeachingMethod): string {
  return (
    TEACHING_METHOD_OPTIONS.find((o) => o.value === value)?.label ?? value
  );
}

/** 指導方法から互換用 isOnline を導出する */
export function teachingMethodToIsOnline(
  method: TeachingMethod | null | undefined,
): boolean {
  return method === "ONLINE" || method === "BOTH";
}

/** 文字列が有効な TargetAge かどうか（検索パラメータの検証用） */
export function isTargetAge(value: string): value is TargetAge {
  return TARGET_AGE_OPTIONS.some((o) => o.value === value);
}

/** 文字列が有効な SkillLevel かどうか（検索パラメータの検証用） */
export function isSkillLevel(value: string): value is SkillLevel {
  return SKILL_LEVEL_OPTIONS.some((o) => o.value === value);
}

export function isGender(value: string): value is Gender {
  return GENDER_OPTIONS.some((o) => o.value === value);
}

export function isAgeRange(value: string): value is AgeRange {
  return AGE_RANGE_OPTIONS.some((o) => o.value === value);
}

export function isTeachingMethod(value: string): value is TeachingMethod {
  return TEACHING_METHOD_OPTIONS.some((o) => o.value === value);
}
