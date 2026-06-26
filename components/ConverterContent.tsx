import React, { useState, useMemo } from 'react';

type Category = 'speed' | 'distance' | 'volume';

interface UnitDef {
  id: string;
  name: string;
  symbol: string;
  toBase: number; // conversion factor to base unit (km/h, m, L)
}

const UNITS: Record<Category, UnitDef[]> = {
  speed: [
    { id: 'kt', name: 'Nœuds', symbol: 'kt', toBase: 1.852 },
    { id: 'kmh', name: 'Kilomètres / heure', symbol: 'km/h', toBase: 1 },
    { id: 'mph', name: 'Miles / heure', symbol: 'mph', toBase: 1.60934 }
  ],
  distance: [
    { id: 'nm', name: 'Milles Nautiques', symbol: 'Nm', toBase: 1852 },
    { id: 'km', name: 'Kilomètres', symbol: 'km', toBase: 1000 },
    { id: 'm', name: 'Mètres', symbol: 'm', toBase: 1 },
    { id: 'ft', name: 'Pieds', symbol: 'ft', toBase: 0.3048 }
  ],
  volume: [
    { id: 'l', name: 'Litres', symbol: 'L', toBase: 1 },
    { id: 'gal_us', name: 'Gallons US (100LL / Avgas)', symbol: 'Gal US', toBase: 3.78541 },
    { id: 'gal_imp', name: 'Gallons Impériaux', symbol: 'Gal Imp', toBase: 4.54609 }
  ]
};

const CATEGORIES: { id: Category; label: string; icon: string }[] = [
  { id: 'speed', label: 'Vitesse', icon: '⚡' },
  { id: 'distance', label: 'Distance', icon: '📏' },
  { id: 'volume', label: 'Volume (Carburant)', icon: '⛽' }
];

