import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@korfbaltools/db";
import { createVastspelenFixtureSchema } from "@korfbaltools/types";
import { requireVastspelen } from "@/lib/require-user";
import { errorResponse, validationErrorResponse } from "@/lib/api-response";
import { ensureVastspelenTeams, toPublicFixture } from "@/lib/vastspelen";

export async function GET(request: NextRequest) {
  const result = await requireVastspelen();
  if ("response" in result) return result.response;

  const { team1, team2 } = await ensureVastspelenTeams(result.user.clubId);
  const teamNiveauParam = request.nextUrl.searchParams.get("teamNiveau");
  const teamIds =
    teamNiveauParam === "1" ? [team1.id] : teamNiveauParam === "2" ? [team2.id] : [team1.id, team2.id];

  const fixtures = await prisma.vastspelenFixture.findMany({
    where: { teamId: { in: teamIds } },
    include: { team: true, appearances: { select: { id: true } } },
    orderBy: { speelweek: "asc" },
  });

  return NextResponse.json({ fixtures: fixtures.map(toPublicFixture) });
}

export async function POST(request: NextRequest) {
  const result = await requireVastspelen();
  if ("response" in result) return result.response;

  const body = await request.json().catch(() => null);
  const parsed = createVastspelenFixtureSchema.safeParse(body);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  const seasonPeriod = await prisma.vastspelenSeasonPeriod.findUnique({
    where: { id: parsed.data.seasonPeriodId },
  });
  if (!seasonPeriod) {
    return errorResponse("not_found", "Seizoensperiode niet gevonden");
  }

  const { team1, team2 } = await ensureVastspelenTeams(result.user.clubId);
  const teamId = parsed.data.teamNiveau === 1 ? team1.id : team2.id;

  const fixture = await prisma.vastspelenFixture.create({
    data: {
      teamId,
      seasonPeriodId: parsed.data.seasonPeriodId,
      tegenstander: parsed.data.tegenstander,
      datum: new Date(parsed.data.datum),
      poule: parsed.data.poule,
      speelweek: parsed.data.speelweek,
      wedstrijdduur: parsed.data.wedstrijdduur,
    },
    include: { team: true, appearances: { select: { id: true } } },
  });

  return NextResponse.json({ fixture: toPublicFixture(fixture) }, { status: 201 });
}
