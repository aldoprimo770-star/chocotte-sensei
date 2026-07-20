"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { startConsultationAction } from "@/app/(student)/mypage/consultations/actions";

/**
 * 公開プロフィール用：事前相談を開始してスレッドへ遷移
 */
export function StartConsultationButton({
  teacherId,
  teacherSlug,
  mode,
}: {
  teacherId: string;
  teacherSlug?: string;
  mode: "student" | "login" | "hidden";
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (mode === "hidden") return null;

  if (mode === "login") {
    const callback = teacherSlug ? `/teachers/${teacherSlug}` : "/teachers";
    return (
      <Button
        href={`/login?callbackUrl=${encodeURIComponent(callback)}`}
        variant="outline"
        fullWidth
      >
        ログインして事前相談する
      </Button>
    );
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        fullWidth
        disabled={isPending}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            const result = await startConsultationAction(teacherId);
            if (result.success) {
              router.push(`/mypage/consultations/${result.conversationId}`);
            } else {
              setError(result.error);
            }
          });
        }}
      >
        {isPending ? "準備中..." : "事前相談する（無料・3往復まで）"}
      </Button>
      {error && <p className="text-sm text-accent">{error}</p>}
    </div>
  );
}
