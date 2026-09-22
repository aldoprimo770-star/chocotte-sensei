import type { AgeRange, Gender } from "@prisma/client";
import type { ProfileViewData } from "@/components/teacher/profile-view";
import type { TeacherContactInfo } from "@/lib/teacher/profile";
import {
  formValuesToInput,
  normalizeProfileFormValues,
} from "@/lib/teacher/normalize-profile-form";
import { teachingMethodsIncludeOnline } from "@/lib/teacher/teaching-methods";
import type { TeacherProfileFormInput } from "@/schemas/teacher.schema";

/**
 * 未保存のプロフィール編集内容をプレビューへ渡すための一時データ。
 * sessionStorage のみ（DB には書かない）。
 */
const STORAGE_KEY = "chocotte:teacher-profile-unsaved-preview";
const STORAGE_VERSION = 1 as const;

type StoredPreview = {
  v: typeof STORAGE_VERSION;
  values: TeacherProfileFormInput;
};

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof sessionStorage !== "undefined";
}

/** 現在のフォーム入力をプレビュー用に保存する（DB 保存ではない） */
export function saveUnsavedProfilePreview(
  values: TeacherProfileFormInput,
): void {
  if (!canUseStorage()) return;
  const payload: StoredPreview = {
    v: STORAGE_VERSION,
    values: normalizeProfileFormValues(formValuesToInput(values)),
  };
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // quota / private mode ではプレビューへ渡せないだけなので握りつぶす
  }
}

/** プレビュー／編集画面で一時データを読み取る */
export function loadUnsavedProfilePreview(): TeacherProfileFormInput | null {
  if (!canUseStorage()) return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredPreview;
    if (parsed?.v !== STORAGE_VERSION || !parsed.values) return null;
    if (typeof parsed.values.displayName !== "string") return null;
    return normalizeProfileFormValues(parsed.values);
  } catch {
    return null;
  }
}

/** 下書き保存・公開が成功したら一時データを捨てる */
export function clearUnsavedProfilePreview(): void {
  if (!canUseStorage()) return;
  sessionStorage.removeItem(STORAGE_KEY);
}

function emptyToNull(value: string | undefined | null): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function toOptionalInt(value: unknown): number | null {
  if (value == null || value === "") return null;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

const GENDERS = new Set<string>(["MALE", "FEMALE", "OTHER", "NO_ANSWER"]);
const AGE_RANGES = new Set<string>([
  "TEENS",
  "TWENTIES",
  "THIRTIES",
  "FORTIES",
  "FIFTIES",
  "SIXTIES_PLUS",
]);

/**
 * DB 上の表示用プロフィールに、未保存のフォーム入力を重ねる。
 * 評価・本人確認などフォームに無い項目は DB 側を維持する。
 */
export function overlayProfileWithFormValues(
  base: ProfileViewData,
  form: TeacherProfileFormInput,
  categories: ReadonlyArray<{ id: string; name: string }>,
  contactEmail: string | null,
): { profile: ProfileViewData; contact: TeacherContactInfo } {
  const input = normalizeProfileFormValues(formValuesToInput(form));
  const categoryById = new Map(categories.map((c) => [c.id, c.name]));
  const teachingMethods = input.teachingMethods;
  const genderRaw = String(input.gender ?? "");
  const ageRaw = String(input.ageRange ?? "");

  const profile: ProfileViewData = {
    ...base,
    displayName: input.displayName.trim() || base.displayName,
    catchphrase: emptyToNull(input.catchphrase),
    bio: emptyToNull(input.bio),
    lessonContent: emptyToNull(input.lessonContent),
    profileImageUrl: emptyToNull(input.profileImageUrl),
    priceMin: toOptionalInt(input.priceMin),
    priceMax: toOptionalInt(input.priceMax),
    targetAges: input.targetAges,
    skillLevels: input.skillLevels,
    gender: GENDERS.has(genderRaw) ? (genderRaw as Gender) : null,
    ageRange: AGE_RANGES.has(ageRaw) ? (ageRaw as AgeRange) : null,
    teachingYears: toOptionalInt(input.teachingYears),
    teachingMethods,
    teachingMethod: null,
    isOnline: teachingMethodsIncludeOnline(teachingMethods),
    isAcceptingStudents: input.isAcceptingStudents === true,
    categories: input.categoryIds
      .map((id) => categoryById.get(id))
      .filter((name): name is string => Boolean(name))
      .map((name) => ({ category: { name } })),
    areas: (Array.isArray(input.areas) ? input.areas : [])
      .filter((a) => a?.prefecture?.trim())
      .map((a) => ({
        prefecture: a.prefecture,
        city: emptyToNull(a.city),
      })),
  };

  const contact: TeacherContactInfo = {
    youtubeUrl: emptyToNull(input.youtubeUrl),
    websiteUrl: emptyToNull(input.websiteUrl),
    snsUrl: emptyToNull(input.snsUrl),
    phone: emptyToNull(input.phone),
    lineId: emptyToNull(input.lineId),
    email: contactEmail,
  };

  return { profile, contact };
}
