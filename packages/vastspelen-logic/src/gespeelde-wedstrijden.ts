import { heeftGespeeld } from "./heeft-gespeeld";
import type { GespeeldeWedstrijd } from "./types";

// Alle wedstrijden van een speler die aan heeftGespeeld voldoen, oplopend op
// speelweek. totSpeelweek beperkt tot een peildatum (bv. "stand vóór wedstrijd X").
export function gespeeldeWedstrijden(
  appearances: GespeeldeWedstrijd[],
  totSpeelweek?: number,
): GespeeldeWedstrijd[] {
  return appearances
    .filter((appearance) => heeftGespeeld(appearance))
    .filter((appearance) => totSpeelweek === undefined || appearance.speelweek <= totSpeelweek)
    .sort((a, b) => a.speelweek - b.speelweek);
}
