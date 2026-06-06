

import React, { useState } from 'react';
import { RECAP_DATA, AIRCRAFT_COLORS, PARAM_PDFS } from '../constants';
import type { TabId, AircraftRecap } from '../types';
import { AircraftCard } from './AircraftCard';

const RecapContent: React.FC = () => {
    type FilterType = TabId | 'ALL';
    const [filter, setFilter] = useState<FilterType>('ALL');
    const aircrafts = RECAP_DATA.map(a => a.id);
    const filteredData = filter === 'ALL' ? RECAP_DATA : RECAP_DATA.filter(d => d.id === filter);
    const title = "Récap'";

    return (
        <div className="max-w-7xl mx-auto animate-fade-in">
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-6 text-white tracking-wide">
                {title}
            </h2>

            {/* Filter Buttons */}
            <div className="flex flex-wrap justify-center gap-2 mb-8">
                <FilterButton label="TOUT" isActive={filter === 'ALL'} onClick={() => setFilter('ALL')} />
                {aircrafts.map(id => (
                    <FilterButton 
                        key={id} 
                        label={id} 
                        isActive={filter === id} 
                        onClick={() => setFilter(id)}
                        colors={AIRCRAFT_COLORS[id]}
                    />
                ))}
            </div>

            {/* AIRCRAFT CONTENT */}
            {filteredData.length > 0 && (
                <>
                    {/* Mobile & Tablet Portrait View (Cards) */}
                    <div className="xl:hidden space-y-6">
                        {filteredData.map(plane => (
                            <AircraftCard key={plane.id} plane={plane} />
                        ))}
                    </div>

                    {/* Desktop & Tablet Landscape View (Table) */}
                    <div className="hidden xl:block bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg shadow-xl overflow-x-auto">
                        <AircraftTable data={filteredData} />
                    </div>
                </>
            )}
        </div>
    );
};

interface ColorProps {
    bg: string;
    text: string;
    ring: string;
    border: string;
}

const FilterButton: React.FC<{ label: string; isActive: boolean; onClick: () => void; colors?: ColorProps }> = ({ label, isActive, onClick, colors }) => {
    const activeBg = colors?.bg ?? 'bg-blue-600';
    const activeText = colors?.text ?? 'text-white';
    const activeRing = colors?.ring ?? 'ring-blue-500';

    return (
        <button
            onClick={onClick}
            className={`px-3 py-1 text-sm font-bold transition-colors duration-200 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-75
                ${isActive
                    ? `${activeBg} ${activeText} ring-2 ${activeRing} shadow-lg`
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
                }`}
        >
            {label}
        </button>
    );
}


