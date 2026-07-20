import { PrismaClient } from "@prisma/client";

/**
 * 旧 teachingMethod / isOnline から teachingMethods 配列へ移行するワンショット。
 */
const db = new PrismaClient();

function expand(method) {
  if (!method) return [];
  if (method === "BOTH") return ["IN_PERSON", "ONLINE"];
  return [method];
}

const teachers = await db.teacherProfile.findMany({
  select: {
    id: true,
    teachingMethod: true,
    teachingMethods: true,
    isOnline: true,
  },
});

let updated = 0;
for (const t of teachers) {
  if (t.teachingMethods?.length) continue;

  let methods = expand(t.teachingMethod);
  if (methods.length === 0 && t.isOnline) methods = ["ONLINE"];
  if (methods.length === 0) continue;

  await db.teacherProfile.update({
    where: { id: t.id },
    data: {
      teachingMethods: methods,
      isOnline: methods.includes("ONLINE"),
    },
  });
  updated += 1;
}

console.log(JSON.stringify({ total: teachers.length, updated }));
await db.$disconnect();
