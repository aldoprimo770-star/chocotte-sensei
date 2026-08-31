"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db";
import { requireAuth } from "@/lib/auth/session";
import { buildConsentWriteData } from "@/lib/legal/consent";
import { getLandingPathByRole } from "@/lib/auth/routes";
import type { ActionResult } from "@/app/(auth)/actions";

/**
 * 現行の利用規約・プライバシーポリシーへの同意を記録する。
 * 既存会員の再同意、および未同意ユーザー向け。
 */
export async function acceptCurrentLegalConsentAction(): Promise<
  ActionResult & { redirectTo?: string }
> {
  const session = await requireAuth();

  try {
    await getDb().user.update({
      where: { id: session.user.id },
      data: buildConsentWriteData(),
    });
  } catch {
    return {
      success: false,
      error: "同意の保存に失敗しました。時間をおいて再度お試しください",
    };
  }

  revalidatePath("/consent");
  revalidatePath("/mypage");
  revalidatePath("/dashboard");

  return {
    success: true,
    redirectTo: getLandingPathByRole(session.user.role),
  };
}
