import "server-only";
import { prisma } from "@korfbaltools/db";
import type {
  VastspelenAppearance,
  VastspelenFixture,
  VastspelenSeasonPeriod,
  VastspelenTeam,
  VastspelenTeamNiveau,
} from "@korfbaltools/types";
import { bepaalSpelerStatus, type GespeeldeWedstrijd } from "@korfbaltools/vastspelen-logic";
import type { VastspelenTeam as VastspelenTeamRow } from "@korfbaltools/db";

// Elke club heeft precies twee vastspelen-teams (1e en 2e, A-categorie) —
// aangemaakt bij eerste gebruik, net als AppConfig-rijen (zie
// packages/db schema.prisma AppConfig-comment voor hetzelfde patroon).
export async function ensureVastspelenTeams(
  clubId: string,
): Promise<{ team1: VastspelenTeamRow; team2: VastspelenTeamRow }> {
  const [team1, team2] = await Promise.all([
    prisma.vastspelenTeam.upsert({
      where: { clubId_niveau_categorie: { clubId, niveau: 1, categorie: "A" } },
      update: {},
      create: { clubId, niveau: 1, categorie: "A" },
    }),
    prisma.vastspelenTeam.upsert({
      where: { clubId_niveau_categorie: { clubId, niveau: 2, categorie: "A" } },
      update: {},
      create: { clubId, niveau: 2, categorie: "A" },
    }),
  ]);
  return { team1, team2 };
}

// Er is bewust geen "actieve periode"-instelling — de meest recente periode
// (op einddatum) die vandaag omvat, of anders de meest recente periode
// uberhaupt, is de periode waarbinnen speelweek-tellingen en de
// driekwart-grens gelden (zie plan sectie "Uitgangspunten": nooit
// seizoensdeel-overstijgend).
export async function getActiveSeasonPeriod() {
  const now = new Date();
  const lopend = await prisma.vastspelenSeasonPeriod.findFirst({
    where: { start: { lte: now }, eind: { gte: now } },
    orderBy: { eind: "desc" },
  });
  if (lopend) return lopend;

  return prisma.vastspelenSeasonPeriod.findFirst({ orderBy: { eind: "desc" } });
}

export function toPublicTeam(team: VastspelenTeamRow): VastspelenTeam {
  return { id: team.id, niveau: team.niveau as VastspelenTeamNiveau, categorie: team.categorie };
}

export function toPublicSeasonPeriod(period: {
  id: string;
  naam: string;
  seizoensdeel: string;
  start: Date;
  eind: Date;
  totaalWedstrijden: number;
}): VastspelenSeasonPeriod {
  return {
    id: period.id,
    naam: period.naam,
    seizoensdeel: period.seizoensdeel as "veld" | "zaal",
    start: period.start.toISOString(),
    eind: period.eind.toISOString(),
    totaalWedstrijden: period.totaalWedstrijden,
  };
}

export function toPublicFixture(fixture: {
  id: string;
  teamId: string;
  team: { niveau: number };
  seasonPeriodId: string;
  tegenstander: string;
  datum: Date;
  poule: string | null;
  speelweek: number;
  wedstrijdduur: number;
  appearances?: unknown[];
}): VastspelenFixture {
  return {
    id: fixture.id,
    teamId: fixture.teamId,
    teamNiveau: fixture.team.niveau as VastspelenTeamNiveau,
    seasonPeriodId: fixture.seasonPeriodId,
    tegenstander: fixture.tegenstander,
    datum: fixture.datum.toISOString(),
    poule: fixture.poule,
    speelweek: fixture.speelweek,
    wedstrijdduur: fixture.wedstrijdduur,
    gespeeld: (fixture.appearances?.length ?? 0) > 0,
  };
}

export function toPublicAppearance(appearance: {
  id: string;
  fixtureId: string;
  playerId: string;
  gespeeldInTeamId: string;
  gespeeldInTeam: { niveau: number };
  minuten: number;
}): VastspelenAppearance {
  return {
    id: appearance.id,
    fixtureId: appearance.fixtureId,
    playerId: appearance.playerId,
    gespeeldInTeamId: appearance.gespeeldInTeamId,
    gespeeldInTeamNiveau: appearance.gespeeldInTeam.niveau as VastspelenTeamNiveau,
    minuten: appearance.minuten,
  };
}

// Bouwt de speelgeschiedenis van een speler binnen de actieve periode, in het
// format dat @korfbaltools/vastspelen-logic verwacht.
export async function gespeeldeWedstrijdenVoorSpeler(
  playerId: string,
  seasonPeriodId: string,
  teamNiveauById: Map<string, VastspelenTeamNiveau>,
): Promise<GespeeldeWedstrijd[]> {
  const appearances = await prisma.vastspelenAppearance.findMany({
    where: { playerId, fixture: { seasonPeriodId } },
    include: { fixture: true },
  });

  return appearances.map((appearance) => ({
    fixtureId: appearance.fixtureId,
    speelweek: appearance.fixture.speelweek,
    gespeeldInTeam: (teamNiveauById.get(appearance.gespeeldInTeamId) ?? 1) as VastspelenTeamNiveau,
    minuten: appearance.minuten,
    wedstrijdduur: appearance.fixture.wedstrijdduur,
  }));
}

export { bepaalSpelerStatus };
