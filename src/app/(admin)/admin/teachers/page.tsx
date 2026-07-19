import type { Metadata } from "next";
import Link from "next/link";
import { getAdminTeachers } from "@/lib/admin/queries";
import { PROFILE_STATUS_LABELS } from "@/constants/admin";
import { IDENTITY_VERIFICATION_STATUS_LABELS } from "@/constants/verification";
import { formatDate } from "@/lib/date";
import { StatusBadge } from "@/components/admin/status-badge";
import { TeacherRowActions } from "./teacher-row-actions";
import { resolveIdentityVerificationStatus } from "@/lib/verification/status";
import { IdentityStatusActions } from "./identity-status-actions";

export const metadata: Metadata = { title: "先生管理" };

/** 先生管理ページ（一覧 + 操作 + 本人確認） */
export default async function AdminTeachersPage() {
  const teachers = await getAdminTeachers();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-800">先生管理</h1>
        <p className="mt-1 text-sm text-gray-500">
          登録されている先生の一覧です（新しい順・最大100件）。
          本人確認画像の表示とステータス切替は管理者のみ可能です。
        </p>
      </div>

      {teachers.length === 0 ? (
        <EmptyState message="まだ先生が登録されていません。" />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
          <table className="w-full min-w-[1100px] text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-xs text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">先生</th>
                <th className="px-4 py-3 font-medium">カテゴリー</th>
                <th className="px-4 py-3 font-medium">都道府県</th>
                <th className="px-4 py-3 font-medium">公開</th>
                <th className="px-4 py-3 font-medium">承認</th>
                <th className="px-4 py-3 font-medium">本人確認</th>
                <th className="px-4 py-3 font-medium">登録日</th>
                <th className="px-4 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {teachers.map((teacher) => {
                const categoryNames = teacher.categories
                  .map((c) => c.category.name)
                  .join("・");
                const prefectures = [
                  ...new Set(teacher.areas.map((a) => a.prefecture)),
                ].join("・");
                const statusStyle = PROFILE_STATUS_LABELS[teacher.status];
                const identityStatus = resolveIdentityVerificationStatus({
                  identityVerificationStatus:
                    teacher.identityVerificationStatus,
                  isVerified: teacher.isVerified,
                  applicationStatus: teacher.verification?.status,
                });
                const identityStyle = identityStatus
                  ? IDENTITY_VERIFICATION_STATUS_LABELS[identityStatus]
                  : null;
                const verificationId = teacher.verification?.id;
                const documentSrc = verificationId
                  ? `/admin/verifications/${verificationId}/document`
                  : null;

                return (
                  <tr key={teacher.id} className="align-top">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={teacher.profileImageUrl}
                          name={teacher.displayName}
                        />
                        <div>
                          <p className="font-medium text-gray-800">
                            {teacher.displayName}
                          </p>
                          <Link
                            href={`/teachers/${teacher.slug}`}
                            className="text-xs text-primary hover:underline"
                          >
                            プロフィールを見る
                          </Link>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {categoryNames || "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {prefectures || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        label={teacher.isPublic ? "公開中" : "非公開"}
                        className={
                          teacher.isPublic
                            ? "bg-primary-light text-primary"
                            : "bg-gray-100 text-gray-500"
                        }
                      />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        label={statusStyle.label}
                        className={statusStyle.className}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-2">
                        {identityStyle ? (
                          <StatusBadge
                            label={identityStyle.label}
                            className={identityStyle.className}
                          />
                        ) : (
                          <span className="text-xs text-gray-400">未申請</span>
                        )}

                        {documentSrc && (
                          <a
                            href={documentSrc}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-28"
                            title="本人確認画像を拡大"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={documentSrc}
                              alt={`${teacher.displayName}の本人確認書類`}
                              className="h-16 w-28 rounded-lg border border-gray-200 object-cover bg-gray-50"
                            />
                          </a>
                        )}

                        {teacher.verification?.rejectReason && (
                          <p className="max-w-[220px] text-[11px] text-accent">
                            コメント：{teacher.verification.rejectReason}
                          </p>
                        )}

                        <IdentityStatusActions
                          teacherId={teacher.id}
                          currentStatus={identityStatus}
                          hasDocument={!!documentSrc}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                      {formatDate(teacher.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <TeacherRowActions
                        teacherId={teacher.id}
                        isPublic={teacher.isPublic}
                        status={teacher.status}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/** プロフィール画像（無い場合は頭文字のプレースホルダー） */
function Avatar({ src, name }: { src: string | null; name: string }) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name}
        className="h-10 w-10 shrink-0 rounded-full object-cover"
      />
    );
  }
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-light text-sm font-bold text-primary">
      {name.charAt(0)}
    </span>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center text-gray-500">
      {message}
    </div>
  );
}
