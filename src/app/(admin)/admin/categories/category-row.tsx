"use client";

import { useState, useTransition } from "react";
import {
  deleteCategoryAction,
  setCategoryActiveAction,
  updateCategoryAction,
} from "@/app/(admin)/admin/actions";
import { StatusBadge } from "@/components/admin/status-badge";
import type { AdminCategoryRow } from "@/lib/admin/queries";

/** カテゴリー1行分の編集・表示切替・削除 */
export function CategoryRow({ category }: { category: AdminCategoryRow }) {
  const [name, setName] = useState(category.name);
  const [sortOrder, setSortOrder] = useState(String(category.sortOrder));
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const linkedCount = category._count.teachers + category._count.students;
  const canHardDelete = linkedCount === 0;
  const dirty =
    name.trim() !== category.name ||
    Number(sortOrder) !== category.sortOrder;

  function save() {
    setError(null);
    startTransition(async () => {
      const result = await updateCategoryAction({
        id: category.id,
        name,
        sortOrder,
      });
      if (!result.success) {
        setError(
          result.fieldErrors?.name ??
            result.fieldErrors?.sortOrder ??
            result.error ??
            "更新に失敗しました。",
        );
      }
    });
  }

  function toggleActive() {
    setError(null);
    startTransition(async () => {
      const result = await setCategoryActiveAction(
        category.id,
        !category.isActive,
      );
      if (!result.success) {
        setError(result.error ?? "更新に失敗しました。");
      }
    });
  }

  function hardDelete() {
    if (!canHardDelete) {
      return;
    }
    if (
      !window.confirm(
        `「${category.name}」を完全に削除しますか？この操作は取り消せません。`,
      )
    ) {
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await deleteCategoryAction(category.id);
      if (!result.success) {
        setError(result.error ?? "削除に失敗しました。");
      }
    });
  }

  return (
    <tr className="align-top">
      <td className="px-4 py-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={50}
          disabled={isPending}
          className="w-full min-w-[8rem] rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm text-gray-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
        />
        <p className="mt-1 text-xs text-gray-400">slug: {category.slug}</p>
        {error && (
          <p role="alert" className="mt-1 text-xs text-accent">
            {error}
          </p>
        )}
      </td>
      <td className="px-4 py-3">
        <input
          type="text"
          inputMode="numeric"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          disabled={isPending}
          className="w-20 rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm text-gray-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
        />
      </td>
      <td className="px-4 py-3">
        <StatusBadge
          label={category.isActive ? "表示中" : "非表示"}
          className={
            category.isActive
              ? "bg-primary-light text-primary"
              : "bg-gray-100 text-gray-500"
          }
        />
      </td>
      <td className="px-4 py-3 text-gray-600">
        先生 {category._count.teachers} / 生徒 {category._count.students}
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={isPending || !dirty || !name.trim()}
            onClick={save}
            className="rounded-lg border border-primary bg-primary px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-40"
          >
            保存
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={toggleActive}
            className="rounded-lg border border-gray-300 px-2.5 py-1 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {category.isActive ? "非表示にする" : "表示する"}
          </button>
          <button
            type="button"
            disabled={isPending || !canHardDelete}
            onClick={hardDelete}
            title={
              canHardDelete
                ? "完全に削除する"
                : "紐づきがあるため削除できません（非表示を利用してください）"
            }
            className="rounded-lg border border-accent/40 px-2.5 py-1 text-xs font-medium text-accent transition-colors hover:bg-accent-light disabled:cursor-not-allowed disabled:opacity-40"
          >
            削除
          </button>
        </div>
      </td>
    </tr>
  );
}
