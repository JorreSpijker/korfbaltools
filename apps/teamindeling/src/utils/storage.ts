import type { PlannerState } from "@/types";

const KEY = "teamindeling_state";

export function loadState(): PlannerState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { players: [], teams: [] };
    return JSON.parse(raw) as PlannerState;
  } catch {
    return { players: [], teams: [] };
  }
}

export function saveState(state: PlannerState): void {
  localStorage.setItem(KEY, JSON.stringify(state));
}
