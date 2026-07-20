"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  CONSULTATION_LIMIT_MESSAGE,
  PRE_CONSULTATION_MAX_ROUND_TRIPS,
} from "@/constants/consultation";
import { formatDate } from "@/lib/date";

export type ThreadMessage = {
  id: string;
  body: string;
  senderRole: "STUDENT" | "TEACHER" | "SYSTEM";
  createdAt: Date | string;
};

type SendAction = (
  conversationId: string,
  body: string,
) => Promise<{ success: true } | { success: false; error?: string }>;

type ReportAction = (
  conversationId: string,
  reason: string,
  messageId?: string,
) => Promise<{ success: true } | { success: false; error?: string }>;

/**
 * 事前相談スレッド UI（生徒・先生で共用）
 */
export function ConsultationThread({
  conversationId,
  messages,
  viewerRole,
  canSend,
  remainingSends,
  purchaseUrl,
  counterpartName,
  sendAction,
  reportAction,
}: {
  conversationId: string;
  messages: ThreadMessage[];
  viewerRole: "STUDENT" | "TEACHER";
  canSend: boolean;
  remainingSends: number | null;
  purchaseUrl?: string;
  counterpartName: string;
  sendAction: SendAction;
  reportAction?: ReportAction;
}) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [reportError, setReportError] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState("");
  const [showReport, setShowReport] = useState(false);
  const [isPending, startTransition] = useTransition();

  function submit() {
    setError(null);
    startTransition(async () => {
      const result = await sendAction(conversationId, body);
      if (result.success) {
        setBody("");
        router.refresh();
      } else {
        setError(result.error ?? "送信に失敗しました。");
      }
    });
  }

  function submitReport() {
    if (!reportAction) return;
    setReportError(null);
    startTransition(async () => {
      const result = await reportAction(conversationId, reportReason);
      if (result.success) {
        setShowReport(false);
        setReportReason("");
        setReportError(null);
      } else {
        setReportError(result.error ?? "通報に失敗しました。");
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3 rounded-2xl border border-border bg-surface/40 p-4">
        {messages.length === 0 ? (
          <p className="text-sm text-muted">
            まだメッセージはありません。{counterpartName}
            へ相談内容を送ってみましょう。
          </p>
        ) : (
          messages.map((m) => {
            const mine =
              (viewerRole === "STUDENT" && m.senderRole === "STUDENT") ||
              (viewerRole === "TEACHER" && m.senderRole === "TEACHER");
            return (
              <div
                key={m.id}
                className={`flex ${mine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                    mine
                      ? "bg-primary text-white"
                      : "border border-border bg-background text-foreground"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.body}</p>
                  <p
                    className={`mt-1 text-[10px] ${mine ? "text-white/70" : "text-muted"}`}
                  >
                    {formatDate(new Date(m.createdAt))}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {remainingSends !== null && (
        <p className="text-xs text-muted">
          無料相談の残り送信回数: {remainingSends} /{" "}
          {PRE_CONSULTATION_MAX_ROUND_TRIPS} 往復
        </p>
      )}

      {!canSend ? (
        <div className="rounded-xl bg-secondary-light px-4 py-3 text-sm text-foreground">
          <p>{CONSULTATION_LIMIT_MESSAGE}</p>
          {purchaseUrl && (
            <p className="mt-2">
              <a
                href={purchaseUrl}
                className="font-medium text-primary hover:underline"
              >
                連絡先を購入する →
              </a>
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <Textarea
            rows={4}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="メッセージを入力（連絡先の交換は禁止されています）"
            disabled={isPending}
          />
          {error && (
            <p role="alert" className="text-sm text-accent">
              {error}
            </p>
          )}
          <Button
            type="button"
            disabled={isPending || !body.trim()}
            onClick={submit}
          >
            {isPending ? "送信中..." : "送信する"}
          </Button>
        </div>
      )}

      {reportAction && (
        <div className="border-t border-border pt-4">
          <button
            type="button"
            className="text-xs text-muted underline hover:text-accent"
            onClick={() => setShowReport((v) => !v)}
          >
            この相談を通報する
          </button>
          {showReport && (
            <div className="mt-2 space-y-2">
              <Textarea
                rows={3}
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                placeholder="通報理由を入力してください"
                disabled={isPending}
              />
              {reportError && (
                <p className="text-sm text-accent">{reportError}</p>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isPending || !reportReason.trim()}
                onClick={submitReport}
              >
                通報を送信
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
