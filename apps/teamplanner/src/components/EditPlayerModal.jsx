import { useState } from 'react'
import Modal from './Modal'

export default function EditPlayerModal({ player, onSave, onDelete, onClose }) {
  const [name, setName] = useState(player.name)
  const [birthdate, setBirthdate] = useState(player.birthdate || '')
  const [gender, setGender] = useState(player.gender || 'm')
  const [confirmDelete, setConfirmDelete] = useState(false)

  const handleSave = () => {
    const trimmed = name.trim()
    if (!trimmed) return
    onSave({ ...player, name: trimmed, birthdate, gender })
    onClose()
  }

  const handleDelete = () => {
    onDelete(player.id)
    onClose()
  }

  return (
    <Modal titleId="edit-player-title" onClose={onClose} className="p-6 w-80">
      <h2 id="edit-player-title" className="text-base font-bold text-gray-900 mb-4">Speler aanpassen</h2>

      <div className="flex flex-col gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-gray-600">Naam</span>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            autoFocus
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-gray-600">Geboortedatum</span>
          <input
            type="date"
            value={birthdate}
            onChange={e => setBirthdate(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-gray-600">Geslacht</span>
          <select
            value={gender}
            onChange={e => setGender(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="m">♂ Man</option>
            <option value="f">♀ Vrouw</option>
          </select>
        </label>
      </div>

      <div className="flex justify-between mt-5">
        {onDelete ? (
          confirmDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Definitief verwijderen?</span>
              <button
                onClick={handleDelete}
                className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
              >
                Ja
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700"
              >
                Nee
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="px-3 py-1.5 text-sm text-red-600 hover:text-red-800 font-medium"
            >
              Verwijderen
            </button>
          )
        ) : <span />}
        <div className="flex gap-2">
          <button onClick={onClose} className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700">
            Annuleren
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="px-4 py-1.5 text-sm bg-accent text-white rounded-lg hover:bg-accent-dark font-medium disabled:opacity-40"
          >
            Opslaan
          </button>
        </div>
      </div>
    </Modal>
  )
}
