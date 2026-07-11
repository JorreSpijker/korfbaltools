import { NextResponse } from "next/server";
import { prisma } from "@korfbaltools/db";
import { requireClubManager } from "@/lib/require-user";
import { errorResponse } from "@/lib/api-response";

export async function GET() {
  const result = await requireClubManager();
  if ("response" in result) return result.response;
  if (result.scope.type !== "club") {
    return errorResponse("forbidden", "Alleen voor clubbeheerders");
  }

  const players = await prisma.player.findMany({
    where: { clubId: result.scope.clubId },
    orderBy: { naam: "asc" },
  });

  return NextResponse.json({ players });
}
