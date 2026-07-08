import { heeftGespeeld } from "./heeft-gespeeld";
import type { GespeeldeWedstrijd, TeamNiveau } from "./types";

// Aantal keer dat een speler is opgesteld boven zijn eigen team (invalbeurt).
// Binnen de 1e/2e-scope is dat alleen relevant voor 2e-teamspelers die
// invallen in het 1e team — spelen in het eigen team of lager telt nooit mee.
export function invalbeurtenGebruikt(appearances: GespeeldeWedstrijd[], eigenTeamNiveau: TeamNiveau): number {
  if (eigenTeamNiveau === 1) return 0;

  return appearances.filter((appearance) => appearance.gespeeldInTeam === 1 && heeftGespeeld(appearance)).length;
}
