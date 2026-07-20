import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/session";
import { getTeacherProfileByUserId } from "@/lib/teacher/profile";
import {
  getConsultationForTeacher,
  hasCompletedContactPurchase,
} from "@/lib/consultation/consultation";
import {
  canSendFreeMessage,
  getRemainingFreeSends,
} from "@/lib/consultation/limits";
import { ConsultationThread } from "@/components/consultation/consultation-thread";
import {
  reportConsultationAsTeacherAction,
  sendTeacherConsultationMessageAction,
} from "../actions";

export const metadata: Metadata = { title: "事前相談" };

export default async function TeacherConsultationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRole("TEACHER");
  const profile = await getTeacherProfileByUserId(session.user.id);
  if (!profile) notFound();

  const { id } = await params;
  const conversation = await getConsultationForTeacher(id, profile.id);
  if (!conversation) notFound();

  const purchased = await hasCompletedContactPurchase(
    conversation.studentId,
    conversation.teacherId,
  );
  const limit = canSendFreeMessage(
    conversation.messages,
    "TEACHER",
    purchased,
  );
  const remaining = getRemainingFreeSends(
    conversation.messages,
    "TEACHER",
    purchased,
  );

  const studentName =
    conversation.student.studentProfile?.displayName ??
    conversation.student.email;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <nav className="mb-4 text-sm text-muted">
        <Link href="/consultations" className="hover:text-primary">
          ← 事前相談一覧
        </Link>
      </nav>

      <h1 className="mb-1 text-2xl font-bold text-foreground">
        {studentName} さんからの相談
      </h1>
      <p className="mb-6 text-sm text-muted">
        連絡先の交換は禁止されています。レッスン内容などについて返信してください。
      </p>

      <ConsultationThread
        conversationId={conversation.id}
        messages={conversation.messages}
        viewerRole="TEACHER"
        canSend={limit.ok}
        remainingSends={remaining}
        counterpartName={studentName}
        sendAction={sendTeacherConsultationMessageAction}
        reportAction={reportConsultationAsTeacherAction}
      />
    </div>
  );
}