const ConverterContent: React.FC = () => {
  const [category, setCategory] = useState<Category>('speed');
  const [equivCategory, setEquivCategory] = useState<Category>('speed');
  const [inputValue, setInputValue] = useState<number | ''>(100);
  const [fromUnitId, setFromUnitId] = useState<string>('kt');
  const [toUnitId, setToUnitId] = useState<string>('kmh');

  // Change default units when switching category
  const handleCategoryChange = (cat: Category) => {
    setCategory(cat);
    setEquivCategory(cat);
    if (cat === 'speed') {
      setFromUnitId('kt');
      setToUnitId('kmh');
      setInputValue(100);
    } else if (cat === 'distance') {
      setFromUnitId('nm');
      setToUnitId('km');
      setInputValue(10);
    } else if (cat === 'volume') {
      setFromUnitId('gal_us');
      setToUnitId('l');
      setInputValue(20);
    }
  };

  const currentUnits = UNITS[category];

  const convertedValue = useMemo(() => {
    if (inputValue === '' || isNaN(Number(inputValue))) return '';
    const fromUnit = currentUnits.find(u => u.id === fromUnitId);
    const toUnit = currentUnits.find(u => u.id === toUnitId);
    if (!fromUnit || !toUnit) return '';

    const valInBase = Number(inputValue) * fromUnit.toBase;
    const result = valInBase / toUnit.toBase;

    // format nicely
    if (Math.abs(result) >= 100) {
      return Number(result.toFixed(1));
    } else if (Math.abs(result) >= 10) {
      return Number(result.toFixed(2));
    } else {
      return Number(result.toFixed(3));
    }
  }, [inputValue, fromUnitId, toUnitId, currentUnits]);

  const handleSwap = () => {
    setFromUnitId(toUnitId);
    setToUnitId(fromUnitId);
  };

  const formatEquiv = (val: number) => {
    if (val >= 100) return Number(val.toFixed(1));
    if (val >= 10) return Number(val.toFixed(2));
    if (val >= 1) return Number(val.toFixed(2));
    return Number(val.toFixed(4));
  };

  return (
    <div className="max-w-3xl mx-auto p-2 sm:p-6 text-white animate-fade-in pb-12">
      <h2 className="text-lg sm:text-2xl font-bold text-center text-indigo-400 uppercase tracking-wider mb-3 sm:mb-6">
        Convertisseur Aéronautique
      </h2>

      {/* Category Tabs */}
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mb-4 sm:mb-6 bg-gray-800/80 p-1 rounded-xl border border-gray-700">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => handleCategoryChange(cat.id)}
            className={`py-1.5 px-2 sm:py-2 sm:px-3 rounded-lg font-bold text-[11px] sm:text-sm transition-all flex items-center justify-center gap-1 sm:gap-1.5 ${
              category === cat.id
                ? 'bg-indigo-600 text-white shadow-lg ring-2 ring-indigo-400'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            <span>{cat.icon}</span>
            <span className="truncate">{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Main Converter Card */}
      <div className="bg-gray-800/90 backdrop-blur-md p-3 sm:p-8 rounded-2xl border border-gray-700 shadow-2xl mb-6 sm:mb-10">
        <div className="grid grid-cols-[1fr,auto,1fr] gap-1.5 sm:gap-6 items-center">
          
          {/* FROM Input Box */}
          <div className="bg-gray-900/80 p-2.5 sm:p-5 rounded-xl border border-gray-700/80 flex flex-col gap-1.5 sm:gap-2 min-w-0">
            <label className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wide truncate">
              Valeur à convertir
            </label>
            <input
              type="number"
              value={inputValue}
              onChange={e => setInputValue(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="0"
              className="w-full bg-transparent text-xl sm:text-3xl font-extrabold text-white focus:outline-none no-spinners"
            />
            <div className="pt-1.5 sm:pt-2 border-t border-gray-800">
              <select
                value={fromUnitId}
                onChange={e => setFromUnitId(e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 text-indigo-300 font-bold rounded-lg py-1.5 px-2 sm:py-2 sm:px-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 truncate"
              >
                {currentUnits.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.symbol})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center flex-shrink-0">
            <button
              onClick={handleSwap}
              title="Inverser les unités"
              className="bg-indigo-600/30 hover:bg-indigo-600 border border-indigo-500/40 text-indigo-300 hover:text-white p-2 sm:p-3 rounded-full transition-all hover:scale-110 active:scale-95 shadow-md"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </button>
          </div>

          {/* TO Output Box */}
          <div className="bg-indigo-950/40 p-2.5 sm:p-5 rounded-xl border border-indigo-500/40 flex flex-col gap-1.5 sm:gap-2 min-w-0">
            <label className="text-[10px] sm:text-xs font-semibold text-indigo-300 uppercase tracking-wide truncate">
              Résultat cible
            </label>
            <div className="text-xl sm:text-3xl font-extrabold text-indigo-400 min-h-[28px] sm:min-h-[36px] flex items-center truncate">
              {convertedValue !== '' ? convertedValue : '-'}
            </div>
            <div className="pt-1.5 sm:pt-2 border-t border-indigo-900/50">
              <select
                value={toUnitId}
                onChange={e => setToUnitId(e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 text-indigo-300 font-bold rounded-lg py-1.5 px-2 sm:py-2 sm:px-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 truncate"
              >
                {currentUnits.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.symbol})
                  </option>
                ))}
              </select>
            </div>
          </div>

        </div>
      </div>

      {/* Equivalences Section */}
      <div className="bg-gray-800/60 rounded-2xl border border-gray-700/80 p-3 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-700 pb-2.5 mb-3">
          <h3 className="text-xs sm:text-base font-bold text-gray-200 uppercase tracking-wider flex items-center gap-1.5">
            <span>📋</span>
            <span>Équivalences usuelles (pour 1)</span>
          </h3>

          {/* Category Filter Pills */}
          <div className="flex gap-1 bg-gray-900/80 p-1 rounded-lg w-full sm:w-auto">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setEquivCategory(cat.id)}
                className={`flex-1 sm:flex-none py-1 px-2 rounded font-bold text-[10px] sm:text-xs transition-all flex items-center justify-center gap-1 ${
                  equivCategory === cat.id
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 bg-gray-900/40 p-2 sm:p-3 rounded-xl border border-gray-800">
          {UNITS[equivCategory].map(unit => (
            <div key={unit.id} className="text-gray-300 bg-gray-800/60 p-2 sm:p-2.5 rounded-lg border border-gray-700/40 text-xs sm:text-sm min-w-0">
              <span className="font-extrabold text-white block mb-1 truncate">1 {unit.symbol} =</span>
              <div className="space-y-0.5 text-gray-400 pl-1 text-[11px] sm:text-xs">
                {UNITS[equivCategory].filter(u => u.id !== unit.id).map(other => {
                  const val = unit.toBase / other.toBase;
                  return (
                    <div key={other.id} className="truncate">
                      <span className="font-bold text-indigo-300">{formatEquiv(val)}</span> {other.symbol}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default ConverterContent;
