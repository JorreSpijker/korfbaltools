import type { SchotPoging, TegenDoelpunt } from "./types";

export interface Stand {
  eigen: number;
  tegenstander: number;
}

export function berekenStand(schotpogingen: SchotPoging[], tegendoelpunten: TegenDoelpunt[]): Stand {
  return {
    eigen: schotpogingen.filter((poging) => poging.resultaat === "raak").length,
    tegenstander: tegendoelpunten.length,
  };
}
