import type { Helft, SchotPoging, TegenDoelpunt } from "./types";

export interface MatchState {
  huidigeHelft: Helft;
  helftGestart: boolean;
  schotpogingen: SchotPoging[];
  tegendoelpunten: TegenDoelpunt[];
}

export const LEGE_MATCH_STATE: MatchState = {
  huidigeHelft: 1,
  helftGestart: false,
  schotpogingen: [],
  tegendoelpunten: [],
};

export type MatchAction =
  | { type: "INIT"; state: MatchState }
  | { type: "START_HELFT" }
  | { type: "PAUZE_HELFT" }
  | { type: "HELFTWISSEL" }
  | { type: "ADD_SCHOTPOGING"; poging: SchotPoging }
  | { type: "EDIT_SCHOTPOGING"; poging: SchotPoging }
  | { type: "DELETE_SCHOTPOGING"; id: string }
  | { type: "ADD_TEGENDOELPUNT"; doelpunt: TegenDoelpunt }
  | { type: "EDIT_TEGENDOELPUNT"; doelpunt: TegenDoelpunt }
  | { type: "DELETE_TEGENDOELPUNT"; id: string };

export function matchReducer(state: MatchState, action: MatchAction): MatchState {
  switch (action.type) {
    case "INIT":
      return action.state;
    case "START_HELFT":
      return { ...state, helftGestart: true };
    case "PAUZE_HELFT":
      return { ...state, helftGestart: false };
    case "HELFTWISSEL":
      return { ...state, huidigeHelft: state.huidigeHelft === 1 ? 2 : 1, helftGestart: false };
    case "ADD_SCHOTPOGING":
      return { ...state, schotpogingen: [...state.schotpogingen, action.poging] };
    case "EDIT_SCHOTPOGING":
      return {
        ...state,
        schotpogingen: state.schotpogingen.map((poging) =>
          poging.id === action.poging.id ? action.poging : poging,
        ),
      };
    case "DELETE_SCHOTPOGING":
      return { ...state, schotpogingen: state.schotpogingen.filter((poging) => poging.id !== action.id) };
    case "ADD_TEGENDOELPUNT":
      return { ...state, tegendoelpunten: [...state.tegendoelpunten, action.doelpunt] };
    case "EDIT_TEGENDOELPUNT":
      return {
        ...state,
        tegendoelpunten: state.tegendoelpunten.map((doelpunt) =>
          doelpunt.id === action.doelpunt.id ? action.doelpunt : doelpunt,
        ),
      };
    case "DELETE_TEGENDOELPUNT":
      return {
        ...state,
        tegendoelpunten: state.tegendoelpunten.filter((doelpunt) => doelpunt.id !== action.id),
      };
  }
}