const AircraftTable: React.FC<{ data: AircraftRecap[] }> = ({ data }) => {
    const renderSpeed = (speedStr: string | undefined) => {
        if (!speedStr) return '-';
        if (speedStr.includes(' (')) {
            const parts = speedStr.split(' (');
            return <>{parts[0]}<br />({parts[1]}</>;
        }
        if (speedStr.includes(' ou ')) {
            const parts = speedStr.split(' ou ');
            return <>{parts[0]}<br />({parts[1]})</>;
        }
        return speedStr;
    };

    return (
        <table className="w-full text-center text-[10px] whitespace-nowrap">
            <thead className="bg-gray-700/80 text-[9px] uppercase tracking-wider">
                <tr>
                    <th rowSpan={2} className="px-1 py-1 border-b border-r border-gray-600 leading-tight">Avion</th>
                    <th colSpan={5} className="px-1 py-1 border-b border-r border-gray-600 leading-tight">PARAMETRES</th>
                    <th rowSpan={2} className="px-1 py-1 border-b border-r border-gray-600 leading-tight">Fb</th>
                    <th colSpan={2} className="px-1 py-1 border-b border-r border-gray-600 leading-tight">CARB. MAX</th>
                    <th colSpan={2} className="px-1 py-1 border-b border-r border-gray-600 leading-tight">Inutilisable</th>
                    <th colSpan={2} className="px-1 py-1 border-b border-r border-gray-600 leading-tight">Conso</th>
                    <th colSpan={2} className="px-1 py-1 border-b border-r border-gray-600 leading-tight">Autonomie</th>
                    <th colSpan={2} className="px-1 py-1 border-b border-r border-gray-600 leading-tight">Vent Travers</th>
                    <th colSpan={2} className="px-1 py-1 border-b border-r border-gray-600 leading-tight">Distances</th>
                    <th rowSpan={2} className="px-1 py-1 border-b border-gray-600 leading-tight">PUISSANCE<br />DECOLLAGE</th>
                </tr>
                <tr>
                    <th className="px-1 py-1 border-b border-r border-gray-600 leading-tight">ROTAT°</th>
                    <th className="px-1 py-1 border-b border-r border-gray-600 leading-tight">Montée</th>
                    <th className="px-1 py-1 border-b border-r border-gray-600 leading-tight">FINALE</th>
                    <th className="px-1 py-1 border-b border-r border-gray-600 leading-tight">Fin. Max</th>
                    <th className="px-1 py-1 border-b border-r border-gray-600 leading-tight">Croisière</th>
                    <th className="px-1 py-1 border-b border-r border-gray-600 leading-tight">princ.</th>
                    <th className="px-1 py-1 border-b border-r border-gray-600 leading-tight">2nd</th>
                    <th className="px-1 py-1 border-b border-r border-gray-600 leading-tight">princ.</th>
                    <th className="px-1 py-1 border-b border-r border-gray-600 leading-tight">2nd</th>
                    <th className="px-1 py-1 border-b border-r border-gray-600 leading-tight">par H</th>
                    <th className="px-1 py-1 border-b border-r border-gray-600 leading-tight">par min</th>
                    <th className="px-1 py-1 border-b border-r border-gray-600 leading-tight">PRINC.</th>
                    <th className="px-1 py-1 border-b border-r border-gray-600 leading-tight">TOTAL</th>
                    <th className="px-1 py-1 border-b border-r border-gray-600 leading-tight">T/O</th>
                    <th className="px-1 py-1 border-b border-r border-gray-600 leading-tight">ATT.</th>
                    <th className="px-1 py-1 border-b border-r border-gray-600 leading-tight">T/O</th>
                    <th className="px-1 py-1 border-b border-r border-gray-600 leading-tight">ATT.</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
                {data.map(plane => {
                    const colors = AIRCRAFT_COLORS[plane.id];
                    return (
                        <tr key={plane.id} className={`${colors?.tableHighlight || ''} transition-all hover:brightness-125`}>
                            <td className={`px-1 py-1 font-bold text-white border-r border-gray-600 leading-tight`}>
                                <a href={PARAM_PDFS[plane.id]} target="_blank" rel="noopener noreferrer" className="hover:underline text-blue-300">
                                    {plane.shortName}
                                </a>
                            </td>
                            <td className="px-1 py-1 border-r border-gray-600 leading-tight">{renderSpeed(plane.parametres.rotation)}</td>
                            <td className="px-1 py-1 border-r border-gray-600 leading-tight">{renderSpeed(plane.parametres.montee)}</td>
                            <td className="px-1 py-1 border-r border-gray-600 leading-tight">{renderSpeed(plane.parametres.finale)}</td>
                            <td className="px-1 py-1 border-r border-gray-600 leading-tight">{renderSpeed(plane.parametres.finesseMax)}</td>
                            <td className="px-1 py-1 border-r border-gray-600 leading-tight">{renderSpeed(plane.parametres.vitesseCroisiere)}</td>
                            <td className="px-1 py-1 font-bold text-sky-200 border-r border-gray-600 leading-tight">{plane.facteurBase}</td>
                            <td className="px-1 py-1 border-r border-gray-600 leading-tight">{plane.cocoMax.princ}</td>
                            <td className="px-1 py-1 border-r border-gray-600 leading-tight">{plane.cocoMax.second || '-'}</td>
                            <td className="px-1 py-1 border-r border-gray-600 leading-tight">{plane.inutilisable.princ}</td>
                            <td className="px-1 py-1 border-r border-gray-600 leading-tight">{plane.inutilisable.second || '-'}</td>
                            <td className="px-1 py-1 border-r border-gray-600 leading-tight">{plane.conso.perHour}</td>
                            <td className="px-1 py-1 border-r border-gray-600 leading-tight">{plane.conso.perMin}</td>
                            <td className="px-1 py-1 border-r border-gray-600 leading-tight">{plane.autonomie.coco1}</td>
                            <td className="px-1 py-1 border-r border-gray-600 leading-tight">{plane.autonomie.coco2 || '-'}</td>
                            <td className="px-1 py-1 border-r border-gray-600 leading-tight">{plane.ventTravers.decollage}</td>
                            <td className="px-1 py-1 border-r border-gray-600 leading-tight">{plane.ventTravers.atterrissage}</td>
                            <td className="px-1 py-1 border-r border-gray-600 leading-tight">{plane.distances.decollage}</td>
                            <td className="px-1 py-1 border-r border-gray-600 leading-tight">{plane.distances.atterrissage}</td>
                            <td className="px-1 py-1 leading-tight">{plane.puissance.decollage}</td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
};

export default RecapContent;