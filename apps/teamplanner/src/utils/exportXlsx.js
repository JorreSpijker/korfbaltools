import * as XLSX from 'xlsx'

export function exportXlsx(state) {
  const { players, teams } = state

  const teamByPlayerId = {}
  for (const team of teams) {
    for (const id of team.playerIds) {
      teamByPlayerId[id] = team.name
    }
  }

  const rows = players.map(p => ({
    Naam: p.name,
    Geboortedatum: p.birthdate || '',
    Team: teamByPlayerId[p.id] || '',
  }))

  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Teamindeling')
  XLSX.writeFile(wb, 'teamindeling.xlsx')
}
