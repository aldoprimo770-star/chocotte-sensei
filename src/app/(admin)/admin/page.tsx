import type { Metadata } from "next";
import Link from "next/link";
import { getAdminStats } from "@/lib/admin/dashboard";
import { StatCard } from "@/components/admin/stat-card";

export const metadata: Metadata = { title: "ダッシュボード" };

/** 管理ダッシュボード（トップ） */
export default async function AdminDashboardPage() {
  const stats = await getAdminStats();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold text-gray-800">ダッシュボード</h1>
        <p className="mt-1 text-sm text-gray-500">
          サイト全体の状況をひと目で確認できます。
        </p>
      </div>

      {/* 全体の集計 */}
      <section>
        <h2 className="mb-3 text-sm font-semibold text-gray-500">全体</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <StatCard label="登録先生数" value={stats.teacherCount} unit="人" />
          <StatCard label="登録生徒数" value={stats.studentCount} unit="人" />
          <StatCard
            label="公開中の先生"
            value={stats.publicTeacherCount}
            unit="人"
          />
          <StatCard
            label="承認待ち先生"
            value={stats.pendingTeacherCount}
            unit="人"
            highlight
          />
          <StatCard
            label="本人確認待ち"
            value={stats.pendingVerifications}
            unit="件"
            highlight
          />
          <StatCard
            label="レビュー承認待ち"
            value={stats.pendingReviews}
            unit="件"
            highlight
          />
          <StatCard
            label="お問い合わせ"
            value={stats.inquiryCount}
            unit="件"
          />
          <StatCard
            label="連絡先購入"
            value={stats.purchaseCount}
            unit="件"
          />
        </div>
      </section>

      {/* 簡易統計 */}
      <section>
        <h2 className="mb-3 text-sm font-semibold text-gray-500">
          最近の動き
        </h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            label="今日の登録数"
            value={stats.registeredToday}
            unit="人"
          />
          <StatCard
            label="今月の登録数"
            value={stats.registeredThisMonth}
            unit="人"
          />
          <StatCard
            label="公開先生数"
            value={stats.publicTeacherCount}
            unit="人"
          />
          <StatCard
            label="未対応の問い合わせ"
            value={stats.unhandledInquiries}
            unit="件"
            highlight
          />
        </div>
      </section>

      {/* クイックリンク */}
      <section>
        <h2 className="mb-3 text-sm font-semibold text-gray-500">
          クイックリンク
        </h2>
        <div className="flex flex-wrap gap-3">
          {[
            { href: "/admin/teachers", label: "先生を管理する" },
            { href: "/admin/students", label: "生徒を管理する" },
            { href: "/admin/inquiries", label: "お問い合わせを見る" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-primary hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
