"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { PREFECTURES } from "@/constants/prefectures";
import { getCitiesByPrefecture } from "@/constants/cities-by-prefecture";
import {
  AGE_RANGE_OPTIONS,
  GENDER_OPTIONS,
  SKILL_LEVEL_OPTIONS,
  TARGET_AGE_OPTIONS,
  TEACHING_METHOD_OPTIONS,
  TEACHING_YEARS_FILTER_OPTIONS,
} from "@/constants/teacher";

/** フォームの入力状態（すべて文字列/真偽値で保持） */
interface SearchFormState {
  keyword: string;
  categoryId: string;
  prefecture: string;
  city: string;
  targetAge: string;
  skillLevel: string;
  gender: string;
  ageRange: string;
  teachingYearsMin: string;
  teachingMethod: string;
  minPrice: string;
  maxPrice: string;
  online: boolean;
  accepting: boolean;
  verified: boolean;
}

interface SearchFormProps {
  categories: ReadonlyArray<{ id: string; name: string }>;
  initial: SearchFormState;
}

/**
 * 先生検索フォーム（クライアントコンポーネント）
 *
 * 検索条件はURLに反映するため、送信時に router.push でクエリを更新します。
 * 初期値は現在のURL条件から復元されるため、検索後も条件が保持されます。
 */
