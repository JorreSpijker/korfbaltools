import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { DndContext, DragOverlay, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, arrayMove, rectSortingStrategy } from '@dnd-kit/sortable'
import TeamCard from './components/TeamCard'
import PlayerPool from './components/PlayerPool'
import AddTeamModal from './components/AddTeamModal'
import ImportModal from './components/ImportModal'
import PlayerCard from './components/PlayerCard'
import PlannerInfo from './components/PlannerInfo'
import { KorfbalToolBar } from '@korfbaltools/ui'
import CategoryInfo from './components/CategoryInfo'
import { loadState, saveState } from './utils/storage'
import { exportDocx } from './utils/exportDocx'
import { exportXlsx } from './utils/exportXlsx'

export default function App() {
  const [user, setUser] = useState(null)
  const [state, setState] = useState(() => loadState())
  const [activePlayer, setActivePlayer] = useState(null)
  const [showAddTeam, setShowAddTeam] = useState(false)
  const [activeTab, setActiveTab] = useState('jeugd')
  const [showImport, setShowImport] = useState(false)
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const exportMenuRef = useRef(null)
  const infoMenuRef = useRef(null)
  const stateRef = useRef(null)
  stateRef.current = state
  const selectedIdsRef = useRef(null)
  selectedIdsRef.current = selectedIds
  const stickyRef = useRef(null)

  useEffect(() => {
    // apps/main's middleware already blocks unauthenticated access to /teamplanner,
    // this only fetches who's logged in so the toolbar reflects it (see /api/me).
    fetch('/api/me')
      .then(res => res.ok ? res.json() : null)
      .then(data => setUser(data?.user ?? null))
      .catch(() => setUser(null))
  }, [])

  useEffect(() => {
    if (!showExportMenu) return
    const handler = (e) => {
      if (!exportMenuRef.current?.contains(e.target)) setShowExportMenu(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showExportMenu])

  useEffect(() => {
    if (!showInfo) return
    const handler = (e) => {
      if (!infoMenuRef.current?.contains(e.target)) setShowInfo(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showInfo])

  useEffect(() => {
    const el = stickyRef.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => {
      document.documentElement.style.setProperty('--sticky-top', `${Math.round(entry.contentRect.height)}px`)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  )

  const persist = useCallback((newState) => {
    setState(newState)
    saveState(newState)
  }, [])

  const assignedIds = useMemo(
    () => new Set(state.teams.flatMap(t => t.playerIds)),
    [state.teams]
  )
  const poolPlayers = useMemo(
    () => state.players.filter(p => !assignedIds.has(p.id)),
    [state.players, assignedIds]
  )
  const visibleTeams = useMemo(
    () => state.teams.filter(t => t.type === activeTab),
    [state.teams, activeTab]
  )

  const handleSelect = useCallback((playerId, shiftKey) => {
    if (!shiftKey) {
      setSelectedIds(prev => {
        if (prev.size === 1 && prev.has(playerId)) return new Set()
        return new Set([playerId])
      })
      return
    }
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(playerId)) next.delete(playerId)
      else next.add(playerId)
      return next
    })
  }, [])

  const handleDragStart = useCallback((event) => {
    const player = stateRef.current.players.find(p => p.id === event.active.data.current?.playerId)
    setActivePlayer(player ?? null)
  }, [])

  const handleDragEnd = useCallback((event) => {
    const { active, over } = event
    setActivePlayer(null)
    if (!over) return

    if (active.data.current?.type === 'team') {
      const activeTeamId = active.data.current.teamId
      const overTeamId = over.data.current?.teamId ?? over.data.current?.destTeamId ?? null
      if (!overTeamId || activeTeamId === overTeamId) return
      const currentState = stateRef.current
      const oldIndex = currentState.teams.findIndex(t => t.id === activeTeamId)
      const newIndex = currentState.teams.findIndex(t => t.id === overTeamId)
      if (oldIndex !== -1 && newIndex !== -1) {
        persist({ ...currentState, teams: arrayMove(currentState.teams, oldIndex, newIndex) })
      }
      return
    }

    const { playerId, sourceTeamId } = active.data.current
    const overData = over.data.current ?? {}
    const destTeamId = overData.destTeamId ?? over.id
    const overPlayerId = overData.overPlayerId ?? null

    if (destTeamId === 'pool' && sourceTeamId === null) return

    const currentState = stateRef.current
    const currentSelectedIds = selectedIdsRef.current
    const isDraggingSelected = currentSelectedIds.has(playerId)
    const toMove = isDraggingSelected ? [...currentSelectedIds] : [playerId]

    if (!isDraggingSelected && sourceTeamId && sourceTeamId === destTeamId && overPlayerId && overPlayerId !== playerId) {
      const newTeams = currentState.teams.map(team => {
        if (team.id !== sourceTeamId) return team
        const fromIndex = team.playerIds.indexOf(playerId)
        const toIndex = team.playerIds.indexOf(overPlayerId)
        if (fromIndex === -1 || toIndex === -1) return team

        const nextIds = [...team.playerIds]
        nextIds.splice(fromIndex, 1)
        const insertAt = fromIndex < toIndex ? toIndex - 1 : toIndex
        nextIds.splice(insertAt, 0, playerId)
        return { ...team, playerIds: nextIds }
      })

      persist({ ...currentState, teams: newTeams })
      return
    }

    if (destTeamId === sourceTeamId) return

    const sourceTeams = isDraggingSelected
      ? currentState.teams.reduce((acc, t) => {
          const hits = t.playerIds.filter(id => toMove.includes(id))
          if (hits.length) acc[t.id] = hits
          return acc
        }, {})
      : { [sourceTeamId]: [playerId] }

    const newTeams = currentState.teams.map(team => {
      let playerIds = [...team.playerIds]
      if (sourceTeams[team.id]) {
        playerIds = playerIds.filter(id => !sourceTeams[team.id].includes(id))
      }
      if (team.id === destTeamId) {
        toMove.forEach(id => { if (!playerIds.includes(id)) playerIds.push(id) })
      }
      return { ...team, playerIds }
    })

    setSelectedIds(new Set())
    persist({ ...currentState, teams: newTeams })
  }, [persist])

  const addTeam = (team) => persist({ ...state, teams: [...state.teams, { ...team, type: activeTab }] })

  const removeTeam = (teamId) => persist({
    ...state,
    teams: state.teams.filter(t => t.id !== teamId),
  })

  const updateTeam = (teamId, updates) => persist({
    ...state,
    teams: state.teams.map(t => t.id === teamId ? { ...t, ...updates } : t),
  })

  const handleNewPlan = (importedPlayers) => persist({ players: importedPlayers, teams: [] })

  const handleAddPlayers = (importedPlayers) => {
    const existingNames = new Set(state.players.map(p => p.name.toLowerCase()))
    const newPlayers = importedPlayers.filter(p => !existingNames.has(p.name.toLowerCase()))
    persist({ ...state, players: [...state.players, ...newPlayers] })
  }

  const handleImportJSON = (jsonState) => persist(jsonState)

  const handleUpdatePlayer = (updatedPlayer) => persist({
    ...state,
    players: state.players.map(p => p.id === updatedPlayer.id ? updatedPlayer : p),
  })

  const handleDeletePlayer = (playerId) => persist({
    ...state,
    players: state.players.filter(p => p.id !== playerId),
    teams: state.teams.map(t => ({ ...t, playerIds: t.playerIds.filter(id => id !== playerId) })),
  })

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'teamindeling.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="min-h-screen bg-white">
        <KorfbalToolBar user={user} />

        {/* Sticky shell — header + summary strip measured as one unit */}
        <div ref={stickyRef} className="sticky top-0 z-20 shadow-sm">
          <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
            <div className="max-w-screen-2xl mx-auto flex items-center justify-between gap-3 sm:gap-4 sm:px-6">
              <h1 className="text-lg font-bold text-gray-900 shrink-0">Teamindeling</h1>
              <div className="flex gap-2 flex-wrap justify-end items-center">
                <div className="relative" ref={infoMenuRef}>
                  <button
                    onClick={() => setShowInfo(v => !v)}
                    aria-label="Hulp en instructies"
                    aria-expanded={showInfo}
                    aria-controls="help-panel"
                    className={`w-11 h-11 text-sm rounded-full border font-semibold flex items-center justify-center transition-colors ${
                      showInfo
                        ? 'bg-gray-900 border-gray-900 text-white'
                        : 'bg-white border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-700'
                    }`}
                  >
                    <span aria-hidden="true">?</span>
                  </button>
                  {showInfo && (
                    <div id="help-panel" className="absolute right-0 mt-2 w-72 sm:w-80 z-20 shadow-lg rounded-xl">
                      <PlannerInfo />
                    </div>
                  )}
                </div>
                <div className="w-px h-5 bg-gray-200" />
                <button
                  onClick={() => setShowImport(true)}
                  className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700"
                >
                  <span className="hidden sm:inline">Nieuwe teamindeling</span>
                  <span className="sm:hidden">Importeren</span>
                </button>
                <div className="relative" ref={exportMenuRef}>
                  <button
                    onClick={() => setShowExportMenu(v => !v)}
                    disabled={state.teams.length === 0 && state.players.length === 0}
                    aria-haspopup="menu"
                    aria-expanded={showExportMenu}
                    className="px-3 py-1.5 text-sm bg-gray-800 text-white rounded-lg hover:bg-gray-900 font-medium disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    Exporteren
                    <span className="text-xs" aria-hidden="true">▾</span>
                  </button>
                  {showExportMenu && (
                    <div role="menu" aria-label="Exporteer als" className="absolute right-0 mt-1 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1">
                      <button
                        role="menuitem"
                        onClick={() => { exportXlsx(state); setShowExportMenu(false) }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Exporteer Excel
                      </button>
                      <button
                        role="menuitem"
                        onClick={() => { exportDocx(state); setShowExportMenu(false) }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Exporteer DOCX
                      </button>
                      <button
                        role="menuitem"
                        onClick={() => { exportJSON(); setShowExportMenu(false) }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Exporteer JSON
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>

          {/* Summary strip */}
          <div className="border-b border-gray-200 bg-gray-50 px-4 sm:px-6 py-3">
            <div className="max-w-screen-2xl mx-auto flex items-center gap-5 text-sm sm:px-6">
              <span className="text-gray-500">
                <span className="font-semibold text-gray-900 tabular-nums">{state.players.length}</span> spelers
              </span>
              <span className="text-gray-300" aria-hidden="true">·</span>
              <span className={poolPlayers.length > 0 ? 'text-amber-700' : 'text-gray-500'}>
                <span className={`font-semibold tabular-nums ${poolPlayers.length > 0 ? 'text-amber-700' : 'text-gray-900'}`}>
                  {poolPlayers.length}
                </span> onverdeeld
              </span>
              <span className="text-gray-300" aria-hidden="true">·</span>
              <span className="text-gray-500">
                <span className="font-semibold text-gray-900 tabular-nums">{state.teams.length}</span> teams
              </span>
            </div>
          </div>
        </div>

        <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 pt-6 pb-14 flex flex-col lg:flex-row gap-6">
          {/* Player pool + category info */}
          <div className="w-full lg:w-72 lg:shrink-0 flex flex-col gap-4">
            <div className="lg:sticky" style={{ top: 'var(--sticky-top, 8rem)' }}>
              <PlayerPool
                players={poolPlayers}
                selectedIds={selectedIds}
                onSelect={handleSelect}
                onAddPlayers={handleAddPlayers}
                onEditPlayer={handleUpdatePlayer}
                onDeletePlayer={handleDeletePlayer}
              />
              <div className="mt-3">
                <CategoryInfo />
              </div>
            </div>
          </div>

          {/* Teams */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-6">
              <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                {['jeugd', 'senioren'].map(tab => {
                  const count = state.teams.filter(t => t.type === tab).length
                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-1.5 text-sm rounded-md font-medium transition-colors ${
                        activeTab === tab ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      {count > 0 && (
                        <span className="ml-1.5 tabular-nums text-xs font-normal text-gray-400">{count}</span>
                      )}
                    </button>
                  )
                })}
              </div>
              <button
                onClick={() => setShowAddTeam(true)}
                className="px-3 py-1.5 text-sm bg-accent text-white rounded-lg hover:bg-accent-dark font-medium"
              >
                + Team
              </button>
            </div>

            <div key={activeTab} className="animate-content-in">
            {visibleTeams.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 rounded-xl border border-dashed border-gray-200 text-gray-400 gap-2">
                <span className="text-sm">
                  Nog geen {activeTab === 'senioren' ? 'senioren' : 'jeugd'} teams
                </span>
                <button
                  onClick={() => setShowAddTeam(true)}
                  className="text-sm text-accent hover:text-accent-dark font-medium"
                >
                  + Team toevoegen
                </button>
              </div>
            ) : (
              <SortableContext items={visibleTeams.map(t => t.id)} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(min(360px,100%),1fr))] gap-5">
                {visibleTeams.map(team => (
                  <TeamCard
                    key={team.id}
                    team={team}
                    players={state.players}
                    selectedIds={selectedIds}
                    onSelect={handleSelect}
                    onRemove={() => removeTeam(team.id)}
                    onUpdate={(updates) => updateTeam(team.id, updates)}
                    onEditPlayer={handleUpdatePlayer}
                  />
                ))}
              </div>
              </SortableContext>
            )}
            </div>
          </div>
        </main>
      </div>

      <DragOverlay dropAnimation={null}>
        {activePlayer && <PlayerCard player={activePlayer} isDragging />}
      </DragOverlay>

      {showAddTeam && (
        <AddTeamModal onAdd={addTeam} onClose={() => setShowAddTeam(false)} type={activeTab} />
      )}
      {showImport && (
        <ImportModal
          onNewPlan={handleNewPlan}
          onAddPlayers={handleAddPlayers}
          onImportJSON={handleImportJSON}
          onClose={() => setShowImport(false)}
        />
      )}
    </DndContext>
  )
}
