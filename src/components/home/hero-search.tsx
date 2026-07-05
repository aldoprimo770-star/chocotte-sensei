"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { PREFECTURES } from "@/constants/prefectures";

/**
 * ヒーローエリアの検索フォーム（キーワード・カテゴリー・都道府県）
 * 検索ボタンで /teachers へクエリ付きで遷移します。
 */
export function HeroSearch({
  categories,
}: {
  categories: ReadonlyArray<{ id: string; name: string }>;
}) {
  const router = useRouter();
  const [keyword, setKeyword] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [prefecture, setPrefecture] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword.trim()) params.set("keyword", keyword.trim());
    if (categoryId) params.set("categoryId", categoryId);
    if (prefecture) params.set("prefecture", prefecture);

    const qs = params.toString();
    router.push(qs ? `/teachers?${qs}` : "/teachers");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto grid max-w-3xl gap-3 rounded-2xl bg-background p-4 shadow-sm sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-center"
    >
      <Input
        type="search"
        aria-label="キーワード"
        placeholder="キーワード"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
      />
      <Select
        aria-label="カテゴリー"
        value={categoryId}
        onChange={(e) => setCategoryId(e.target.value)}
      >
        <option value="">カテゴリー</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </Select>
      <Select
        aria-label="都道府県"
        value={prefecture}
        onChange={(e) => setPrefecture(e.target.value)}
      >
        <option value="">都道府県</option>
        {PREFECTURES.map((pref) => (
          <option key={pref} value={pref}>
            {pref}
          </option>
        ))}
      </Select>
      <Button type="submit" size="md">
        検索する
      </Button>
    </form>
  );
}
