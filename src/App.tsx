/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Info, Layers, Zap, Hexagon, Box, Triangle, Minus, Compass, Github } from 'lucide-react';
import { POINT_GROUPS, PointGroupData } from './data/pointGroups';
import { 
  calculateTensorComponents, 
  TensorTimeReversal, 
  isCentrosymmetric,
  calculateSHGExpressions,
  SHGExpression,
  TensorType,
  getSymmetryOperations,
  formatCoeff
} from './services/tensorCalculator';
import { PointGroupExplorer } from './components/PointGroupExplorer';
import { HelpPage } from './components/HelpPage';
import { SimulatorPage } from './components/SimulatorPage';
import { FormatPointGroup, SymmetryOperation, TensorTerm } from './components/MathComponents';
import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';

function AxisOrientationInfo({ crystalSystem }: { crystalSystem: string }) {
  if (crystalSystem === 'Triclinic') return null;

  let content = null;
  switch (crystalSystem) {
    case 'Monoclinic':
      content = (
        <>
          <span className="font-mono font-medium">z</span> is the unique axis (parallel to the 2-fold axis or perpendicular to the mirror plane).
        </>
      );
      break;
    case 'Orthorhombic':
    case 'Tetragonal':
    case 'Cubic':
      content = (
        <>
          <span className="font-mono font-medium">x</span> ∥ <InlineMath math="[100]" />, <span className="font-mono font-medium">y</span> ∥ <InlineMath math="[010]" />, <span className="font-mono font-medium">z</span> ∥ <InlineMath math="[001]" />
        </>
      );
      break;
    case 'Trigonal':
    case 'Hexagonal':
      content = (
        <>
          <span className="font-mono font-medium">z</span> ∥ <InlineMath math="[001]" /> / <InlineMath math="[0001]" /> (c-axis)<br/>
          <span className="font-mono font-medium">x</span> ∥ <InlineMath math="[100]" /> / <InlineMath math="[2\bar{1}\bar{1}0]" /> (a-axis)<br/>
          <span className="font-mono font-medium">y</span> ∥ <InlineMath math="[120]" /> / <InlineMath math="[01\bar{1}0]" />
        </>
      );
      break;
  }

  if (!content) return null;

  return (
    <div className="p-4 border border-[#141414] border-opacity-10 space-y-2 bg-[#141414]/5">
      <p className="text-[10px] uppercase tracking-widest opacity-50 flex items-center gap-1.5">
        <Compass className="w-3 h-3" />
        Axis Orientation
      </p>
      <p className="text-xs leading-relaxed opacity-70">
        {content}
      </p>
    </div>
  );
}

function negateExpression(expr: string): string {
  if (expr === "0") return "0";
  let result = expr.trim();
  if (!result.startsWith('-') && !result.startsWith('+')) {
    result = '+' + result;
  }
  result = result.replace(/\+/g, 'TEMP_PLUS').replace(/-/g, '+').replace(/TEMP_PLUS/g, '-');
  result = result.replace(/^\+\s*/, '');
  result = result.replace(/\s*\+\s*/g, ' + ').replace(/\s*-\s*/g, ' - ');
  result = result.trim().replace(/^-\s*/, '-');
  return result;
}



