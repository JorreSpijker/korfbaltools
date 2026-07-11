export type ScoreType = "afstand" | "doorloop" | "strafworp";
export type SchotResultaat = "raak" | "mis";
export type Helft = 1 | 2;

export interface SchotPoging {
  id: string;
  wedstrijdId: string;
  schutterNaam: string;
  helft: Helft;
  minuut: number;
  scoreType: ScoreType;
  resultaat: SchotResultaat;
  aangemaaktOp: string;
  gewijzigdOp: string;
}

export interface TegenDoelpunt {
  id: string;
  wedstrijdId: string;
  verdedigerNaam: string;
  helft: Helft;
  minuut: number;
  aangemaaktOp: string;
  gewijzigdOp: string;
}

export interface Wedstrijd {
  id: string;
  datum: string;
  tegenstander: string | null;
  teamNamen: string[];
  status: "bezig" | "afgerond";
  huidigeHelft: Helft;
  helftGestart: boolean;
}
