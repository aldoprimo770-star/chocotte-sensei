"use client";

import { useState, useTransition } from "react";
import type { ReportStatus } from "@prisma/client";
import { updateReportStatusAction } from "@/app/(admin)/admin/actions";
import { REPORT_STATUS_LABELS } from "@/constants/consultation";

const STATUSES = Object.keys(REPORT_STATUS_LABELS) as ReportStatus[];

export function ReportRowActions({
  reportId,
  status,
  adminNote: initialNote,
}: {
  reportId: string;
  status: ReportStatus;
  adminNote: string;
}) {
  const [nextStatus, setNextStatus] = useState(status);
  const [note, setNote] = useState(initialNote);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="min-w-[180px] space-y-2">
      <select
        value={nextStatus}
        onChange={(e) => setNextStatus(e.target.value as ReportStatus)}
        disabled={isPending}
        className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-xs"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {REPORT_STATUS_LABELS[s].label}
          </option>
        ))}
      </select>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={2}
        placeholder="管理者メモ（任意）"
        disabled={isPending}
        className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-xs"
      />
      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          setError(null);
          setMessage(null);
          startTransition(async () => {
            const result = await updateReportStatusAction({
              reportId,
              status: nextStatus,
              adminNote: note,
            });
            if (result.success) setMessage("更新しました");
            else setError(result.error ?? "失敗しました");
          });
        }}
        className="rounded-lg bg-primary px-2.5 py-1 text-xs font-medium text-white disabled:opacity-40"
      >
        保存
      </button>
      {error && <p className="text-xs text-accent">{error}</p>}
      {message && <p className="text-xs text-primary">{message}</p>}
    </div>
  );
}
