"use client";

import { useState, useTransition } from "react";
import type { VerificationStatus } from "@prisma/client";
import {
  approveVerificationAction,
  rejectVerificationAction,
} from "@/app/(admin)/admin/actions";

/** 本人確認の操作（承認・却下＋却下理由入力） */
export function VerificationRowActions({
  verificationId,
  status,
}: {
  verificationId: string;
  status: VerificationStatus;
}) {
  const [isPending, startTransition] = useTransition();
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  function approve() {
    setError(null);
    startTransition(async () => {
      const result = await approveVerificationAction(verificationId);
      if (!result.success) setError(result.error ?? "失敗しました。");
    });
  }

  function reject() {
    setError(null);
    startTransition(async () => {
      const result = await rejectVerificationAction(verificationId, reason);
      if (result.success) {
        setShowReject(false);
        setReason("");
      } else {
        setError(result.error ?? "失敗しました。");
      }
    });
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={isPending || status === "APPROVED"}
          onClick={approve}
          className="rounded-lg border border-primary bg-primary px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-40"
        >
          承認
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => setShowReject((v) => !v)}
          className="rounded-lg border border-accent px-2.5 py-1 text-xs font-medium text-accent transition-colors hover:bg-accent-light disabled:opacity-40"
        >
          却下
        </button>
      </div>

      {showReject && (
        <div className="space-y-2">
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            placeholder="却下理由を入力（先生に表示されます）"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="button"
            disabled={isPending}
            onClick={reject}
            className="rounded-lg border border-accent bg-accent px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-40"
          >
            却下を確定
          </button>
        </div>
      )}

      {error && <p className="text-xs text-accent">{error}</p>}
    </div>
  );
}
