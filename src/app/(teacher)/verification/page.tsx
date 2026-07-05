import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/session";
import { getTeacherProfileByUserId } from "@/lib/teacher/profile";
import { getVerificationByTeacherId } from "@/lib/verification/verification";
import {
  getDocumentTypeLabel,
  VERIFICATION_STATUS_LABELS,
} from "@/constants/verification";
import { formatDate } from "@/lib/date";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/admin/status-badge";
import { VerifiedBadge } from "@/components/teacher/verified-badge";
import { VerificationForm } from "./verification-form";

export const metadata: Metadata = { title: "本人確認" };

/** 先生の本人確認ページ（申請・状況確認・再申請） */
export default async function VerificationPage() {
  const session = await requireRole("TEACHER");
  const profile = await getTeacherProfileByUserId(session.user.id);
  if (!profile) {
    notFound();
  }

  const verification = await getVerificationByTeacherId(profile.id);
  const status = verification?.status;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">本人確認</h1>
        <p className="mt-1 text-sm text-muted">
          本人確認を行うと、プロフィールに「本人確認済み」バッジが表示され、
          生徒に安心してもらえます。
        </p>
      </div>

      {/* 現在の状況 */}
      {verification && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>申請状況</CardTitle>
              <StatusBadge
                label={VERIFICATION_STATUS_LABELS[verification.status].label}
                className={VERIFICATION_STATUS_LABELS[verification.status].className}
              />
            </div>
          </CardHeader>

          <dl className="space-y-3 text-sm">
            <Row label="書類の種類">
              {getDocumentTypeLabel(verification.documentType)}
            </Row>
            <Row label="提出日">{formatDate(verification.createdAt)}</Row>
            {verification.note && <Row label="備考">{verification.note}</Row>}
          </dl>

          {/* 却下理由 */}
          {status === "REJECTED" && verification.rejectReason && (
            <div className="mt-4 rounded-xl bg-accent-light px-4 py-3 text-sm text-accent">
              <p className="font-medium">却下理由</p>
              <p className="mt-1 whitespace-pre-wrap">
                {verification.rejectReason}
              </p>
            </div>
          )}
        </Card>
      )}

      {/* 状態別の本文 */}
      {status === "APPROVED" ? (
        <Card>
          <div className="flex items-center gap-3">
            <VerifiedBadge />
            <p className="text-sm text-foreground">
              本人確認が完了しています。
            </p>
          </div>
        </Card>
      ) : status === "PENDING" ? (
        <Card>
          <p className="text-sm text-muted">
            現在審査中です。承認までしばらくお待ちください。
          </p>
        </Card>
      ) : (
        // 未申請 or 却下 → （再）申請フォーム
        <Card>
          <CardHeader>
            <CardTitle>
              {status === "REJECTED" ? "再申請" : "本人確認を申請する"}
            </CardTitle>
          </CardHeader>
          <VerificationForm
            submitLabel={status === "REJECTED" ? "再申請する" : "申請する"}
            defaultValues={
              verification
                ? {
                    documentType: verification.documentType,
                    documentUrl: verification.documentUrl,
                    note: verification.note ?? "",
                  }
                : undefined
            }
          />
        </Card>
      )}
    </div>
  );
}

/** 情報行 */
function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-4">
      <dt className="w-24 shrink-0 font-medium text-muted">{label}</dt>
      <dd className="flex-1 text-foreground">{children}</dd>
    </div>
  );
}
