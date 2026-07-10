// Public shapes for the vastspelen tool (A-categorie, 1e/2e team) — see
// docs/apps/vastspelen-plan.md and packages/db schema.prisma (models
// prefixed "Vastspelen"). Dates are ISO strings, same convention as User.

export type VastspelenTeamNiveau = 1 | 2;
export type VastspelenSeizoensdeel = "veld" | "zaal";

export interface VastspelenTeam {
  id: string;
  niveau: VastspelenTeamNiveau;
  categorie: string;
}

export type VastspelenSpelerStatus = "vrij" | "laatste_invalbeurt" | "zou_vastspelen_veroorzaken";

export interface VastspelenPlayer {
  id: string;
  naam: string;
  geboortedatum: string;
  teamId: string;
  teamNiveau: VastspelenTeamNiveau;
  status: VastspelenSpelerStatus;
}

export interface VastspelenSeasonPeriod {
  id: string;
  naam: string;
  seizoensdeel: VastspelenSeizoensdeel;
  start: string;
  eind: string;
  totaalWedstrijden: number;
}

export interface VastspelenFixture {
  id: string;
  teamId: string;
  teamNiveau: VastspelenTeamNiveau;
  seasonPeriodId: string;
  tegenstander: string;
  datum: string;
  poule: string | null;
  speelweek: number;
  wedstrijdduur: number;
  gespeeld: boolean;
}

export interface VastspelenAppearance {
  id: string;
  fixtureId: string;
  playerId: string;
  gespeeldInTeamId: string;
  gespeeldInTeamNiveau: VastspelenTeamNiveau;
  minuten: number;
}

export interface VastspelenCheckResultaat {
  playerId: string;
  toegestaan: boolean;
  reden: string;
}
