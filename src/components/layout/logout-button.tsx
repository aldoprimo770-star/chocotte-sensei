"use client";

import { useTransition } from "react";
import { logoutAction } from "@/app/(auth)/actions";

/**
 * ログアウトボタン（クライアントコンポーネント）
 * Server Action(logoutAction) を呼び出してセッションを破棄します。
 */
export function LogoutButton() {
  const [isPending, startTransition] = useTransition();

  function handleLogout() {
    startTransition(() => {
      void logoutAction();
    });
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isPending}
      className="text-sm font-medium text-muted transition-colors hover:text-primary disabled:opacity-50"
    >
      {isPending ? "..." : "ログアウト"}
    </button>
  );
}
