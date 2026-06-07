import React, { useState, useEffect } from 'react';

type PlaneType = 'CESSNA' | 'EVEKTOR' | 'DR400';

const PLANES: Record<PlaneType, { name: string; fb: number }> = {
  CESSNA: { name: 'Cessna', fb: 0.65 },
  EVEKTOR: { name: 'Evektor', fb: 0.6 },
  DR400: { name: 'DR400', fb: 0.54 },
};

const ACTIVE_PLANE_CLASSES: Record<PlaneType, string> = {
  CESSNA: 'bg-gradient-to-r from-green-500 to-orange-500 text-white ring-1 ring-orange-400 ring-offset-1 ring-offset-gray-800',
  EVEKTOR: 'bg-gradient-to-r from-blue-500 to-yellow-500 text-white ring-1 ring-yellow-400 ring-offset-1 ring-offset-gray-800',
  DR400: 'bg-gradient-to-r from-blue-800 to-red-600 text-white ring-1 ring-red-500 ring-offset-1 ring-offset-gray-800',
};

const TarifsContent: React.FC = () => {
  const [plane, setPlane] = useState<PlaneType>('CESSNA');
  const [instruction, setInstruction] = useState<boolean>(false);
  const [hours, setHours] = useState<number | ''>('');
  const [minutes, setMinutes] = useState<number | ''>('');
  const [distance, setDistance] = useState<number | ''>('');
  const [lastEdited, setLastEdited] = useState<'duration' | 'distance'>('duration');

  const [prices, setPrices] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('flightPrices_v2');
    if (saved) {
        try {
            return JSON.parse(saved);
        } catch(e) {}
    }
    return {
      CESSNA: 110, EVEKTOR: 110, DR400: 150,
      instruction: 20
    };
  });

  useEffect(() => {
    localStorage.setItem('flightPrices_v2', JSON.stringify(prices));
  }, [prices]);

  const updateFamilyPrice = (family: string, val: number) => {
    setPrices(prev => ({ ...prev, [family]: val }));
  }

  const handleDurationChange = (newHours: number | '', newMinutes: number | '') => {
    setHours(newHours);
    setMinutes(newMinutes);
    setLastEdited('duration');
    
    const totalMin = (newHours || 0) * 60 + (newMinutes || 0);
    if (newHours === '' && newMinutes === '') {
      setDistance('');
    } else {
      setDistance(Math.round(totalMin / PLANES[plane].fb));
    }
  };

  const handleDistanceChange = (newDist: number | '') => {
    setDistance(newDist);
    setLastEdited('distance');
    
    if (newDist === '') {
      setHours('');
      setMinutes('');
    } else {
      const totalMin = Math.round(newDist * PLANES[plane].fb);
      setHours(Math.floor(totalMin / 60) || '');
      setMinutes(totalMin % 60);
    }
  };

  const handlePlaneChange = (newPlane: PlaneType) => {
    setPlane(newPlane);
    if (lastEdited === 'duration') {
      const totalMin = (hours || 0) * 60 + (minutes || 0);
      if (hours !== '' || minutes !== '') {
        setDistance(Math.round(totalMin / PLANES[newPlane].fb));
      }
    } else {
      if (distance !== '') {
        const totalMin = Math.round(distance * PLANES[newPlane].fb);
        setHours(Math.floor(totalMin / 60) || '');
        setMinutes(totalMin % 60);
      }
    }
  };

  const totalMin = (hours || 0) * 60 + (minutes || 0);
  const hourlyRate = prices[plane] + (instruction ? prices.instruction : 0);
  const cost = (totalMin / 60) * hourlyRate;

  return (
    <div className="max-w-2xl mx-auto space-y-3">
      <div className="bg-gray-800 rounded-lg shadow-lg p-3 border border-gray-700">
        <h2 className="text-lg font-bold text-emerald-400 mb-3 flex items-center gap-2">
          <span>💶</span> Calculateur de Tarifs
        </h2>

        <div className="space-y-3">
          {/* Plane Selection */}
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Type d'avion</label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(PLANES) as PlaneType[]).map((p) => (
                <button
                  key={p}
                  onClick={() => handlePlaneChange(p)}
                  className={`py-1 px-2 rounded-md text-xs font-bold transition-all ${
                    plane === p
                      ? ACTIVE_PLANE_CLASSES[p]
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {PLANES[p].name}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-gray-400 mt-1">
              Tarif horaire : {prices[plane]}€/h | Facteur de base : {PLANES[plane].fb}
            </p>
          </div>

          {/* Instruction Option */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="instruction"
              checked={instruction}
              onChange={(e) => setInstruction(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-gray-600 bg-gray-700 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-gray-800"
            />
            <label htmlFor="instruction" className="ml-2 text-xs font-medium text-gray-300 cursor-pointer">
              Vol avec instruction
            </label>
          </div>

          <hr className="border-gray-700" />

          {/* Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Duration Input */}
            <div className="bg-gray-700/50 p-2 rounded-lg border border-gray-600">
              <label className="block text-xs font-medium text-gray-300 mb-1.5">Durée du vol</label>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={hours}
                    onChange={(e) => handleDurationChange(e.target.value === '' ? '' : parseInt(e.target.value), minutes)}
                    className="w-full bg-gray-800 border border-gray-600 rounded-md py-1 px-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <span className="text-[10px] text-gray-400 mt-0.5 block text-center">Heures</span>
                </div>
                <span className="text-lg font-bold text-gray-500 pb-4">:</span>
                <div className="flex-1">
                  <input
                    type="number"
                    min="0"
                    max="59"
                    placeholder="0"
                    value={minutes}
                    onChange={(e) => handleDurationChange(hours, e.target.value === '' ? '' : parseInt(e.target.value))}
                    className="w-full bg-gray-800 border border-gray-600 rounded-md py-1 px-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <span className="text-[10px] text-gray-400 mt-0.5 block text-center">Minutes</span>
                </div>
              </div>
            </div>

            {/* Distance Input */}
            <div className="bg-gray-700/50 p-2 rounded-lg border border-gray-600">
              <label className="block text-xs font-medium text-gray-300 mb-1.5">Distance</label>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={distance}
                    onChange={(e) => handleDistanceChange(e.target.value === '' ? '' : parseInt(e.target.value))}
                    className="w-full bg-gray-800 border border-gray-600 rounded-md py-1 px-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 no-spinners"
                  />
                  <span className="text-[10px] text-gray-400 mt-0.5 block text-center">Nautiques (Nm)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Result */}
          <div className="bg-emerald-900/30 border border-emerald-500/50 rounded-lg p-3 text-center mt-2">
            <h3 className="text-sm font-medium text-emerald-400 mb-0.5">Coût estimé du vol</h3>
            <div className="text-3xl font-bold text-white">
              {cost.toFixed(2)} <span className="text-xl text-emerald-500">€</span>
            </div>
            <p className="text-[10px] text-gray-400 mt-1">
              Basé sur un tarif de {hourlyRate}€/h pour {totalMin} minutes.
            </p>
          </div>

          {/* Configuration Panel */}
          <div className="bg-gray-800/80 p-3 sm:p-4 rounded-lg border border-gray-700 mt-4">
            <h4 className="text-xs font-bold text-gray-400 mb-3 uppercase text-center border-b border-gray-700 pb-2">Paramétrages des Coûts Horaires</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6 text-xs max-w-sm mx-auto">
              {/* Col 1 */}
              <div className="flex flex-col gap-2">
                 {['CESSNA', 'EVEKTOR'].map(f => (
                    <div key={f} className="flex justify-between items-center gap-2">
                      <span className="font-bold text-gray-300">{f}</span>
                      <div className="flex items-center">
                        <input 
                          type="number" 
                          className="w-14 bg-gray-700 border border-gray-600 text-center rounded-md py-1 px-1 focus:ring-1 focus:ring-emerald-500 focus:outline-none text-white no-spinners transition-colors" 
                          value={prices[f] || ''} 
                          onChange={e => updateFamilyPrice(f, Number(e.target.value))} 
                        />
                        <span className="ml-1.5 text-gray-500 w-6">€/h</span>
                      </div>
                    </div>
                 ))}
              </div>

              {/* Col 2 */}
              <div className="flex flex-col gap-2">
                 <div className="flex justify-between items-center gap-2">
                    <span className="font-bold text-gray-300">DR400</span>
                    <div className="flex items-center">
                      <input 
                        type="number" 
                        className="w-14 bg-gray-700 border border-gray-600 text-center rounded-md py-1 px-1 focus:ring-1 focus:ring-emerald-500 focus:outline-none text-white no-spinners transition-colors" 
                        value={prices.DR400 || ''} 
                        onChange={e => updateFamilyPrice('DR400', Number(e.target.value))} 
                      />
                      <span className="ml-1.5 text-gray-500 w-6">€/h</span>
                    </div>
                 </div>
                 
                 <div className="flex justify-between items-center gap-2">
                    <span className="font-bold text-emerald-400">Instruct.</span>
                    <div className="flex items-center">
                        <input 
                          type="number" 
                          className="w-14 bg-gray-700 border border-gray-600 text-center rounded-md py-1 px-1 focus:ring-1 focus:ring-emerald-500 focus:outline-none text-emerald-400 font-bold no-spinners transition-colors" 
                          value={prices.instruction || ''} 
                          onChange={e => setPrices(prev => ({...prev, instruction: Number(e.target.value)}))} 
                        />
                        <span className="ml-1.5 text-gray-500 w-6">€/h</span>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TarifsContent;
