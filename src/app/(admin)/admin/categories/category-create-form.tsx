"use client";

import { useState, useTransition } from "react";
import { createCategoryAction } from "@/app/(admin)/admin/actions";

/** カテゴリー新規作成フォーム */
export function CategoryCreateForm() {
  const [name, setName] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await createCategoryAction({ name, sortOrder });
      if (result.success) {
        setName("");
        setSortOrder("");
        return;
      }
      setError(
        result.fieldErrors?.name ??
          result.fieldErrors?.sortOrder ??
          result.error ??
          "作成に失敗しました。",
      );
    });
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5"
    >
      <h2 className="mb-3 text-sm font-bold text-gray-800">新規カテゴリー追加</h2>
      {error && (
        <p
          role="alert"
          className="mb-3 rounded-xl bg-accent-light px-3 py-2 text-sm text-accent"
        >
          {error}
        </p>
      )}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="min-w-0 flex-1 text-sm">
          <span className="mb-1 block font-medium text-gray-600">
            カテゴリー名 <span className="text-accent">*</span>
          </span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={50}
            required
            placeholder="例: 料理"
            disabled={isPending}
            className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
          />
        </label>
        <label className="w-full text-sm sm:w-36">
          <span className="mb-1 block font-medium text-gray-600">
            表示順（任意）
          </span>
          <input
            type="text"
            inputMode="numeric"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            placeholder="自動"
            disabled={isPending}
            className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
          />
        </label>
        <button
          type="submit"
          disabled={isPending || !name.trim()}
          className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isPending ? "追加中..." : "追加する"}
        </button>
      </div>
    </form>
  );
}
