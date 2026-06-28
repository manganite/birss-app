import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Info, Layers, Zap, Compass, ChevronDown, ChevronUp } from 'lucide-react';
import { InlineMath } from 'react-katex';
import { PointGroupData } from '../data/pointGroups';
import {
  calculateTensorComponents,
  isCentrosymmetric,
  calculateSHGExpressions,
  getSymmetryOperations,
  getLabFrameVectors,
  getAlternateSettings,
  getFutureSettingCount,
  formatSymbolicSourceTerm,
  type SymbolicSHGResult,
} from '../services/tensorCalculator';
import { FormatPointGroup, SymmetryOperation, TensorTerm, getCrystalIcon, getPresetsForSystem, LabFrameOrientation, AxisOrientationInfo, hklToPresetAngles } from './MathComponents';
import type { TensorConfig, PresetAnglesState } from '../types';

const TENSOR_META = {
  ED: { label: 'Electric Dipole', rank: '3', type: 'POLAR' },
  MD: { label: 'Magnetic Dipole', rank: '3', type: 'AXIAL' },
  EQ: { label: 'Electric Quadrupole', rank: '4', type: 'POLAR' },
} as const;

interface CalculatorPageProps {
  selectedGroup: PointGroupData | null;
  tensorConfig: TensorConfig;
  presetAngles: PresetAnglesState;
  symbolicExpressions: SymbolicSHGResult | null;
  onNavigate: (view: string) => void;
}

