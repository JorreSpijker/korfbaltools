import { describe, expect, it } from "vitest";
import { LEGE_MATCH_STATE, matchReducer } from "./match-reducer";
import type { SchotPoging, TegenDoelpunt } from "./types";

function maakPoging(id: string): SchotPoging {
  return {
    id,
    wedstrijdId: "w1",
    schutterNaam: "Anna",
    helft: 1,
    minuut: 5,
    scoreType: "afstand",
    resultaat: "raak",
    aangemaaktOp: "2026-07-10T10:00:00.000Z",
    gewijzigdOp: "2026-07-10T10:00:00.000Z",
  };
}

function maakDoelpunt(id: string): TegenDoelpunt {
  return {
    id,
    wedstrijdId: "w1",
    verdedigerNaam: "Bram",
    helft: 1,
    minuut: 6,
    aangemaaktOp: "2026-07-10T10:00:00.000Z",
    gewijzigdOp: "2026-07-10T10:00:00.000Z",
  };
}

describe("matchReducer", () => {
  it("INIT vervangt de volledige state", () => {
    const nieuweState = { ...LEGE_MATCH_STATE, huidigeHelft: 2 as const };
    expect(matchReducer(LEGE_MATCH_STATE, { type: "INIT", state: nieuweState })).toEqual(nieuweState);
  });

  it("START_HELFT en PAUZE_HELFT togglen helftGestart", () => {
    const gestart = matchReducer(LEGE_MATCH_STATE, { type: "START_HELFT" });
    expect(gestart.helftGestart).toBe(true);
    expect(matchReducer(gestart, { type: "PAUZE_HELFT" }).helftGestart).toBe(false);
  });

  it("HELFTWISSEL wisselt helft en zet helftGestart uit", () => {
    const gestart = matchReducer(LEGE_MATCH_STATE, { type: "START_HELFT" });
    const gewisseld = matchReducer(gestart, { type: "HELFTWISSEL" });
    expect(gewisseld.huidigeHelft).toBe(2);
    expect(gewisseld.helftGestart).toBe(false);
  });

  it("ADD_SCHOTPOGING voegt toe zonder bestaande te muteren", () => {
    const state = matchReducer(LEGE_MATCH_STATE, { type: "ADD_SCHOTPOGING", poging: maakPoging("p1") });
    expect(state.schotpogingen).toHaveLength(1);
    expect(LEGE_MATCH_STATE.schotpogingen).toHaveLength(0);
  });

  it("EDIT_SCHOTPOGING vervangt de poging met matchend id", () => {
    const metPoging = matchReducer(LEGE_MATCH_STATE, { type: "ADD_SCHOTPOGING", poging: maakPoging("p1") });
    const gewijzigd = matchReducer(metPoging, {
      type: "EDIT_SCHOTPOGING",
      poging: { ...maakPoging("p1"), resultaat: "mis" },
    });
    expect(gewijzigd.schotpogingen[0]!.resultaat).toBe("mis");
  });

  it("DELETE_SCHOTPOGING verwijdert op id", () => {
    const metPoging = matchReducer(LEGE_MATCH_STATE, { type: "ADD_SCHOTPOGING", poging: maakPoging("p1") });
    const verwijderd = matchReducer(metPoging, { type: "DELETE_SCHOTPOGING", id: "p1" });
    expect(verwijderd.schotpogingen).toHaveLength(0);
  });

  it("ADD_/EDIT_/DELETE_TEGENDOELPUNT werken hetzelfde", () => {
    const metDoelpunt = matchReducer(LEGE_MATCH_STATE, { type: "ADD_TEGENDOELPUNT", doelpunt: maakDoelpunt("d1") });
    expect(metDoelpunt.tegendoelpunten).toHaveLength(1);
    const gewijzigd = matchReducer(metDoelpunt, {
      type: "EDIT_TEGENDOELPUNT",
      doelpunt: { ...maakDoelpunt("d1"), verdedigerNaam: "Chris" },
    });
    expect(gewijzigd.tegendoelpunten[0]!.verdedigerNaam).toBe("Chris");
    const verwijderd = matchReducer(gewijzigd, { type: "DELETE_TEGENDOELPUNT", id: "d1" });
    expect(verwijderd.tegendoelpunten).toHaveLength(0);
  });
});
