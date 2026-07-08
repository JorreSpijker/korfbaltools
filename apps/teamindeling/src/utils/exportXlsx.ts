import * as XLSX from "xlsx";
import type { PlannerState } from "@/types";

export function exportXlsx(state: PlannerState): void {
  const { players, teams } = state;

  const teamByPlayerId: Record<string, string> = {};
  for (const team of teams) {
    for (const id of team.playerIds) {
      teamByPlayerId[id] = team.name;
    }
  }

  const rows = players.map((p) => ({
    Naam: p.name,
    Geboortedatum: p.birthdate || "",
    Team: teamByPlayerId[p.id] || "",
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Teamindeling");
  XLSX.writeFile(wb, "teamindeling.xlsx");
}
