import React, { useState, useRef, useEffect, useMemo, forwardRef } from 'react';
import { createPortal } from 'react-dom';
import type { ChecklistData, ChecklistSection, ChecklistItem, AircraftRecap, TabId } from '../types';
import { AircraftCard } from './AircraftCard';
import { AIRCRAFT_COLORS } from '../constants';
import { PersonalNotes } from './PersonalNotes';
import { CheckCheck } from 'lucide-react';

interface WarningPopupProps {
  isVisible: boolean;
  onClose: () => void;
  skippedCount: number;
}

const WarningPopup: React.FC<WarningPopupProps> = ({ isVisible, onClose, skippedCount }) => {
  if (!isVisible || skippedCount === 0) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 z-50 animate-fade-in" role="alert">
      <div className="flex items-center justify-between gap-4 bg-red-800 border border-red-600 text-white font-bold p-3 rounded-lg shadow-2xl max-w-md mx-auto sm:mx-0">
        <span>{`Attention, ${skippedCount} item${skippedCount > 1 ? 's' : ''} n'ont pas été vérifiés !`}</span>
        <button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-white"
          aria-label="Fermer l'alerte"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
};


interface ChecklistItemRowProps {
  item: ChecklistItem;
  isChecked?: boolean;
  onToggle?: () => void;
  highlightStyle?: 'next' | 'red';
  aircraftHighlightClasses?: string;
  checkboxClasses?: string;
  highlightTextColor?: string;
}

const ChecklistItemRow = forwardRef<HTMLDivElement, ChecklistItemRowProps>(
  ({ item, isChecked, onToggle, highlightStyle, aircraftHighlightClasses, checkboxClasses, highlightTextColor }, ref) => {
    if (item.isNote) {
      return (
        <div className="text-center text-sm italic text-yellow-300 bg-yellow-900/40 py-2 px-4 my-2 mx-4 rounded-md">
          <p>{item.item}</p>
          {item.action && <p>{item.action}</p>}
        </div>
      );
    }

    if (item.action === '') {
      return (
        <div ref={ref} className="py-2 px-4 mt-4 border-b border-gray-700/50 last:border-b-0">
          <div className="text-blue-300 font-bold text-lg">{item.item}</div>
        </div>
      );
    }

    const rowClasses = [
      'flex justify-between items-center py-3 px-4 gap-4 border-b border-gray-700/50 last:border-b-0 transition-all duration-300',
       isChecked
        ? 'bg-gray-800/50'
        : highlightStyle === 'next' && aircraftHighlightClasses
        ? aircraftHighlightClasses
        : highlightStyle === 'red'
        ? 'bg-red-900/60 ring-2 ring-red-600'
        : 'hover:bg-gray-700/40',
    ].join(' ');

    const textClasses = isChecked
      ? 'text-gray-500 line-through italic'
      : item.item === 'DEPOSER PLAN DE VOL ???'
      ? 'text-red-500 font-bold'
      : item.item === 'Balises de détresse !'
      ? 'text-red-500'
      : item.isWarning || item.item === 'Avion à laver'
      ? 'text-red-500 font-bold'
      : item.item === 'Feux NAV si vol de nuit'
      ? 'italic text-gray-400'
      : 'text-gray-300';
      
    const renderItemText = () => {
      const parts = item.item.split(/(\bON\b|\bOFF\b)/i);
      return parts.map((part, index) => {
        const lowerPart = part.toLowerCase();
        if (lowerPart === 'on') {
          return <strong key={index} className={highlightTextColor || 'text-green-400'}>{part}</strong>;
        }
        if (lowerPart === 'off') {
          return <strong key={index} className="text-zinc-500">{part}</strong>;
        }
        return part;
      });
    };

    return (
      <div ref={ref} className={rowClasses}>
        <div className={`flex-1 ${textClasses}`}>{renderItemText()}</div>
        <div className="flex-shrink-0 font-semibold text-white ml-auto">
          {item.action !== undefined ? (
            item.action
          ) : (
            <input
              type="checkbox"
              className={`h-5 w-5 bg-gray-900 border-gray-600 focus:ring-offset-gray-800 rounded ${checkboxClasses ?? 'accent-blue-500 focus:ring-blue-500'}`}
              aria-label={item.item}
              checked={isChecked ?? false}
              onChange={onToggle}
            />
          )}
        </div>
      </div>
    );
  }
);
ChecklistItemRow.displayName = 'ChecklistItemRow';

