"use client";

import { useEffect, useReducer, useState } from "react";
import {
  LEGE_MATCH_STATE,
  matchReducer,
  type SchotPoging,
  type TegenDoelpunt,
  type Wedstrijd,
} from "@korfbaltools/scoreformulier-logic";
import {
  deleteSchotPoging,
  deleteTegenDoelpunt,
  getWedstrijd,
  listSchotpogingen,
  listTegendoelpunten,
  patchWedstrijd,
  saveSchotPoging,
  saveTegenDoelpunt,
  saveWedstrijd,
} from "./db";

export function useMatch(wedstrijdId: string) {
  const [state, dispatch] = useReducer(matchReducer, LEGE_MATCH_STATE);
  const [wedstrijd, setWedstrijd] = useState<Wedstrijd | null>(null);
  const [geladen, setGeladen] = useState(false);

  useEffect(() => {
    let actief = true;
    void (async () => {
      const [geladenWedstrijd, schotpogingen, tegendoelpunten] = await Promise.all([
        getWedstrijd(wedstrijdId),
        listSchotpogingen(wedstrijdId),
        listTegendoelpunten(wedstrijdId),
      ]);
      if (!actief || !geladenWedstrijd) return;
      dispatch({
        type: "INIT",
        state: {
          huidigeHelft: geladenWedstrijd.huidigeHelft,
          helftGestart: geladenWedstrijd.helftGestart,
          schotpogingen,
          tegendoelpunten,
        },
      });
      setWedstrijd(geladenWedstrijd);
      setGeladen(true);
    })();
    return () => {
      actief = false;
    };
  }, [wedstrijdId]);

  async function startHelft() {
    dispatch({ type: "START_HELFT" });
    await patchWedstrijd(wedstrijdId, { helftGestart: true });
  }

  async function pauzeHelft() {
    dispatch({ type: "PAUZE_HELFT" });
    await patchWedstrijd(wedstrijdId, { helftGestart: false });
  }

  async function helftwissel() {
    const volgendeHelft = state.huidigeHelft === 1 ? 2 : 1;
    dispatch({ type: "HELFTWISSEL" });
    await patchWedstrijd(wedstrijdId, { huidigeHelft: volgendeHelft, helftGestart: false });
  }

  async function voegSchotPogingToe(poging: SchotPoging) {
    dispatch({ type: "ADD_SCHOTPOGING", poging });
    await saveSchotPoging(poging);
  }

  async function wijzigSchotPoging(poging: SchotPoging) {
    dispatch({ type: "EDIT_SCHOTPOGING", poging });
    await saveSchotPoging(poging);
  }

  async function verwijderSchotPoging(id: string) {
    dispatch({ type: "DELETE_SCHOTPOGING", id });
    await deleteSchotPoging(id);
  }

  async function voegTegenDoelpuntToe(doelpunt: TegenDoelpunt) {
    dispatch({ type: "ADD_TEGENDOELPUNT", doelpunt });
    await saveTegenDoelpunt(doelpunt);
  }

  async function wijzigTegenDoelpunt(doelpunt: TegenDoelpunt) {
    dispatch({ type: "EDIT_TEGENDOELPUNT", doelpunt });
    await saveTegenDoelpunt(doelpunt);
  }

  async function verwijderTegenDoelpunt(id: string) {
    dispatch({ type: "DELETE_TEGENDOELPUNT", id });
    await deleteTegenDoelpunt(id);
  }

  async function rondAf() {
    if (!wedstrijd) return;
    const bijgewerkt: Wedstrijd = { ...wedstrijd, status: "afgerond" };
    await saveWedstrijd(bijgewerkt);
    setWedstrijd(bijgewerkt);
  }

  return {
    wedstrijd,
    state,
    geladen,
    startHelft,
    pauzeHelft,
    helftwissel,
    voegSchotPogingToe,
    wijzigSchotPoging,
    verwijderSchotPoging,
    voegTegenDoelpuntToe,
    wijzigTegenDoelpunt,
    verwijderTegenDoelpunt,
    rondAf,
  };
}
