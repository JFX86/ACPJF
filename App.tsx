import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Header from './components/Header';
import ChecklistContent from './components/ChecklistContent';
import RecapContent from './components/RecapContent';
import TarifsContent from './components/TarifsContent';
import ParamsContent from './components/ParamsContent';
import { CHECKLIST_DATA, RECAP_DATA } from './constants';
import type { TabId } from './types';

// Clé utilisée pour sauvegarder le favori dans le localStorage du navigateur.
// Le localStorage est un stockage de données propre à chaque utilisateur et à chaque appareil,
// ce qui garantit que le choix du favori est personnel et persistant.
const FAVORITE_STORAGE_KEY = 'acp-checklist-favorite-tab';
const CHECKLIST_STATES_STORAGE_KEY = 'acp-checklist-session-states';

interface ChecklistSessionState {
  checkedState: Record<string, boolean>;
  scrollPosition: number;
}

/**
 * Récupère l'onglet favori sauvegardé depuis le localStorage.
 * Renvoie null si aucun favori n'est trouvé ou si le stockage n'est pas accessible.
 */
const getFavoriteTab = (): TabId | null => {
    try {
        const savedFavorite = window.localStorage.getItem(FAVORITE_STORAGE_KEY);
        // On vérifie que la valeur sauvegardée est bien un onglet valide pour éviter les erreurs.
        if (savedFavorite && CHECKLIST_DATA.hasOwnProperty(savedFavorite)) {
           return savedFavorite as TabId;
        }
    } catch (error) {
        console.error("Impossible de lire depuis le localStorage", error);
    }
    return null;
}

const getInitialChecklistStates = (): Partial<Record<TabId, ChecklistSessionState>> => {
    try {
        const saved = window.localStorage.getItem(CHECKLIST_STATES_STORAGE_KEY);
        if (saved) {
            return JSON.parse(saved);
        }
    } catch (error) {
        console.error("Impossible de lire les états depuis le localStorage", error);
    }
    return {};
}

