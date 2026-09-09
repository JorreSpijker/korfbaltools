import { NextResponse } from "next/server";
import { prisma } from "@korfbaltools/db";
import { requireClub } from "@/lib/club-context";

export async function GET() {
  const result = requireClub("mijn-club");
  if ("response" in result) return result.response;

  const players = await prisma.player.findMany({
    where: { clubId: result.clubId },
    orderBy: { naam: "asc" },
  });

  return NextResponse.json({ players });
}