function getLabFrameVectors(tx: number, ty: number) {
  const cx = Math.cos(tx * Math.PI / 180);
  const sx = Math.sin(tx * Math.PI / 180);
  const cy = Math.cos(ty * Math.PI / 180);
  const sy = Math.sin(ty * Math.PI / 180);

  const formatVec = (v: number[]) => {
    const terms = [];
    const labels = ['X', 'Y', 'Z'];
    for (let i = 0; i < 3; i++) {
      if (Math.abs(v[i]) > 1e-5) {
        const coeff = formatCoeff(v[i]);
        const sign = v[i] < 0 ? "-" : (terms.length > 0 ? "+" : "");
        terms.push(`${sign}${coeff}\\mathbf{${labels[i]}}_{LAB}`);
      }
    }
    return terms.length > 0 ? terms.join(" ") : "0";
  };

  // R maps Crystal to Lab: V_lab = R * V_cryst
  // So V_cryst = R^T * V_lab
  // x_crys = R_00 X_lab + R_10 Y_lab + R_20 Z_lab
  // y_crys = R_01 X_lab + R_11 Y_lab + R_21 Z_lab
  // z_crys = R_02 X_lab + R_12 Y_lab + R_22 Z_lab

  const x_crys = [cy, 0, -sy];
  const y_crys = [sx * sy, cx, sx * cy];
  const z_crys = [cx * sy, -sx, cx * cy];

  return {
    X: formatVec(x_crys),
    Y: formatVec(y_crys),
    Z: formatVec(z_crys)
  };
}

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
  const [currentView, setCurrentView] = useState<'calculator' | 'simulator' | 'explorer' | 'help'>('calculator');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [activeCategory, setActiveCategory] = useState<GroupCategory>('All');
  const [selectedGroup, setSelectedGroup] = useState<PointGroupData | null>(null);
  const [selectedTensorType, setSelectedTensorType] = useState<'ED' | 'MD' | 'EQ'>('ED');
  const [selectedTimeReversal, setSelectedTimeReversal] = useState<TensorTimeReversal>('i');
  const [activeResultTab, setActiveResultTab] = useState<'components' | 'induced' | 'source'>('components');

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
    setSearchQuery('');
    setIsSearchFocused(false);
    setCurrentView('calculator');
  };

  const getCrystalIcon = (system: string) => {
    switch (system.toLowerCase()) {
      case 'cubic': return <Box className="w-5 h-5" />;
      case 'hexagonal': return <Hexagon className="w-5 h-5" />;
      case 'trigonal': return <Triangle className="w-5 h-5" />;
      case 'tetragonal': return <Box className="w-5 h-5 scale-y-125" />;
      case 'orthorhombic': return <Box className="w-5 h-5 scale-x-125" />;
      case 'monoclinic': return <Box className="w-5 h-5 skew-x-12" />;
      case 'triclinic': return <Box className="w-5 h-5 skew-x-12 skew-y-6" />;
      default: return <Layers className="w-5 h-5" />;
    }
  };

  const currentComponents = useMemo(() => {
    if (!selectedGroup) return [];
    return calculateTensorComponents(selectedGroup.name, selectedTensorType, selectedTimeReversal);
  }, [selectedGroup, selectedTensorType, selectedTimeReversal]);

  const currentOperations = useMemo(() => {
    if (!selectedGroup) return [];
    return getSymmetryOperations(selectedGroup.name);
  }, [selectedGroup]);

  const [thetaX, setThetaX] = useState<number>(0);
  const [thetaY, setThetaY] = useState<number>(0);

  const tensorMeta = {
    ED: { label: 'Electric Dipole', rank: 'RANK 3', type: 'POLAR' },
    MD: { label: 'Magnetic Dipole', rank: 'RANK 3', type: 'AXIAL' },
    EQ: { label: 'Electric Quadrupole', rank: 'RANK 4', type: 'POLAR' },
  };

  const currentExpressions = calculateSHGExpressions(selectedGroup?.name || "", selectedTensorType, selectedTimeReversal, thetaX, thetaY);
  const labFrame = getLabFrameVectors(thetaX, thetaY);

  const sourceTerms = currentExpressions.source;
  const inducedTerms = currentExpressions.induced;

  return (
    <div className="min-h-screen bg-[#E4E3E0] text-[#141414] font-sans selection:bg-[#141414] selection:text-[#E4E3E0]">
      {/* Header */}
      <header className="border-b border-[#141414] bg-[#E4E3E0] px-6 py-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Left: Title & Tagline */}
          <div className="flex items-center">
            <h1 className="text-2xl font-serif italic tracking-tight leading-none">
              The Birss App
            </h1>
            <span className="hidden md:inline-block text-xs opacity-60 ml-4 border-l border-[#141414] border-opacity-20 pl-4">
              Nonlinear optical tensors for magnetic point groups
            </span>
          </div>

          {/* Center: Navigation Pills */}
          <div className="flex items-center bg-white/40 border border-[#141414] border-opacity-10 rounded-full p-1 self-start lg:self-auto">
            <button 
              onClick={() => setCurrentView('calculator')}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${currentView === 'calculator' ? 'bg-[#141414] text-[#E4E3E0]' : 'hover:bg-[#141414]/5 text-[#141414]/70'}`}
            >
              Calculator
            </button>
            <button 
              onClick={() => setCurrentView('simulator')}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${currentView === 'simulator' ? 'bg-[#141414] text-[#E4E3E0]' : 'hover:bg-[#141414]/5 text-[#141414]/70'}`}
            >
              Simulator
            </button>
            <button 
              onClick={() => setCurrentView('explorer')}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${currentView === 'explorer' ? 'bg-[#141414] text-[#E4E3E0]' : 'hover:bg-[#141414]/5 text-[#141414]/70'}`}
            >
              Explorer
            </button>
            <button 
              onClick={() => setCurrentView('help')}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${currentView === 'help' ? 'bg-[#141414] text-[#E4E3E0]' : 'hover:bg-[#141414]/5 text-[#141414]/70'}`}
            >
              Help
            </button>
          </div>

          {/* Right: Search & GitHub */}
          <div className="flex items-center gap-4 self-start lg:self-auto w-full lg:w-auto">
            <div className="relative w-full lg:w-64">
              <div className="flex items-center bg-white/50 border border-[#141414] border-opacity-20 rounded-full px-3 py-1.5 focus-within:border-opacity-100 focus-within:bg-white transition-all">
                <Search className="w-3.5 h-3.5 opacity-50" />
                <input 
                  type="text"
                  placeholder="Search groups (e.g., 4/m, 4'/m, 11')"
                  className="bg-transparent border-none outline-none w-full text-xs ml-2 placeholder:opacity-40"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                />
              </div>
              
              <AnimatePresence>
                {isSearchFocused && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute top-[calc(100%+8px)] right-0 w-full lg:w-80 bg-[#E4E3E0] border border-[#141414] rounded-lg z-50 shadow-xl flex flex-col max-h-[400px] overflow-hidden"
                  >
                    <div className="p-3 border-b border-[#141414] border-opacity-10 bg-white/30 text-[10px] opacity-60 leading-tight">
                      Use an apostrophe (') for time-reversed elements (Black & White) and append 1' for Gray groups.
                    </div>
                    
                    <div className="p-2 border-b border-[#141414]/10 flex flex-wrap gap-1 bg-white/10 sticky top-0 z-10">
                      {(['All', 'Ordinary', 'Gray', 'Black & White'] as GroupCategory[]).map(cat => (
                        <button
                          key={cat}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => setActiveCategory(cat)}
                          className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded-full transition-colors ${activeCategory === cat ? 'bg-[#141414] text-[#E4E3E0]' : 'bg-transparent text-[#141414] hover:bg-[#141414]/10'}`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                    
                    <div className="overflow-y-auto flex-1 p-2">
                      {filteredGroups.length > 0 ? filteredGroups.map(group => (
                        <button
                          key={group.name}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleSelect(group)}
                          className="w-full text-left px-3 py-2 hover:bg-[#141414] hover:text-[#E4E3E0] transition-colors flex justify-between items-center group rounded-md"
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
          />
        ) : !selectedGroup ? (
          <div className="h-[50vh] flex flex-col items-center justify-center text-center space-y-8">
            <div className="w-24 h-24 border border-[#141414] border-dashed rounded-full flex items-center justify-center animate-spin-slow">
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
            {/* Summary Sidebar */}
            <div className="space-y-12">
              <section className="space-y-6">
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
                  <div className="flex items-center gap-3 p-4 border border-[#141414] border-opacity-10">
                    {getCrystalIcon(selectedGroup.crystalSystem)}
                    <div>
                      <p className="text-sm font-medium">{selectedGroup.crystalSystem}</p>
                      <p className="text-[10px] uppercase tracking-widest opacity-50">Crystal System</p>
                    </div>
                  </div>
                  <div className={`p-4 border border-[#141414] ${isCentrosymmetric(selectedGroup.name) ? 'bg-[#141414] text-[#E4E3E0]' : 'border-opacity-10'}`}>
                    <p className="text-sm font-medium">
                      {isCentrosymmetric(selectedGroup.name) ? 'Centrosymmetric' : 'Non-Centrosymmetric'}
                    </p>
                    <p className="text-[10px] uppercase tracking-widest opacity-50">Symmetry Type</p>
                  </div>
                  
                  <div className="p-4 border border-[#141414] border-opacity-10 space-y-3">
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
              {/* Tensor Type Selector */}
              <div className="flex flex-col gap-6 border-b border-[#141414] border-opacity-10 pb-8">
                <div className="space-y-3">
                  <p className="text-[10px] uppercase tracking-[0.2em] opacity-50">Tensor Classification</p>
                  <div className="flex flex-wrap gap-3">
                    {(['ED', 'MD', 'EQ'] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => setSelectedTensorType(type)}
                        className={`px-4 py-2 text-[10px] uppercase tracking-[0.2em] transition-all border border-[#141414] ${
                          selectedTensorType === type 
                            ? 'bg-[#141414] text-[#E4E3E0]' 
                            : 'hover:bg-[#141414] hover:text-[#E4E3E0] opacity-50 hover:opacity-100 border-opacity-20'
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
                        className={`px-6 py-2 text-[10px] uppercase tracking-[0.2em] transition-all border border-[#141414] ${
                          selectedTimeReversal === tr 
                            ? 'bg-[#141414] text-[#E4E3E0]' 
                            : 'hover:bg-[#141414] hover:text-[#E4E3E0] opacity-50 hover:opacity-100 border-opacity-20'
                        }`}
                      >
                        {tr === 'i' ? 'i-type (Time-Even)' : 'c-type (Time-Odd)'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white/50 border border-[#141414] overflow-hidden">
                {/* Tab Menu */}
                <div className="flex overflow-x-auto border-b border-[#141414] border-opacity-20 bg-white/30 hide-scrollbar">
                  <button
                    onClick={() => setActiveResultTab('components')}
                    className={`px-6 py-4 text-xs font-medium uppercase tracking-wider whitespace-nowrap transition-colors ${activeResultTab === 'components' ? 'bg-[#141414] text-[#E4E3E0]' : 'hover:bg-[#141414]/5 text-[#141414]/70'}`}
                  >
                    Tensor Components
                  </button>
                  <button
                    onClick={() => setActiveResultTab('induced')}
                    className={`px-6 py-4 text-xs font-medium uppercase tracking-wider whitespace-nowrap transition-colors border-l border-[#141414] border-opacity-10 ${activeResultTab === 'induced' ? 'bg-[#141414] text-[#E4E3E0]' : 'hover:bg-[#141414]/5 text-[#141414]/70'}`}
                  >
                    Induced Response
                  </button>
                  <button
                    onClick={() => setActiveResultTab('source')}
                    className={`px-6 py-4 text-xs font-medium uppercase tracking-wider whitespace-nowrap transition-colors border-l border-[#141414] border-opacity-10 ${activeResultTab === 'source' ? 'bg-[#141414] text-[#E4E3E0]' : 'hover:bg-[#141414]/5 text-[#141414]/70'}`}
                  >
                    Source Terms
                  </button>
                </div>

                {/* Tab Content */}
                <div className="p-6 md:p-8 min-h-[400px]">
                  {activeResultTab === 'components' && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                      <div className="flex justify-between items-center border-b border-[#141414] border-opacity-10 pb-4">
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
                              <div key={i} className="group border-b border-[#141414] border-opacity-10 pb-4 hover:border-opacity-100 transition-all">
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
                            <div key={i} className="group border-b border-[#141414] border-opacity-10 pb-4 hover:border-opacity-100 transition-all">
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
                        <div className="p-6 border border-[#141414] border-dashed flex items-center gap-4 opacity-50 mt-8">
                          <Info className="w-5 h-5" />
                          <p className="text-xs leading-relaxed italic">
                            In centrosymmetric point groups, all components of the second-order nonlinear susceptibility 
                            tensor <InlineMath math="\chi^{(2)}" /> (Electric Dipole) vanish under the inversion operation.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeResultTab === 'induced' && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                      <div className="flex justify-between items-center border-b border-[#141414] border-opacity-10 pb-4">
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
                            <div key={i} className="flex flex-col md:flex-row md:items-center gap-4 border-b border-[#141414] border-opacity-10 pb-4">
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

                      <div className="p-4 border border-[#141414] border-dashed text-[10px] uppercase tracking-widest opacity-60 leading-relaxed mt-8">
                        Note: This calculation assumes two identical input fields <InlineMath math="E(\omega)" />. 
                        The full electric field vector is considered for the induced response.
                      </div>
                    </div>
                  )}

                  {activeResultTab === 'source' && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                      <div className="flex justify-between items-center border-b border-[#141414] border-opacity-10 pb-4">
                        <div className="text-[10px] uppercase tracking-[0.2em] opacity-50 flex items-center gap-2">
                          <Compass className="w-3 h-3" />
                          Source Term Components S (Lab Frame)
                        </div>
                        <div className="text-[10px] font-mono opacity-50">
                          {selectedTensorType === 'ED' ? <InlineMath math="S \propto P" /> : selectedTensorType === 'MD' ? <InlineMath math="S \propto \nabla \times M" /> : <InlineMath math="S \propto \nabla \cdot Q" />}
                        </div>
                      </div>

                      <div className="space-y-6 border-b border-[#141414] border-opacity-10 pb-6">
                        <div className="space-y-3">
                          <p className="text-[10px] uppercase tracking-[0.2em] opacity-50">
                            Select the direction of light propagation relative to the crystal axes
                          </p>
                          <div className="flex flex-wrap gap-3">
                            {[
                              { label: 'k || z', math: 'k \\parallel z', tx: 0, ty: 0 },
                              { label: 'k || x', math: 'k \\parallel x', tx: 0, ty: -90 },
                              { label: 'k || y', math: 'k \\parallel y', tx: 90, ty: 0 },
                              { label: 'k || xy', math: 'k \\parallel xy', tx: 90, ty: -45 },
                              { label: 'k || xz', math: 'k \\parallel xz', tx: 0, ty: -45 },
                              { label: 'k || yz', math: 'k \\parallel yz', tx: 45, ty: 0 },
                            ].map((ori) => (
                              <button
                                key={ori.label}
                                onClick={() => {
                                  setThetaX(ori.tx);
                                  setThetaY(ori.ty);
                                }}
                                className={`px-4 py-2 text-[12px] tracking-[0.1em] transition-all border border-[#141414] ${
                                  thetaX === ori.tx && thetaY === ori.ty
                                    ? 'bg-[#141414] text-[#E4E3E0]' 
                                    : 'hover:bg-[#141414] hover:text-[#E4E3E0] opacity-50 hover:opacity-100 border-opacity-20'
                                }`}
                              >
                                <InlineMath math={ori.math} />
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="flex flex-col md:flex-row gap-8 items-start mt-6">
                          <div className="flex-1 bg-[#141414]/5 p-4 border border-[#141414]/10 rounded-sm w-full">
                            <h4 className="text-[10px] uppercase tracking-[0.2em] opacity-50 mb-3">Crystal Orientation in Lab Frame</h4>
                            <div className="flex flex-col gap-3 text-sm font-mono">
                              <div className="flex flex-wrap gap-x-6 gap-y-2">
                                <InlineMath math={`\\mathbf{x}_{crys} = ${labFrame.X}`} />
                                <InlineMath math={`\\mathbf{y}_{crys} = ${labFrame.Y}`} />
                                <InlineMath math={`\\mathbf{z}_{crys} = ${labFrame.Z}`} />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        {sourceTerms.map((expr, i) => {
                          const isNull = expr.expression === "0";
                          return (
                            <div key={i} className="flex flex-col md:flex-row md:items-center gap-4 border-b border-[#141414] border-opacity-10 pb-4">
                              <div className="w-16 font-mono text-xl">
                                <TensorTerm term={expr.component} isNull={isNull} />
                              </div>
                              <div className="flex-1 font-mono text-xl tracking-tight overflow-x-auto whitespace-nowrap pb-2 md:pb-0">
                                <span className="opacity-30 mr-4"><InlineMath math="\propto" /></span>
                                <span className="opacity-50 mr-4"><TensorTerm term={expr.relation} isNull={isNull} /></span>
                                <span className="opacity-30 mr-4"><InlineMath math="=" /></span>
                                <TensorTerm term={expr.expression} isNull={isNull} />
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="p-4 border border-[#141414] border-dashed text-[10px] uppercase tracking-widest opacity-60 leading-relaxed mt-8">
                        Note: The incoming light propagates along the Z-axis in the Lab Frame, meaning the electric field is purely transverse: <InlineMath math="\vec{E} = (E_X, E_Y, 0)" />.
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-8 border border-[#141414] border-opacity-10 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Tensor Notes
                </h4>
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
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-24 border-t border-[#141414] p-8 text-center">
        <p className="text-[10px] uppercase tracking-[0.5em] opacity-30">
          The Birss App &copy; 2026
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
