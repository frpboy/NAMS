"use server";

import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth/auth";

type AuditLogWithUser = Prisma.AuditLogGetPayload<{
  include: {
    user: {
      select: {
        name: true;
        email: true;
        role: true;
      };
    };
  };
}>;

export async function createLog(data: {
  action: string;
  entity: string;
  entityId?: string;
  details?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) return;

  try {
    await db.auditLog.create({
      data: {
        ...data,
        userId: session.user.id,
      },
    });
  } catch (err) {
    console.error("Failed to create audit log:", err);
  }
}

export async function getAuditLogs(): Promise<AuditLogWithUser[]> {
  const logs = await db.auditLog.findMany({
    include: {
      user: { select: { name: true, email: true, role: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 500, // Limit for performance
  });

  return logs as unknown as AuditLogWithUser[];
}
