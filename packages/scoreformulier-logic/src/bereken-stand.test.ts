import { describe, expect, it } from "vitest";
import { berekenStand } from "./bereken-stand";
import type { SchotPoging, TegenDoelpunt } from "./types";

function maakPoging(resultaat: "raak" | "mis"): SchotPoging {
  return {
    id: crypto.randomUUID(),
    wedstrijdId: "w1",
    schutterNaam: "Anna",
    helft: 1,
    minuut: 5,
    scoreType: "afstand",
    resultaat,
    aangemaaktOp: "2026-07-10T10:00:00.000Z",
    gewijzigdOp: "2026-07-10T10:00:00.000Z",
  };
}

function maakTegenDoelpunt(): TegenDoelpunt {
  return {
    id: crypto.randomUUID(),
    wedstrijdId: "w1",
    verdedigerNaam: "Bram",
    helft: 1,
    minuut: 6,
    aangemaaktOp: "2026-07-10T10:00:00.000Z",
    gewijzigdOp: "2026-07-10T10:00:00.000Z",
  };
}

describe("berekenStand", () => {
  it("telt alleen raak mee voor eigen team", () => {
    const stand = berekenStand([maakPoging("raak"), maakPoging("mis"), maakPoging("raak")], []);
    expect(stand.eigen).toBe(2);
  });

  it("telt elk tegendoelpunt mee voor tegenstander", () => {
    const stand = berekenStand([], [maakTegenDoelpunt(), maakTegenDoelpunt()]);
    expect(stand.tegenstander).toBe(2);
  });

  it("geeft 0-0 zonder acties", () => {
    expect(berekenStand([], [])).toEqual({ eigen: 0, tegenstander: 0 });
  });
});
