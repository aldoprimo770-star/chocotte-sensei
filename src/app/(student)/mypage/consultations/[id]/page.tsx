import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/session";
import {
  getConsultationForStudent,
  hasCompletedContactPurchase,
} from "@/lib/consultation/consultation";
import { getRemainingFreeSends } from "@/lib/consultation/limits";
import { canSendFreeMessage } from "@/lib/consultation/limits";
import { ConsultationThread } from "@/components/consultation/consultation-thread";
import {
  reportConsultationAction,
  sendStudentConsultationMessageAction,
} from "../actions";
import { getActivePurchase } from "@/lib/purchase/purchase";

export const metadata: Metadata = { title: "事前相談" };

export default async function StudentConsultationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRole("STUDENT");
  const { id } = await params;
  const conversation = await getConsultationForStudent(id, session.user.id);
  if (!conversation) notFound();

  const purchased = await hasCompletedContactPurchase(
    session.user.id,
    conversation.teacherId,
  );
  const limit = canSendFreeMessage(
    conversation.messages,
    "STUDENT",
    purchased,
  );
  const remaining = getRemainingFreeSends(
    conversation.messages,
    "STUDENT",
    purchased,
  );

  const activePurchase = await getActivePurchase(
    session.user.id,
    conversation.teacherId,
  );
  const purchaseUrl =
    activePurchase?.status === "COMPLETED"
      ? `/mypage/purchases/${activePurchase.id}`
      : `/teachers/${conversation.teacher.slug}/purchase`;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <nav className="mb-4 text-sm text-muted">
        <Link href="/mypage/consultations" className="hover:text-primary">
          ← 事前相談一覧
        </Link>
      </nav>

      <h1 className="mb-1 text-2xl font-bold text-foreground">
        {conversation.teacher.displayName} 先生への相談
      </h1>
      <p className="mb-6 text-sm text-muted">
        連絡先の交換は禁止されています。レッスン内容などについて相談できます。
      </p>

      <ConsultationThread
        conversationId={conversation.id}
        messages={conversation.messages}
        viewerRole="STUDENT"
        canSend={limit.ok}
        remainingSends={remaining}
        purchaseUrl={purchaseUrl}
        counterpartName={`${conversation.teacher.displayName}先生`}
        sendAction={sendStudentConsultationMessageAction}
        reportAction={reportConsultationAction}
      />
    </div>
  );
}
