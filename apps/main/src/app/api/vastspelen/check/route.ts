import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@korfbaltools/db";
import { checkVastspelenOpstellingSchema, type VastspelenCheckResultaat, type VastspelenTeamNiveau } from "@korfbaltools/types";
import { magOpstellen } from "@korfbaltools/vastspelen-logic";
import { requireClub } from "@/lib/club-context";
import { errorResponse, validationErrorResponse } from "@/lib/api-response";
import { ensureVastspelenTeams, gespeeldeWedstrijdenVoorSpeler } from "@/lib/vastspelen";

const MAX_INVALLERS_PER_WEDSTRIJD = 2;

// Opstelling-check vóór de wedstrijd (fase 4, de kernfunctie): per
// voorgestelde speler magOpstellen() draaien op basis van zijn
// speelgeschiedenis tot en met de vorige speelweek, plus een batch-brede
// controle op het max. 2-invallers-per-wedstrijd-plafond.
export async function POST(request: NextRequest) {
  const result = requireClub("vastspelen");
  if ("response" in result) return result.response;

  const body = await request.json().catch(() => null);
  const parsed = checkVastspelenOpstellingSchema.safeParse(body);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  const { team1, team2 } = await ensureVastspelenTeams(result.clubId);
  const clubTeamIds = [team1.id, team2.id];
  const teamNiveauById = new Map<string, VastspelenTeamNiveau>([
    [team1.id, 1],
    [team2.id, 2],
  ]);

  const fixture = await prisma.vastspelenFixture.findUnique({
    where: { id: parsed.data.fixtureId },
    include: { seasonPeriod: true },
  });
  if (!fixture || !clubTeamIds.includes(fixture.teamId)) {
    return errorResponse("not_found", "Wedstrijd niet gevonden");
  }

  const playerIds = parsed.data.spelers.map((speler) => speler.playerId);
  const players = await prisma.vastspelenPlayer.findMany({
    where: { id: { in: playerIds }, teamId: { in: clubTeamIds } },
  });
  const playerById = new Map(players.map((player) => [player.id, player]));

  const totaalInvallers = parsed.data.spelers.filter((speler) => {
    const player = playerById.get(speler.playerId);
    const eigenTeamId = player ? teamNiveauById.get(player.teamId) : undefined;
    return speler.gespeeldInTeamNiveau === 1 && eigenTeamId === 2;
  }).length;

  const resultaten: VastspelenCheckResultaat[] = await Promise.all(
    parsed.data.spelers.map(async (speler): Promise<VastspelenCheckResultaat> => {
      const player = playerById.get(speler.playerId);
      if (!player) {
        return { playerId: speler.playerId, toegestaan: false, reden: "Speler niet gevonden" };
      }

      const isInvallerNaarTeam1 = speler.gespeeldInTeamNiveau === 1 && teamNiveauById.get(player.teamId) === 2;
      const appearances = await gespeeldeWedstrijdenVoorSpeler(player.id, fixture.seasonPeriodId, teamNiveauById);

      const magResult = magOpstellen({
        appearances,
        teamNiveau: speler.gespeeldInTeamNiveau,
        fixture: { speelweek: fixture.speelweek },
        seasonPeriod: { totaalWedstrijden: fixture.seasonPeriod.totaalWedstrijden },
        totSpeelweek: fixture.speelweek - 1,
        invallersAlOpgesteldDitDuel: isInvallerNaarTeam1 && totaalInvallers > MAX_INVALLERS_PER_WEDSTRIJD ? MAX_INVALLERS_PER_WEDSTRIJD : 0,
      });

      return { playerId: speler.playerId, ...magResult };
    }),
  );

  return NextResponse.json({ resultaten });
}
