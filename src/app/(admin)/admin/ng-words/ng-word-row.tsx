"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { NgWord, NgWordCategory } from "@prisma/client";
import {
  deleteNgWordAction,
  updateNgWordAction,
} from "@/app/(admin)/admin/actions";
import { NG_WORD_CATEGORY_LABELS } from "@/constants/consultation";

const CATEGORIES = Object.keys(
  NG_WORD_CATEGORY_LABELS,
) as NgWordCategory[];

export function NgWordRow({ word }: { word: NgWord }) {
  const router = useRouter();
  const [value, setValue] = useState(word.word);
  const [category, setCategory] = useState(word.category);
  const [isActive, setIsActive] = useState(word.isActive);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <tr className="align-middle">
      <td className="px-4 py-3">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm"
          disabled={isPending}
        />
      </td>
      <td className="px-4 py-3">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as NgWordCategory)}
          className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm"
          disabled={isPending}
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {NG_WORD_CATEGORY_LABELS[c]}
            </option>
          ))}
        </select>
      </td>
      <td className="px-4 py-3">
        <label className="flex items-center gap-2 text-xs text-gray-600">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            disabled={isPending}
          />
          有効
        </label>
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={isPending}
            onClick={() => {
              setError(null);
              startTransition(async () => {
                const result = await updateNgWordAction({
                  id: word.id,
                  word: value,
                  category,
                  isActive,
                });
                if (result.success) router.refresh();
                else setError(result.error ?? "更新失敗");
              });
            }}
            className="rounded-lg border border-primary px-2.5 py-1 text-xs font-medium text-primary"
          >
            保存
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => {
              if (!window.confirm(`「${word.word}」を削除しますか？`)) return;
              setError(null);
              startTransition(async () => {
                const result = await deleteNgWordAction(word.id);
                if (result.success) router.refresh();
                else setError(result.error ?? "削除失敗");
              });
            }}
            className="rounded-lg border border-accent px-2.5 py-1 text-xs font-medium text-accent"
          >
            削除
          </button>
        </div>
        {error && <p className="mt-1 text-xs text-accent">{error}</p>}
      </td>
    </tr>
  );
}
