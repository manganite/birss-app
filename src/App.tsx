/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Info, Layers, Zap, Minus, Compass, Github, ChevronDown, ChevronUp } from 'lucide-react';
import { POINT_GROUPS, PointGroupData } from './data/pointGroups';
import {
  calculateTensorComponents,
  TensorTimeReversal,
  isCentrosymmetric,
  calculateSHGExpressions,
  SHGExpression,
  TensorType,
  getSymmetryOperations,
  getLabFrameVectors,
  getAlternateSettings,
  getFutureSettingCount,
  calculateSymbolicSHGExpressions,
  formatSymbolicSourceTerm,
} from './services/tensorCalculator';
import { PointGroupExplorer } from './components/PointGroupExplorer';
import { HelpPage } from './components/HelpPage';
import { SimulatorPage } from './components/SimulatorPage';
import { FormatPointGroup, SymmetryOperation, TensorTerm, getCrystalIcon, getPresetsForSystem, LabFrameOrientation, AxisOrientationInfo, hklToPresetAngles } from './components/MathComponents';
import { InlineMath } from 'react-katex';

const normalizeString = (str: string) => {
  return str
    .toLowerCase()
    .replace(/[’‘`´,]/g, "'") // Replace curly quotes, backticks, commas with standard apostrophe
    .replace(/\s+/g, "");     // Remove all spaces
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
  const [selectedTensorType, setSelectedTensorType] = useState<'ED' | 'MD' | 'EQ'>('ED');
  const [selectedTimeReversal, setSelectedTimeReversal] = useState<TensorTimeReversal>('i');
  const [activeResultTab, setActiveResultTab] = useState<'components' | 'induced' | 'source'>('components');
  const [amplitudes, setAmplitudes] = useState<Record<string, number>>({});
  const [phases, setPhases] = useState<Record<string, number>>({});
  const [selectedSetting, setSelectedSetting] = useState<number>(1);
  const [mobileSourceExpanded, setMobileSourceExpanded] = useState(false);
  const [mobileClassificationExpanded, setMobileClassificationExpanded] = useState(false);
  const [mobileSetupExpanded, setMobileSetupExpanded] = useState(false);
  const [mobileTensorNotesExpanded, setMobileTensorNotesExpanded] = useState(false);
  const [hklInput, setHklInput] = useState('');

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

  const handleSelect = (group: PointGroupData) => {
    setSelectedGroup(group);
    setSelectedSetting(1);
    setSearchQuery('');
    setIsSearchFocused(false);
    if (currentView === 'explorer' || currentView === 'help') {
      setCurrentView('calculator');
    }
  };


  const currentComponents = useMemo(() => {
    if (!selectedGroup) return [];
    return calculateTensorComponents(selectedGroup.name, selectedTensorType, selectedTimeReversal, selectedSetting);
  }, [selectedGroup, selectedTensorType, selectedTimeReversal, selectedSetting]);

  const currentOperations = useMemo(() => {
    if (!selectedGroup) return [];
    return getSymmetryOperations(selectedGroup.name, selectedSetting);
  }, [selectedGroup, selectedSetting]);

  const [thetaX, setThetaX] = useState<number>(0);
  const [thetaY, setThetaY] = useState<number>(0);
  const [phiX, setPhiX] = useState<number>(0);
  const [phiY, setPhiY] = useState<number>(0);
  const [psi, setPsi] = useState<number>(0);

  const tensorMeta = {
    ED: { label: 'Electric Dipole', rank: 'RANK 3', type: 'POLAR' },
    MD: { label: 'Magnetic Dipole', rank: 'RANK 3', type: 'AXIAL' },
    EQ: { label: 'Electric Quadrupole', rank: 'RANK 4', type: 'POLAR' },
  };

  const labFrameBase = useMemo(() => getLabFrameVectors({ thetaX, thetaY, phiX: 0, phiY: 0, psi: 0 }), [thetaX, thetaY]);
  const currentExpressions = useMemo(
    () => calculateSHGExpressions({ groupName: selectedGroup?.name || "", tensorType: selectedTensorType, trType: selectedTimeReversal, thetaX, thetaY, phiX: 0, phiY: 0, psi: 0, setting: selectedSetting }),
    [selectedGroup, selectedTensorType, selectedTimeReversal, thetaX, thetaY, selectedSetting]
  );

  const symbolicExpressions = useMemo(
    () => selectedGroup ? calculateSymbolicSHGExpressions({ groupName: selectedGroup.name, tensorType: selectedTensorType, trType: selectedTimeReversal, thetaX, thetaY, setting: selectedSetting }) : null,
    [selectedGroup, selectedTensorType, selectedTimeReversal, thetaX, thetaY, selectedSetting]
  );

  const sourceTerms = currentExpressions.source;
  const inducedTerms = currentExpressions.induced;

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
            selectedTensorType={selectedTensorType}
            setSelectedTensorType={setSelectedTensorType}
            selectedTimeReversal={selectedTimeReversal}
            setSelectedTimeReversal={setSelectedTimeReversal}
            thetaX={thetaX}
            setThetaX={setThetaX}
            thetaY={thetaY}
            setThetaY={setThetaY}
            phiX={phiX}
            setPhiX={setPhiX}
            phiY={phiY}
            setPhiY={setPhiY}
            psi={psi}
            setPsi={setPsi}
            selectedSetting={selectedSetting}
            symbolicExpressions={symbolicExpressions}
            amplitudes={amplitudes}
            setAmplitudes={setAmplitudes}
            phases={phases}
            setPhases={setPhases}
          />
        ) : !selectedGroup ? (
          <div className="h-[50vh] flex flex-col items-center justify-center text-center space-y-8">
            <div className="w-24 h-24 border border-ink border-dashed rounded-full flex items-center justify-center animate-spin-slow">
              <Layers className="w-8 h-8 opacity-20" />
            </div>
            <div className="space-y-2">
              <p className="text-xl font-serif italic opacity-40">Select a point group to begin analysis</p>
              <p className="text-[10px] uppercase tracking-[0.3em] opacity-30">International Notation (Hermann-Mauguin)</p>
            </div>
          </div>
        ) : (
          <motion.div 
            key={selectedGroup.name}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-12"
          >
            {/* Summary Sidebar — below results on mobile, left column on desktop */}
            <div className="order-last lg:order-first space-y-12">
              {/* Mobile: compact group indicator always visible */}
              <div className="lg:hidden">
                <button
                  type="button"
                  aria-expanded={mobileClassificationExpanded}
                  onClick={() => setMobileClassificationExpanded(!mobileClassificationExpanded)}
                  className="flex items-center justify-between w-full p-4 border border-ink border-opacity-10 bg-white/30"
                >
                  <div className="flex items-center gap-3">
                    {getCrystalIcon(selectedGroup.crystalSystem)}
                    <div className="text-left">
                      <span className="text-lg font-serif italic"><FormatPointGroup name={selectedGroup.name} /></span>
                      <span className="text-xs opacity-50 ml-2">{selectedGroup.crystalSystem}</span>
                      {isCentrosymmetric(selectedGroup.name) && <span className="text-xs opacity-50 ml-2">· Centro</span>}
                    </div>
                  </div>
                  {mobileClassificationExpanded ? <ChevronUp className="w-4 h-4 opacity-50" /> : <ChevronDown className="w-4 h-4 opacity-50" />}
                </button>
              </div>

              {/* Full classification — always on desktop, expandable on mobile */}
              <section className={`space-y-6 ${mobileClassificationExpanded ? '' : 'hidden lg:block'}`}>
                <div className="text-[10px] uppercase tracking-[0.2em] opacity-50 flex items-center gap-2">
                  <Info className="w-3 h-3" />
                  Classification
                </div>
                <div className="space-y-4">
                  <div>
                    <h2 className="text-5xl font-serif italic"><FormatPointGroup name={selectedGroup.name} /></h2>
                    <p className="text-xs uppercase tracking-widest opacity-50 mt-1">
                      {selectedGroup.type === 'I' ? 'Standard' : selectedGroup.type === 'II' ? 'Gray' : 'Magnetic'} Point Group
                    </p>
                  </div>
                  <div className="flex items-center gap-3 p-4 border border-ink border-opacity-10">
                    {getCrystalIcon(selectedGroup.crystalSystem)}
                    <div>
                      <p className="text-sm font-medium">{selectedGroup.crystalSystem}</p>
                      <p className="text-[10px] uppercase tracking-widest opacity-50">Crystal System</p>
                    </div>
                  </div>
                  <div className={`p-4 border border-ink ${isCentrosymmetric(selectedGroup.name) ? 'bg-ink text-paper' : 'border-opacity-10'}`}>
                    <p className="text-sm font-medium">
                      {isCentrosymmetric(selectedGroup.name) ? 'Centrosymmetric' : 'Non-Centrosymmetric'}
                    </p>
                    <p className="text-[10px] uppercase tracking-widest opacity-50">Symmetry Type</p>
                  </div>

                  <div className="p-4 border border-ink border-opacity-10 space-y-3">
                    <p className="text-[10px] uppercase tracking-widest opacity-50">Symmetry Operations ({currentOperations.length})</p>
                    <div className="flex flex-wrap gap-1.5">
                      {currentOperations.map((op, i) => (
                        <SymmetryOperation key={i} symbol={op} />
                      ))}
                    </div>
                  </div>

                  <AxisOrientationInfo crystalSystem={selectedGroup.crystalSystem} />
                </div>
              </section>
            </div>

            {/* Main Content: Tensor Components */}
            <div className="lg:col-span-2 space-y-8">
              {/* Tensor Type Selector — collapsible on mobile at defaults */}
              <div className="flex flex-col gap-6 border-b border-ink border-opacity-10 pb-8">
                {/* Mobile compact indicator when at defaults */}
                {selectedTensorType === 'ED' && selectedTimeReversal === 'i' && !mobileSetupExpanded && (
                  <button
                    type="button"
                    aria-expanded={false}
                    onClick={() => setMobileSetupExpanded(true)}
                    className="md:hidden flex items-center justify-between p-3 border border-ink/10 bg-white/30 text-xs"
                  >
                    <span className="opacity-60">Electric Dipole · i-type (Time-Even)</span>
                    <ChevronDown className="w-3.5 h-3.5 opacity-50" />
                  </button>
                )}

                {/* Full setup controls — always on desktop, expandable on mobile */}
                <div className={selectedTensorType === 'ED' && selectedTimeReversal === 'i' && !mobileSetupExpanded ? 'hidden md:flex flex-col gap-6' : 'flex flex-col gap-6'}>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] uppercase tracking-[0.2em] opacity-50">Tensor Classification</p>
                      {mobileSetupExpanded && (
                        <button type="button" aria-label="Collapse setup controls" onClick={() => setMobileSetupExpanded(false)} className="md:hidden opacity-50 hover:opacity-100">
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {(['ED', 'MD', 'EQ'] as const).map((type) => (
                        <button
                          key={type}
                          onClick={() => setSelectedTensorType(type)}
                          className={`px-4 py-2 text-[10px] uppercase tracking-[0.2em] transition-all border border-ink ${
                            selectedTensorType === type
                              ? 'bg-ink text-paper'
                              : 'hover:bg-ink hover:text-paper opacity-50 hover:opacity-100 border-opacity-20'
                          }`}
                        >
                          {tensorMeta[type].label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-[10px] uppercase tracking-[0.2em] opacity-50">Time-Reversal Symmetry</p>
                    <div className="flex gap-3">
                      {(['i', 'c'] as const).map((tr) => (
                        <button
                          key={tr}
                          onClick={() => setSelectedTimeReversal(tr)}
                          className={`px-6 py-2 text-[10px] uppercase tracking-[0.2em] transition-all border border-ink ${
                            selectedTimeReversal === tr
                              ? 'bg-ink text-paper'
                              : 'hover:bg-ink hover:text-paper opacity-50 hover:opacity-100 border-opacity-20'
                          }`}
                        >
                          {tr === 'i' ? 'i-type (Time-Even)' : 'c-type (Time-Odd)'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {(() => {
                  const altSettings = getAlternateSettings(selectedGroup.name);
                  const futureCount = getFutureSettingCount(selectedGroup.name);
                  if (!altSettings && !futureCount) return null;
                  return (
                    <div className="space-y-3">
                      <p className="text-[10px] uppercase tracking-[0.2em] opacity-50">Crystal Setting</p>
                      {altSettings ? (
                        <div className="flex flex-wrap gap-3">
                          <button
                            onClick={() => setSelectedSetting(1)}
                            className={`px-4 py-2 text-[10px] uppercase tracking-[0.2em] transition-all border border-ink ${
                              selectedSetting === 1
                                ? 'bg-ink text-paper'
                                : 'hover:bg-ink hover:text-paper opacity-50 hover:opacity-100 border-opacity-20'
                            }`}
                          >
                            Default
                          </button>
                          {altSettings.map((s, i) => (
                            <button
                              key={i}
                              onClick={() => setSelectedSetting(i + 2)}
                              className={`px-4 py-2 text-[10px] uppercase tracking-[0.2em] transition-all border border-ink ${
                                selectedSetting === i + 2
                                  ? 'bg-ink text-paper'
                                  : 'hover:bg-ink hover:text-paper opacity-50 hover:opacity-100 border-opacity-20'
                              }`}
                            >
                              {s.name}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs opacity-40 italic">{futureCount} settings — selection coming</p>
                      )}
                    </div>
                  );
                })()}
              </div>

              <div className="bg-white/50 border border-ink overflow-hidden">
                {/* Tab Menu — desktop only */}
                <div className="hidden md:flex overflow-x-auto border-b border-ink border-opacity-20 bg-white/30 hide-scrollbar">
                  <button
                    onClick={() => setActiveResultTab('components')}
                    className={`px-6 py-4 text-xs font-medium uppercase tracking-wider whitespace-nowrap transition-colors ${activeResultTab === 'components' ? 'bg-ink text-paper' : 'hover:bg-ink/5 text-ink/70'}`}
                  >
                    Tensor Components
                  </button>
                  <button
                    onClick={() => setActiveResultTab('induced')}
                    className={`px-6 py-4 text-xs font-medium uppercase tracking-wider whitespace-nowrap transition-colors border-l border-ink border-opacity-10 ${activeResultTab === 'induced' ? 'bg-ink text-paper' : 'hover:bg-ink/5 text-ink/70'}`}
                  >
                    Induced Response
                  </button>
                  <button
                    onClick={() => setActiveResultTab('source')}
                    className={`px-6 py-4 text-xs font-medium uppercase tracking-wider whitespace-nowrap transition-colors border-l border-ink border-opacity-10 ${activeResultTab === 'source' ? 'bg-ink text-paper' : 'hover:bg-ink/5 text-ink/70'}`}
                  >
                    Source Terms
                  </button>
                </div>

                {/* Content — mobile: stacked scroll, desktop: tab-controlled */}
                <div className="p-6 md:p-8 md:min-h-[400px] space-y-8 md:space-y-0">
                  {/* Components — always on mobile, tab-controlled on desktop */}
                  <div className={activeResultTab !== 'components' ? 'md:hidden' : ''}>
                    <div className="space-y-6">
                      <div className="flex justify-between items-center border-b border-ink border-opacity-10 pb-4">
                        <div className="text-[10px] uppercase tracking-[0.2em] opacity-50 flex items-center gap-2">
                          <Zap className="w-3 h-3" />
                          {tensorMeta[selectedTensorType].label} Tensor ({tensorMeta[selectedTensorType].type})
                        </div>
                        <div className="text-[10px] font-mono opacity-50">RANK {tensorMeta[selectedTensorType].rank}</div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                        {currentComponents.map((comp, i) => {
                          const isNull = comp.toLowerCase().includes('zero') || comp.toLowerCase().includes('none') || comp.includes('not supported');
                          if (isNull) {
                            return (
                              <div key={i} className="group border-b border-ink border-opacity-10 pb-4 hover:border-opacity-100 transition-all">
                                <div className="text-lg font-mono tracking-tighter opacity-30">
                                  {comp}
                                </div>
                                <div className="text-[9px] uppercase tracking-[0.2em] opacity-30 mt-1 group-hover:opacity-100">
                                  Null State
                                </div>
                              </div>
                            );
                          }

                          const parts = comp.split('=').map(p => p.trim());
                          return (
                            <div key={i} className="group border-b border-ink border-opacity-10 pb-4 hover:border-opacity-100 transition-all">
                              <div className="text-lg font-mono tracking-tighter flex flex-wrap items-baseline gap-2">
                                <TensorTerm term={parts[0]} isNull={false} />
                                {parts.length > 1 && parts.slice(1).map((part, pi) => (
                                  <div key={pi} className="flex items-baseline gap-2">
                                    <span className="text-xs opacity-30"><InlineMath math="=" /></span>
                                    <TensorTerm term={part} isNull={false} />
                                  </div>
                                ))}
                              </div>
                              <div className="text-[9px] uppercase tracking-[0.2em] opacity-30 mt-1 group-hover:opacity-100">
                                Active Component
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {selectedTensorType === 'ED' && isCentrosymmetric(selectedGroup.name) && (
                        <div className="p-6 border border-ink border-dashed flex items-center gap-4 opacity-50 mt-8">
                          <Info className="w-5 h-5" />
                          <p className="text-xs leading-relaxed italic">
                            In centrosymmetric point groups, all components of the second-order nonlinear susceptibility
                            tensor <InlineMath math="\chi^{(2)}" /> (Electric Dipole) vanish under the inversion operation.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Induced — always on mobile, tab-controlled on desktop */}
                  <div className={activeResultTab !== 'induced' ? 'md:hidden' : ''}>
                    <div className="space-y-6">
                      <div className="flex justify-between items-center border-b border-ink border-opacity-10 pb-4 pt-4 md:pt-0 border-t md:border-t-0 border-ink/10">
                        <div className="text-[10px] uppercase tracking-[0.2em] opacity-50 flex items-center gap-2">
                          <Compass className="w-3 h-3" />
                          {selectedTensorType === 'ED' ? 'Induced Polarization' : selectedTensorType === 'MD' ? 'Induced Magnetization' : 'Induced Quadrupole'} (CRYSTAL FRAME)
                        </div>
                        <div className="text-[10px] font-mono opacity-50">FULL FIELD COMPONENTS</div>
                      </div>

                      <div className="space-y-6">
                        {inducedTerms.map((expr, i) => {
                          const isNull = expr.expression === "0";
                          return (
                            <div key={i} className="flex flex-col md:flex-row md:items-center gap-4 border-b border-ink border-opacity-10 pb-4">
                              <div className="w-16 font-mono text-xl">
                                <TensorTerm term={expr.component} isNull={isNull} />
                              </div>
                              <div className="flex-1 font-mono text-xl tracking-tight overflow-x-auto whitespace-nowrap pb-2 md:pb-0">
                                <span className="opacity-30 mr-4"><InlineMath math="=" /></span>
                                <TensorTerm term={expr.expression} isNull={isNull} />
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="p-4 border border-ink border-dashed text-[10px] uppercase tracking-widest opacity-60 leading-relaxed mt-8">
                        Note: This calculation assumes two identical input fields <InlineMath math="E(\omega)" />.
                        The full electric field vector is considered for the induced response.
                      </div>
                    </div>
                  </div>

                  {/* Source Terms — disclosure on mobile, tab-controlled on desktop */}
                  <div className={activeResultTab !== 'source' ? 'md:hidden' : ''}>
                    <button
                      type="button"
                      aria-expanded={mobileSourceExpanded}
                      onClick={() => setMobileSourceExpanded(!mobileSourceExpanded)}
                      className="md:hidden flex items-center justify-between w-full pt-4 border-t border-ink/10 pb-2"
                    >
                      <span className="text-[10px] uppercase tracking-[0.2em] opacity-50 flex items-center gap-2">
                        <Compass className="w-3 h-3" />
                        Source Terms (Lab Frame)
                      </span>
                      {mobileSourceExpanded ? <ChevronUp className="w-3.5 h-3.5 opacity-50" /> : <ChevronDown className="w-3.5 h-3.5 opacity-50" />}
                    </button>

                    <div className={!mobileSourceExpanded ? 'hidden md:block' : ''}>
                      <div className="space-y-6">
                        <div className="hidden md:flex justify-between items-center border-b border-ink border-opacity-10 pb-4">
                          <div className="text-[10px] uppercase tracking-[0.2em] opacity-50 flex items-center gap-2">
                            <Compass className="w-3 h-3" />
                            Source Term Components S (Lab Frame)
                          </div>
                          <div className="text-[10px] font-mono opacity-50">
                            {selectedTensorType === 'ED' ? <InlineMath math="S \propto P" /> : selectedTensorType === 'MD' ? <InlineMath math="S \propto \nabla \times M" /> : <InlineMath math="S \propto \nabla \cdot Q" />}
                          </div>
                        </div>

                        <div className="space-y-6 border-b border-ink border-opacity-10 pb-6">
                          <div className="space-y-3">
                            <p className="text-[10px] uppercase tracking-[0.2em] opacity-50">
                              Select the direction of light propagation relative to the crystal axes
                            </p>
                            <div className="flex flex-wrap gap-3 items-center">
                              {getPresetsForSystem(selectedGroup.crystalSystem).map((ori) => (
                                <button
                                  key={ori.label}
                                  onClick={() => {
                                    setThetaX(ori.tx);
                                    setThetaY(ori.ty);
                                    setHklInput('');
                                  }}
                                  className={`px-4 py-2 text-[12px] tracking-[0.1em] transition-all border border-ink ${
                                    thetaX === ori.tx && thetaY === ori.ty && !hklInput
                                      ? 'bg-ink text-paper'
                                      : 'hover:bg-ink hover:text-paper opacity-50 hover:opacity-100 border-opacity-20'
                                  }`}
                                >
                                  <InlineMath math={ori.math} />
                                </button>
                              ))}
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] uppercase tracking-[0.1em] opacity-40">or</span>
                                <div className="relative">
                                  <input
                                    type="text"
                                    value={hklInput}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setHklInput(val);
                                      const parts = val.trim().split(/[\s,]+/).map(Number);
                                      if (parts.length === 3 && parts.every(n => Number.isInteger(n))) {
                                        const angles = hklToPresetAngles(parts[0], parts[1], parts[2]);
                                        if (angles) {
                                          setThetaX(angles.tx);
                                          setThetaY(angles.ty);
                                        }
                                      }
                                    }}
                                    placeholder="h k l"
                                    className="w-24 px-3 py-2 text-[12px] tracking-[0.1em] border border-ink border-opacity-20 bg-transparent text-center placeholder:opacity-30 focus:outline-none focus:border-opacity-100"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col md:flex-row gap-8 items-start mt-6">
                            <LabFrameOrientation labFrame={labFrameBase} />
                          </div>
                        </div>

                        <div className="space-y-6">
                          {symbolicExpressions?.source.map((symExpr, i) => {
                            const formatted = formatSymbolicSourceTerm(symExpr.symbolicPoly);
                            const isNull = formatted === '0';
                            return (
                              <div key={i} className="flex flex-col md:flex-row md:items-center gap-4 border-b border-ink border-opacity-10 pb-4">
                                <div className="w-16 font-mono text-xl">
                                  <TensorTerm term={symExpr.component} isNull={isNull} />
                                </div>
                                <div className="flex-1 font-mono text-xl tracking-tight overflow-x-auto whitespace-nowrap pb-2 md:pb-0">
                                  <span className="opacity-30 mr-4"><InlineMath math="\propto" /></span>
                                  <TensorTerm term={formatted} isNull={isNull} />
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {symbolicExpressions && symbolicExpressions.source.length > 0 && symbolicExpressions.source.every(t => t.symbolicPoly.size === 0) && (
                          <div className="p-6 border border-ink border-opacity-10 bg-ink/5 space-y-4 mt-2">
                            <div className="flex items-start gap-3">
                              <Info className="w-4 h-4 mt-0.5 shrink-0 opacity-60" />
                              <p className="text-sm leading-relaxed">
                                {selectedTensorType === 'ED' && isCentrosymmetric(selectedGroup.name) && selectedTimeReversal === 'i'
                                  ? 'Electric-dipole SHG is symmetry-forbidden for centrosymmetric groups (i-type). The inversion operation forces all components of χ⁽²⁾ to zero.'
                                  : selectedGroup.type === 'II' && selectedTimeReversal === 'c'
                                  ? "c-type tensors vanish identically for grey groups (G1'). The time-reversal symmetry of the grey group requires all c-type components to be zero."
                                  : 'All source terms vanish for this configuration.'}
                              </p>
                            </div>
                            <div className="flex flex-wrap gap-2 ml-7">
                              {selectedTimeReversal === 'i' && (
                                <button
                                  onClick={() => setSelectedTimeReversal('c')}
                                  className="px-3 py-1.5 text-xs border border-ink border-opacity-20 hover:bg-ink hover:text-paper transition-colors"
                                >
                                  Try c-type
                                </button>
                              )}
                              {selectedTimeReversal === 'c' && (
                                <button
                                  onClick={() => setSelectedTimeReversal('i')}
                                  className="px-3 py-1.5 text-xs border border-ink border-opacity-20 hover:bg-ink hover:text-paper transition-colors"
                                >
                                  Try i-type
                                </button>
                              )}
                              {selectedTensorType !== 'EQ' && (
                                <button
                                  onClick={() => setSelectedTensorType('EQ')}
                                  className="px-3 py-1.5 text-xs border border-ink border-opacity-20 hover:bg-ink hover:text-paper transition-colors"
                                >
                                  Try EQ
                                </button>
                              )}
                              {selectedTensorType !== 'MD' && (
                                <button
                                  onClick={() => setSelectedTensorType('MD')}
                                  className="px-3 py-1.5 text-xs border border-ink border-opacity-20 hover:bg-ink hover:text-paper transition-colors"
                                >
                                  Try MD
                                </button>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="p-4 border border-ink border-dashed text-[10px] uppercase tracking-widest opacity-60 leading-relaxed mt-8">
                          Note: The incoming light propagates along the Z-axis in the Lab Frame, meaning the electric field is purely transverse: <InlineMath math="\vec{E} = (E_X, E_Y, 0)" />.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 border border-ink border-opacity-10 space-y-4">
                {/* Mobile: collapsible button; Desktop: static header */}
                <div className="hidden md:block">
                  <h4 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    Tensor Notes
                  </h4>
                </div>
                <button
                  type="button"
                  aria-expanded={mobileTensorNotesExpanded}
                  onClick={() => setMobileTensorNotesExpanded(!mobileTensorNotesExpanded)}
                  className="md:hidden flex items-center justify-between w-full"
                >
                  <h4 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    Tensor Notes
                  </h4>
                  {mobileTensorNotesExpanded ? <ChevronUp className="w-3.5 h-3.5 opacity-50" /> : <ChevronDown className="w-3.5 h-3.5 opacity-50" />}
                </button>
                <div className={mobileTensorNotesExpanded ? '' : 'hidden md:block'}>
                  {(selectedTensorType === 'MD' || selectedTensorType === 'EQ') && (
                    <p className="text-xs opacity-60 leading-relaxed">
                      {selectedTensorType === 'MD' && "Note: Magnetic Dipole (Axial 3rd rank) tensors do not necessarily vanish in centrosymmetric groups."}
                      {selectedTensorType === 'EQ' && "Note: Electric Quadrupole (Polar 4th rank) tensors survive inversion symmetry."}
                    </p>
                  )}
                  <p className="text-xs opacity-60 leading-relaxed mt-2">
                    For more details on conventions, physics background, and references, please see the <button onClick={() => setCurrentView('help')} className="underline hover:opacity-100 font-medium">Help page</button>.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
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

      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 12s linear infinite;
        }
      `}</style>
    </div>
  );
}
