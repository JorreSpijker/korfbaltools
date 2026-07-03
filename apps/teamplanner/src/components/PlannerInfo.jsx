export default function PlannerInfo() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <p className="text-sm font-semibold text-gray-700 mb-3">Aan de slag</p>
      <ol className="flex flex-col gap-3">
        <li className="flex gap-3 items-start">
          <span className="flex-shrink-0 w-5 h-5 rounded-full border border-gray-300 text-gray-500 text-[10px] font-semibold flex items-center justify-center mt-0.5">1</span>
          <span className="text-sm text-gray-600 leading-relaxed">Importeer je spelerslijst via <strong className="text-gray-800 font-medium">+ Excel</strong> in de spelerspool. In de Excel hebben we drie kolommen nodig: naam, geboortedatum en geslacht</span>
        </li>
        <li className="flex gap-3 items-start">
          <span className="flex-shrink-0 w-5 h-5 rounded-full border border-gray-300 text-gray-500 text-[10px] font-semibold flex items-center justify-center mt-0.5">2</span>
          <span className="text-sm text-gray-600 leading-relaxed">Maak teams aan en sleep spelers van de lijst naar een team</span>
        </li>
        <li className="flex gap-3 items-start">
          <span className="flex-shrink-0 w-5 h-5 rounded-full border border-gray-300 text-gray-500 text-[10px] font-semibold flex items-center justify-center mt-0.5">3</span>
          <span className="text-sm text-gray-600 leading-relaxed">Controleer de status per team en wijzig waar nodig</span>
        </li>
        <li className="flex gap-3 items-start">
          <span className="flex-shrink-0 w-5 h-5 rounded-full border border-gray-300 text-gray-500 text-[10px] font-semibold flex items-center justify-center mt-0.5">4</span>
          <span className="text-sm text-gray-600 leading-relaxed">Exporteer de indeling als Excel, DOCX of JSON. De volgende keer kan je de JSON weer inladen om verder te gaan</span>
        </li>
      </ol>
      <p className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400 leading-relaxed">Shift+klik om meerdere spelers tegelijk te selecteren. Validatie wordt automatisch gecontroleerd.</p>
    </div>
  )
}
