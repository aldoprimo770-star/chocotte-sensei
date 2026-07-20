import { cache } from "react";
import { getDb } from "@/lib/db";
import { PRE_CONSULTATION_MAX_ROUND_TRIPS } from "@/constants/consultation";
import { canSendFreeMessage, countRoundTrips } from "@/lib/consultation/limits";

/** 生徒が先生との事前相談スレッドを取得または作成 */
export async function getOrCreatePreConsultation(
  studentUserId: string,
  teacherProfileId: string,
) {
  return getDb().conversation.upsert({
    where: {
      studentId_teacherId_type: {
        studentId: studentUserId,
        teacherId: teacherProfileId,
        type: "PRE_CONSULTATION",
      },
    },
    create: {
      studentId: studentUserId,
      teacherId: teacherProfileId,
      type: "PRE_CONSULTATION",
      status: "OPEN",
    },
    update: {},
    select: { id: true, status: true, studentId: true, teacherId: true },
  });
}

/** 連絡先購入完了済みか（事前相談の無制限解除判定） */
export async function hasCompletedContactPurchase(
  studentUserId: string,
  teacherProfileId: string,
): Promise<boolean> {
  const purchase = await getDb().purchase.findFirst({
    where: {
      studentId: studentUserId,
      teacherId: teacherProfileId,
      status: "COMPLETED",
    },
    select: { id: true },
  });
  return !!purchase;
}

/** 生徒の相談一覧 */
export async function getStudentConsultations(studentUserId: string) {
  return getDb().conversation.findMany({
    where: { studentId: studentUserId, type: "PRE_CONSULTATION" },
    orderBy: [{ lastMessageAt: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      status: true,
      lastMessageAt: true,
      createdAt: true,
      teacher: {
        select: {
          id: true,
          displayName: true,
          profileImageUrl: true,
          slug: true,
        },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { body: true, createdAt: true, senderRole: true },
      },
    },
  });
}

/** 先生の相談一覧 */
export async function getTeacherConsultations(teacherProfileId: string) {
  return getDb().conversation.findMany({
    where: { teacherId: teacherProfileId, type: "PRE_CONSULTATION" },
    orderBy: [{ lastMessageAt: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      status: true,
      lastMessageAt: true,
      createdAt: true,
      student: {
        select: {
          id: true,
          email: true,
          studentProfile: { select: { displayName: true, avatarUrl: true } },
        },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { body: true, createdAt: true, senderRole: true },
      },
    },
  });
}

/** 生徒本人の相談スレッド詳細 */
export const getConsultationForStudent = cache(
  async (conversationId: string, studentUserId: string) => {
    return getDb().conversation.findFirst({
      where: {
        id: conversationId,
        studentId: studentUserId,
        type: "PRE_CONSULTATION",
      },
      select: {
        id: true,
        status: true,
        studentId: true,
        teacherId: true,
        lastMessageAt: true,
        createdAt: true,
        teacher: {
          select: {
            id: true,
            displayName: true,
            profileImageUrl: true,
            slug: true,
            userId: true,
          },
        },
        messages: {
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
            body: true,
            senderRole: true,
            senderUserId: true,
            kind: true,
            createdAt: true,
          },
        },
      },
    });
  },
);

/** 先生本人の相談スレッド詳細 */
export const getConsultationForTeacher = cache(
  async (conversationId: string, teacherProfileId: string) => {
    return getDb().conversation.findFirst({
      where: {
        id: conversationId,
        teacherId: teacherProfileId,
        type: "PRE_CONSULTATION",
      },
      select: {
        id: true,
        status: true,
        studentId: true,
        teacherId: true,
        lastMessageAt: true,
        createdAt: true,
        student: {
          select: {
            id: true,
            email: true,
            studentProfile: { select: { displayName: true, avatarUrl: true } },
          },
        },
        teacher: {
          select: { id: true, displayName: true, slug: true, userId: true },
        },
        messages: {
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
            body: true,
            senderRole: true,
            senderUserId: true,
            kind: true,
            createdAt: true,
          },
        },
      },
    });
  },
);

/** 送信可否と残り回数をまとめて返す */
export async function getSendEligibility(
  conversationId: string,
  senderRole: "STUDENT" | "TEACHER",
  studentUserId: string,
  teacherProfileId: string,
) {
  const messages = await getDb().conversationMessage.findMany({
    where: { conversationId, kind: "TEXT" },
    select: { senderRole: true },
    orderBy: { createdAt: "asc" },
  });

  const purchased = await hasCompletedContactPurchase(
    studentUserId,
    teacherProfileId,
  );
  const limit = canSendFreeMessage(messages, senderRole, purchased);
  const counts = countRoundTrips(messages);

  return {
    ...limit,
    purchased,
    counts,
    maxRoundTrips: PRE_CONSULTATION_MAX_ROUND_TRIPS,
  };
}
