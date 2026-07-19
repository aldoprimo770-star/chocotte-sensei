"use client";

import { useState, useTransition } from "react";
import {
  deleteAnnouncementAction,
  setAnnouncementPublishedAction,
  updateAnnouncementAction,
} from "@/app/(admin)/admin/actions";
import { StatusBadge } from "@/components/admin/status-badge";
import { formatDate } from "@/lib/date";
import type { AdminAnnouncementRow } from "@/lib/admin/queries";

/** お知らせ1行分の編集・公開切替・削除 */
export function AnnouncementRow({
  announcement,
}: {
  announcement: AdminAnnouncementRow;
}) {
  const [title, setTitle] = useState(announcement.title);
  const [content, setContent] = useState(announcement.content);
  const [displayOrder, setDisplayOrder] = useState(
    String(announcement.displayOrder),
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const dirty =
    title.trim() !== announcement.title ||
    content.trim() !== announcement.content ||
    Number(displayOrder) !== announcement.displayOrder;

  function save() {
    setError(null);
    startTransition(async () => {
      const result = await updateAnnouncementAction({
        id: announcement.id,
        title,
        content,
        displayOrder,
      });
      if (!result.success) {
        setError(
          result.fieldErrors?.title ??
            result.fieldErrors?.content ??
            result.fieldErrors?.displayOrder ??
            result.error ??
            "更新に失敗しました。",
        );
      }
    });
  }

  function togglePublished() {
    setError(null);
    startTransition(async () => {
      const result = await setAnnouncementPublishedAction(
        announcement.id,
        !announcement.published,
      );
      if (!result.success) {
        setError(result.error ?? "更新に失敗しました。");
      }
    });
  }

  function hardDelete() {
    if (
      !window.confirm(
        `「${announcement.title}」を削除しますか？この操作は取り消せません。`,
      )
    ) {
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await deleteAnnouncementAction(announcement.id);
      if (!result.success) {
        setError(result.error ?? "削除に失敗しました。");
      }
    });
  }

  return (
    <article className="space-y-3 rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge
          label={announcement.published ? "公開中" : "非公開"}
          className={
            announcement.published
              ? "bg-primary-light text-primary"
              : "bg-gray-100 text-gray-500"
          }
        />
        <span className="text-xs text-gray-500">
          投稿日 {formatDate(announcement.createdAt)}
        </span>
      </div>

      {error && (
        <p role="alert" className="text-xs text-accent">
          {error}
        </p>
      )}

      <label className="block text-sm">
        <span className="mb-1 block font-medium text-gray-600">タイトル</span>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
          disabled={isPending}
          className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
        />
      </label>

      <label className="block text-sm">
        <span className="mb-1 block font-medium text-gray-600">本文</span>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          disabled={isPending}
          className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
        />
      </label>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="w-full text-sm sm:w-36">
          <span className="mb-1 block font-medium text-gray-600">表示順</span>
          <input
            type="text"
            inputMode="numeric"
            value={displayOrder}
            onChange={(e) => setDisplayOrder(e.target.value)}
            disabled={isPending}
            className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={isPending || !dirty || !title.trim() || !content.trim()}
            onClick={save}
            className="rounded-lg border border-primary bg-primary px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-40"
          >
            保存
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={togglePublished}
            className="rounded-lg border border-gray-300 px-2.5 py-1 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {announcement.published ? "非公開にする" : "公開する"}
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={hardDelete}
            className="rounded-lg border border-accent/40 px-2.5 py-1 text-xs font-medium text-accent transition-colors hover:bg-accent-light disabled:cursor-not-allowed disabled:opacity-40"
          >
            削除
          </button>
        </div>
      </div>
    </article>
  );
}
