// Scope: alleen A-categorie 1e/2e team (zie docs/apps/vastspelen-plan.md) —
// daarom is TeamNiveau een gesloten 1|2 union, geen algemeen Int.
export type TeamNiveau = 1 | 2;

export interface GespeeldeWedstrijd {
  fixtureId: string;
  speelweek: number;
  gespeeldInTeam: TeamNiveau;
  minuten: number;
  wedstrijdduur: number;
}

export interface MagOpstellenInput {
  appearances: GespeeldeWedstrijd[];
  teamNiveau: TeamNiveau;
  fixture: { speelweek: number };
  seasonPeriod: { totaalWedstrijden: number };
  totSpeelweek?: number;
  // Aantal invallers vanuit het lagere team dat al voor déze wedstrijd is
  // opgesteld, los van de speler die nu gecheckt wordt (max. 2 per wedstrijd,
  // zie plan sectie "Uitgangspunten"). Alleen relevant als teamNiveau === 1.
  invallersAlOpgesteldDitDuel?: number;
}

export interface MagOpstellenResult {
  toegestaan: boolean;
  reden: string;
}
