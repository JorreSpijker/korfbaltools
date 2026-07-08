import { describe, expect, it } from "vitest";
import { eigenTeam } from "./eigen-team";
import type { GespeeldeWedstrijd, TeamNiveau } from "./types";

const wedstrijd = (speelweek: number, gespeeldInTeam: TeamNiveau, minuten = 60): GespeeldeWedstrijd => ({
  fixtureId: `w${speelweek}`,
  speelweek,
  gespeeldInTeam,
  minuten,
  wedstrijdduur: 60,
});

describe("eigenTeam", () => {
  it("is null met minder dan 3 gespeelde wedstrijden", () => {
    expect(eigenTeam([wedstrijd(1, 2), wedstrijd(2, 2)])).toBeNull();
  });

  it("is team 2 bij 3 van de 3 in team 2", () => {
    expect(eigenTeam([wedstrijd(1, 2), wedstrijd(2, 2), wedstrijd(3, 2)])).toBe(2);
  });

  it("is team 2 bij 2 van de 3 in team 2 (2/3 >= 65%)", () => {
    expect(eigenTeam([wedstrijd(1, 2), wedstrijd(2, 2), wedstrijd(3, 1)])).toBe(2);
  });

  it("is team 1 bij 1 van de 3 in team 2 (1/3 < 65%)", () => {
    expect(eigenTeam([wedstrijd(1, 2), wedstrijd(2, 1), wedstrijd(3, 1)])).toBe(1);
  });

  it("is team 1 bij 0 van de 3 in team 2", () => {
    expect(eigenTeam([wedstrijd(1, 1), wedstrijd(2, 1), wedstrijd(3, 1)])).toBe(1);
  });

  it("kijkt alleen naar de laatste 3 gespeelde wedstrijden", () => {
    const appearances = [
      wedstrijd(1, 2),
      wedstrijd(2, 2),
      wedstrijd(3, 2),
      wedstrijd(4, 1),
      wedstrijd(5, 1),
      wedstrijd(6, 1),
    ];
    expect(eigenTeam(appearances)).toBe(1);
  });

  it("negeert niet-gespeelde wedstrijden (minder dan 75% duur)", () => {
    const appearances = [wedstrijd(1, 2), wedstrijd(2, 2), wedstrijd(3, 2, 10), wedstrijd(4, 1)];
    // wedstrijd 3 telt niet mee (10/60 < 75%), dus laatste 3 gespeelde zijn 1,2,4
    // (team 2, team 2, team 1) -> 2/3 in team 2 (>= 65%) -> eigen team 2
    expect(eigenTeam(appearances)).toBe(2);
  });

  it("respecteert totSpeelweek als peildatum", () => {
    const appearances = [wedstrijd(1, 2), wedstrijd(2, 2), wedstrijd(3, 2), wedstrijd(4, 1)];
    expect(eigenTeam(appearances, 3)).toBe(2);
  });
});
