import { gespeeldeWedstrijden } from "./gespeelde-wedstrijden";
import type { GespeeldeWedstrijd, TeamNiveau } from "./types";

const LAATSTE_N_WEDSTRIJDEN = 3;
const DREMPEL_65_PERCENT = 0.65;

// Eigen team = laagste team waarin een speler, over zijn laatste 3 gespeelde
// wedstrijden binnen dit seizoensdeel, volgens de 65%-regel "hoort". Binnen
// de 1e/2e-team-scope van dit plan (zie plan sectie "Uitgangspunten") komt dat
// neer op: 2/3 (≈66.7%, >= 65%) of meer van de laatste 3 in het 2e team
// gespeeld -> eigen team is het 2e team, anders het 1e.
// null zolang er nog geen 3 gespeelde wedstrijden zijn.
export function eigenTeam(appearances: GespeeldeWedstrijd[], totSpeelweek?: number): TeamNiveau | null {
  const laatste = gespeeldeWedstrijden(appearances, totSpeelweek).slice(-LAATSTE_N_WEDSTRIJDEN);
  if (laatste.length < LAATSTE_N_WEDSTRIJDEN) return null;

  const aantalInTeam2 = laatste.filter((w) => w.gespeeldInTeam === 2).length;
  return aantalInTeam2 / LAATSTE_N_WEDSTRIJDEN >= DREMPEL_65_PERCENT ? 2 : 1;
}
