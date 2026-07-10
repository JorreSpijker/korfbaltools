import { describe, expect, it } from "vitest";
import { gespeeldeWedstrijden } from "./gespeelde-wedstrijden";
import type { GespeeldeWedstrijd } from "./types";

const wedstrijd = (speelweek: number, minuten: number, gespeeldInTeam: 1 | 2 = 2): GespeeldeWedstrijd => ({
  fixtureId: `w${speelweek}`,
  speelweek,
  gespeeldInTeam,
  minuten,
  wedstrijdduur: 60,
});

describe("gespeeldeWedstrijden", () => {
  it("filtert niet-gespeelde wedstrijden eruit", () => {
    const result = gespeeldeWedstrijden([wedstrijd(1, 60), wedstrijd(2, 10)]);
    expect(result.map((w) => w.speelweek)).toEqual([1]);
  });

  it("sorteert oplopend op speelweek", () => {
    const result = gespeeldeWedstrijden([wedstrijd(3, 60), wedstrijd(1, 60), wedstrijd(2, 60)]);
    expect(result.map((w) => w.speelweek)).toEqual([1, 2, 3]);
  });

  it("respecteert totSpeelweek als peildatum", () => {
    const result = gespeeldeWedstrijden([wedstrijd(1, 60), wedstrijd(2, 60), wedstrijd(3, 60)], 2);
    expect(result.map((w) => w.speelweek)).toEqual([1, 2]);
  });
});
