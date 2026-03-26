/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Info, Layers, Zap, Hexagon, Box, Triangle, Minus, Compass } from 'lucide-react';
import { POINT_GROUPS, PointGroupData } from './data/pointGroups';
import { 
  calculateTensorComponents, 
  TensorTimeReversal, 
  isCentrosymmetric,
  calculateSHGExpressions,
  SHGExpression,
  TensorType
} from './services/tensorCalculator';

const TensorTerm = ({ term, isNull }: { term: string; isNull: boolean; key?: any }) => {
  // Split by parts that look like Symbol_Indices(Power)?
  // e.g. χ_xyz, E_x, E_y², P_x, M_z
  // We restrict indices to x, y, z to prevent greedy matching of adjacent symbols
  const parts = term.split(/([χPMQE]_[xyz]+²?)/);

  return (
    <span className={isNull ? 'opacity-30' : 'text-[#141414]'}>
      {parts.map((part, i) => {
        const match = part.match(/^([χPMQE])_([xyz]+)(²)?$/);
        if (match) {
          const [, symbol, indices, power] = match;
          const isChi = symbol === 'χ';
          
          return (
            <span key={i} className={isChi ? 'mr-1.5 inline-block' : ''}>
              {symbol}
              <sub className="text-[0.75em] leading-none ml-px font-sans italic">{indices}</sub>
              {power && <sup className="text-[0.75em] leading-none">{power}</sup>}
            </span>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
};

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<PointGroupData | null>(null);
  const [selectedTensorType, setSelectedTensorType] = useState<'ED' | 'MD' | 'EQ'>('ED');
  const [selectedTimeReversal, setSelectedTimeReversal] = useState<TensorTimeReversal>('i');

  const filteredGroups = useMemo(() => {
    if (!searchQuery) return [];
    return POINT_GROUPS.filter(pg => 
      pg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pg.crystalSystem.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 5);
  }, [searchQuery]);

  const handleSelect = (group: PointGroupData) => {
    setSelectedGroup(group);
    setSearchQuery('');
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

  const [selectedKDir, setSelectedKDir] = useState<'x' | 'y' | 'z'>('z');

  const tensorMeta = {
    ED: { label: 'Electric Dipole', rank: 'RANK 3', type: 'POLAR' },
    MD: { label: 'Magnetic Dipole', rank: 'RANK 3', type: 'AXIAL' },
    EQ: { label: 'Electric Quadrupole', rank: 'RANK 4', type: 'POLAR' },
  };

  const currentExpressions = calculateSHGExpressions(selectedGroup?.name || "", selectedTensorType, selectedTimeReversal, selectedKDir);

  return (
    <div className="min-h-screen bg-[#E4E3E0] text-[#141414] font-sans selection:bg-[#141414] selection:text-[#E4E3E0]">
      {/* Header */}
      <header className="border-b border-[#141414] p-8 md:p-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.2em] opacity-50">
              <Zap className="w-3 h-3" />
              SHG TENSOR CALCULATOR
            </div>
            <h1 className="text-6xl md:text-8xl font-serif italic tracking-tight leading-none">
              The Birss App
            </h1>
            <p className="max-w-xl text-sm opacity-70 leading-relaxed">
              Calculates non-zero susceptibility tensor components (Electric Dipole, Magnetic Dipole, Electric Quadrupole) and induced transverse Second Harmonic Generation (SHG) source terms for all 32 crystallographic and 122 magnetic point groups.
            </p>
          </div>
          
          <div className="relative w-full md:w-80">
            <div className="flex items-center gap-2 border-b border-[#141414] pb-2 focus-within:border-opacity-100 border-opacity-30 transition-all">
              <Search className="w-4 h-4 opacity-50" />
              <input 
                type="text"
                placeholder="Search Point Group (e.g. mm2, 432)"
                className="bg-transparent border-none outline-none w-full text-sm placeholder:opacity-30"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <AnimatePresence>
              {filteredGroups.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 w-full bg-[#E4E3E0] border border-[#141414] border-t-0 z-50 shadow-xl"
                >
                  {filteredGroups.map(group => (
                    <button
                      key={group.name}
                      onClick={() => handleSelect(group)}
                      className="w-full text-left p-4 hover:bg-[#141414] hover:text-[#E4E3E0] transition-colors flex justify-between items-center group"
                    >
                      <span className="text-xl font-serif italic">{group.name}</span>
                      <span className="text-[10px] uppercase tracking-widest opacity-50 group-hover:opacity-100">{group.crystalSystem}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-8 md:p-12">
        {!selectedGroup ? (
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
                    <h2 className="text-5xl font-serif italic">{selectedGroup.name}</h2>
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

                <div className="space-y-3">
                  <p className="text-[10px] uppercase tracking-[0.2em] opacity-50">Propagation Direction (k)</p>
                  <div className="flex gap-3">
                    {(['x', 'y', 'z'] as const).map((dir) => (
                      <button
                        key={dir}
                        onClick={() => setSelectedKDir(dir)}
                        className={`px-8 py-2 text-[10px] uppercase tracking-[0.2em] transition-all border border-[#141414] ${
                          selectedKDir === dir 
                            ? 'bg-[#141414] text-[#E4E3E0]' 
                            : 'hover:bg-[#141414] hover:text-[#E4E3E0] opacity-50 hover:opacity-100 border-opacity-20'
                        }`}
                      >
                        k ∥ {dir}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="text-[10px] uppercase tracking-[0.2em] opacity-50 flex items-center gap-2">
                <Zap className="w-3 h-3" />
                {tensorMeta[selectedTensorType].label} Tensor ({tensorMeta[selectedTensorType].type})
              </div>
              
              <div className="bg-white/50 border border-[#141414] p-8 md:p-12 space-y-8">
                <div className="flex justify-between items-start">
                  <h3 className="text-3xl font-serif italic">Non-zero Components</h3>
                  <div className="text-[10px] font-mono opacity-50">{tensorMeta[selectedTensorType].rank}</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                  {currentComponents.map((comp, i) => {
                    const parts = comp.split('=').map(p => p.trim());
                    const isNull = comp.toLowerCase().includes('zero') || comp.toLowerCase().includes('none');
                    
                    return (
                      <div key={i} className="group border-b border-[#141414] border-opacity-10 pb-4 hover:border-opacity-100 transition-all">
                        <div className="text-lg font-mono tracking-tighter flex flex-wrap items-baseline gap-2">
                          <TensorTerm term={parts[0]} isNull={isNull} />
                          {parts.length > 1 && parts.slice(1).map((part, pi) => (
                            <div key={pi} className="flex items-baseline gap-2">
                              <span className="text-xs opacity-30">=</span>
                              <TensorTerm term={part} isNull={isNull} />
                            </div>
                          ))}
                        </div>
                        <div className="text-[9px] uppercase tracking-[0.2em] opacity-30 mt-1 group-hover:opacity-100">
                          {isNull ? 'Null State' : 'Active Component'}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {selectedTensorType === 'ED' && selectedGroup.centrosymmetric && (
                  <div className="p-6 border border-[#141414] border-dashed flex items-center gap-4 opacity-50">
                    <Info className="w-5 h-5" />
                    <p className="text-xs leading-relaxed italic">
                      In centrosymmetric point groups, all components of the second-order nonlinear susceptibility 
                      tensor χ<sup>(2)</sup> (Electric Dipole) vanish under the inversion operation.
                    </p>
                  </div>
                )}
              </div>

              <div className="text-[10px] uppercase tracking-[0.2em] opacity-50 flex items-center gap-2">
                <Compass className="w-3 h-3" />
                Induced SHG Source Terms (k ∥ {selectedKDir})
              </div>

              <div className="bg-white/50 border border-[#141414] p-8 md:p-12 space-y-8">
                <div className="flex justify-between items-start">
                  <h3 className="text-3xl font-serif italic">Induced Nonlinear Response</h3>
                  <div className="text-[10px] font-mono opacity-50">TRANSVERSE FIELDS ONLY</div>
                </div>

                <div className="space-y-6">
                  {currentExpressions.map((expr, i) => {
                    const isNull = expr.expression === "0";
                    return (
                      <div key={i} className="flex flex-col md:flex-row md:items-center gap-4 border-b border-[#141414] border-opacity-10 pb-4">
                        <div className="w-16 font-mono text-xl">
                          <TensorTerm term={expr.component} isNull={isNull} />
                        </div>
                        <div className="flex-1 font-mono text-xl tracking-tight overflow-x-auto whitespace-nowrap pb-2 md:pb-0">
                          <span className="opacity-30 mr-4">=</span>
                          <TensorTerm term={expr.expression} isNull={isNull} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="p-4 border border-[#141414] border-dashed text-[10px] uppercase tracking-widest opacity-60 leading-relaxed">
                  Note: This calculation assumes two identical input fields E(ω). 
                  The transverse condition is strictly enforced: E · k = 0 (E<sub>{selectedKDir}</sub> = 0) 
                  and only propagating source terms (transverse to k) are displayed.
                </div>
              </div>

              <div className="p-8 border border-[#141414] border-opacity-10 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-widest">Reference Note</h4>
                <p className="text-xs opacity-60 leading-relaxed">
                  The symmetry relations presented here follow the conventions of the International Tables for Crystallography. 
                  {selectedTensorType === 'MD' && " Magnetic Dipole (Axial 3rd rank) tensors do not necessarily vanish in centrosymmetric groups."}
                  {selectedTensorType === 'EQ' && " Electric Quadrupole (Polar 4th rank) tensors survive inversion symmetry."}
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
