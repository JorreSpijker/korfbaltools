import type { SchotPoging, ScoreType } from "./types";

export interface SchotStatistiek {
  pogingen: number;
  raak: number;
  percentage: number;
}

export interface SpelerSchotStatistiek extends SchotStatistiek {
  schutterNaam: string;
  perScoreType: Record<ScoreType, SchotStatistiek>;
}

const SCORE_TYPES: ScoreType[] = ["afstand", "doorloop", "strafworp"];

function naarPercentage(raak: number, pogingen: number): number {
  return pogingen === 0 ? 0 : Math.round((raak / pogingen) * 100);
}

function berekenStatistiek(pogingen: SchotPoging[]): SchotStatistiek {
  const raak = pogingen.filter((poging) => poging.resultaat === "raak").length;
  return { pogingen: pogingen.length, raak, percentage: naarPercentage(raak, pogingen.length) };
}

export function berekenSchotpercentages(schotpogingen: SchotPoging[]): SpelerSchotStatistiek[] {
  const perSpeler = new Map<string, SchotPoging[]>();
  for (const poging of schotpogingen) {
    const bestaand = perSpeler.get(poging.schutterNaam) ?? [];
    bestaand.push(poging);
    perSpeler.set(poging.schutterNaam, bestaand);
  }

  return [...perSpeler.entries()].map(([schutterNaam, pogingen]) => {
    const perScoreType = Object.fromEntries(
      SCORE_TYPES.map((scoreType) => [
        scoreType,
        berekenStatistiek(pogingen.filter((poging) => poging.scoreType === scoreType)),
      ]),
    ) as Record<ScoreType, SchotStatistiek>;

    return { schutterNaam, ...berekenStatistiek(pogingen), perScoreType };
  });
}
