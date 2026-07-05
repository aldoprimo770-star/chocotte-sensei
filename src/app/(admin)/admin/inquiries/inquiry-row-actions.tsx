"use client";

import { useTransition } from "react";
import type { InquiryStatus } from "@prisma/client";
import { updateInquiryStatusAction } from "@/app/(admin)/admin/actions";

/** お問い合わせのステータス変更ボタン（返信済み / 対応完了） */
export function InquiryRowActions({
  inquiryId,
  status,
}: {
  inquiryId: string;
  status: InquiryStatus;
}) {
  const [isPending, startTransition] = useTransition();

  function change(next: InquiryStatus) {
    startTransition(() => {
      void updateInquiryStatusAction(inquiryId, next);
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        disabled={isPending || status === "REPLIED"}
        onClick={() => change("REPLIED")}
        className="rounded-lg border border-gray-300 px-2.5 py-1 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
      >
        返信済みに変更
      </button>
      <button
        type="button"
        disabled={isPending || status === "CLOSED"}
        onClick={() => change("CLOSED")}
        className="rounded-lg border border-primary bg-primary px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-40"
      >
        対応完了に変更
      </button>
    </div>
  );
}
