import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@korfbaltools/db";
import { updateVastspelenFixtureSchema } from "@korfbaltools/types";
import { requireClub } from "@/lib/club-context";
import { errorResponse, validationErrorResponse } from "@/lib/api-response";
import { ensureVastspelenTeams, toPublicFixture } from "@/lib/vastspelen";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const result = requireClub("vastspelen");
  if ("response" in result) return result.response;

  const { id } = await params;
  const { team1, team2 } = await ensureVastspelenTeams(result.clubId);
  const clubTeamIds = [team1.id, team2.id];

  const fixture = await prisma.vastspelenFixture.findUnique({
    where: { id },
    include: { team: true, appearances: { select: { id: true } } },
  });
  if (!fixture || !clubTeamIds.includes(fixture.teamId)) {
    return errorResponse("not_found", "Wedstrijd niet gevonden");
  }

  return NextResponse.json({ fixture: toPublicFixture(fixture) });
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const result = requireClub("vastspelen");
  if ("response" in result) return result.response;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = updateVastspelenFixtureSchema.safeParse(body);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  const { team1, team2 } = await ensureVastspelenTeams(result.clubId);
  const clubTeamIds = [team1.id, team2.id];

  const existing = await prisma.vastspelenFixture.findUnique({ where: { id } });
  if (!existing || !clubTeamIds.includes(existing.teamId)) {
    return errorResponse("not_found", "Wedstrijd niet gevonden");
  }

  const fixture = await prisma.vastspelenFixture.update({
    where: { id },
    data: {
      tegenstander: parsed.data.tegenstander,
      datum: new Date(parsed.data.datum),
      poule: parsed.data.poule,
      speelweek: parsed.data.speelweek,
      wedstrijdduur: parsed.data.wedstrijdduur,
    },
    include: { team: true, appearances: { select: { id: true } } },
  });

  return NextResponse.json({ fixture: toPublicFixture(fixture) });
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const result = requireClub("vastspelen");
  if ("response" in result) return result.response;

  const { id } = await params;
  const { team1, team2 } = await ensureVastspelenTeams(result.clubId);
  const clubTeamIds = [team1.id, team2.id];

  const existing = await prisma.vastspelenFixture.findUnique({ where: { id } });
  if (!existing || !clubTeamIds.includes(existing.teamId)) {
    return errorResponse("not_found", "Wedstrijd niet gevonden");
  }

  await prisma.vastspelenFixture.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
