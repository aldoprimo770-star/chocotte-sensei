import type { SkillLevel, TargetAge } from "@prisma/client";
import {
  SELECTABLE_TEACHING_METHODS,
  type SelectableTeachingMethod,
} from "@/lib/teacher/teaching-methods";
import type {
  TeacherProfileFormInput,
  TeacherProfileFormValues,
} from "@/schemas/teacher.schema";

/**
 * z.preprocess により TeacherProfileFormInput 上のチェックボックス配列は
 * 入力型が {} になる。正規化後は実行時どおり配列として扱う。
 */
export type NormalizedProfileFormValues = TeacherProfileFormInput & {
  teachingMethods: SelectableTeachingMethod[];
  categoryIds: string[];
  targetAges: TargetAge[];
  skillLevels: SkillLevel[];
  isAcceptingStudents: boolean;
};

/**
 * フォーム送信値の正規化（入力型ゆれの吸収）
 *
 * react-hook-form のチェックボックスは選択数により型が揺れるため、
 * 保存前に配列・真偽値へ揃える。
 */
export function normalizeProfileFormValues(
  raw: TeacherProfileFormInput,
): NormalizedProfileFormValues {
  return {
    ...raw,
    teachingMethods: toSelectableTeachingMethods(raw.teachingMethods),
    categoryIds: toStringArray(raw.categoryIds),
    targetAges: toStringArray(raw.targetAges) as TargetAge[],
    skillLevels: toStringArray(raw.skillLevels) as SkillLevel[],
    isAcceptingStudents: raw.isAcceptingStudents === true,
  };
}

/**
 * zodResolver 検証後の output（数値・undefined 済み）や、
 * フォーム生値を、Server Action 再検証用の入力形（文字列）へ戻す。
 */
export function formValuesToInput(
  data: TeacherProfileFormValues | TeacherProfileFormInput,
): TeacherProfileFormInput {
  return {
    displayName: data.displayName,
    catchphrase: data.catchphrase ?? "",
    bio: data.bio ?? "",
    lessonContent: data.lessonContent ?? "",
    profileImageUrl: data.profileImageUrl ?? "",
    youtubeUrl: data.youtubeUrl ?? "",
    websiteUrl: data.websiteUrl ?? "",
    snsUrl: data.snsUrl ?? "",
    phone: data.phone ?? "",
    lineId: data.lineId ?? "",
    gender: data.gender ?? "",
    ageRange: data.ageRange ?? "",
    teachingYears:
      data.teachingYears != null && data.teachingYears !== ""
        ? String(data.teachingYears)
        : "",
    teachingMethods: toStringArray(data.teachingMethods) as TeacherProfileFormInput["teachingMethods"],
    priceMin:
      data.priceMin != null && data.priceMin !== ""
        ? String(data.priceMin)
        : "",
    priceMax:
      data.priceMax != null && data.priceMax !== ""
        ? String(data.priceMax)
        : "",
    targetAges: toStringArray(
      data.targetAges,
    ) as TeacherProfileFormInput["targetAges"],
    skillLevels: toStringArray(
      data.skillLevels,
    ) as TeacherProfileFormInput["skillLevels"],
    categoryIds: toStringArray(data.categoryIds),
    areas: (data.areas ?? []).map((a) => ({
      prefecture: a.prefecture,
      city: a.city ?? "",
    })),
    isAcceptingStudents: data.isAcceptingStudents === true,
  };
}

function toStringArray(value: unknown): string[] {
  if (value == null || value === false || value === "") return [];
  if (Array.isArray(value)) {
    return value.filter((v): v is string => typeof v === "string");
  }
  if (typeof value === "string") return [value];
  return [];
}

function toSelectableTeachingMethods(
  value: unknown,
): SelectableTeachingMethod[] {
  return toStringArray(value).filter(
    (m): m is SelectableTeachingMethod =>
      (SELECTABLE_TEACHING_METHODS as readonly string[]).includes(m),
  );
}