export function CalculatorPage({ selectedGroup, tensorConfig, presetAngles, symbolicExpressions, onNavigate }: CalculatorPageProps) {
  const [hklInput, setHklInput] = useState('');
  const [activeResultTab, setActiveResultTab] = useState<'components' | 'induced' | 'source'>('components');
  const [mobileSourceExpanded, setMobileSourceExpanded] = useState(false);
  const [mobileClassificationExpanded, setMobileClassificationExpanded] = useState(false);
  const [mobileSetupExpanded, setMobileSetupExpanded] = useState(false);
  const [mobileTensorNotesExpanded, setMobileTensorNotesExpanded] = useState(false);

  const hklValidation = useMemo(() => {
    if (!hklInput.trim()) return 'empty' as const;
    const parts = hklInput.trim().split(/[\s,]+/).map(Number);
    if (parts.length !== 3 || !parts.every(n => Number.isInteger(n))) return 'invalid' as const;
    if (parts[0] === 0 && parts[1] === 0 && parts[2] === 0) return 'invalid' as const;
    return 'valid' as const;
  }, [hklInput]);

  const { thetaX, setThetaX, thetaY, setThetaY, psi0, setPsi0 } = presetAngles;
  const { type: selectedTensorType, setType: setSelectedTensorType, timeReversal: selectedTimeReversal, setTimeReversal: setSelectedTimeReversal, setting: selectedSetting, setSetting: setSelectedSetting } = tensorConfig;

  const currentComponents = useMemo(() => {
    if (!selectedGroup) return [];
    return calculateTensorComponents(selectedGroup.name, selectedTensorType, selectedTimeReversal, selectedSetting);
  }, [selectedGroup, selectedTensorType, selectedTimeReversal, selectedSetting]);

  const currentOperations = useMemo(() => {
    if (!selectedGroup) return [];
    return getSymmetryOperations(selectedGroup.name, selectedSetting);
  }, [selectedGroup, selectedSetting]);

  const labFrameBase = useMemo(() => getLabFrameVectors({ thetaX, thetaY, psi0, phiX: 0, phiY: 0, psi: 0 }), [thetaX, thetaY, psi0]);

  const currentExpressions = useMemo(
    () => calculateSHGExpressions({ groupName: selectedGroup?.name || "", tensorType: selectedTensorType, trType: selectedTimeReversal, thetaX, thetaY, psi0, phiX: 0, phiY: 0, psi: 0, setting: selectedSetting }),
    [selectedGroup, selectedTensorType, selectedTimeReversal, thetaX, thetaY, psi0, selectedSetting]
  );

  const sourceTerms = currentExpressions.source;
  const inducedTerms = currentExpressions.induced;

  if (!selectedGroup) {
    return (
      <div className="h-[50vh] flex flex-col items-center justify-center text-center space-y-8">
        <div className="w-24 h-24 border border-ink border-dashed rounded-full flex items-center justify-center animate-spin-slow">
          <Layers className="w-8 h-8 opacity-20" />
        </div>
        <div className="space-y-2">
          <p className="text-xl font-serif italic opacity-40">Select a point group to begin analysis</p>
          <p className="text-[10px] uppercase tracking-[0.3em] opacity-30">International Notation (Hermann-Mauguin)</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      key={selectedGroup.name}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Compact group indicator — always visible, click to expand classification */}
      <button
        type="button"
        aria-expanded={mobileClassificationExpanded}
        aria-controls="classification-panel"
        onClick={() => setMobileClassificationExpanded(prev => !prev)}
        className="flex items-center justify-between w-full p-4 border border-ink border-opacity-10 bg-white/30"
      >
        <div className="flex items-center gap-3">
          {getCrystalIcon(selectedGroup.crystalSystem)}
          <div className="text-left flex items-center flex-wrap gap-x-2 gap-y-1">
            <span className="text-lg font-serif italic"><FormatPointGroup name={selectedGroup.name} /></span>
            <span className="text-xs opacity-50">{selectedGroup.crystalSystem}</span>
            <span className="text-xs opacity-50">· Type {selectedGroup.type}</span>
            <span className="text-xs opacity-50">· {isCentrosymmetric(selectedGroup.name) ? 'Centro' : 'Non-centro'}</span>
          </div>
        </div>
        {mobileClassificationExpanded ? <ChevronUp className="w-4 h-4 opacity-50" /> : <ChevronDown className="w-4 h-4 opacity-50" />}
      </button>

      {/* Expandable classification panel */}
      {mobileClassificationExpanded && (
        <section id="classification-panel" className="space-y-4 border border-ink border-opacity-10 p-6">
          <div className="text-xs uppercase tracking-[0.2em] opacity-50 font-semibold flex items-center gap-2">
            <Info className="w-3 h-3" />
            Classification
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <h2 className="text-4xl font-serif italic"><FormatPointGroup name={selectedGroup.name} /></h2>
              <p className="text-[10px] uppercase tracking-widest opacity-50 mt-1">
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
            <AxisOrientationInfo crystalSystem={selectedGroup.crystalSystem} />
          </div>
          <div className="p-4 border border-ink border-opacity-10 space-y-3">
            <p className="text-[10px] uppercase tracking-widest opacity-50">Symmetry Operations ({currentOperations.length})</p>
            <div className="flex flex-wrap gap-1.5">
              {currentOperations.map((op, i) => (
                <SymmetryOperation key={i} symbol={op} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Main Content: Tensor Components — full width */}
      <div className="space-y-8">
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
                    {TENSOR_META[type].label}
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

        {/* Mobile-only preset strip — always visible */}
        <div className="md:hidden flex flex-wrap gap-2 items-center py-3">
          <span className="text-[10px] uppercase tracking-[0.2em] opacity-50 mr-1 flex items-center gap-1">
            <Compass className="w-3 h-3" />Cut
          </span>
          {getPresetsForSystem(selectedGroup.crystalSystem).map((ori) => (
            <button
              key={ori.label}
              onClick={() => {
                setThetaX(ori.tx);
                setThetaY(ori.ty);
                setPsi0(ori.psi0);
                setHklInput('');
              }}
              className={`px-3 py-1.5 text-[11px] tracking-[0.1em] transition-all border border-ink ${
                thetaX === ori.tx && thetaY === ori.ty && psi0 === ori.psi0 && !hklInput
                  ? 'bg-ink text-paper'
                  : 'opacity-50 border-opacity-20'
              }`}
            >
              <InlineMath math={ori.math} />
            </button>
          ))}
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
            {/* Components */}
            <div className={activeResultTab !== 'components' ? 'md:hidden' : ''}>
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-ink border-opacity-10 pb-4">
                  <div className="text-xs uppercase tracking-[0.2em] opacity-50 font-semibold flex items-center gap-2">
                    <Zap className="w-3 h-3" />
                    {TENSOR_META[selectedTensorType].label} Tensor ({TENSOR_META[selectedTensorType].type})
                  </div>
                  <div className="text-[10px] font-mono opacity-50">RANK {TENSOR_META[selectedTensorType].rank}</div>
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

            {/* Induced */}
            <div className={activeResultTab !== 'induced' ? 'md:hidden' : ''}>
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-ink border-opacity-10 pb-4 pt-4 md:pt-0 border-t md:border-t-0 border-ink/10">
                  <div className="text-xs uppercase tracking-[0.2em] opacity-50 font-semibold flex items-center gap-2">
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

            {/* Source Terms */}
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
                    <div className="text-xs uppercase tracking-[0.2em] opacity-50 font-semibold flex items-center gap-2">
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
                              setPsi0(ori.psi0);
                              setHklInput('');
                            }}
                            className={`px-4 py-2 text-[12px] tracking-[0.1em] transition-all border border-ink ${
                              thetaX === ori.tx && thetaY === ori.ty && psi0 === ori.psi0 && !hklInput
                                ? 'bg-ink text-paper'
                                : 'hover:bg-ink hover:text-paper opacity-50 hover:opacity-100 border-opacity-20'
                            }`}
                          >
                            <InlineMath math={ori.math} />
                          </button>
                        ))}
                        {selectedGroup.crystalSystem === 'Cubic' && (
                          <div className="hidden md:flex items-center gap-2">
                            <span className="text-[10px] uppercase tracking-[0.1em] opacity-40">or</span>
                            <div className="relative">
                              <input
                                type="text"
                                aria-label="Miller indices [h k l]"
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
                                      setPsi0(angles.psi0);
                                    }
                                  }
                                }}
                                placeholder="h k l"
                                className={`w-24 px-3 py-2 text-[12px] tracking-[0.1em] border bg-transparent text-center placeholder:opacity-30 focus:outline-none ${
                                  hklValidation === 'invalid'
                                    ? 'border-red-400/60 text-red-900/70'
                                    : 'border-ink border-opacity-20 focus:border-opacity-100'
                                }`}
                              />
                              {hklValidation === 'invalid' && (
                                <p className="absolute text-[9px] text-red-400/80 mt-0.5 w-full text-center">3 integers</p>
                              )}
                            </div>
                          </div>
                        )}
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
              For more details on conventions, physics background, and references, please see the <button onClick={() => onNavigate('help')} className="underline hover:opacity-100 font-medium">Help page</button>.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
