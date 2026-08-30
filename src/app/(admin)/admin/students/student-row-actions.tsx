"use client";

import { useState, useTransition } from "react";
import { deleteStudentAccountAction } from "@/app/(admin)/admin/actions";

/** 生徒管理の操作（削除） */
export function StudentRowActions({
  studentProfileId,
  displayName,
  email,
}: {
  studentProfileId: string;
  displayName: string;
  email: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onDelete() {
    const ok = window.confirm(
      [
        `「${displayName}」（${email}）を完全に削除しますか？`,
        "",
        "アカウント・購入・相談・レビュー・お気に入りなど関連データも削除されます。",
        "この操作は取り消せません。",
      ].join("\n"),
    );
    if (!ok) return;

    setError(null);
    startTransition(async () => {
      const result = await deleteStudentAccountAction(studentProfileId);
      if (!result.success) {
        setError(result.error ?? "削除に失敗しました。");
      }
    });
  }

  return (
    <div className="space-y-1">
      <button
        type="button"
        disabled={isPending}
        onClick={onDelete}
        className="rounded-lg border border-red-300 px-2.5 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
      >
        {isPending ? "削除中..." : "削除"}
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
