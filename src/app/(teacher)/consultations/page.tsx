import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/session";
import { getTeacherProfileByUserId } from "@/lib/teacher/profile";
import { getTeacherConsultations } from "@/lib/consultation/consultation";
import { CONVERSATION_STATUS_LABELS } from "@/constants/consultation";
import { formatDate } from "@/lib/date";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/admin/status-badge";

export const metadata: Metadata = { title: "事前相談" };

/** 先生：事前相談一覧 */
export default async function TeacherConsultationsPage() {
  const session = await requireRole("TEACHER");
  const profile = await getTeacherProfileByUserId(session.user.id);
  if (!profile) notFound();

  const items = await getTeacherConsultations(profile.id);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="mb-2 text-2xl font-bold text-foreground">事前相談</h1>
      <p className="mb-8 text-sm text-muted">
        生徒からの事前相談一覧です。無料で3往復まで返信できます。
      </p>

      {items.length === 0 ? (
        <Card>
          <p className="text-sm text-muted">まだ相談は届いていません。</p>
        </Card>
      ) : (
        <ul className="space-y-3">
          {items.map((c) => {
            const status = CONVERSATION_STATUS_LABELS[c.status];
            const name =
              c.student.studentProfile?.displayName ?? c.student.email;
            const preview = c.messages[0]?.body ?? "（メッセージなし）";
            return (
              <li key={c.id}>
                <Link
                  href={`/consultations/${c.id}`}
                  className="block rounded-2xl border border-border bg-background p-4 transition-shadow hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-foreground">{name}</p>
                      <p className="mt-0.5 line-clamp-1 text-sm text-muted">
                        {preview}
                      </p>
                    </div>
                    <StatusBadge
                      label={status.label}
                      className={status.className}
                    />
                  </div>
                  <p className="mt-2 text-xs text-muted">
                    {formatDate(c.lastMessageAt ?? c.createdAt)}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
