"use client";

import { useState, useTransition } from "react";
import type { IdentityVerificationStatus } from "@prisma/client";
import { setTeacherIdentityVerificationStatusAction } from "@/app/(admin)/admin/actions";
import { IDENTITY_VERIFICATION_STATUS_OPTIONS } from "@/constants/verification";

/**
 * 先生管理：本人確認ステータス切替（PENDING / VERIFIED / REJECTED）
 * VERIFIED への変更時は確認ダイアログを表示する。
 */
export function IdentityStatusActions({
  teacherId,
  currentStatus,
  hasDocument,
}: {
  teacherId: string;
  currentStatus: IdentityVerificationStatus | null;
  /** 提出画像があるとき true（サムネイル表示用に親で利用） */
  hasDocument: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<IdentityVerificationStatus | "">(
    currentStatus ?? "",
  );
  const [rejectReason, setRejectReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  function apply() {
    setError(null);
    setMessage(null);

    if (!status) {
      setError("ステータスを選択してください。");
      return;
    }

    if (status === "VERIFIED") {
      const ok = window.confirm(
        "この先生を「本人確認済み（VERIFIED）」にしますか？\n公開プロフィールと一覧に ✅ 本人確認済み バッジが表示されます。",
      );
      if (!ok) return;
    }

    if (status === "REJECTED" && !rejectReason.trim()) {
      setError("差し戻しの場合は管理者コメントを入力してください。");
      return;
    }

    startTransition(async () => {
      const result = await setTeacherIdentityVerificationStatusAction(
        teacherId,
        status,
        rejectReason,
      );
      if (result.success) {
        setMessage("更新しました。");
        if (status !== "REJECTED") setRejectReason("");
      } else {
        setError(result.error ?? "更新に失敗しました。");
      }
    });
  }

  return (
    <div className="min-w-[200px] space-y-2">
      <select
        value={status}
        disabled={isPending}
        onChange={(e) =>
          setStatus(e.target.value as IdentityVerificationStatus | "")
        }
        className="w-full rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
      >
        <option value="">未申請 / 未設定</option>
        {IDENTITY_VERIFICATION_STATUS_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      {status === "REJECTED" && (
        <textarea
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          rows={2}
          placeholder="差し戻しコメント（先生に表示）"
          disabled={isPending}
          className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
        />
      )}

      <button
        type="button"
        disabled={
          isPending ||
          !status ||
          (status === currentStatus && status !== "REJECTED")
        }
        onClick={apply}
        className="rounded-lg border border-primary bg-primary px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-40"
      >
        {isPending ? "更新中..." : "ステータスを更新"}
      </button>

      {!hasDocument && (
        <p className="text-[10px] text-gray-400">提出画像なし</p>
      )}
      {error && <p className="text-xs text-accent">{error}</p>}
      {message && <p className="text-xs text-primary">{message}</p>}
    </div>
  );
}
