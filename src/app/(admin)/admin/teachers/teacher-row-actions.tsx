"use client";

import { useTransition } from "react";
import type { ProfileStatus } from "@prisma/client";
import {
  approveTeacherAction,
  rejectTeacherAction,
  setTeacherVisibilityAction,
} from "@/app/(admin)/admin/actions";
import { cn } from "@/lib/utils";

/** 管理者向けの先生操作ボタン群（公開切替・承認・却下） */
export function TeacherRowActions({
  teacherId,
  isPublic,
  status,
}: {
  teacherId: string;
  isPublic: boolean;
  status: ProfileStatus;
}) {
  const [isPending, startTransition] = useTransition();

  function run(action: () => Promise<unknown>) {
    startTransition(() => {
      void action();
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      {/* 公開 / 非公開 切替 */}
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

      {/* 承認 */}
      <button
        type="button"
        disabled={isPending || status === "APPROVED"}
        onClick={() => run(() => approveTeacherAction(teacherId))}
        className="rounded-lg border border-primary bg-primary px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-40"
      >
        承認
      </button>

      {/* 却下 */}
      <button
        type="button"
        disabled={isPending || status === "REJECTED"}
        onClick={() => run(() => rejectTeacherAction(teacherId))}
        className="rounded-lg border border-accent px-2.5 py-1 text-xs font-medium text-accent transition-colors hover:bg-accent-light disabled:cursor-not-allowed disabled:opacity-40"
      >
        却下
      </button>
    </div>
  );
}
