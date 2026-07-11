export const GENDERS = ["m", "v"] as const;

export type Gender = (typeof GENDERS)[number];

export interface Player {
  id: string;
  clubId: string;
  naam: string;
  geslacht: Gender;
  teamId: string | null;
}