interface ChecklistSectionCardProps {
  section: ChecklistSection;
  sectionKeyPrefix: string;
  tabId: string;
  checkedState: Record<string, boolean>;
  itemStyles: Record<string, 'next' | 'red'>;
  itemRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>;
  onItemToggle: (key: string) => void;
  onSectionToggle: (keys: string[], shouldCheck: boolean) => void;
  aircraftHighlightClasses?: string;
  checkboxClasses?: string;
  highlightTextColor?: string;
  isFirstSection?: boolean;
  onCheckPreviousSections?: () => void;
  resetTrigger?: number;
  searchQuery?: string;
}

const ChecklistSectionCard: React.FC<ChecklistSectionCardProps> = ({ section, sectionKeyPrefix, tabId, checkedState, itemStyles, itemRefs, onItemToggle, onSectionToggle, aircraftHighlightClasses, checkboxClasses, highlightTextColor, isFirstSection, onCheckPreviousSections, resetTrigger, searchQuery }) => {
  const sectionCheckboxRef = useRef<HTMLInputElement>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const prevIsAllChecked = useRef(false);

  const sectionMatches = useMemo(() => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const str = (val: any) => typeof val === 'string' ? val.toLowerCase() : typeof val === 'number' ? val.toString() : '';
    if (str(section.title).includes(q)) return true;
    if (section.items?.some(i => str(i.item).includes(q) || str(i.action).includes(q))) return true;
    if (section.subsections?.some(sub => str(sub.title).includes(q) || sub.items?.some(i => str(i.item).includes(q) || str(i.action).includes(q)))) return true;
    return false;
  }, [section, searchQuery]);

  useEffect(() => {
    if (searchQuery) {
      setIsCollapsed(false);
    }
  }, [searchQuery]);

  const checkableItems = useMemo(() => {
    let items: { item: ChecklistItem; key: string }[] = [];
    if (section.items) {
      items = items.concat(
        section.items
          .map((item, index) => ({ item, key: `${sectionKeyPrefix}-${index}` }))
          .filter(({ item }) => item.action === undefined && !item.isNote)
      );
    }

    if (section.subsections) {
      section.subsections.forEach((sub, subIndex) => {
        if (sub.items) {
           items = items.concat(
              sub.items
                .map((item, index) => ({ item, key: `${sectionKeyPrefix}-s${subIndex}-${index}` }))
                .filter(({ item }) => item.action === undefined && !item.isNote)
           );
        }
      });
    }
    return items;
  }, [section, sectionKeyPrefix]);

  const checkedCount = useMemo(() => 
    checkableItems.filter(({ key }) => checkedState[key]).length
  , [checkableItems, checkedState]);
  
  const isAllChecked = checkableItems.length > 0 && checkedCount === checkableItems.length;
  const isIndeterminate = checkedCount > 0 && checkedCount < checkableItems.length;

  useEffect(() => {
    if (sectionCheckboxRef.current) {
      sectionCheckboxRef.current.indeterminate = isIndeterminate;
    }
  }, [isIndeterminate]);

  useEffect(() => {
    if (isAllChecked && !prevIsAllChecked.current) {
       setIsCollapsed(true);
       setTimeout(() => {
         const sectionIndex = parseInt(sectionKeyPrefix, 10);
         const nextSectionId = `section-${tabId}-${sectionIndex + 1}`;
         const el = document.getElementById(nextSectionId);
         if (el) {
           el.scrollIntoView({ behavior: 'smooth', block: 'start' });
         }
       }, 150);
    }
    prevIsAllChecked.current = isAllChecked;
  }, [isAllChecked, sectionKeyPrefix, tabId]);

  useEffect(() => {
    if (resetTrigger && resetTrigger > 0) {
      setIsCollapsed(false);
    }
  }, [resetTrigger]);

  const allItemKeys = checkableItems.map(i => i.key);

  if (!sectionMatches) {
    return null;
  }

  const matchesSearch = (text: any) => {
    if (!searchQuery) return true;
    if (typeof text === 'string') return text.toLowerCase().includes(searchQuery.toLowerCase());
    if (typeof text === 'number') return text.toString().includes(searchQuery.toLowerCase());
    return false;
  };

  const sectionTitleMatches = section.title && matchesSearch(section.title);

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg shadow-xl mb-8 transition-all duration-300">
      <h3 
        className="bg-gray-700/80 text-white text-lg font-bold p-3 border-b-2 border-blue-500 rounded-t-lg flex justify-between items-center cursor-pointer select-none"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <span>{section.title}</span>
        <div className="flex items-center gap-3">
          {!isFirstSection && onCheckPreviousSections && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCheckPreviousSections();
                }}
                className="text-gray-400 hover:text-blue-400 focus:outline-none transition-colors duration-200 flex items-center justify-center p-1"
                aria-label="Cocher les sections précédentes"
                title="Cocher et replier les sections précédentes"
              >
                <CheckCheck size={20} />
              </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsCollapsed(!isCollapsed);
            }}
            className="text-gray-400 hover:text-white focus:outline-none transition-transform duration-200 flex items-center justify-center p-1"
            style={{ transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)' }}
            aria-label={isCollapsed ? 'Déplier' : 'Replier'}
          >
            ▼
          </button>
          {checkableItems.length > 0 && (
            <input
              ref={sectionCheckboxRef}
              type="checkbox"
              onClick={(e) => e.stopPropagation()}
              className={`h-5 w-5 bg-gray-900 border-gray-600 focus:ring-offset-gray-800 rounded ${checkboxClasses ?? 'accent-blue-500 focus:ring-blue-500'}`}
              checked={isAllChecked}
              onChange={() => {
                const goingToUncheck = isAllChecked;
                onSectionToggle(allItemKeys, !isAllChecked);
                if (goingToUncheck && isCollapsed) {
                  setIsCollapsed(false);
                  setTimeout(() => {
                    const el = document.getElementById(`section-${tabId}-${sectionKeyPrefix.split('-')[0]}`);
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }, 150);
                }
              }}
              aria-label={`Cocher ou décocher tous les éléments pour ${section.title}`}
            />
          )}
        </div>
      </h3>
      {!isCollapsed && (
        <div className="animate-fade-in-down">
          {section.items && section.items.map((item, index) => {
             const itemKey = `${sectionKeyPrefix}-${index}`;
             const isCheckable = item.action === undefined && !item.isNote;
             const itemMatches = sectionTitleMatches || matchesSearch(item.item) || (item.action && matchesSearch(item.action));
             
             if (!itemMatches) return null;

             return (
              <ChecklistItemRow
                ref={el => { if (isCheckable) itemRefs.current[itemKey] = el; }}
                key={`main-${index}`}
                item={item}
                isChecked={checkedState[itemKey]}
                onToggle={isCheckable ? () => onItemToggle(itemKey) : undefined}
                highlightStyle={itemStyles[itemKey]}
                aircraftHighlightClasses={aircraftHighlightClasses}
                checkboxClasses={checkboxClasses}
                highlightTextColor={highlightTextColor}
              />
            );
          })}
          {section.subsections && section.subsections.map((sub, subIndex) => {
             const subTitleMatches = sub.title && matchesSearch(sub.title);
             const hasMatchingItems = sub.items?.some(i => matchesSearch(i.item) || (i.action && matchesSearch(i.action)));
             
             if (!sectionTitleMatches && !subTitleMatches && !hasMatchingItems) return null;

             return (
               <div key={`sub-${subIndex}`} id={`section-${tabId}-${sectionKeyPrefix.split('-')[0]}-sub-${subIndex}`} className="mt-4 first:mt-0 scroll-mt-24">
                  <div className="bg-gray-700/40 text-blue-300 font-bold px-4 py-2 text-sm uppercase tracking-wide border-y border-gray-700/50">
                      {sub.title}
                  </div>
                  {sub.items && sub.items.map((item, index) => {
                    const itemKey = `${sectionKeyPrefix}-s${subIndex}-${index}`;
                    const isCheckable = item.action === undefined && !item.isNote;
                    const itemMatches = sectionTitleMatches || subTitleMatches || matchesSearch(item.item) || (item.action && matchesSearch(item.action));
                    
                    if (!itemMatches) return null;

                    return (
                      <ChecklistItemRow
                        ref={el => { if (isCheckable) itemRefs.current[itemKey] = el; }}
                        key={`sub-item-${index}`}
                        item={item}
                        isChecked={checkedState[itemKey]}
                        onToggle={isCheckable ? () => onItemToggle(itemKey) : undefined}
                        highlightStyle={itemStyles[itemKey]}
                        aircraftHighlightClasses={aircraftHighlightClasses}
                        checkboxClasses={checkboxClasses}
                        highlightTextColor={highlightTextColor}
                      />
                    );
                  })}
               </div>
             );
          })}
        </div>
      )}
    </div>
  );
};

