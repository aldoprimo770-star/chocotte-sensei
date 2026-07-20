import type { TeachingMethod } from "@prisma/client";

/**
 * 指導方法の正規化・互換ヘルパー
 *
 * - 新規: teachingMethods 配列（IN_PERSON / ONLINE / PHONE）
 * - 旧: teachingMethod 単一（BOTH 含む）+ isOnline
 */

/** UI・検索で選択可能な指導方法（将来追加はここへ） */
export const SELECTABLE_TEACHING_METHODS = [
  "IN_PERSON",
  "ONLINE",
  "PHONE",
] as const satisfies readonly TeachingMethod[];

export type SelectableTeachingMethod =
  (typeof SELECTABLE_TEACHING_METHODS)[number];

/** 旧単一値を配列へ展開 */
export function expandLegacyTeachingMethod(
  method: TeachingMethod | null | undefined,
): TeachingMethod[] {
  if (!method) return [];
  if (method === "BOTH") return ["IN_PERSON", "ONLINE"];
  return [method];
}

/**
 * DB 読み取り時に有効な指導方法一覧を返す。
 * teachingMethods が空なら旧フィールドから推定する。
 */
export function resolveTeachingMethods(profile: {
  teachingMethods?: TeachingMethod[] | null;
  teachingMethod?: TeachingMethod | null;
  isOnline?: boolean;
}): TeachingMethod[] {
  const fromArray = (profile.teachingMethods ?? []).filter(
    (m) => m !== "BOTH",
  );
  if (fromArray.length > 0) {
    // BOTH が混ざっている場合は展開してユニーク化
    const expanded = new Set<TeachingMethod>();
    for (const m of profile.teachingMethods ?? []) {
      for (const x of expandLegacyTeachingMethod(m)) {
        if (x !== "BOTH") expanded.add(x);
      }
    }
    return [...expanded];
  }

  const fromLegacy = expandLegacyTeachingMethod(profile.teachingMethod);
  if (fromLegacy.length > 0) return fromLegacy;

  if (profile.isOnline) return ["ONLINE"];
  return [];
}

/** オンライン対応か（互換 isOnline / 検索用） */
export function teachingMethodsIncludeOnline(
  methods: readonly TeachingMethod[],
): boolean {
  return methods.includes("ONLINE") || methods.includes("BOTH");
}

/** 保存用: 選択値を正規化し、旧カラム同期値も返す */
export function prepareTeachingMethodsForSave(
  methods: readonly TeachingMethod[],
): {
  teachingMethods: TeachingMethod[];
  teachingMethod: TeachingMethod | null;
  isOnline: boolean;
} {
  const unique = [
    ...new Set(
      methods.flatMap((m) => expandLegacyTeachingMethod(m)).filter(
        (m) => m !== "BOTH",
      ),
    ),
  ];

  // 旧単一カラム: 1件ならそのまま、対面+オンラインのみなら BOTH、それ以外は null
  let teachingMethod: TeachingMethod | null = null;
  if (unique.length === 1) {
    teachingMethod = unique[0]!;
  } else if (
    unique.length === 2 &&
    unique.includes("IN_PERSON") &&
    unique.includes("ONLINE") &&
    !unique.includes("PHONE")
  ) {
    teachingMethod = "BOTH";
  }

  return {
    teachingMethods: unique,
    teachingMethod,
    isOnline: teachingMethodsIncludeOnline(unique),
  };
}

export function isSelectableTeachingMethod(
  value: string,
): value is SelectableTeachingMethod {
  return (SELECTABLE_TEACHING_METHODS as readonly string[]).includes(value);
}
