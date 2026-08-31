"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LegalConsentCheckbox } from "@/components/auth/legal-consent-checkbox";
import { Button } from "@/components/ui/button";
import { acceptCurrentLegalConsentAction } from "./actions";

/** 再同意フォーム */
export function ConsentForm() {
  const router = useRouter();
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!agreed) {
      setError("利用規約とプライバシーポリシーへの同意が必要です");
      return;
    }
    setSubmitting(true);
    const result = await acceptCurrentLegalConsentAction();
    setSubmitting(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    router.refresh();
    router.push(result.redirectTo ?? "/");
  }

  return (
    <form method="post" onSubmit={onSubmit} className="space-y-5">
      {error ? (
        <p
          role="alert"
          className="rounded-xl bg-accent-light px-4 py-3 text-sm text-accent"
        >
          {error}
        </p>
      ) : null}

      <LegalConsentCheckbox
        checked={agreed}
        onChange={setAgreed}
        error={undefined}
      />

      <Button type="submit" fullWidth disabled={submitting || !agreed}>
        {submitting ? "保存中..." : "同意して続ける"}
      </Button>
    </form>
  );
}
