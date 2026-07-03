import { useState } from 'react'
import Modal from './Modal'

export default function AddTeamModal({ onAdd, onClose, type = 'senioren' }) {
  const [name, setName] = useState('')
  const [teamClass, setTeamClass] = useState('')
  const [category, setCategory] = useState('A')
  const [uCategory, setUCategory] = useState('U19')
  const [format, setFormat] = useState('8tal')

  const isJeugd = type === 'jeugd'

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    onAdd({
      id: crypto.randomUUID(),
      name: name.trim(),
      class: teamClass.trim(),
      category,
      ...(isJeugd && category === 'A' && { uCategory }),
      ...(isJeugd && category === 'B' && { format }),
      playerIds: [],
    })
    onClose()
  }

  return (
    <Modal titleId="add-team-title" onClose={onClose} className="p-6 w-96">
      <h2 id="add-team-title" className="text-lg font-bold text-gray-900 mb-4">Team toevoegen</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label htmlFor="team-name" className="block text-sm font-medium text-gray-700 mb-1">Naam *</label>
          <input
            id="team-name"
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="bijv. S1, J2"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            autoFocus
          />
        </div>
        <div>
          <label htmlFor="team-class" className="block text-sm font-medium text-gray-700 mb-1">Klasse</label>
          <input
            id="team-class"
            type="text"
            value={teamClass}
            onChange={e => setTeamClass(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
        <div>
          <label htmlFor="team-category" className="block text-sm font-medium text-gray-700 mb-1">Categorie</label>
          <select
            id="team-category"
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          >
            {isJeugd ? (
              <>
                <option value="A">A-categorie (wedstrijdkorfbal)</option>
                <option value="B">B-categorie (breedtekorfbal)</option>
                <option value="C">C-categorie (geen wedstrijden)</option>
              </>
            ) : (
              <>
                <option value="A">A-categorie (≥4 heren + ≥4 dames)</option>
                <option value="B">B-categorie (≥8 spelers)</option>
                <option value="C">C-categorie (geen wedstrijden)</option>
              </>
            )}
          </select>
        </div>

        {isJeugd && category === 'A' && (
          <div>
            <label htmlFor="team-ucategory" className="block text-sm font-medium text-gray-700 mb-1">Leeftijdscategorie</label>
            <select
              id="team-ucategory"
              value={uCategory}
              onChange={e => setUCategory(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="U19">U19 (geb. 2007–2008)</option>
              <option value="U17">U17 (geb. 2009–2010)</option>
              <option value="U15">U15 (geb. 2011–2012)</option>
            </select>
          </div>
        )}

        {isJeugd && category === 'B' && (
          <div>
            <label htmlFor="team-format" className="block text-sm font-medium text-gray-700 mb-1">Format</label>
            <select
              id="team-format"
              value={format}
              onChange={e => setFormat(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="8tal">8-tal (max 3 jaar bandbreedte)</option>
              <option value="4tal">4-tal (max 2 jaar bandbreedte)</option>
            </select>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">
            Annuleren
          </button>
          <button
            type="submit"
            disabled={!name.trim()}
            className="px-4 py-2 text-sm bg-accent text-white rounded-lg hover:bg-accent-dark font-medium disabled:opacity-50"
          >
            Toevoegen
          </button>
        </div>
      </form>
    </Modal>
  )
}
