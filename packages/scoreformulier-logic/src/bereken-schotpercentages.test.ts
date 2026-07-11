import { describe, expect, it } from "vitest";
import { berekenSchotpercentages } from "./bereken-schotpercentages";
import type { SchotPoging } from "./types";

function maakPoging(overrides: Partial<SchotPoging>): SchotPoging {
  return {
    id: crypto.randomUUID(),
    wedstrijdId: "w1",
    schutterNaam: "Anna",
    helft: 1,
    minuut: 5,
    scoreType: "afstand",
    resultaat: "raak",
    aangemaaktOp: "2026-07-10T10:00:00.000Z",
    gewijzigdOp: "2026-07-10T10:00:00.000Z",
    ...overrides,
  };
}

describe("berekenSchotpercentages", () => {
  it("groepeert per schutter", () => {
    const result = berekenSchotpercentages([
      maakPoging({ schutterNaam: "Anna" }),
      maakPoging({ schutterNaam: "Bram" }),
    ]);
    expect(result.map((r) => r.schutterNaam).sort()).toEqual(["Anna", "Bram"]);
  });

  it("berekent totaalpercentage per speler", () => {
    const result = berekenSchotpercentages([
      maakPoging({ schutterNaam: "Anna", resultaat: "raak" }),
      maakPoging({ schutterNaam: "Anna", resultaat: "raak" }),
      maakPoging({ schutterNaam: "Anna", resultaat: "mis" }),
    ]);
    expect(result[0]).toMatchObject({ pogingen: 3, raak: 2, percentage: 67 });
  });

  it("berekent percentage per scoretype los", () => {
    const result = berekenSchotpercentages([
      maakPoging({ schutterNaam: "Anna", scoreType: "afstand", resultaat: "raak" }),
      maakPoging({ schutterNaam: "Anna", scoreType: "strafworp", resultaat: "mis" }),
    ]);
    expect(result[0]!.perScoreType.afstand).toEqual({ pogingen: 1, raak: 1, percentage: 100 });
    expect(result[0]!.perScoreType.strafworp).toEqual({ pogingen: 1, raak: 0, percentage: 0 });
    expect(result[0]!.perScoreType.doorloop).toEqual({ pogingen: 0, raak: 0, percentage: 0 });
  });

  it("geeft lege lijst zonder pogingen", () => {
    expect(berekenSchotpercentages([])).toEqual([]);
  });
});
