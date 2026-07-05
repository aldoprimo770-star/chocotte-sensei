/**
 * プロフィール完成率の計算
 *
 * 入力済みの項目に応じて加点し、0〜100(%) を返します。
 * 画面では「プロフィール完成率 85%」のように表示し、
 * 先生に入力を促すために使います。
 */

/** 完成率の計算に必要な項目だけを受け取る型 */
export interface ProfileCompletionInput {
  profileImageUrl?: string | null;
  catchphrase?: string | null;
  bio?: string | null;
  lessonContent?: string | null;
  priceMin?: number | null;
  isOnline: boolean;
  categoryCount: number;
  areaCount: number;
  targetAgeCount: number;
  skillLevelCount: number;
}

/**
 * 各項目の配点（合計100）
 * 重要度の高い項目ほど配点を大きくしています。
 */
const WEIGHTS = {
  profileImage: 15,
  catchphrase: 10,
  bio: 15,
  lessonContent: 15,
  category: 15,
  area: 10, // 対応地域 または オンライン対応
  price: 10,
  targetAge: 5,
  skillLevel: 5,
} as const;

/** 文字列が入力済み（空でない）か */
function hasText(value?: string | null): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

/** プロフィール完成率（0〜100）を計算する */
export function calculateProfileCompletion(
  input: ProfileCompletionInput,
): number {
  let score = 0;

  if (hasText(input.profileImageUrl)) score += WEIGHTS.profileImage;
  if (hasText(input.catchphrase)) score += WEIGHTS.catchphrase;
  if (hasText(input.bio)) score += WEIGHTS.bio;
  if (hasText(input.lessonContent)) score += WEIGHTS.lessonContent;
  if (input.categoryCount > 0) score += WEIGHTS.category;
  if (input.areaCount > 0 || input.isOnline) score += WEIGHTS.area;
  if (input.priceMin !== null && input.priceMin !== undefined)
    score += WEIGHTS.price;
  if (input.targetAgeCount > 0) score += WEIGHTS.targetAge;
  if (input.skillLevelCount > 0) score += WEIGHTS.skillLevel;

  // 念のため 0〜100 に収める
  return Math.min(100, Math.max(0, score));
}
