import { binnenDriekwartCompetitie } from "./binnen-driekwart-competitie";
import { eigenTeam } from "./eigen-team";
import type { MagOpstellenInput, MagOpstellenResult } from "./types";

const MAX_INVALLERS_PER_WEDSTRIJD = 2;

// Combineert eigenTeam + driekwart-grens + max. 2-invallers-per-wedstrijd tot
// één ja/nee met uitleg (zie plan sectie "Rekenlogica"). De 45-dagen-
// afwezigheidsreset en de opvolgende-wedstrijd-/gelijke-klasse-uitzonderingen
// uit het KNKV-reglement vereisen afwezigheidsdata die dit datamodel nog niet
// bijhoudt — bewust nog niet geautomatiseerd, zie docs/apps/vastspelen-plan.md.
export function magOpstellen(input: MagOpstellenInput): MagOpstellenResult {
  const { appearances, teamNiveau, fixture, seasonPeriod, totSpeelweek, invallersAlOpgesteldDitDuel = 0 } = input;

  const eigen = eigenTeam(appearances, totSpeelweek);

  if (eigen === null) {
    return { toegestaan: true, reden: "Nog geen eigen team vastgesteld (minder dan 3 gespeelde wedstrijden)." };
  }

  if (eigen === teamNiveau) {
    return { toegestaan: true, reden: "Speelt in eigen team." };
  }

  // eigen === 2, teamNiveau === 1: speler wil invallen vanuit het lagere team.
  if (eigen === 2 && teamNiveau === 1) {
    if (!binnenDriekwartCompetitie(fixture, seasonPeriod)) {
      return {
        toegestaan: false,
        reden: "Na driekwart van de competitie mag een 2e-teamspeler niet meer invallen in het 1e team.",
      };
    }
    if (invallersAlOpgesteldDitDuel >= MAX_INVALLERS_PER_WEDSTRIJD) {
      return {
        toegestaan: false,
        reden: `Al ${MAX_INVALLERS_PER_WEDSTRIJD} invallers vanuit het 2e team opgesteld voor deze wedstrijd.`,
      };
    }
    return { toegestaan: true, reden: "Invalbeurt vanuit het 2e team, binnen de toegestane grenzen." };
  }

  // eigen === 1, teamNiveau === 2: 1e-teamspeler speelt af in het 2e team, niet beperkt door deze regel.
  return { toegestaan: true, reden: "Speelt af vanuit het 1e team." };
}