interface ChecklistContentProps {
  data: ChecklistData;
  recapData?: AircraftRecap;
  tabId: TabId;
  checkedState: Record<string, boolean>;
  onCheckedStateChange: (newState: Record<string, boolean>) => void;
  onReset: () => void;
}

const ChecklistContent: React.FC<ChecklistContentProps> = ({ data, recapData, tabId, checkedState, onCheckedStateChange, onReset }) => {
  const colors = AIRCRAFT_COLORS[tabId];
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCheckPreviousModalOpen, setIsCheckPreviousModalOpen] = useState(false);
  const [targetSectionIndexToCheck, setTargetSectionIndexToCheck] = useState<number | null>(null);
  const [itemStyles, setItemStyles] = useState<Record<string, 'next' | 'red'>>({});
  const [showSkippedWarning, setShowSkippedWarning] = useState(false);
  const [skippedCount, setSkippedCount] = useState(0);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const checkableItems = useMemo(() => {
    const items: { key: string }[] = [];
    data.content.forEach((section, sectionIndex) => {
      if (section.items) {
        section.items.forEach((item, itemIndex) => {
          if (item.action === undefined && !item.isNote) {
            items.push({ key: `${sectionIndex}-${itemIndex}` });
          }
        });
      }
      if (section.subsections) {
        section.subsections.forEach((sub, subIndex) => {
          if (sub.items) {
            sub.items.forEach((item, itemIndex) => {
              if (item.action === undefined && !item.isNote) {
                items.push({ key: `${sectionIndex}-s${subIndex}-${itemIndex}` });
              }
            });
          }
        });
      }
    });
    return items;
  }, [data.content]);

  useEffect(() => {
    // Reset highlights when data source changes (tab switch)
    setItemStyles({});
    setShowSkippedWarning(false);
    setSkippedCount(0);
  }, [data]);
  
  useEffect(() => {
    const newStyles: Record<string, 'next' | 'red'> = {};
    let firstSkippedItemKey: string | null = null;
    let nextItemToHighlightKey: string | null = null;
    let currentSkippedCount = 0;

    const checkedIndices = checkableItems
      .map((item, index) => (checkedState[item.key] ? index : -1))
      .filter((index) => index !== -1);
    
    if (checkedIndices.length === 0) {
      if (checkableItems.length > 0) {
        const firstItemKey = checkableItems[0].key;
        newStyles[firstItemKey] = 'next';
      }
    } else {
        const sortedChecked = [...checkedIndices].sort((a, b) => a - b);
        const firstCheckedIndex = sortedChecked[0];
        
        // Find skips before the very first checked item
        for (let i = 0; i < firstCheckedIndex; i++) {
            const itemKey = checkableItems[i].key;
            if (!checkedState[itemKey]) { // Should always be true
                newStyles[itemKey] = 'red';
                currentSkippedCount++;
                if (!firstSkippedItemKey) {
                    firstSkippedItemKey = itemKey;
                }
            }
        }

        // Find skips between subsequent checked items
        for (let i = 0; i < sortedChecked.length - 1; i++) {
            const current = sortedChecked[i];
            const next = sortedChecked[i + 1];
            if (next > current + 1) {
                for (let j = current + 1; j < next; j++) {
                    const itemKey = checkableItems[j].key;
                    if (!checkedState[itemKey]) {
                        newStyles[itemKey] = 'red';
                        currentSkippedCount++;
                        if (!firstSkippedItemKey) {
                            firstSkippedItemKey = itemKey;
                        }
                    }
                }
            }
        }
    }
    
    // Find next item to highlight
    const lastCheckedIndex = checkedIndices.length > 0 ? Math.max(...checkedIndices) : -1;
    
    if (lastCheckedIndex + 1 < checkableItems.length) {
      const nextItemKey = checkableItems[lastCheckedIndex + 1].key;
      if (!newStyles[nextItemKey] && !checkedState[nextItemKey]) {
        newStyles[nextItemKey] = 'next';
        nextItemToHighlightKey = nextItemKey;
      }
    }
    
    setItemStyles(newStyles);
    setShowSkippedWarning(currentSkippedCount > 0);
    setSkippedCount(currentSkippedCount);

    const scrollToKey = (key: string | null) => {
        if (!key) return;
        const element = itemRefs.current[key];
        if (!element) return;
        
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
        });
    };

    // Scroll logic: red takes precedence over blue
    if (firstSkippedItemKey) {
      scrollToKey(firstSkippedItemKey);
    } else if (nextItemToHighlightKey) {
      scrollToKey(nextItemToHighlightKey);
    }
  }, [checkedState, checkableItems]);


  const handleItemToggle = (key: string) => {
    onCheckedStateChange({
      ...checkedState,
      [key]: !checkedState[key],
    });
  };

  const handleSectionToggle = (keys: string[], shouldCheck: boolean) => {
    const newCheckedState = { ...checkedState };
    keys.forEach(key => {
      newCheckedState[key] = shouldCheck;
    });
    onCheckedStateChange(newCheckedState);
  };

  const handleCheckPreviousSectionsRequest = (targetSectionIndex: number) => {
    setTargetSectionIndexToCheck(targetSectionIndex);
    setIsCheckPreviousModalOpen(true);
  };

  const confirmCheckPreviousSections = () => {
    if (targetSectionIndexToCheck === null) return;
    
    const keysToCheck: string[] = [];
    data.content.forEach((section, sectionIndex) => {
      if (sectionIndex < targetSectionIndexToCheck) {
        if (section.items) {
          section.items.forEach((item, itemIndex) => {
            if (item.action === undefined && !item.isNote) {
              keysToCheck.push(`${sectionIndex}-${itemIndex}`);
            }
          });
        }
        if (section.subsections) {
          section.subsections.forEach((sub, subIndex) => {
            if (sub.items) {
               sub.items.forEach((item, itemIndex) => {
                 if (item.action === undefined && !item.isNote) {
                   keysToCheck.push(`${sectionIndex}-s${subIndex}-${itemIndex}`);
                 }
               });
            }
          });
        }
      }
    });
    
    const newCheckedState = { ...checkedState };
    keysToCheck.forEach(key => {
      newCheckedState[key] = true;
    });
    
    // Save target index before resetting state
    const targetIndex = targetSectionIndexToCheck;
    
    onCheckedStateChange(newCheckedState);
    setIsCheckPreviousModalOpen(false);
    setTargetSectionIndexToCheck(null);

    // Scroll to the targeted section after the DOM updates (since previous sections will collapse)
    setTimeout(() => {
      const el = document.getElementById(`section-${tabId}-${targetIndex}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 150);
  };
  
  const handleConfirmReset = () => {
    onReset();
    setResetTrigger(prev => prev + 1);
    setIsModalOpen(false);
  };

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <div className="text-center mb-8">
        {data.pdfUrl && colors ? (
          <a
            href={data.pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`block text-center text-2xl sm:text-3xl font-bold p-4 rounded-lg shadow-lg transition-transform duration-200 ease-in-out hover:scale-105 ${colors.bg} ${colors.text}`}
          >
            {data.title}
          </a>
        ) : (
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-white tracking-wide">
            {data.title}
          </h2>
        )}
         {data.content.length > 0 && (
            <div className="mt-4 flex justify-center items-center flex-nowrap w-full px-2 sm:px-0 gap-2 overflow-hidden">
                {['BUBK', 'GIYA', 'GKQA', 'GLVX', 'HMPI', 'HNNY', 'HPPL'].includes(tabId) && (
                    <span className="text-red-500 font-bold text-[10px] sm:text-sm whitespace-nowrap truncate">
                        Ne remplace pas le manuel de vol ⚠
                    </span>
                )}
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex-shrink-0 px-2 py-1 sm:px-3 sm:py-1 bg-gray-600 hover:bg-gray-500 text-white font-semibold text-xs sm:text-sm rounded-lg shadow-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
                    aria-label="Réinitialiser la checklist"
                >
                    Réinitialiser
                </button>
            </div>
        )}
        
        {!['PARAMS', 'RECAP', 'TARIFS'].includes(tabId) && (
            <div className="mt-2 w-full text-left">
                <PersonalNotes storageKey={tabId} />
            </div>
        )}

        {data.content.length > 0 && tabId !== 'PAX' && (
          <div className="mt-6 mb-8 text-left bg-gray-800/40 rounded-lg p-4 border border-gray-700/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Sommaire des sections</h4>
              <div className="relative w-full sm:w-64">
                 <input 
                   type="text" 
                   value={searchQuery}
                   onChange={e => setSearchQuery(e.target.value)}
                   placeholder="Rechercher..."
                   className="w-full bg-gray-700/50 border border-gray-600 rounded-md py-1.5 pl-3 pr-8 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                 />
                 {searchQuery && (
                   <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white" aria-label="Effacer la recherche">
                     ×
                   </button>
                 )}
              </div>
            </div>
            
            {!searchQuery && (
              <div className="flex flex-wrap gap-2">
                {data.content.map((section, index) => (
                  <React.Fragment key={index}>
                    <button
                    onClick={() => {
                      const el = document.getElementById(`section-${tabId}-${index}`);
                      if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }}
                    className="px-3 py-1.5 bg-gray-700/50 hover:bg-gray-600 text-gray-200 hover:text-white text-sm font-medium rounded-md transition-colors border border-gray-600/50 shadow-sm"
                  >
                    {section.title}
                  </button>
                  {section.subsections && section.subsections.length > 0 && (
                    <>
                      {section.subsections.map((sub, subIndex) => (
                        <button
                          key={`sub-${index}-${subIndex}`}
                          onClick={() => {
                            const el = document.getElementById(`section-${tabId}-${index}-sub-${subIndex}`);
                            if (el) {
                              el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }
                          }}
                          className="px-2.5 py-1.5 bg-gray-800 hover:bg-gray-700 text-blue-300 hover:text-blue-200 text-[13px] font-medium rounded-md transition-colors border border-gray-700 shadow-sm"
                        >
                          ↳ {sub.title}
                        </button>
                      ))}
                    </>
                  )}
                </React.Fragment>
              ))}
            </div>
            )}
          </div>
        )}
      </div>

      {recapData && <AircraftCard plane={recapData} showTitle={false} />}

      {data.content.length > 0 ? (
        <div>
          {data.content.map((section, index) => (
             <div key={index} id={`section-${tabId}-${index}`} className="scroll-mt-24">
               <ChecklistSectionCard
                section={section}
                sectionKeyPrefix={index.toString()}
                tabId={tabId}
                checkedState={checkedState}
                itemStyles={itemStyles}
                itemRefs={itemRefs}
                onItemToggle={handleItemToggle}
                onSectionToggle={handleSectionToggle}
                aircraftHighlightClasses={colors?.highlight}
                checkboxClasses={colors?.checkbox}
                highlightTextColor={colors?.highlightText}
                isFirstSection={index === 0}
                onCheckPreviousSections={() => handleCheckPreviousSectionsRequest(index)}
                resetTrigger={resetTrigger}
                searchQuery={searchQuery}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-400 mt-8 italic">
          Check-list vide pour le moment.
        </div>
      )}

      {isCheckPreviousModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-start justify-center pt-20 z-[60]" role="dialog" aria-modal="true" aria-labelledby="modal-check-title">
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl border border-gray-600 w-full max-w-sm mx-4">
            <h3 id="modal-check-title" className="text-xl font-bold mb-4 text-white">Cocher les sections précédentes ?</h3>
            <p className="text-gray-300 mb-6 font-medium">Êtes-vous sûr de vouloir cocher et replier toutes les sections précédentes ?</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setIsCheckPreviousModalOpen(false);
                  setTargetSectionIndexToCheck(null);
                }}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded font-semibold transition-colors duration-200"
              >
                Annuler
              </button>
              <button
                onClick={confirmCheckPreviousSections}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-semibold transition-colors duration-200"
              >
                Cocher tout
              </button>
            </div>
          </div>
        </div>
      )}

       {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-start justify-center pt-20 z-50" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl border border-gray-600 w-full max-w-sm mx-4">
            <h3 id="modal-title" className="text-xl font-bold mb-4 text-white">Réinitialiser la checklist ?</h3>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmReset}
                className="px-4 py-2 bg-red-700 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
       {createPortal(
            <WarningPopup isVisible={showSkippedWarning} onClose={() => setShowSkippedWarning(false)} skippedCount={skippedCount} />,
            document.body
        )}
    </div>
  );
};

export default ChecklistContent;