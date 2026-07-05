"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

/**
 * ログアウトボタン
 */
export function LogoutButton() {
  async function handleLogout(): Promise<void> {
    await signOut({ callbackUrl: "/" });
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleLogout}>
      ログアウト
    </Button>
  );
}
