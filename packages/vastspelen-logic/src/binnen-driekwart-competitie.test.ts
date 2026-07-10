import { describe, expect, it } from "vitest";
import { binnenDriekwartCompetitie } from "./binnen-driekwart-competitie";

describe("binnenDriekwartCompetitie", () => {
  const seasonPeriod = { totaalWedstrijden: 20 };

  it("is true ruim binnen de grens", () => {
    expect(binnenDriekwartCompetitie({ speelweek: 10 }, seasonPeriod)).toBe(true);
  });

  it("is true precies op de grens", () => {
    expect(binnenDriekwartCompetitie({ speelweek: 15 }, seasonPeriod)).toBe(true);
  });

  it("is false net na de grens", () => {
    expect(binnenDriekwartCompetitie({ speelweek: 16 }, seasonPeriod)).toBe(false);
  });
});
