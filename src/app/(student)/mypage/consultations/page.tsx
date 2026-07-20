import type { Metadata } from "next";
import Link from "next/link";
import { requireRole } from "@/lib/auth/session";
import { getStudentConsultations } from "@/lib/consultation/consultation";
import { CONVERSATION_STATUS_LABELS } from "@/constants/consultation";
import { formatDate } from "@/lib/date";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/admin/status-badge";

export const metadata: Metadata = { title: "事前相談" };

/** 生徒：事前相談一覧 */
export default async function StudentConsultationsPage() {
  const session = await requireRole("STUDENT");
  const items = await getStudentConsultations(session.user.id);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="mb-2 text-2xl font-bold text-foreground">事前相談</h1>
      <p className="mb-8 text-sm text-muted">
        先生への事前相談一覧です。無料で3往復までやり取りできます。
      </p>

      {items.length === 0 ? (
        <Card>
          <p className="text-sm text-muted">
            まだ相談はありません。先生プロフィールから「事前相談する」を押してください。
          </p>
          <Link
            href="/teachers"
            className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
          >
            先生を探す →
          </Link>
        </Card>
      ) : (
        <ul className="space-y-3">
          {items.map((c) => {
            const status = CONVERSATION_STATUS_LABELS[c.status];
            const preview = c.messages[0]?.body ?? "（メッセージなし）";
            return (
              <li key={c.id}>
                <Link
                  href={`/mypage/consultations/${c.id}`}
                  className="block rounded-2xl border border-border bg-background p-4 transition-shadow hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {c.teacher.profileImageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={c.teacher.profileImageUrl}
                          alt=""
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-surface">
                          🍫
                        </span>
                      )}
                      <div>
                        <p className="font-medium text-foreground">
                          {c.teacher.displayName}
                        </p>
                        <p className="mt-0.5 line-clamp-1 text-sm text-muted">
                          {preview}
                        </p>
                      </div>
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
