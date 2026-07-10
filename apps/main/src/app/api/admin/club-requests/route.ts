import { NextResponse } from "next/server";
import { prisma } from "@korfbaltools/db";
import { requireClubManager } from "@/lib/require-user";

export async function GET() {
  const result = await requireClubManager();
  if ("response" in result) return result.response;

  const users = await prisma.user.findMany({
    where: {
      pendingClubId: result.scope.type === "club" ? result.scope.clubId : { not: null },
    },
    include: { pendingClub: { select: { naam: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    requests: users.map((user) => ({
      id: user.id,
      email: user.email,
      naam: user.naam,
      pendingClubId: user.pendingClubId,
      pendingClubNaam: user.pendingClub?.naam ?? "—",
    })),
  });
}
