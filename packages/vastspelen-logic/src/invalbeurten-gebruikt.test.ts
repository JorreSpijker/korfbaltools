import { describe, expect, it } from "vitest";
import { invalbeurtenGebruikt } from "./invalbeurten-gebruikt";
import type { GespeeldeWedstrijd, TeamNiveau } from "./types";

const wedstrijd = (speelweek: number, gespeeldInTeam: TeamNiveau, minuten = 60): GespeeldeWedstrijd => ({
  fixtureId: `w${speelweek}`,
  speelweek,
  gespeeldInTeam,
  minuten,
  wedstrijdduur: 60,
});

describe("invalbeurtenGebruikt", () => {
  it("is altijd 0 als eigen team het 1e team is", () => {
    expect(invalbeurtenGebruikt([wedstrijd(1, 1), wedstrijd(2, 1)], 1)).toBe(0);
  });

  it("telt appearances in team 1 voor een 2e-teamspeler", () => {
    const appearances = [wedstrijd(1, 2), wedstrijd(2, 1), wedstrijd(3, 1)];
    expect(invalbeurtenGebruikt(appearances, 2)).toBe(2);
  });

  it("negeert niet-gespeelde invalbeurten (minder dan 75% duur)", () => {
    const appearances = [wedstrijd(1, 1, 10), wedstrijd(2, 1, 60)];
    expect(invalbeurtenGebruikt(appearances, 2)).toBe(1);
  });

  it("telt appearances in het eigen team (2) niet mee", () => {
    const appearances = [wedstrijd(1, 2), wedstrijd(2, 2)];
    expect(invalbeurtenGebruikt(appearances, 2)).toBe(0);
  });
});
