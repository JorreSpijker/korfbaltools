import { describe, expect, it } from "vitest";
import { magOpstellen } from "./mag-opstellen";
import type { GespeeldeWedstrijd, MagOpstellenInput, TeamNiveau } from "./types";

const wedstrijd = (speelweek: number, gespeeldInTeam: TeamNiveau, minuten = 60): GespeeldeWedstrijd => ({
  fixtureId: `w${speelweek}`,
  speelweek,
  gespeeldInTeam,
  minuten,
  wedstrijdduur: 60,
});

const basisInput = (overrides: Partial<MagOpstellenInput> = {}): MagOpstellenInput => ({
  appearances: [],
  teamNiveau: 1,
  fixture: { speelweek: 5 },
  seasonPeriod: { totaalWedstrijden: 20 },
  ...overrides,
});

describe("magOpstellen", () => {
  it("staat toe zolang er nog geen eigen team is vastgesteld", () => {
    const result = magOpstellen(basisInput({ appearances: [wedstrijd(1, 2)] }));
    expect(result.toegestaan).toBe(true);
  });

  it("staat toe wanneer speler in eigen team speelt", () => {
    const appearances = [wedstrijd(1, 2), wedstrijd(2, 2), wedstrijd(3, 2)];
    const result = magOpstellen(basisInput({ appearances, teamNiveau: 2 }));
    expect(result.toegestaan).toBe(true);
  });

  it("staat een 2e-teamspeler toe om in te vallen in het 1e team, binnen de grenzen", () => {
    const appearances = [wedstrijd(1, 2), wedstrijd(2, 2), wedstrijd(3, 2)];
    const result = magOpstellen(basisInput({ appearances, teamNiveau: 1, invallersAlOpgesteldDitDuel: 1 }));
    expect(result.toegestaan).toBe(true);
  });

  it("weigert een 3e invaller vanuit het 2e team voor dezelfde wedstrijd", () => {
    const appearances = [wedstrijd(1, 2), wedstrijd(2, 2), wedstrijd(3, 2)];
    const result = magOpstellen(basisInput({ appearances, teamNiveau: 1, invallersAlOpgesteldDitDuel: 2 }));
    expect(result.toegestaan).toBe(false);
  });

  it("weigert invallen vanuit het 2e team na driekwart van de competitie", () => {
    const appearances = [wedstrijd(1, 2), wedstrijd(2, 2), wedstrijd(3, 2)];
    const result = magOpstellen(
      basisInput({ appearances, teamNiveau: 1, fixture: { speelweek: 16 }, seasonPeriod: { totaalWedstrijden: 20 } }),
    );
    expect(result.toegestaan).toBe(false);
  });

  it("staat een 1e-teamspeler altijd toe om af te spelen in het 2e team", () => {
    const appearances = [wedstrijd(1, 1), wedstrijd(2, 1), wedstrijd(3, 1)];
    const result = magOpstellen(basisInput({ appearances, teamNiveau: 2 }));
    expect(result.toegestaan).toBe(true);
  });
});
