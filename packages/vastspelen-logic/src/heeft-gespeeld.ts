import type { GespeeldeWedstrijd } from "./types";

// "Gespeeld" = minimaal 75% van de wedstrijdduur (KNKV A-categorie regel).
export function heeftGespeeld(appearance: Pick<GespeeldeWedstrijd, "minuten" | "wedstrijdduur">): boolean {
  return appearance.minuten / appearance.wedstrijdduur >= 0.75;
}
