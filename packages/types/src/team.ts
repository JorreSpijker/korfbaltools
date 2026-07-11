export const TEAM_TYPES = ["jeugd", "senioren"] as const;

export type TeamType = (typeof TEAM_TYPES)[number];

export interface Team {
  id: string;
  clubId: string;
  naam: string;
  type: TeamType;
  categorie: string;
}
