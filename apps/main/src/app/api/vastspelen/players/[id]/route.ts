import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@korfbaltools/db";
import { updateVastspelenPlayerSchema } from "@korfbaltools/types";
import { requireClub } from "@/lib/club-context";
import { errorResponse, validationErrorResponse } from "@/lib/api-response";
import { ensureVastspelenTeams } from "@/lib/vastspelen";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const result = requireClub("vastspelen");
  if ("response" in result) return result.response;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = updateVastspelenPlayerSchema.safeParse(body);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  const { team1, team2 } = await ensureVastspelenTeams(result.clubId);
  const clubTeamIds = [team1.id, team2.id];

  const existing = await prisma.vastspelenPlayer.findUnique({ where: { id } });
  if (!existing || !clubTeamIds.includes(existing.teamId)) {
    return errorResponse("not_found", "Speler niet gevonden");
  }

  const teamId = parsed.data.teamNiveau === 1 ? team1.id : team2.id;
  const player = await prisma.vastspelenPlayer.update({
    where: { id },
    data: { naam: parsed.data.naam, geboortedatum: new Date(parsed.data.geboortedatum), teamId },
  });

  return NextResponse.json({
    player: {
      id: player.id,
      naam: player.naam,
      geboortedatum: player.geboortedatum.toISOString(),
      teamId: player.teamId,
      teamNiveau: parsed.data.teamNiveau,
    },
  });
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const result = requireClub("vastspelen");
  if ("response" in result) return result.response;

  const { id } = await params;
  const { team1, team2 } = await ensureVastspelenTeams(result.clubId);
  const clubTeamIds = [team1.id, team2.id];

  const existing = await prisma.vastspelenPlayer.findUnique({ where: { id } });
  if (!existing || !clubTeamIds.includes(existing.teamId)) {
    return errorResponse("not_found", "Speler niet gevonden");
  }

  await prisma.vastspelenPlayer.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
