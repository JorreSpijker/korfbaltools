const KEY = 'teamplanner_state'

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { players: [], teams: [] }
    return JSON.parse(raw)
  } catch {
    return { players: [], teams: [] }
  }
}

export function saveState(state) {
  localStorage.setItem(KEY, JSON.stringify(state))
}
