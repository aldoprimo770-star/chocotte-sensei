import { getDb } from "@/lib/db";

/**
 * 連絡先購入完了後に、事前相談スレッドの無料枠ロックを解除する。
 * 将来のチャット継続にも使える。
 */
export async function unlockPreConsultationAfterPurchase(
  studentUserId: string,
  teacherProfileId: string,
): Promise<void> {
  await getDb().conversation.updateMany({
    where: {
      studentId: studentUserId,
      teacherId: teacherProfileId,
      type: "PRE_CONSULTATION",
      status: "LOCKED",
    },
    data: { status: "OPEN" },
  });
}
