import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@korfbaltools/db";
import { createVastspelenPlayerSchema } from "@korfbaltools/types";
import { requireClub } from "@/lib/club-context";
import { validationErrorResponse } from "@/lib/api-response";
import { ensureVastspelenTeams } from "@/lib/vastspelen";

export async function POST(request: NextRequest) {
  const result = requireClub("vastspelen");
  if ("response" in result) return result.response;

  const body = await request.json().catch(() => null);
  const parsed = createVastspelenPlayerSchema.safeParse(body);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  const { team1, team2 } = await ensureVastspelenTeams(result.clubId);
  const teamId = parsed.data.teamNiveau === 1 ? team1.id : team2.id;

  const player = await prisma.vastspelenPlayer.create({
    data: { naam: parsed.data.naam, geboortedatum: new Date(parsed.data.geboortedatum), teamId },
  });

  return NextResponse.json(
    {
      player: {
        id: player.id,
        naam: player.naam,
        geboortedatum: player.geboortedatum.toISOString(),
        teamId: player.teamId,
        teamNiveau: parsed.data.teamNiveau,
        status: "vrij",
      },
    },
    { status: 201 },
  );
}
