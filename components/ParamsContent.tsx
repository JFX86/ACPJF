import React, { useState } from 'react';
import LinksContent from './LinksContent';
import FavoritesContent from './FavoritesContent';
import NoticeContent from './NoticeContent';
import type { TabId } from '../types';

interface ParamsContentProps {
  currentFavorite: TabId | null;
  setFavorite: (tabId: TabId | null) => void;
  onGlobalReset: () => void;
}

const ParamsContent: React.FC<ParamsContentProps> = ({ currentFavorite, setFavorite, onGlobalReset }) => {
  const [showResetPopup, setShowResetPopup] = useState(false);

  const handleConfirmReset = () => {
    onGlobalReset();
    setShowResetPopup(false);
  };

  return (
    <div className="space-y-12">
      <div className="flex justify-center pt-4">
        <button
          onClick={() => setShowResetPopup(true)}
          className="max-w-xs w-full bg-red-700 hover:bg-red-600 border border-red-500 hover:border-red-400 text-white font-bold py-3 px-6 rounded-lg shadow-lg flex items-center justify-center gap-2 transition-all duration-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
          </svg>
          TOUT RÉINITIALISER
        </button>
      </div>

      <section>
        <LinksContent />
      </section>
      
      <div className="border-t border-gray-700"></div>
      
      <section>
        <FavoritesContent currentFavorite={currentFavorite} setFavorite={setFavorite} />
      </section>
      
      <div className="border-t border-gray-700"></div>
      
      <section>
        <NoticeContent />
      </section>

      {/* Global Reset Popup */}
      {showResetPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-start justify-center pt-20 z-50 animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="global-modal-title">
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl border border-gray-600 w-full max-w-sm mx-4 transform transition-all">
            <h3 id="global-modal-title" className="text-xl font-bold mb-4 text-white">Tout réinitialiser ?</h3>
            <p className="text-gray-300 mb-6">(ceci annulera tout ⚠️)</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowResetPopup(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
              >
                ANNULER
              </button>
              <button
                onClick={handleConfirmReset}
                className="px-4 py-2 bg-red-700 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParamsContent;