const App: React.FC = () => {
  const [favoriteTab, setFavoriteTab] = useState<TabId | null>(getFavoriteTab);
  const [activeTab, setActiveTab] = useState<TabId>(favoriteTab || 'RECAP');
  const [checklistStates, setChecklistStates] = useState<Partial<Record<TabId, ChecklistSessionState>>>(getInitialChecklistStates);
  const mainContentRef = useRef<HTMLElement>(null);

  // Restore scroll position when active tab changes
  useEffect(() => {
    if (!mainContentRef.current) return;

    const tabState = checklistStates[activeTab];
    const hasCheckedItems = tabState?.checkedState && Object.values(tabState.checkedState).some(c => c);

    if (hasCheckedItems && typeof tabState.scrollPosition === 'number') {
        mainContentRef.current.scrollTop = tabState.scrollPosition;
    } else {
        mainContentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [activeTab]);

  // Persist checklist states
  useEffect(() => {
    try {
      window.localStorage.setItem(CHECKLIST_STATES_STORAGE_KEY, JSON.stringify(checklistStates));
    } catch (error) {
      console.error("Impossible d'écrire les états dans le localStorage", error);
    }
  }, [checklistStates]);

  // Ce `useEffect` se déclenche à chaque fois que `favoriteTab` change.
  // Il sauvegarde automatiquement le nouvel onglet favori dans le localStorage,
  // assurant que le choix de l'utilisateur est mémorisé pour sa prochaine visite.
  useEffect(() => {
    try {
      if (favoriteTab) {
        window.localStorage.setItem(FAVORITE_STORAGE_KEY, favoriteTab);
      } else {
         window.localStorage.removeItem(FAVORITE_STORAGE_KEY);
      }
    } catch (error) {
      console.error("Impossible d'écrire dans le localStorage", error);
    }
  }, [favoriteTab]);

  const handleSetFavorite = (tab: TabId | null) => {
    setFavoriteTab(tab);
    // If a new favorite is set, switch to it for immediate feedback.
    // If it's deselected (tab is null), the user is on the "FAVORI" tab, so we don't need to switch.
    if (tab) {
      setActiveTab(tab);
    }
  }

  const handleTabChange = (newTab: TabId) => {
    if (activeTab === newTab) return;

    // Save scroll position of the old tab if it's a checklist tab
    if (mainContentRef.current && CHECKLIST_DATA[activeTab]?.content.length > 0) {
      const scrollPosition = mainContentRef.current.scrollTop;
      setChecklistStates(prev => ({
        ...prev,
        [activeTab]: { ...(prev[activeTab] || { checkedState: {}, scrollPosition: 0 }), scrollPosition },
      }));
    }
    setActiveTab(newTab);
  };
  
  const handleChecklistStateChange = (tabId: TabId, newCheckedState: Record<string, boolean>) => {
    setChecklistStates(prev => ({
        ...prev,
        [tabId]: { ...(prev[tabId] || { checkedState: {}, scrollPosition: 0 }), checkedState: newCheckedState },
    }));
  };

  const activeChecklist = useMemo(() => CHECKLIST_DATA[activeTab], [activeTab]);
  const recapDataForTab = useMemo(() => RECAP_DATA.find(d => d.id === activeTab), [activeTab]);
  
  const checkableItemKeys = useMemo(() => {
    const keys: string[] = [];
    if (!activeChecklist?.content) return keys;

    activeChecklist.content.forEach((section, sectionIndex) => {
      if (section.items) {
        section.items.forEach((item, itemIndex) => {
          if (item.action === undefined && !item.isNote) {
            keys.push(`${sectionIndex}-${itemIndex}`);
          }
        });
      }
      if (section.subsections) {
        section.subsections.forEach((subsection, subIndex) => {
          if (subsection.items) {
             subsection.items.forEach((item, itemIndex) => {
               if (item.action === undefined && !item.isNote) {
                 keys.push(`${sectionIndex}-s${subIndex}-${itemIndex}`);
               }
             });
          }
        });
      }
    });
    return keys;
  }, [activeChecklist]);

  const getInitialState = useCallback(() => {
    const state: Record<string, boolean> = {};
    checkableItemKeys.forEach(key => state[key] = false);
    return state;
  }, [checkableItemKeys]);

  const checkedState = useMemo(() => (
    checklistStates[activeTab]?.checkedState ?? getInitialState()
  ), [activeTab, checklistStates, getInitialState]);


  const handleReset = (tabId: TabId) => {
    // getInitialState is based on the activeTab, which is what we want here.
    const initialCheckedState = getInitialState();
    handleChecklistStateChange(tabId, initialCheckedState);
    mainContentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGlobalReset = () => {
    setChecklistStates({});
    mainContentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderContent = () => {
    if (activeTab === 'PARAMS') {
      return (
        <ParamsContent 
          currentFavorite={favoriteTab}
          setFavorite={handleSetFavorite}
          onGlobalReset={handleGlobalReset}
        />
      );
    }
    if (activeTab === 'TARIFS') {
      return <TarifsContent />;
    }
    if (activeTab === 'RECAP') {
      return <RecapContent />;
    }
    if (activeChecklist) {
      return (
        <ChecklistContent
          key={activeTab}
          data={activeChecklist}
          recapData={recapDataForTab}
          tabId={activeTab}
          checkedState={checkedState}
          onCheckedStateChange={(newState) => handleChecklistStateChange(activeTab, newState)}
          onReset={() => handleReset(activeTab)}
        />
      );
    }
    return (
      <div className="text-center text-red-500">
        Contenu non trouvé pour cet onglet.
      </div>
    );
  };

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-gray-200">
      <Header activeTab={activeTab} setActiveTab={handleTabChange} />
      <main ref={mainContentRef} className="flex-1 overflow-y-auto">
        <div className="p-4 sm:p-6 md:p-8">
            {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
