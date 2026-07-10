import { NextResponse } from "next/server";
import { prisma } from "@korfbaltools/db";
import type { VastspelenPlayer, VastspelenTeamNiveau } from "@korfbaltools/types";
import { requireVastspelen } from "@/lib/require-user";
import {
  bepaalSpelerStatus,
  ensureVastspelenTeams,
  gespeeldeWedstrijdenVoorSpeler,
  getActiveSeasonPeriod,
  toPublicSeasonPeriod,
  toPublicTeam,
} from "@/lib/vastspelen";

// Dashboard-state (zie plan fase 5): beide teams van de club, hun spelers met
// stoplicht-status, en de actieve seizoensperiode. Spelerslijst is bewust
// gedeeld tussen beide teamleiders (zie plan "Openstaande ontwerpkeuze") —
// requireVastspelen scoopt alleen op club, niet op team-niveau.
export async function GET() {
  const result = await requireVastspelen();
  if ("response" in result) return result.response;

  const { team1, team2 } = await ensureVastspelenTeams(result.user.clubId);
  const teamNiveauById = new Map<string, VastspelenTeamNiveau>([
    [team1.id, 1],
    [team2.id, 2],
  ]);

  const seasonPeriod = await getActiveSeasonPeriod();
  const seasonPeriods = await prisma.vastspelenSeasonPeriod.findMany({ orderBy: { start: "desc" } });

  const players = await prisma.vastspelenPlayer.findMany({
    where: { teamId: { in: [team1.id, team2.id] } },
    orderBy: { naam: "asc" },
  });

  let eerstvolgendeSpeelweek = 1;
  if (seasonPeriod) {
    const laatsteFixture = await prisma.vastspelenFixture.findFirst({
      where: { seasonPeriodId: seasonPeriod.id, teamId: { in: [team1.id, team2.id] } },
      orderBy: { speelweek: "desc" },
    });
    eerstvolgendeSpeelweek = (laatsteFixture?.speelweek ?? 0) + 1;
  }

  const publicPlayers: VastspelenPlayer[] = await Promise.all(
    players.map(async (player) => {
      const teamNiveau = teamNiveauById.get(player.teamId) ?? 1;
      const status = seasonPeriod
        ? bepaalSpelerStatus({
            appearances: await gespeeldeWedstrijdenVoorSpeler(player.id, seasonPeriod.id, teamNiveauById),
            teamNiveau,
            eerstvolgendeSpeelweek,
            seasonPeriod: { totaalWedstrijden: seasonPeriod.totaalWedstrijden },
          })
        : "vrij";

      return {
        id: player.id,
        naam: player.naam,
        geboortedatum: player.geboortedatum.toISOString(),
        teamId: player.teamId,
        teamNiveau,
        status,
      };
    }),
  );

  return NextResponse.json({
    teams: [toPublicTeam(team1), toPublicTeam(team2)],
    players: publicPlayers,
    seasonPeriod: seasonPeriod ? toPublicSeasonPeriod(seasonPeriod) : null,
    seasonPeriods: seasonPeriods.map(toPublicSeasonPeriod),
  });
}
