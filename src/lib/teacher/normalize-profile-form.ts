import type { TeacherProfileFormInput } from "@/schemas/teacher.schema";

/**
 * フォーム送信値の正規化（Server Action / クライアント共通）
 *
 * react-hook-form のチェックボックスは選択数により型が揺れるため、
 * 保存前に配列・真偽値へ揃える。
 */
export function normalizeProfileFormValues(
  raw: TeacherProfileFormInput,
): TeacherProfileFormInput {
  return {
    ...raw,
    teachingMethods: toStringArray(raw.teachingMethods),
    categoryIds: toStringArray(raw.categoryIds),
    targetAges: toStringArray(raw.targetAges) as TeacherProfileFormInput["targetAges"],
    skillLevels: toStringArray(
      raw.skillLevels,
    ) as TeacherProfileFormInput["skillLevels"],
    isAcceptingStudents: raw.isAcceptingStudents === true,
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
