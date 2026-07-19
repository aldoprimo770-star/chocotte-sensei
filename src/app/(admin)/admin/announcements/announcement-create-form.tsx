"use client";

import { useState, useTransition } from "react";
import { createAnnouncementAction } from "@/app/(admin)/admin/actions";

/** お知らせ新規作成フォーム */
export function AnnouncementCreateForm() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [displayOrder, setDisplayOrder] = useState("");
  const [published, setPublished] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await createAnnouncementAction({
        title,
        content,
        published,
        displayOrder,
      });
      if (result.success) {
        setTitle("");
        setContent("");
        setDisplayOrder("");
        setPublished(true);
        return;
      }
      setError(
        result.fieldErrors?.title ??
          result.fieldErrors?.content ??
          result.fieldErrors?.displayOrder ??
          result.error ??
          "作成に失敗しました。",
      );
    });
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-3 rounded-2xl border border-gray-200 bg-white p-4 sm:p-5"
    >
      <h2 className="text-sm font-bold text-gray-800">新規お知らせ追加</h2>
      {error && (
        <p
          role="alert"
          className="rounded-xl bg-accent-light px-3 py-2 text-sm text-accent"
        >
          {error}
        </p>
      )}
      <label className="block text-sm">
        <span className="mb-1 block font-medium text-gray-600">
          タイトル <span className="text-accent">*</span>
        </span>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
          required
          disabled={isPending}
          placeholder="例: サービス開始のお知らせ"
          className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
        />
      </label>
      <label className="block text-sm">
        <span className="mb-1 block font-medium text-gray-600">
          本文 <span className="text-accent">*</span>
        </span>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          required
          disabled={isPending}
          placeholder="お知らせの内容を入力してください"
          className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
        />
      </label>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="w-full text-sm sm:w-36">
          <span className="mb-1 block font-medium text-gray-600">
            表示順（任意）
          </span>
          <input
            type="text"
            inputMode="numeric"
            value={displayOrder}
            onChange={(e) => setDisplayOrder(e.target.value)}
            placeholder="0"
            disabled={isPending}
            className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
          />
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
            disabled={isPending}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          すぐに公開する
        </label>
        <button
          type="submit"
          disabled={isPending || !title.trim() || !content.trim()}
          className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-40 sm:ml-auto"
        >
          {isPending ? "追加中..." : "追加する"}
        </button>
      </div>
    </form>
  );
}
