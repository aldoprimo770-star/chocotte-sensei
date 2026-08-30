"use client";

import { useState, useTransition } from "react";
import type { ProfileStatus } from "@prisma/client";
import {
  approveTeacherAction,
  deleteTeacherAccountAction,
  rejectTeacherAction,
  setTeacherVisibilityAction,
} from "@/app/(admin)/admin/actions";
import { cn } from "@/lib/utils";

/** 管理者向けの先生操作ボタン群（公開切替・承認・却下・削除） */
export function TeacherRowActions({
  teacherId,
  displayName,
  email,
  isPublic,
  status,
}: {
  teacherId: string;
  displayName: string;
  email: string;
  isPublic: boolean;
  status: ProfileStatus;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function run(action: () => Promise<{ success: boolean; error?: string }>) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.success) {
        setError(result.error ?? "操作に失敗しました。");
      }
    });
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={isPending}
          onClick={() =>
            run(() => setTeacherVisibilityAction(teacherId, !isPublic))
          }
          className={cn(
            "rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-50",
            isPublic
              ? "border-gray-300 text-gray-600 hover:bg-gray-100"
              : "border-primary text-primary hover:bg-primary-light",
          )}
        >
          {isPublic ? "非公開にする" : "公開にする"}
        </button>

        <button
          type="button"
          disabled={isPending || status === "APPROVED"}
          onClick={() => run(() => approveTeacherAction(teacherId))}
          className="rounded-lg border border-primary bg-primary px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-40"
        >
          承認
        </button>

        <button
          type="button"
          disabled={isPending || status === "REJECTED"}
          onClick={() => run(() => rejectTeacherAction(teacherId))}
          className="rounded-lg border border-accent px-2.5 py-1 text-xs font-medium text-accent transition-colors hover:bg-accent-light disabled:cursor-not-allowed disabled:opacity-40"
        >
          却下
        </button>

        <button
          type="button"
          disabled={isPending}
          onClick={() => {
            const ok = window.confirm(
              [
                `「${displayName}」（${email}）を完全に削除しますか？`,
                "",
                "アカウント・プロフィール・購入・相談・レビューなど関連データも削除されます。",
                "この操作は取り消せません。",
              ].join("\n"),
            );
            if (!ok) return;
            run(() => deleteTeacherAccountAction(teacherId));
          }}
          className="rounded-lg border border-red-300 px-2.5 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
        >
          削除
        </button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
