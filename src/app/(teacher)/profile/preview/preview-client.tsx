"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TeacherProfileView } from "@/components/teacher/profile-view";
import type { ProfileViewData } from "@/components/teacher/profile-view";
import type { TeacherContactInfo } from "@/lib/teacher/profile";
import {
  loadUnsavedProfilePreview,
  overlayProfileWithFormValues,
} from "@/lib/teacher/unsaved-profile-preview";

/**
 * 未保存のフォーム入力があればそれを重ねてプレビューする。
 * 無ければサーバーから渡した DB 上の内容を表示する。
 */
export function ProfilePreviewClient({
  savedProfile,
  savedContact,
  categories,
  isPublic,
}: {
  savedProfile: ProfileViewData;
  savedContact: TeacherContactInfo;
  categories: ReadonlyArray<{ id: string; name: string }>;
  isPublic: boolean;
}) {
  const [view, setView] = useState<{
    ready: boolean;
    usingUnsaved: boolean;
    profile: ProfileViewData;
    contact: TeacherContactInfo;
  }>({
    ready: false,
    usingUnsaved: false,
    profile: savedProfile,
    contact: savedContact,
  });

  useEffect(() => {
    const draft = loadUnsavedProfilePreview();
    if (!draft) {
      setView({
        ready: true,
        usingUnsaved: false,
        profile: savedProfile,
        contact: savedContact,
      });
      return;
    }
    const overlaid = overlayProfileWithFormValues(
      savedProfile,
      draft,
      categories,
      savedContact.email,
    );
    setView({
      ready: true,
      usingUnsaved: true,
      profile: overlaid.profile,
      contact: overlaid.contact,
    });
  }, [savedProfile, savedContact, categories]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">プレビュー</h1>
          <p className="mt-1 text-sm text-muted">
            {view.usingUnsaved
              ? "いま編集中の内容の確認画面です（まだ保存していません）"
              : "生徒に表示される内容の確認画面です"}
            {!isPublic && "（現在は非公開です）"}
          </p>
        </div>
        <Link
          href="/profile"
          className="shrink-0 text-sm font-medium text-primary hover:underline"
        >
          編集に戻る
        </Link>
      </div>

      {view.ready ? (
        <TeacherProfileView
          profile={view.profile}
          canViewContact
          contact={view.contact}
        />
      ) : (
        <p className="text-sm text-muted">プレビューを読み込んでいます…</p>
      )}
    </div>
  );
}
