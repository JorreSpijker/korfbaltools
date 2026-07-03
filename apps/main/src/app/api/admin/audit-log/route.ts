import { NextResponse } from "next/server";
import { prisma } from "@korfbaltools/db";
import { requireAdmin } from "@/lib/require-user";

export async function GET() {
  const result = await requireAdmin();
  if ("response" in result) return result.response;

  const entries = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      actor: { select: { email: true } },
      targetUser: { select: { email: true } },
    },
  });

  return NextResponse.json({
    entries: entries.map((entry) => ({
      id: entry.id,
      actorId: entry.actorId,
      actorEmail: entry.actor.email,
      action: entry.action,
      targetUserId: entry.targetUserId,
      targetUserEmail: entry.targetUser.email,
      metadata: entry.metadata,
      createdAt: entry.createdAt.toISOString(),
    })),
  });
}
