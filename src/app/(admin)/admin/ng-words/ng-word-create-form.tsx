"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createNgWordAction } from "@/app/(admin)/admin/actions";
import { NG_WORD_CATEGORY_LABELS } from "@/constants/consultation";
import type { NgWordCategory } from "@prisma/client";

const CATEGORIES = Object.keys(
  NG_WORD_CATEGORY_LABELS,
) as NgWordCategory[];

export function NgWordCreateForm() {
  const router = useRouter();
  const [word, setWord] = useState("");
  const [category, setCategory] =
    useState<NgWordCategory>("CUSTOM");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="flex flex-wrap items-end gap-3 rounded-2xl border border-gray-200 bg-white p-4"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        startTransition(async () => {
          const result = await createNgWordAction({ word, category });
          if (result.success) {
            setWord("");
            router.refresh();
          } else {
            setError(result.error ?? "追加に失敗しました。");
          }
        });
      }}
    >
      <label className="text-sm">
        <span className="mb-1 block text-xs text-gray-500">ワード</span>
        <input
          value={word}
          onChange={(e) => setWord(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          placeholder="例: Telegram"
          disabled={isPending}
        />
      </label>
      <label className="text-sm">
        <span className="mb-1 block text-xs text-gray-500">カテゴリ</span>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as NgWordCategory)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          disabled={isPending}
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {NG_WORD_CATEGORY_LABELS[c]}
            </option>
          ))}
        </select>
      </label>
      <button
        type="submit"
        disabled={isPending || !word.trim()}
        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
      >
        追加
      </button>
      {error && <p className="w-full text-sm text-accent">{error}</p>}
    </form>
  );
}
