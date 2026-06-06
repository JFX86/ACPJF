

import React from 'react';
import { AIRCRAFT_COLORS, PARAM_PDFS } from '../constants';
import type { AircraftRecap } from '../types';

const CardRow: React.FC<{ label: string, value: string }> = ({ label, value }) => (
    <>
        <span className="text-gray-400 font-semibold text-right">{label}:</span>
        <span className="text-white">{value}</span>
    </>
);

export const AircraftCard: React.FC<{ plane: AircraftRecap, showTitle?: boolean }> = ({ plane, showTitle = true }) => {
    const colors = AIRCRAFT_COLORS[plane.id];
    return (
        <div className={`bg-gray-800/80 border-l-4 ${colors?.border ?? 'border-gray-500'} rounded-r-lg shadow-lg p-4 mb-8`}>
            {showTitle && (
                <h3 className={`text-2xl font-bold mb-3 text-white`}>
                    <a href={PARAM_PDFS[plane.id]} target="_blank" rel="noopener noreferrer" className="hover:underline text-blue-300">
                        {plane.id} ({plane.shortName})
                    </a>
                </h3>
            )}
            
            <div className="mb-4">
              <h4 className="text-lg font-bold text-sky-400 mb-2 border-b border-gray-600 pb-1">Paramètres Clés</h4>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <CardRow label="Rotation" value={plane.parametres.rotation} />
                <CardRow label="Montée" value={plane.parametres.montee} />
                <CardRow label="Finale" value={plane.parametres.finale} />
                <CardRow label="Finesse max" value={plane.parametres.finesseMax} />
                <CardRow label="Vitesse croisière" value={plane.parametres.vitesseCroisiere} />
              </div>
            </div>

            <div>
              <h4 className="text-lg font-bold text-sky-400 mb-2 border-b border-gray-600 pb-1">Performances & Limites</h4>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <CardRow label="Facteur de base (Fb)" value={plane.facteurBase} />
                <CardRow label="CARBURANT MAX princ." value={plane.cocoMax.princ} />
                {plane.cocoMax.second && <CardRow label="CARBURANT MAX 2nd" value={plane.cocoMax.second} />}
                <CardRow label="Inutilisable princ." value={plane.inutilisable.princ} />
                {plane.inutilisable.second && <CardRow label="Inutilisable 2nd" value={plane.inutilisable.second} />}
                <CardRow label="CONSO /h" value={plane.conso.perHour} />
                <CardRow label="CONSO /min" value={plane.conso.perMin} />
                <CardRow label="AUTONOMIE PRINC." value={plane.autonomie.coco1} />
                {plane.autonomie.coco2 && <CardRow label="AUTONOMIE TOTAL" value={plane.autonomie.coco2} />}
                <CardRow label="VENT TRAVERS décollage" value={plane.ventTravers.decollage} />
                <CardRow label="VENT TRAVERS atterrissage" value={plane.ventTravers.atterrissage} />
                <CardRow label="DISTANCE décollage" value={plane.distances.decollage} />
                <CardRow label="DISTANCE atterrissage" value={plane.distances.atterrissage} />
                <CardRow label="PUISSANCE décollage" value={plane.puissance.decollage} />
              </div>
            </div>
        </div>
    );
};