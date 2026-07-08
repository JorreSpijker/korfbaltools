import { describe, expect, it } from "vitest";
import { bepaalSpelerStatus } from "./speler-status";
import type { GespeeldeWedstrijd, TeamNiveau } from "./types";

const wedstrijd = (speelweek: number, gespeeldInTeam: TeamNiveau, minuten = 60): GespeeldeWedstrijd => ({
  fixtureId: `w${speelweek}`,
  speelweek,
  gespeeldInTeam,
  minuten,
  wedstrijdduur: 60,
});

const seasonPeriod = { totaalWedstrijden: 20 };

describe("bepaalSpelerStatus", () => {
  it("is altijd vrij voor 1e-teamspelers", () => {
    const status = bepaalSpelerStatus({
      appearances: [wedstrijd(1, 1), wedstrijd(2, 1), wedstrijd(3, 1)],
      teamNiveau: 1,
      eerstvolgendeSpeelweek: 4,
      seasonPeriod,
    });
    expect(status).toBe("vrij");
  });

  it("is vrij voor een 2e-teamspeler zonder invalgeschiedenis", () => {
    const status = bepaalSpelerStatus({
      appearances: [wedstrijd(1, 2), wedstrijd(2, 2), wedstrijd(3, 2)],
      teamNiveau: 2,
      eerstvolgendeSpeelweek: 4,
      seasonPeriod,
    });
    expect(status).toBe("vrij");
  });

  it("is laatste_invalbeurt als nog één keer invallen het eigen team laat verschuiven", () => {
    // laatste 3 gespeeld: team2, team2, team1 -> eigen team nu nog 2 (2/3 >= 65%).
    // Nog één invalbeurt (team1) erbij zou de nieuwe laatste 3 (team2, team1, team1)
    // op 1/3 in team2 brengen (< 65%) -> eigen team verschuift naar 1.
    const status = bepaalSpelerStatus({
      appearances: [wedstrijd(1, 2), wedstrijd(2, 2), wedstrijd(3, 1)],
      teamNiveau: 2,
      eerstvolgendeSpeelweek: 4,
      seasonPeriod,
    });
    expect(status).toBe("laatste_invalbeurt");
  });

  it("zou vastspelen veroorzaken na driekwart van de competitie", () => {
    const status = bepaalSpelerStatus({
      appearances: [wedstrijd(1, 2), wedstrijd(2, 2), wedstrijd(3, 2)],
      teamNiveau: 2,
      eerstvolgendeSpeelweek: 16,
      seasonPeriod,
    });
    expect(status).toBe("zou_vastspelen_veroorzaken");
  });
});
