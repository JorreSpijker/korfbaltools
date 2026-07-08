import { eigenTeam } from "./eigen-team";
import { magOpstellen } from "./mag-opstellen";
import type { GespeeldeWedstrijd, TeamNiveau } from "./types";

export type SpelerStatus = "vrij" | "laatste_invalbeurt" | "zou_vastspelen_veroorzaken";

// Stoplicht-status voor de dashboard-spelerslijst (zie plan sectie "Flow"):
// beantwoordt "kan deze speler nú als invaller in het 1e team worden
// opgesteld, zonder vastspelen te veroorzaken?". Alleen relevant voor
// 2e-teamspelers — 1e-teamspelers mogen altijd afspelen in het 2e team.
export function bepaalSpelerStatus(input: {
  appearances: GespeeldeWedstrijd[];
  teamNiveau: TeamNiveau;
  eerstvolgendeSpeelweek: number;
  seasonPeriod: { totaalWedstrijden: number };
}): SpelerStatus {
  if (input.teamNiveau === 1) return "vrij";

  const fixture = { speelweek: input.eerstvolgendeSpeelweek };
  const huidig = magOpstellen({
    appearances: input.appearances,
    teamNiveau: 1,
    fixture,
    seasonPeriod: input.seasonPeriod,
  });
  if (!huidig.toegestaan) return "zou_vastspelen_veroorzaken";

  const eigenNu = eigenTeam(input.appearances);
  const simulatie: GespeeldeWedstrijd = {
    fixtureId: "__simulatie__",
    speelweek: input.eerstvolgendeSpeelweek,
    gespeeldInTeam: 1,
    minuten: 60,
    wedstrijdduur: 60,
  };
  const eigenNaSimulatie = eigenTeam([...input.appearances, simulatie]);

  if (eigenNu !== 1 && eigenNaSimulatie === 1) return "laatste_invalbeurt";
  return "vrij";
}
