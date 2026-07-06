export type Gender = "m" | "f";
export type TeamType = "jeugd" | "senioren";
export type TeamCategory = "A" | "B" | "C";
export type UCategory = "U19" | "U17" | "U15";
export type TeamFormat = "4tal" | "8tal";

export interface Player {
  id: string;
  name: string;
  birthdate: string;
  gender: Gender;
}

export interface Team {
  id: string;
  name: string;
  class: string;
  type: TeamType;
  category: TeamCategory;
  uCategory?: UCategory;
  format?: TeamFormat;
  playerIds: string[];
}

export interface PlannerState {
  players: Player[];
  teams: Team[];
}
