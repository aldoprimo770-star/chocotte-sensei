import type { MessageSenderRole } from "@prisma/client";
import {
  CONSULTATION_LIMIT_MESSAGE,
  PRE_CONSULTATION_MAX_ROUND_TRIPS,
} from "@/constants/consultation";

/**
 * 往復カウント:
 * 生徒メッセージと先生メッセージの少ない方 = 完了した往復数。
 * 例: 生徒3・先生2 → 2往復完了、生徒はあと1通送れる。
 */
export function countRoundTrips(
  messages: ReadonlyArray<{ senderRole: MessageSenderRole }>,
): { studentCount: number; teacherCount: number; completedRoundTrips: number } {
  let studentCount = 0;
  let teacherCount = 0;
  for (const m of messages) {
    if (m.senderRole === "STUDENT") studentCount += 1;
    if (m.senderRole === "TEACHER") teacherCount += 1;
  }
  return {
    studentCount,
    teacherCount,
    completedRoundTrips: Math.min(studentCount, teacherCount),
  };
}

/** 連絡先未購入時に、指定ロールがさらに送信できるか */
export function canSendFreeMessage(
  messages: ReadonlyArray<{ senderRole: MessageSenderRole }>,
  senderRole: "STUDENT" | "TEACHER",
  hasCompletedPurchase: boolean,
): { ok: true } | { ok: false; message: string } {
  if (hasCompletedPurchase) {
    return { ok: true };
  }

  const { studentCount, teacherCount } = countRoundTrips(messages);
  const used =
    senderRole === "STUDENT" ? studentCount : teacherCount;

  if (used >= PRE_CONSULTATION_MAX_ROUND_TRIPS) {
    return { ok: false, message: CONSULTATION_LIMIT_MESSAGE };
  }

  return { ok: true };
}

/** 無料枠の残り表示用 */
export function getRemainingFreeSends(
  messages: ReadonlyArray<{ senderRole: MessageSenderRole }>,
  senderRole: "STUDENT" | "TEACHER",
  hasCompletedPurchase: boolean,
): number | null {
  if (hasCompletedPurchase) return null;
  const { studentCount, teacherCount } = countRoundTrips(messages);
  const used = senderRole === "STUDENT" ? studentCount : teacherCount;
  return Math.max(0, PRE_CONSULTATION_MAX_ROUND_TRIPS - used);
}
