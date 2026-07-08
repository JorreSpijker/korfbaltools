import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@korfbaltools/db";
import { saveVastspelenAppearancesSchema } from "@korfbaltools/types";
import { requireVastspelen } from "@/lib/require-user";
import { errorResponse, validationErrorResponse } from "@/lib/api-response";
import { ensureVastspelenTeams, toPublicAppearance } from "@/lib/vastspelen";

interface RouteParams {
  params: Promise<{ id: string }>;
}

async function requireClubFixture(clubId: string, fixtureId: string) {
  const { team1, team2 } = await ensureVastspelenTeams(clubId);
  const fixture = await prisma.vastspelenFixture.findUnique({ where: { id: fixtureId } });
  if (!fixture || ![team1.id, team2.id].includes(fixture.teamId)) return null;
  return { fixture, team1, team2 };
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const result = await requireVastspelen();
  if ("response" in result) return result.response;

  const { id } = await params;
  const context = await requireClubFixture(result.user.clubId, id);
  if (!context) {
    return errorResponse("not_found", "Wedstrijd niet gevonden");
  }

  const appearances = await prisma.vastspelenAppearance.findMany({
    where: { fixtureId: id },
    include: { gespeeldInTeam: true },
  });

  return NextResponse.json({ appearances: appearances.map(toPublicAppearance) });
}

// Volledige vervanging van de minuten-invoer voor deze wedstrijd (fase 3,
// "wedstrijd-na-afloop invoerscherm") — eenvoudiger en minder foutgevoelig
// dan losse create/update/delete-calls per speler vanuit één formulier.
export async function POST(request: NextRequest, { params }: RouteParams) {
  const result = await requireVastspelen();
  if ("response" in result) return result.response;

  const { id } = await params;
  const context = await requireClubFixture(result.user.clubId, id);
  if (!context) {
    return errorResponse("not_found", "Wedstrijd niet gevonden");
  }

  const body = await request.json().catch(() => null);
  const parsed = saveVastspelenAppearancesSchema.safeParse(body);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  const { team1, team2 } = context;
  const teamIdByNiveau = { 1: team1.id, 2: team2.id } as const;

  await prisma.$transaction(async (tx) => {
    await tx.vastspelenAppearance.deleteMany({ where: { fixtureId: id } });
    if (parsed.data.appearances.length > 0) {
      await tx.vastspelenAppearance.createMany({
        data: parsed.data.appearances.map((appearance) => ({
          fixtureId: id,
          playerId: appearance.playerId,
          gespeeldInTeamId: teamIdByNiveau[appearance.gespeeldInTeamNiveau],
          minuten: appearance.minuten,
        })),
      });
    }
  });

  const appearances = await prisma.vastspelenAppearance.findMany({
    where: { fixtureId: id },
    include: { gespeeldInTeam: true },
  });

  return NextResponse.json({ appearances: appearances.map(toPublicAppearance) });
}