export function SearchForm({ categories, initial }: SearchFormProps) {
  const router = useRouter();
  const [state, setState] = useState<SearchFormState>(initial);

  /** 現在の入力値からURLを組み立てて遷移（ページは1に戻す） */
  function applySearch(next: SearchFormState) {
    const params = new URLSearchParams();
    if (next.keyword.trim()) params.set("keyword", next.keyword.trim());
    if (next.categoryId) params.set("categoryId", next.categoryId);
    if (next.prefecture) params.set("prefecture", next.prefecture);
    if (next.city) params.set("city", next.city);
    if (next.targetAge) params.set("targetAge", next.targetAge);
    if (next.skillLevel) params.set("skillLevel", next.skillLevel);
    if (next.gender) params.set("gender", next.gender);
    if (next.ageRange) params.set("ageRange", next.ageRange);
    if (next.teachingYearsMin)
      params.set("teachingYearsMin", next.teachingYearsMin);
    if (next.teachingMethod)
      params.set("teachingMethod", next.teachingMethod);
    if (next.minPrice.trim()) params.set("minPrice", next.minPrice.trim());
    if (next.maxPrice.trim()) params.set("maxPrice", next.maxPrice.trim());
    // 指導方法未指定時のみ旧 online フラグを送る
    if (!next.teachingMethod && next.online) params.set("online", "1");
    if (next.accepting) params.set("accepting", "1");
    if (next.verified) params.set("verified", "1");

    const qs = params.toString();
    router.push(qs ? `/teachers?${qs}` : "/teachers");
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    applySearch(state);
  }

  /** 個別フィールドの更新ヘルパー */
  function update<K extends keyof SearchFormState>(
    key: K,
    value: SearchFormState[K],
  ) {
    setState((prev) => {
      const next = { ...prev, [key]: value };
      // 都道府県変更時は市町村をリセット
      if (key === "prefecture") {
        next.city = "";
      }
      return next;
    });
  }

  const cities = state.prefecture
    ? getCitiesByPrefecture(state.prefecture)
    : [];

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* キーワード */}
        <div>
          <Label htmlFor="keyword">キーワード</Label>
          <Input
            id="keyword"
            type="search"
            placeholder="名前・レッスン内容など"
            value={state.keyword}
            onChange={(e) => update("keyword", e.target.value)}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* カテゴリー */}
          <div>
            <Label htmlFor="categoryId">カテゴリー</Label>
            <Select
              id="categoryId"
              value={state.categoryId}
              onChange={(e) => update("categoryId", e.target.value)}
            >
              <option value="">すべて</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>

          {/* 都道府県 */}
          <div>
            <Label htmlFor="prefecture">都道府県</Label>
            <Select
              id="prefecture"
              value={state.prefecture}
              onChange={(e) => update("prefecture", e.target.value)}
            >
              <option value="">すべて</option>
              {PREFECTURES.map((pref) => (
                <option key={pref} value={pref}>
                  {pref}
                </option>
              ))}
            </Select>
          </div>

          {/* 市町村 */}
          <div>
            <Label htmlFor="city">市町村</Label>
            <Select
              id="city"
              value={state.city}
              disabled={!state.prefecture}
              onChange={(e) => update("city", e.target.value)}
            >
              <option value="">すべて</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </Select>
          </div>

          {/* 指導対象 */}
          <div>
            <Label htmlFor="targetAge">指導対象</Label>
            <Select
              id="targetAge"
              value={state.targetAge}
              onChange={(e) => update("targetAge", e.target.value)}
            >
              <option value="">すべて</option>
              {TARGET_AGE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </div>

          {/* 指導方法 */}
          <div>
            <Label htmlFor="teachingMethod">指導方法</Label>
            <Select
              id="teachingMethod"
              value={state.teachingMethod}
              onChange={(e) => update("teachingMethod", e.target.value)}
            >
              <option value="">すべて</option>
              {TEACHING_METHOD_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </div>

          {/* 性別 */}
          <div>
            <Label htmlFor="gender">性別</Label>
            <Select
              id="gender"
              value={state.gender}
              onChange={(e) => update("gender", e.target.value)}
            >
              <option value="">すべて</option>
              {GENDER_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </div>

          {/* 年代 */}
          <div>
            <Label htmlFor="ageRange">年代</Label>
            <Select
              id="ageRange"
              value={state.ageRange}
              onChange={(e) => update("ageRange", e.target.value)}
            >
              <option value="">すべて</option>
              {AGE_RANGE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </div>

          {/* 講師歴 */}
          <div>
            <Label htmlFor="teachingYearsMin">講師歴</Label>
            <Select
              id="teachingYearsMin"
              value={state.teachingYearsMin}
              onChange={(e) => update("teachingYearsMin", e.target.value)}
            >
              <option value="">すべて</option>
              {TEACHING_YEARS_FILTER_OPTIONS.map((o) => (
                <option key={o.value} value={String(o.value)}>
                  {o.label}
                </option>
              ))}
            </Select>
          </div>

          {/* 対応レベル */}
          <div>
            <Label htmlFor="skillLevel">対応レベル</Label>
            <Select
              id="skillLevel"
              value={state.skillLevel}
              onChange={(e) => update("skillLevel", e.target.value)}
            >
              <option value="">すべて</option>
              {SKILL_LEVEL_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </div>

          {/* 参考価格（下限） */}
          <div>
            <Label htmlFor="minPrice">参考価格（下限・円）</Label>
            <Input
              id="minPrice"
              type="text"
              inputMode="numeric"
              placeholder="例: 1000"
              value={state.minPrice}
              onChange={(e) => update("minPrice", e.target.value)}
            />
          </div>

          {/* 参考価格（上限） */}
          <div>
            <Label htmlFor="maxPrice">参考価格（上限・円）</Label>
            <Input
              id="maxPrice"
              type="text"
              inputMode="numeric"
              placeholder="例: 5000"
              value={state.maxPrice}
              onChange={(e) => update("maxPrice", e.target.value)}
            />
          </div>
        </div>

        {/* 絞り込みトグル */}
        <div className="flex flex-wrap gap-2">
          {!state.teachingMethod && (
            <Checkbox
              label="オンライン対応"
              checked={state.online}
              onChange={(e) => update("online", e.target.checked)}
            />
          )}
          <Checkbox
            label="新規受付中"
            checked={state.accepting}
            onChange={(e) => update("accepting", e.target.checked)}
          />
          <Checkbox
            label="本人確認済み"
            checked={state.verified}
            onChange={(e) => update("verified", e.target.checked)}
          />
        </div>

        <Button type="submit" fullWidth>
          この条件で検索
        </Button>
      </form>
    </Card>
  );
}
