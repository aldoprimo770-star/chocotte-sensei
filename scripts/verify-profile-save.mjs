/**
 * プロフィール保存まわりの検証（正規化 + DB 読み書き）
 * 使い方: node scripts/verify-profile-save.mjs
 */
import { PrismaClient } from "@prisma/client";

function toStringArray(value) {
  if (value == null || value === false || value === "") return [];
  if (Array.isArray(value)) return value.filter((v) => typeof v === "string");
  if (typeof value === "string") return [value];
  return [];
}

function normalize(raw) {
  return {
    teachingMethods: toStringArray(raw.teachingMethods),
    isAcceptingStudents: raw.isAcceptingStudents === true,
  };
}

function prepareTeachingMethodsForSave(methods) {
  const unique = [...new Set(methods.filter((m) => m && m !== "BOTH"))];
  let teachingMethod = null;
  if (unique.length === 1) teachingMethod = unique[0];
  else if (
    unique.length === 2 &&
    unique.includes("IN_PERSON") &&
    unique.includes("ONLINE") &&
    !unique.includes("PHONE")
  ) {
    teachingMethod = "BOTH";
  }
  return {
    teachingMethods: unique,
    teachingMethod,
    isOnline: unique.includes("ONLINE"),
  };
}

console.log(
  "case1",
  normalize({ teachingMethods: "ONLINE", isAcceptingStudents: undefined }),
);
console.log(
  "case2",
  normalize({
    teachingMethods: ["IN_PERSON", "PHONE"],
    isAcceptingStudents: false,
  }),
);

const db = new PrismaClient();

try {
  const teacher = await db.teacherProfile.findFirst({
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      slug: true,
      displayName: true,
      teachingMethods: true,
      teachingMethod: true,
      isOnline: true,
      isAcceptingStudents: true,
    },
  });

  if (!teacher) {
    console.log("NO_TEACHER");
    process.exit(0);
  }

  console.log("before", teacher);

  const prepared = prepareTeachingMethodsForSave([
    "IN_PERSON",
    "ONLINE",
    "PHONE",
  ]);
  const nextAccepting = !teacher.isAcceptingStudents;

  await db.teacherProfile.update({
    where: { id: teacher.id },
    data: {
      teachingMethods: prepared.teachingMethods,
      teachingMethod: prepared.teachingMethod,
      isOnline: prepared.isOnline,
      isAcceptingStudents: nextAccepting,
    },
  });

  const after = await db.teacherProfile.findUnique({
    where: { id: teacher.id },
    select: {
      id: true,
      slug: true,
      teachingMethods: true,
      teachingMethod: true,
      isOnline: true,
      isAcceptingStudents: true,
    },
  });

  console.log("after", after);

  const ok =
    Array.isArray(after?.teachingMethods) &&
    after.teachingMethods.includes("IN_PERSON") &&
    after.teachingMethods.includes("ONLINE") &&
    after.teachingMethods.includes("PHONE") &&
    after.isAcceptingStudents === nextAccepting &&
    after.isOnline === true;

  // 元に戻す（本番データを壊さない）
  await db.teacherProfile.update({
    where: { id: teacher.id },
    data: {
      teachingMethods: teacher.teachingMethods,
      teachingMethod: teacher.teachingMethod,
      isOnline: teacher.isOnline,
      isAcceptingStudents: teacher.isAcceptingStudents,
    },
  });

  console.log(ok ? "VERIFY_OK" : "VERIFY_FAIL");
  process.exit(ok ? 0 : 1);
} finally {
  await db.$disconnect();
}
