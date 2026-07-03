import { NextResponse } from "next/server";
import { prisma } from "@korfbaltools/db";
import { toPublicUser } from "@/lib/user-mapper";
import { requireAdmin } from "@/lib/require-user";

export async function GET() {
  const result = await requireAdmin();
  if ("response" in result) return result.response;

  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });
  const lastLogins = await prisma.session.groupBy({
    by: ["userId"],
    _max: { createdAt: true },
  });
  const lastLoginByUserId = new Map(lastLogins.map((row) => [row.userId, row._max.createdAt]));

  return NextResponse.json({
    users: users.map((user) => ({
      ...toPublicUser(user),
      lastLoginAt: lastLoginByUserId.get(user.id)?.toISOString() ?? null,
    })),
  });
}
