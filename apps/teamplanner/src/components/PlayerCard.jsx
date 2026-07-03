import { useState } from 'react'
import { useDraggable, useDroppable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import EditPlayerModal from './EditPlayerModal'
import { calculateAgeYears } from '../utils/dateUtils'

function displayAge(birthdate) {
  const age = calculateAgeYears(birthdate)
  return age === null ? '?' : Math.floor(age)
}

export default function PlayerCard({ player, sourceTeamId, isDragging: isOverlay, isSelected, onSelect, onEditPlayer, onDeletePlayer }) {
  const { attributes, listeners, setNodeRef: setDragRef, transform, isDragging } = useDraggable({
    id: `player-${player.id}`,
    data: { playerId: player.id, sourceTeamId: sourceTeamId ?? null },
    disabled: isOverlay,
  })

  const { setNodeRef: setDropRef, isOver: isDropOver } = useDroppable({
    id: `player-drop-${player.id}`,
    disabled: !sourceTeamId || isOverlay,
    data: { destTeamId: sourceTeamId, overPlayerId: player.id },
  })

  const [showEdit, setShowEdit] = useState(false)

  const combinedRef = (node) => { setDragRef(node); setDropRef(node) }

  const style = isOverlay ? {} : { transform: CSS.Translate.toString(transform) }
  const genderColor = player.gender === 'f'
    ? 'bg-pink-50 border-pink-200 text-pink-900'
    : 'bg-blue-50 border-blue-200 text-blue-900'

  const handleClick = (e) => {
    if (!onSelect) return
    onSelect(player.id, e.shiftKey)
  }

  const handleEditClick = (e) => {
    e.stopPropagation()
    setShowEdit(true)
  }

  return (
    <>
      <div
        ref={combinedRef}
        style={style}
        {...listeners}
        {...attributes}
        onClick={handleClick}
        className={`group flex items-center gap-2 px-3 py-2 rounded-lg border text-sm touch-none select-none transition-all ${
          isSelected
            ? 'bg-yellow-100 border-yellow-400 text-yellow-900 ring-2 ring-yellow-300'
            : genderColor
        } ${
          isDragging ? 'opacity-30' : 'cursor-grab active:cursor-grabbing'
        } ${isDropOver && !isDragging ? 'border-t-2 border-t-accent' : ''} ${isOverlay ? 'shadow-xl cursor-grabbing rotate-1 scale-[1.03] ring-1 ring-black/[0.06]' : ''}`}
      >
        <span className="font-medium flex-1 min-w-0 truncate">{player.name}</span>
        <span className={`text-xs tabular-nums ${isSelected ? 'text-yellow-800' : player.gender === 'f' ? 'text-pink-700' : 'text-blue-700'}`}>
          {displayAge(player.birthdate)}j
        </span>
        <span className={`text-xs ${isSelected ? 'text-yellow-700' : player.gender === 'f' ? 'text-pink-700' : 'text-blue-600'}`}>
          {player.gender === 'f' ? '♀' : '♂'}
        </span>
        {onEditPlayer && (
          <button
            onPointerDown={e => e.stopPropagation()}
            onClick={handleEditClick}
            className="opacity-0 group-hover:opacity-60 hover:!opacity-100 focus:opacity-100 text-xs leading-none ml-1 transition-opacity rounded"
            aria-label={`Bewerk ${player.name}`}
          >
            ✎
          </button>
        )}
      </div>

      {showEdit && (
        <EditPlayerModal
          player={player}
          onSave={onEditPlayer}
          onDelete={onDeletePlayer}
          onClose={() => setShowEdit(false)}
        />
      )}
    </>
  )
}
