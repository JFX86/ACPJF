import React, { useState, useEffect } from 'react';

type PlaneType = 'CESSNA' | 'EVEKTOR' | 'DR400';

const PLANES: Record<PlaneType, { name: string; rate: number; fb: number }> = {
  CESSNA: { name: 'Cessna', rate: 110, fb: 0.65 },
  EVEKTOR: { name: 'Evektor', rate: 110, fb: 0.6 },
  DR400: { name: 'DR400', rate: 150, fb: 0.54 },
};

const ACTIVE_PLANE_CLASSES: Record<PlaneType, string> = {
  CESSNA: 'bg-gradient-to-r from-green-500 to-orange-500 text-white ring-2 ring-orange-400 ring-offset-2 ring-offset-gray-800',
  EVEKTOR: 'bg-gradient-to-r from-blue-500 to-yellow-500 text-white ring-2 ring-yellow-400 ring-offset-2 ring-offset-gray-800',
  DR400: 'bg-gradient-to-r from-blue-800 to-red-600 text-white ring-2 ring-red-500 ring-offset-2 ring-offset-gray-800',
};

const TarifsContent: React.FC = () => {
  const [plane, setPlane] = useState<PlaneType>('CESSNA');
  const [instruction, setInstruction] = useState<boolean>(false);
  const [hours, setHours] = useState<number | ''>('');
  const [minutes, setMinutes] = useState<number | ''>('');
  const [distance, setDistance] = useState<number | ''>('');
  const [lastEdited, setLastEdited] = useState<'duration' | 'distance'>('duration');

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
  const hourlyRate = PLANES[plane].rate + (instruction ? 20 : 0);
  const cost = (totalMin / 60) * hourlyRate;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
        <h2 className="text-2xl font-bold text-emerald-400 mb-6 flex items-center gap-2">
          <span>💶</span> Calculateur de Tarifs
        </h2>

        <div className="space-y-6">
          {/* Plane Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Type d'avion</label>
            <div className="grid grid-cols-3 gap-3">
              {(Object.keys(PLANES) as PlaneType[]).map((p) => (
                <button
                  key={p}
                  onClick={() => handlePlaneChange(p)}
                  className={`py-2 px-4 rounded-md text-sm font-bold transition-all ${
                    plane === p
                      ? ACTIVE_PLANE_CLASSES[p]
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {PLANES[p].name}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Tarif horaire : {PLANES[plane].rate}€/h | Facteur de base : {PLANES[plane].fb}
            </p>
          </div>

          {/* Instruction Option */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="instruction"
              checked={instruction}
              onChange={(e) => setInstruction(e.target.checked)}
              className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-gray-800"
            />
            <label htmlFor="instruction" className="ml-3 text-sm font-medium text-gray-300 cursor-pointer">
              Vol avec instruction (+20€/h)
            </label>
          </div>

          <hr className="border-gray-700" />

          {/* Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Duration Input */}
            <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
              <label className="block text-sm font-medium text-gray-300 mb-3">Durée du vol</label>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={hours}
                    onChange={(e) => handleDurationChange(e.target.value === '' ? '' : parseInt(e.target.value), minutes)}
                    className="w-full bg-gray-800 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="text-xs text-gray-400 mt-1 block text-center">Heures</span>
                </div>
                <span className="text-xl font-bold text-gray-500 pb-5">:</span>
                <div className="flex-1">
                  <input
                    type="number"
                    min="0"
                    max="59"
                    placeholder="0"
                    value={minutes}
                    onChange={(e) => handleDurationChange(hours, e.target.value === '' ? '' : parseInt(e.target.value))}
                    className="w-full bg-gray-800 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="text-xs text-gray-400 mt-1 block text-center">Minutes</span>
                </div>
              </div>
            </div>

            {/* Distance Input */}
            <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
              <label className="block text-sm font-medium text-gray-300 mb-3">Distance</label>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={distance}
                    onChange={(e) => handleDistanceChange(e.target.value === '' ? '' : parseInt(e.target.value))}
                    className="w-full bg-gray-800 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="text-xs text-gray-400 mt-1 block text-center">Nautiques (Nm)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Result */}
          <div className="bg-emerald-900/30 border border-emerald-500/50 rounded-lg p-6 text-center mt-6">
            <h3 className="text-lg font-medium text-emerald-400 mb-2">Coût estimé du vol</h3>
            <div className="text-5xl font-bold text-white">
              {cost.toFixed(2)} <span className="text-3xl text-emerald-500">€</span>
            </div>
            <p className="text-sm text-gray-400 mt-3">
              Basé sur un tarif de {hourlyRate}€/h pour {totalMin} minutes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TarifsContent;
