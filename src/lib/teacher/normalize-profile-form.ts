import type {
  TeacherProfileFormInput,
  TeacherProfileFormValues,
} from "@/schemas/teacher.schema";

/**
 * フォーム送信値の正規化（入力型ゆれの吸収）
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
    targetAges: toStringArray(
      raw.targetAges,
    ) as TeacherProfileFormInput["targetAges"],
    skillLevels: toStringArray(
      raw.skillLevels,
    ) as TeacherProfileFormInput["skillLevels"],
    isAcceptingStudents: raw.isAcceptingStudents === true,
  };
}

/**
 * zodResolver 検証後の output（数値・undefined 済み）を、
 * Server Action 再検証用の入力形（文字列）へ戻す。
 */
export function formValuesToInput(
  data: TeacherProfileFormValues,
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
      data.teachingYears != null ? String(data.teachingYears) : "",
    teachingMethods: data.teachingMethods ?? [],
    priceMin: data.priceMin != null ? String(data.priceMin) : "",
    priceMax: data.priceMax != null ? String(data.priceMax) : "",
    targetAges: data.targetAges ?? [],
    skillLevels: data.skillLevels ?? [],
    categoryIds: data.categoryIds ?? [],
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
