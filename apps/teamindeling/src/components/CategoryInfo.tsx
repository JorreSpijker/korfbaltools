export default function CategoryInfo() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <p className="text-sm font-semibold text-gray-700 mb-3">Categorie-eisen</p>
      <div className="flex flex-col gap-2.5">
        <div className="flex items-start gap-3">
          <span className="flex-shrink-0 w-5 h-5 rounded bg-gray-900 text-white text-[10px] font-bold flex items-center justify-center mt-0.5">A</span>
          <div className="text-sm text-gray-600 leading-relaxed">
            <span className="font-medium text-gray-700">Senioren:</span> ≥4 heren + ≥4 dames<br />
            <span className="font-medium text-gray-700">Jeugd:</span> U15 / U17 / U19
          </div>
        </div>
        <div className="h-px bg-gray-100" />
        <div className="flex items-start gap-3">
          <span className="flex-shrink-0 w-5 h-5 rounded bg-gray-200 text-gray-700 text-[10px] font-bold flex items-center justify-center mt-0.5">B</span>
          <div className="text-sm text-gray-600 leading-relaxed">
            <span className="font-medium text-gray-700">Senioren:</span> ≥8 spelers<br />
            <span className="font-medium text-gray-700">Jeugd:</span> 4-tal (max 2j) of 8-tal (max 3j)
          </div>
        </div>
        <div className="h-px bg-gray-100" />
        <div className="flex items-start gap-3">
          <span className="flex-shrink-0 w-5 h-5 rounded bg-gray-100 text-gray-600 text-[10px] font-bold flex items-center justify-center mt-0.5">C</span>
          <span className="text-sm text-gray-600 leading-relaxed">Geen eisen</span>
        </div>
      </div>
    </div>
  );
}
