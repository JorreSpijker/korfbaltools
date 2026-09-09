import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@korfbaltools/db";
import { importPlayersSchema } from "@korfbaltools/types";
import { requireClub } from "@/lib/club-context";
import { validationErrorResponse } from "@/lib/api-response";

// Spelers komen altijd zonder team binnen (pool in) — toewijzen gebeurt
// via PATCH /api/mijn-club/players/:id (drag-and-drop), niet bij import.
export async function POST(request: NextRequest) {
  const result = requireClub("mijn-club");
  if ("response" in result) return result.response;

  const body = await request.json().catch(() => null);
  const parsed = importPlayersSchema.safeParse(body);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  const clubId = result.clubId;
  const players = await prisma.player.createManyAndReturn({
    data: parsed.data.players.map((player) => ({ ...player, clubId })),
  });

  return NextResponse.json({ players }, { status: 201 });
}
