// Max. 2 invallers-per-wedstrijd-regel geldt alleen tot en met driekwart van
// de competitie (zie plan sectie "Uitgangspunten").
export function binnenDriekwartCompetitie(
  fixture: { speelweek: number },
  seasonPeriod: { totaalWedstrijden: number },
): boolean {
  return fixture.speelweek <= seasonPeriod.totaalWedstrijden * 0.75;
}
