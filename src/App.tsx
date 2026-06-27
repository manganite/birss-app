/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Search, Github } from 'lucide-react';
import { POINT_GROUPS, PointGroupData } from './data/pointGroups';
import {
  TensorTimeReversal,
  TensorType,
  calculateSymbolicSHGExpressions,
} from './services/tensorCalculator';
import { PointGroupExplorer } from './components/PointGroupExplorer';
import { HelpPage } from './components/HelpPage';
import { SimulatorPage } from './components/SimulatorPage';
import { CalculatorPage } from './components/CalculatorPage';
import { FormatPointGroup } from './components/MathComponents';

const normalizeString = (str: string) => {
  return str
    .toLowerCase()
    .replace(/[''`´,]/g, "'")
    .replace(/\s+/g, "");
};

type GroupCategory = 'All' | 'Ordinary' | 'Gray' | 'Black & White';

const getGroupCategory = (name: string): GroupCategory => {
  if (name.endsWith("1'")) return 'Gray';
  if (name.includes("'")) return 'Black & White';
  return 'Ordinary';
};

export default function App() {
  const [currentView, setCurrentView] = useState<'calculator' | 'simulator' | 'explorer' | 'help'>('explorer');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [activeCategory, setActiveCategory] = useState<GroupCategory>('All');
  const [selectedGroup, setSelectedGroup] = useState<PointGroupData | null>(null);
  const [selectedTensorType, setSelectedTensorType] = useState<TensorType>('ED');
  const [selectedTimeReversal, setSelectedTimeReversal] = useState<TensorTimeReversal>('i');
  const [selectedSetting, setSelectedSetting] = useState<number>(1);
  const [amplitudes, setAmplitudes] = useState<Record<string, number>>({});
  const [phases, setPhases] = useState<Record<string, number>>({});

  const [thetaX, setThetaX] = useState<number>(0);
  const [thetaY, setThetaY] = useState<number>(0);
  const [psi0, setPsi0] = useState<number>(0);
  const [phiX, setPhiX] = useState<number>(0);
  const [phiY, setPhiY] = useState<number>(0);
  const [psi, setPsi] = useState<number>(0);

  const filteredGroups = useMemo(() => {
    let groups = POINT_GROUPS;
    if (activeCategory !== 'All') {
      groups = groups.filter(pg => getGroupCategory(pg.name) === activeCategory);
    }
    if (searchQuery) {
      const normalizedQuery = normalizeString(searchQuery);
      groups = groups.filter(pg =>
        normalizeString(pg.name).includes(normalizedQuery) ||
        normalizeString(pg.crystalSystem).includes(normalizedQuery)
      );
    }
    return groups;
  }, [searchQuery, activeCategory]);

  const symbolicExpressions = useMemo(
    () => selectedGroup ? calculateSymbolicSHGExpressions({ groupName: selectedGroup.name, tensorType: selectedTensorType, trType: selectedTimeReversal, thetaX, thetaY, psi0, setting: selectedSetting }) : null,
    [selectedGroup, selectedTensorType, selectedTimeReversal, thetaX, thetaY, psi0, selectedSetting]
  );

  const handleSelect = (group: PointGroupData) => {
    setSelectedGroup(group);
    setSelectedSetting(1);
    setSearchQuery('');
    setIsSearchFocused(false);
    if (currentView === 'explorer' || currentView === 'help') {
      setCurrentView('calculator');
    }
  };

  const tensorConfig = {
    type: selectedTensorType, setType: setSelectedTensorType,
    timeReversal: selectedTimeReversal, setTimeReversal: setSelectedTimeReversal,
    setting: selectedSetting, setSetting: setSelectedSetting,
  };

  const orientation = {
    thetaX, setThetaX, thetaY, setThetaY, psi0, setPsi0,
    phiX, setPhiX, phiY, setPhiY, psi, setPsi,
  };

  const simulation = {
    amplitudes, setAmplitudes, phases, setPhases,
  };

  return (
    <div className="min-h-screen bg-paper text-ink font-sans selection:bg-ink selection:text-paper">
      {/* Header */}
      <header className="border-b border-ink bg-paper px-6 py-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-4">

          {/* Left: Title & Tagline */}
          <div className="flex items-center">
            <h1 className="text-2xl font-serif italic tracking-tight leading-none">
              The Birss App
            </h1>
            <span className="hidden md:inline-block text-xs opacity-60 ml-4 border-l border-ink border-opacity-20 pl-4">
              Nonlinear optical tensors for magnetic point groups
            </span>
          </div>

          {/* Center: Navigation Pills */}
          <div className="flex items-center bg-white/40 border border-ink border-opacity-10 rounded-full p-1 self-start lg:self-auto">
            <button
              onClick={() => setCurrentView('explorer')}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${currentView === 'explorer' ? 'bg-ink text-paper' : 'hover:bg-ink/5 text-ink/70'}`}
            >
              Explorer
            </button>
            <button
              onClick={() => setCurrentView('calculator')}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${currentView === 'calculator' ? 'bg-ink text-paper' : 'hover:bg-ink/5 text-ink/70'}`}
            >
              Calculator
            </button>
            <button
              onClick={() => setCurrentView('simulator')}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${currentView === 'simulator' ? 'bg-ink text-paper' : 'hover:bg-ink/5 text-ink/70'}`}
            >
              Simulator
            </button>
            <button
              onClick={() => setCurrentView('help')}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${currentView === 'help' ? 'bg-ink text-paper' : 'hover:bg-ink/5 text-ink/70'}`}
            >
              Help
            </button>
          </div>

          {/* Right: Search & GitHub */}
          <div className="flex items-center gap-4 self-start lg:self-auto w-full lg:w-auto">
            <div className="relative w-full lg:w-64">
              <div className="flex items-center bg-white/50 border border-ink border-opacity-20 rounded-full px-3 py-1.5 focus-within:border-opacity-100 focus-within:bg-white transition-all">
                <Search className="w-3.5 h-3.5 opacity-50" />
                <input
                  type="text"
                  placeholder="Search groups (e.g., 4/m, 4'/m, 11')"
                  className="bg-transparent border-none outline-none w-full text-xs ml-2 placeholder:opacity-40"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setHighlightedIndex(-1); }}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                  role="combobox"
                  aria-expanded={isSearchFocused}
                  aria-controls="group-search-listbox"
                  aria-autocomplete="list"
                  aria-activedescendant={highlightedIndex >= 0 ? `group-option-${filteredGroups[highlightedIndex]?.name}` : undefined}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowDown') {
                      e.preventDefault();
                      setHighlightedIndex(i => Math.min(i + 1, filteredGroups.length - 1));
                    } else if (e.key === 'ArrowUp') {
                      e.preventDefault();
                      setHighlightedIndex(i => Math.max(i - 1, -1));
                    } else if (e.key === 'Enter') {
                      if (highlightedIndex >= 0 && filteredGroups[highlightedIndex]) {
                        e.preventDefault();
                        handleSelect(filteredGroups[highlightedIndex]);
                      }
                    } else if (e.key === 'Escape') {
                      setIsSearchFocused(false);
                      e.currentTarget.blur();
                    }
                  }}
                />
              </div>

              <AnimatePresence>
                {isSearchFocused && (
                  <motion.div
                    id="group-search-listbox"
                    role="listbox"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute top-[calc(100%+8px)] right-0 w-full lg:w-80 bg-paper border border-ink rounded-lg z-50 shadow-xl flex flex-col max-h-[400px] overflow-hidden"
                  >
                    <div className="p-3 border-b border-ink border-opacity-10 bg-white/30 text-[10px] opacity-60 leading-tight">
                      Use an apostrophe (') for time-reversed elements (Black & White) and append 1' for Gray groups.
                    </div>

                    <div className="p-2 border-b border-ink/10 flex flex-wrap gap-1 bg-white/10 sticky top-0 z-10">
                      {(['All', 'Ordinary', 'Gray', 'Black & White'] as GroupCategory[]).map(cat => (
                        <button
                          key={cat}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => setActiveCategory(cat)}
                          className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded-full transition-colors ${activeCategory === cat ? 'bg-ink text-paper' : 'bg-transparent text-ink hover:bg-ink/10'}`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>

                    <div className="overflow-y-auto flex-1 p-2">
                      {filteredGroups.length > 0 ? filteredGroups.map((group, idx) => (
                        <button
                          key={group.name}
                          id={`group-option-${group.name}`}
                          role="option"
                          aria-selected={idx === highlightedIndex}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleSelect(group)}
                          className={`w-full text-left px-3 py-2 hover:bg-ink hover:text-paper transition-colors flex justify-between items-center group rounded-md ${idx === highlightedIndex ? 'bg-ink/10' : ''}`}
                        >
                          <span className="text-sm font-serif italic"><FormatPointGroup name={group.name} /></span>
                          <span className="text-[10px] uppercase tracking-widest opacity-50 group-hover:opacity-100">{group.crystalSystem}</span>
                        </button>
                      )) : (
                        <div className="p-4 text-center text-xs opacity-50">No groups found</div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <a
              href="https://github.com/manganite/birss-app"
              target="_blank"
              rel="noopener noreferrer"
              className="opacity-40 hover:opacity-100 transition-opacity hidden sm:block"
              title="View source on GitHub"
            >
              <Github className="w-5 h-5" />
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-8 md:p-12">
        {currentView === 'help' ? (
          <HelpPage />
        ) : currentView === 'explorer' ? (
          <PointGroupExplorer
            onSelectGroupForCalculator={(group) => {
              setSelectedGroup(group);
              setCurrentView('calculator');
            }}
          />
        ) : currentView === 'simulator' ? (
          <SimulatorPage
            selectedGroup={selectedGroup}
            tensorConfig={tensorConfig}
            orientation={orientation}
            symbolicExpressions={symbolicExpressions}
            simulation={simulation}
          />
        ) : (
          <CalculatorPage
            selectedGroup={selectedGroup}
            tensorConfig={tensorConfig}
            presetAngles={{ thetaX, setThetaX, thetaY, setThetaY, psi0, setPsi0 }}
            symbolicExpressions={symbolicExpressions}
            onNavigate={(view) => setCurrentView(view as 'calculator' | 'simulator' | 'explorer' | 'help')}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-24 border-t border-ink p-8 text-center space-y-2">
        <p className="text-[10px] uppercase tracking-[0.5em] opacity-30">
          The Birss App &copy; 2026
        </p>
        <p className="text-[10px] uppercase tracking-[0.2em] opacity-30">
          By{' '}
          <a
            href="https://github.com/manganite"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:opacity-100 transition-opacity"
          >
            Thomas Lottermoser
          </a>
        </p>
        <p className="text-[10px] uppercase tracking-[0.2em] opacity-30">
          <a
            href={`https://github.com/manganite/birss-app/releases/tag/v${__APP_VERSION__}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:opacity-100 transition-opacity"
          >
            v{__APP_VERSION__}
          </a>
          {' '}&middot;{' '}
          <a
            href={`https://github.com/manganite/birss-app/releases/tag/v${__APP_VERSION__}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:opacity-100 transition-opacity"
          >
            What&apos;s new
          </a>
          {' '}&middot;{' '}
          <a
            href="https://github.com/manganite/birss-app/blob/main/LICENSE"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:opacity-100 transition-opacity"
          >
            MIT License
          </a>
        </p>
      </footer>
    </div>
  );
}
