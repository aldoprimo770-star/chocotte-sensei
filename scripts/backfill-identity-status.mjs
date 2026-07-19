import { PrismaClient } from "@prisma/client";

/**
 * 既存の IdentityVerification / isVerified から
 * TeacherProfile.identityVerificationStatus を埋めるワンショット。
 */
const db = new PrismaClient();

const verifications = await db.identityVerification.findMany({
  select: { teacherId: true, status: true },
});

let syncedFromApplication = 0;
for (const v of verifications) {
  const status =
    v.status === "APPROVED"
      ? "VERIFIED"
      : v.status === "REJECTED"
        ? "REJECTED"
        : "PENDING";
  await db.teacherProfile.update({
    where: { id: v.teacherId },
    data: {
      identityVerificationStatus: status,
      isVerified: status === "VERIFIED",
    },
  });
  syncedFromApplication += 1;
}

const orphans = await db.teacherProfile.updateMany({
  where: { isVerified: true, identityVerificationStatus: null },
  data: { identityVerificationStatus: "VERIFIED" },
});

console.log(
  JSON.stringify({
    syncedFromApplication,
    backfilledFromIsVerified: orphans.count,
  }),
);

await db.$disconnect();
