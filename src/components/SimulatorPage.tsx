import { useState, useEffect, type ReactNode } from 'react';
import { PointGroupData } from '../data/pointGroups';
import { isCentrosymmetric, type SymbolicSHGResult, formatSymbolicSourceTerm } from '../services/tensorCalculator';
import { InlineMath, BlockMath } from 'react-katex';
import { Zap, Sliders, Activity, ChevronDown, ChevronUp, Info, RotateCcw } from 'lucide-react';
import { TensorTerm, FormatPointGroup, getPresetsForSystem, KDirectionSelector, GroupIdentityHeader } from './MathComponents';
import { PolarimetryPlot } from './PolarimetryPlot';
import { useSimulatorState } from '../hooks/useSimulatorState';
import type { TensorConfig, OrientationState, SimulationState } from '../types';

const PHASE_DETENTS = [
  ...[0, 45, 90, 135, 180, 225, 270, 315, 360].map(val => ({ val, threshold: 5 })),
  ...[15, 30, 60, 75, 105, 120, 150, 165, 195, 210, 240, 255, 285, 300, 330, 345].map(val => ({ val, threshold: 3 })),
];

const MAGNITUDE_DETENTS = [
  ...[0, 0.25, 0.5, 0.75, 1.0].map(val => ({ val, threshold: 0.02 })),
  ...[0.05, 0.1, 0.15, 0.2, 0.3, 0.35, 0.4, 0.45, 0.55, 0.6, 0.65, 0.7, 0.8, 0.85, 0.9, 0.95].map(val => ({ val, threshold: 0.01 })),
];

function snapValue(raw: number, detents: { val: number; threshold: number }[]): number {
  for (const { val, threshold } of detents) {
    if (Math.abs(raw - val) <= threshold) return val;
  }
  return raw;
}

interface SimulatorPageProps {
  selectedGroup: PointGroupData | null;
  tensorConfig: TensorConfig;
  orientation: OrientationState;
  symbolicExpressions: SymbolicSHGResult | null;
  simulation: SimulationState;
}

export function SimulatorPage({
  selectedGroup,
  tensorConfig,
  orientation,
  symbolicExpressions,
  simulation,
}: SimulatorPageProps) {
  const { type: selectedTensorType, setType: setSelectedTensorType, timeReversal: selectedTimeReversal, setTimeReversal: setSelectedTimeReversal, setting: selectedSetting } = tensorConfig;
  const { thetaX, setThetaX, thetaY, setThetaY, psi0, setPsi0, phiX, setPhiX, phiY, setPhiY, psi, setPsi } = orientation;
  const { amplitudes, setAmplitudes, phases, setPhases } = simulation;
  const [activePolarimetryTab, setActivePolarimetryTab] = useState<'anisotropy' | 'polarizer' | 'analyzer'>('anisotropy');
  const [showEquations, setShowEquations] = useState(false);
  const [verboseFormulas, setVerboseFormulas] = useState(false);
  const [showRotation, setShowRotation] = useState(phiX !== 0 || phiY !== 0 || psi !== 0);

  const [mobileSetupExpanded, setMobileSetupExpanded] = useState(false);
  const [mobilePlotVariant, setMobilePlotVariant] = useState<'primary' | 'secondary'>('primary');
  const [mobileActiveComponent, setMobileActiveComponent] = useState<string | null>(null);

  const rotationActive = phiX !== 0 || phiY !== 0 || psi !== 0;

  const activePreset = getPresetsForSystem(selectedGroup?.crystalSystem ?? '').find(p => p.tx === thetaX && p.ty === thetaY && p.psi0 === psi0);

  const { labFrame, sourceTerms, sourceTermsExEy, expandedFormulas, independentComponents, simulationData } =
    useSimulatorState(selectedGroup, selectedTensorType, selectedTimeReversal, thetaX, thetaY, psi0, phiX, phiY, psi, selectedSetting, amplitudes, setAmplitudes, phases, setPhases);

  useEffect(() => {
    if (independentComponents.length > 0 && (!mobileActiveComponent || !independentComponents.includes(mobileActiveComponent))) {
      setMobileActiveComponent(independentComponents[0]);
    }
  }, [independentComponents, mobileActiveComponent]);

  const mobileDataKeyMap: Record<string, { primary: string; secondary: string; primaryLabel: string; secondaryLabel: string }> = {
    anisotropy: { primary: 'parallel', secondary: 'crossed', primaryLabel: '∥', secondaryLabel: '⊥' },
    polarizer: { primary: 'pol_a0', secondary: 'pol_a90', primaryLabel: 'Ana 0°', secondaryLabel: 'Ana 90°' },
    analyzer: { primary: 'ana_p0', secondary: 'ana_p90', primaryLabel: 'Pol 0°', secondaryLabel: 'Pol 90°' },
  };
  const mobileMap = mobileDataKeyMap[activePolarimetryTab];
  const mobileDataKey = mobilePlotVariant === 'primary' ? mobileMap.primary : mobileMap.secondary;
  const mobileDisplayMaxMap: Record<string, number> = {
    parallel: simulationData.maxParallel, crossed: simulationData.maxCrossed,
    pol_a0: simulationData.maxPolA0, pol_a90: simulationData.maxPolA90,
    ana_p0: simulationData.maxAnaP0, ana_p90: simulationData.maxAnaP90,
  };
  const mobilePlotTitle: Record<string, { primary: ReactNode; secondary: ReactNode }> = {
    anisotropy: { primary: <>Parallel (<InlineMath math="I_{\parallel}" />)</>, secondary: <>Crossed (<InlineMath math="I_{\perp}" />)</> },
    polarizer: { primary: 'Analyzer at 0°', secondary: 'Analyzer at 90°' },
    analyzer: { primary: 'Polarizer at 0°', secondary: 'Polarizer at 90°' },
  };
  const mobilePlotSubtitle: Record<string, { primary: string; secondary: string }> = {
    anisotropy: { primary: 'Polarizer ∥ Analyzer', secondary: 'Polarizer ⊥ Analyzer' },
    polarizer: { primary: 'Fixed Analyzer', secondary: 'Fixed Analyzer' },
    analyzer: { primary: 'Fixed Polarizer', secondary: 'Fixed Polarizer' },
  };
  const mobileLabelPrefix: Record<string, 'Polarizer' | 'Analyzer'> = {
    anisotropy: 'Polarizer', polarizer: 'Polarizer', analyzer: 'Analyzer',
  };

  if (!selectedGroup) {
    return (
      <div className="h-[50vh] flex flex-col items-center justify-center text-center space-y-8">
        <div className="w-24 h-24 border border-ink border-dashed rounded-full flex items-center justify-center animate-spin-slow">
          <Activity className="w-8 h-8 opacity-20" />
        </div>
        <div className="space-y-2">
          <p className="text-xl font-serif italic opacity-40">Select a point group to begin simulation</p>
          <p className="text-[10px] uppercase tracking-[0.3em] opacity-30">Go to Explorer or use Search</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Group identity header — shared with Calculator */}
      <div className="hidden md:block">
        <GroupIdentityHeader group={selectedGroup} setting={selectedSetting} />
      </div>

      {/* Top Controls */}
      <div className="bg-white/50 border border-ink p-6 md:p-8 space-y-8">
        {/* Mobile compact summary */}
        <button
          type="button"
          aria-expanded={mobileSetupExpanded}
          onClick={() => setMobileSetupExpanded(!mobileSetupExpanded)}
          className="md:hidden flex items-center justify-between w-full"
        >
          <span className="text-sm font-medium">
            <span className="font-serif italic"><FormatPointGroup name={selectedGroup.name} /></span>
            <span className="opacity-50 mx-1">·</span>
            <span className="text-xs">{selectedTensorType === 'ED' ? 'ED' : selectedTensorType === 'MD' ? 'MD' : 'EQ'}</span>
            <span className="opacity-50 mx-1">·</span>
            <span className="text-xs">{selectedTimeReversal}-type</span>
            <span className="opacity-50 mx-1">·</span>
            <span className="text-xs">{activePreset ? activePreset.label : 'Custom'}</span>
          </span>
          {mobileSetupExpanded ? <ChevronUp className="w-4 h-4 opacity-50" /> : <ChevronDown className="w-4 h-4 opacity-50" />}
        </button>

        {/* Full controls — always on desktop, expandable on mobile */}
        <div className={mobileSetupExpanded ? '' : 'hidden md:block'}>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1 space-y-4">
              <h4 className="text-[10px] uppercase tracking-[0.2em] opacity-50 flex items-center gap-2">
                <Zap className="w-3 h-3" /> Tensor Classification
              </h4>
              <div className="flex flex-wrap gap-2">
                {(['ED', 'MD', 'EQ'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedTensorType(type)}
                    className={`px-4 py-2 text-xs font-medium transition-colors border border-ink ${
                      selectedTensorType === type
                        ? 'bg-ink text-paper'
                        : 'hover:bg-ink/5 opacity-50 hover:opacity-100 border-opacity-20'
                    }`}
                  >
                    {type === 'ED' ? 'Electric Dipole' : type === 'MD' ? 'Magnetic Dipole' : 'Electric Quadrupole'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 space-y-4">
              <h4 className="text-[10px] uppercase tracking-[0.2em] opacity-50 flex items-center gap-2">
                <Activity className="w-3 h-3" /> Time Reversal Symmetry
              </h4>
              <div className="flex flex-wrap gap-2">
                {(['i', 'c'] as const).map((tr) => (
                  <button
                    key={tr}
                    onClick={() => setSelectedTimeReversal(tr)}
                    className={`px-4 py-2 text-xs font-medium transition-colors border border-ink ${
                      selectedTimeReversal === tr
                        ? 'bg-ink text-paper'
                        : 'hover:bg-ink/5 opacity-50 hover:opacity-100 border-opacity-20'
                    }`}
                  >
                    {tr === 'i' ? 'i-type (Time-Even)' : 'c-type (Time-Odd)'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-ink border-opacity-10 pt-6 mt-8">
            <KDirectionSelector
              crystalSystem={selectedGroup.crystalSystem}
              thetaX={thetaX} thetaY={thetaY} psi0={psi0}
              setThetaX={setThetaX} setThetaY={setThetaY} setPsi0={setPsi0}
              labFrame={labFrame}
            />
          </div>
        </div>

        <div className="hidden md:block space-y-4 border-t border-ink border-opacity-10 pt-6">
          <button
            type="button"
            aria-expanded={showRotation}
            onClick={() => setShowRotation(!showRotation)}
            className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] opacity-50 hover:opacity-100 transition-opacity w-full"
          >
            {showRotation ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            <span>Crystal Rotation</span>
            {rotationActive && !showRotation && (
              <span className="normal-case tracking-normal text-[11px] ml-2 opacity-70">
                ({phiX !== 0 ? `φ_x = ${phiX}°` : ''}{phiX !== 0 && (phiY !== 0 || psi !== 0) ? ', ' : ''}{phiY !== 0 ? `φ_y = ${phiY}°` : ''}{(phiX !== 0 || phiY !== 0) && psi !== 0 ? ', ' : ''}{psi !== 0 ? `ψ = ${psi}°` : ''})
              </span>
            )}
          </button>

          {showRotation && (
            <div className="space-y-3">
              {([
                { label: '\\varphi_x', value: phiX, setValue: setPhiX, min: -90, max: 90, desc: 'Tilt about lab-x' },
                { label: '\\varphi_y', value: phiY, setValue: setPhiY, min: -90, max: 90, desc: 'Tilt about lab-y' },
                { label: '\\psi', value: psi, setValue: setPsi, min: -180, max: 180, desc: 'Azimuth about k' },
              ] as const).map(({ label, value, setValue, min, max, desc }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="w-10 shrink-0 text-right">
                    <InlineMath math={label} />
                  </div>
                  <input
                    type="range"
                    min={min}
                    max={max}
                    step="1"
                    value={value}
                    onChange={(e) => setValue(parseFloat(e.target.value))}
                    className="flex-1 accent-ink"
                    title={desc}
                  />
                  <div className="flex items-center gap-1 shrink-0">
                    <input
                      type="number"
                      min={min}
                      max={max}
                      step="1"
                      value={value}
                      onChange={(e) => {
                        const v = parseFloat(e.target.value);
                        if (!isNaN(v)) setValue(Math.max(min, Math.min(max, v)));
                      }}
                      className="w-16 text-right text-xs font-mono bg-white/50 border border-ink/20 px-2 py-1 rounded-sm focus:border-ink/60 focus:outline-none"
                    />
                    <span className="text-xs opacity-50">°</span>
                  </div>
                </div>
              ))}
              <button
                onClick={() => { setPhiX(0); setPhiY(0); setPsi(0); }}
                disabled={!rotationActive}
                className="flex items-center gap-1.5 text-xs opacity-50 hover:opacity-100 disabled:opacity-20 disabled:cursor-default transition-opacity mt-1"
              >
                <RotateCcw className="w-3 h-3" />
                Reset rotation
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Simulator Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Sliders — below plots on mobile */}
        <div className="lg:col-span-4 order-last lg:order-first space-y-6">
          <div className="hidden md:flex text-[10px] uppercase tracking-[0.2em] opacity-50 items-center gap-2">
            <Sliders className="w-3 h-3" />
            Independent Tensor Components
          </div>

          {(selectedGroup.crystalSystem === 'Triclinic' || selectedGroup.crystalSystem === 'Monoclinic') && (
            <div className="hidden md:block p-3 border border-ink border-opacity-10 bg-ink/5 text-xs opacity-70 leading-relaxed">
              Component values and polarimetry orientations depend on the in-plane Cartesian convention (see Help). Different monoclinic angles are represented by adjusting component values, not a separate control. Birefringence is not modeled.
            </div>
          )}

          {/* Mobile: component selector + one component's sliders */}
          {independentComponents.length > 0 && (
            <div className="md:hidden space-y-3">
              <div className="flex flex-wrap gap-1.5">
                {independentComponents.map(comp => (
                  <button
                    key={comp}
                    onClick={() => setMobileActiveComponent(comp)}
                    className={`px-2 py-1 text-xs border border-ink/20 transition-colors flex items-center gap-1 ${
                      mobileActiveComponent === comp ? 'bg-ink text-paper' : 'opacity-60 hover:opacity-100'
                    }`}
                  >
                    <TensorTerm term={comp} isNull={false} />
                    <span className="font-mono text-[10px] opacity-70">
                      {(amplitudes[comp] ?? 1).toFixed(2)}
                    </span>
                  </button>
                ))}
              </div>
              {mobileActiveComponent && (() => {
                const comp = mobileActiveComponent;
                const phaseVal = phases[comp] ?? 0;
                const singleComponent = independentComponents.length === 1;
                return (
                  <div className={`bg-white/50 border border-ink p-3 space-y-1.5 ${singleComponent ? 'opacity-40' : ''}`}>
                    {singleComponent && (
                      <div className="flex items-start gap-2 p-2 border border-ink/10 bg-ink/5 text-xs leading-relaxed opacity-70 mb-2">
                        <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                        <span>Single component: amplitude is only a global scale; the phase is unobservable in intensity.</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <div className="w-16 shrink-0 text-right font-mono text-sm font-medium">
                        <TensorTerm term={comp} isNull={false} />
                      </div>
                      <input type="range" min="0" max="1" step="0.01"
                        value={amplitudes[comp] ?? 1}
                        onChange={(e) => setAmplitudes(p => ({ ...p, [comp]: snapValue(parseFloat(e.target.value), MAGNITUDE_DETENTS) }))}
                        className="flex-1 accent-ink" disabled={singleComponent} />
                      <input type="number" min="0" max="1" step="0.01"
                        value={amplitudes[comp] ?? 1}
                        onChange={(e) => { const v = parseFloat(e.target.value); if (!isNaN(v)) setAmplitudes(p => ({ ...p, [comp]: Math.max(0, Math.min(1, v)) })); }}
                        className="w-14 text-right text-xs font-mono bg-white/50 border border-ink/20 px-1.5 py-1 rounded-sm focus:border-ink/60 focus:outline-none"
                        disabled={singleComponent} />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-16 shrink-0 text-right text-xs opacity-60">Phase</div>
                      <input type="range" min="0" max="360" step="1"
                        value={phaseVal}
                        onChange={(e) => setPhases(p => ({ ...p, [comp]: snapValue(parseInt(e.target.value, 10), PHASE_DETENTS) }))}
                        className="flex-1 accent-ink" disabled={singleComponent} />
                      <div className="flex items-center gap-0.5 shrink-0">
                        <input type="number" min="0" max="360" step="1"
                          value={phaseVal}
                          onChange={(e) => { const v = parseInt(e.target.value, 10); if (!isNaN(v)) setPhases(p => ({ ...p, [comp]: Math.max(0, Math.min(360, v)) })); }}
                          className="w-14 text-right text-xs font-mono bg-white/50 border border-ink/20 px-1.5 py-1 rounded-sm focus:border-ink/60 focus:outline-none"
                          disabled={singleComponent} />
                        <span className="text-xs opacity-50">°</span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          <div className="hidden md:block bg-white/50 border border-ink p-4 space-y-4">
            {independentComponents.length === 0 ? (
              <div className="py-6 space-y-4">
                <div className="flex items-start gap-3 p-4 border border-ink border-opacity-10 bg-ink/5">
                  <Info className="w-4 h-4 mt-0.5 shrink-0 opacity-60" />
                  <p className="text-sm leading-relaxed">
                    {selectedTensorType === 'ED' && isCentrosymmetric(selectedGroup.name) && selectedTimeReversal === 'i'
                      ? 'ED SHG is symmetry-forbidden for centrosymmetric groups (i-type).'
                      : selectedGroup.type === 'II' && selectedTimeReversal === 'c'
                      ? "c-type tensors vanish for grey groups (G1')."
                      : 'No non-zero components for this configuration.'}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedTimeReversal === 'i' && (
                    <button onClick={() => setSelectedTimeReversal('c')} className="px-3 py-1.5 text-xs border border-ink border-opacity-20 hover:bg-ink hover:text-paper transition-colors">Try c-type</button>
                  )}
                  {selectedTimeReversal === 'c' && (
                    <button onClick={() => setSelectedTimeReversal('i')} className="px-3 py-1.5 text-xs border border-ink border-opacity-20 hover:bg-ink hover:text-paper transition-colors">Try i-type</button>
                  )}
                  {selectedTensorType !== 'EQ' && (
                    <button onClick={() => setSelectedTensorType('EQ')} className="px-3 py-1.5 text-xs border border-ink border-opacity-20 hover:bg-ink hover:text-paper transition-colors">Try EQ</button>
                  )}
                  {selectedTensorType !== 'MD' && (
                    <button onClick={() => setSelectedTensorType('MD')} className="px-3 py-1.5 text-xs border border-ink border-opacity-20 hover:bg-ink hover:text-paper transition-colors">Try MD</button>
                  )}
                </div>
              </div>
            ) : (
              <>
              {independentComponents.length === 1 && (
                <div className="flex items-start gap-2 p-3 border border-ink/10 bg-ink/5 text-xs leading-relaxed opacity-70">
                  <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  <span>Single component: amplitude is only a global scale; the phase is unobservable in intensity.</span>
                </div>
              )}
              {independentComponents.map(comp => {
                const phaseVal = phases[comp] ?? 0;
                const singleComponent = independentComponents.length === 1;
                return (
                  <div key={comp} className={`space-y-1.5 border-b border-ink/10 pb-3 last:border-0 last:pb-0 ${singleComponent ? 'opacity-40' : ''}`}>
                    <div className="flex items-center gap-2">
                      <div className="w-20 shrink-0 text-right font-mono text-sm font-medium">
                        <TensorTerm term={comp} isNull={false} />
                      </div>
                      <input
                        type="range"
                        min="0" max="1" step="0.01"
                        value={amplitudes[comp] ?? 1}
                        onChange={(e) => setAmplitudes(p => ({ ...p, [comp]: snapValue(parseFloat(e.target.value), MAGNITUDE_DETENTS) }))}
                        onKeyDown={(e) => {
                          if (e.shiftKey && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
                            e.preventDefault();
                            const dir = (e.key === 'ArrowRight' || e.key === 'ArrowUp') ? 1 : -1;
                            setAmplitudes(p => ({ ...p, [comp]: Math.max(0, Math.min(1, (p[comp] ?? 1) + dir * 0.05)) }));
                          }
                        }}
                        className="flex-1 accent-ink"
                        disabled={singleComponent}
                      />
                      <input
                        type="number"
                        min="0" max="1" step="0.01"
                        value={amplitudes[comp] ?? 1}
                        onChange={(e) => {
                          const v = parseFloat(e.target.value);
                          if (!isNaN(v)) setAmplitudes(p => ({ ...p, [comp]: Math.max(0, Math.min(1, v)) }));
                        }}
                        className="w-14 text-right text-xs font-mono bg-white/50 border border-ink/20 px-1.5 py-1 rounded-sm focus:border-ink/60 focus:outline-none"
                        disabled={singleComponent}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-20 shrink-0" />
                      <div className="flex-1 flex justify-between px-0.5 -mt-1">
                        {[0, 0.5, 1].map(tick => (
                          <button key={tick} type="button" disabled={singleComponent}
                            onClick={() => setAmplitudes(p => ({ ...p, [comp]: tick }))}
                            className="text-[9px] opacity-30 hover:opacity-80 transition-opacity"
                          >{tick}</button>
                        ))}
                      </div>
                      <div className="w-14 shrink-0" />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-20 shrink-0 text-right text-xs opacity-60">Phase</div>
                      <input
                        type="range"
                        min="0" max="360" step="1"
                        value={phaseVal}
                        onChange={(e) => setPhases(p => ({ ...p, [comp]: snapValue(parseInt(e.target.value, 10), PHASE_DETENTS) }))}
                        onKeyDown={(e) => {
                          if (e.shiftKey && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
                            e.preventDefault();
                            const dir = (e.key === 'ArrowRight' || e.key === 'ArrowUp') ? 1 : -1;
                            setPhases(p => ({ ...p, [comp]: Math.max(0, Math.min(360, (p[comp] ?? 0) + dir * 15)) }));
                          }
                        }}
                        className="flex-1 accent-ink"
                        disabled={singleComponent}
                      />
                      <div className="flex items-center gap-0.5 shrink-0">
                        <input
                          type="number"
                          min="0" max="360" step="1"
                          value={phaseVal}
                          onChange={(e) => {
                            const v = parseInt(e.target.value, 10);
                            if (!isNaN(v)) setPhases(p => ({ ...p, [comp]: Math.max(0, Math.min(360, v)) }));
                          }}
                          className="w-14 text-right text-xs font-mono bg-white/50 border border-ink/20 px-1.5 py-1 rounded-sm focus:border-ink/60 focus:outline-none"
                          disabled={singleComponent}
                        />
                        <span className="text-xs opacity-50">°</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-20 shrink-0" />
                      <div className="flex-1 flex justify-between px-0.5 -mt-1">
                        {[0, 90, 180, 270, 360].map(tick => (
                          <button key={tick} type="button" disabled={singleComponent}
                            onClick={() => setPhases(p => ({ ...p, [comp]: tick }))}
                            className="text-[9px] opacity-30 hover:opacity-80 transition-opacity"
                          >{tick}</button>
                        ))}
                      </div>
                      <div className="w-14 shrink-0" />
                    </div>
                  </div>
                );
              })}
              </>
            )}
          </div>
        </div>

        {/* Right Column: Polar Plots — sticky on tablet/desktop */}
        <div className="lg:col-span-8 md:sticky md:top-20 self-start z-10 space-y-6">
          <div className="text-[10px] uppercase tracking-[0.2em] opacity-50 flex items-center gap-2">
            <Activity className="w-3 h-3" />
            SHG Intensity Polarimetry
          </div>

          <div className="bg-white/50 border border-ink overflow-hidden">
            {/* Tab Menu */}
            <div className="flex overflow-x-auto border-b border-ink border-opacity-20 bg-white/30 hide-scrollbar">
              <button
                onClick={() => setActivePolarimetryTab('anisotropy')}
                className={`px-4 md:px-6 py-4 text-xs font-medium uppercase tracking-wider whitespace-nowrap transition-colors ${activePolarimetryTab === 'anisotropy' ? 'bg-ink text-paper' : 'hover:bg-ink/5 text-ink/70'}`}
              >
                <span className="md:hidden">Aniso</span>
                <span className="hidden md:inline">Anisotropy</span>
              </button>
              <button
                onClick={() => setActivePolarimetryTab('polarizer')}
                className={`px-4 md:px-6 py-4 text-xs font-medium uppercase tracking-wider whitespace-nowrap transition-colors border-l border-ink border-opacity-10 ${activePolarimetryTab === 'polarizer' ? 'bg-ink text-paper' : 'hover:bg-ink/5 text-ink/70'}`}
              >
                <span className="md:hidden">Pol</span>
                <span className="hidden md:inline">Polarizer</span>
              </button>
              <button
                onClick={() => setActivePolarimetryTab('analyzer')}
                className={`px-4 md:px-6 py-4 text-xs font-medium uppercase tracking-wider whitespace-nowrap transition-colors border-l border-ink border-opacity-10 ${activePolarimetryTab === 'analyzer' ? 'bg-ink text-paper' : 'hover:bg-ink/5 text-ink/70'}`}
              >
                <span className="md:hidden">Ana</span>
                <span className="hidden md:inline">Analyzer</span>
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-4 md:p-6">
              {independentComponents.length === 0 ? (
                <div className="h-[400px] flex flex-col items-center justify-center gap-4 text-sm opacity-50">
                  <span className="italic">Zero intensity</span>
                  <span className="text-xs">
                    {selectedTensorType === 'ED' && isCentrosymmetric(selectedGroup.name) && selectedTimeReversal === 'i'
                      ? 'ED SHG is symmetry-forbidden for centrosymmetric groups (i-type).'
                      : selectedGroup.type === 'II' && selectedTimeReversal === 'c'
                      ? "c-type tensors vanish for grey groups (G1')."
                      : ''}
                  </span>
                </div>
              ) : (
                <div className="animate-in fade-in duration-300">
                  {/* Mobile: ∥/⊥ toggle + single plot */}
                  <div className="md:hidden space-y-4">
                    <div className="flex justify-center border border-ink/20 rounded-sm overflow-hidden w-fit mx-auto">
                      <button
                        onClick={() => setMobilePlotVariant('primary')}
                        className={`px-3 py-1.5 text-xs transition-colors ${mobilePlotVariant === 'primary' ? 'bg-ink text-paper' : 'opacity-50 hover:opacity-100'}`}
                      >{mobileMap.primaryLabel}</button>
                      <button
                        onClick={() => setMobilePlotVariant('secondary')}
                        className={`px-3 py-1.5 text-xs border-l border-ink/20 transition-colors ${mobilePlotVariant === 'secondary' ? 'bg-ink text-paper' : 'opacity-50 hover:opacity-100'}`}
                      >{mobileMap.secondaryLabel}</button>
                    </div>
                    <PolarimetryPlot
                      title={mobilePlotTitle[activePolarimetryTab][mobilePlotVariant]}
                      subtitle={mobilePlotSubtitle[activePolarimetryTab][mobilePlotVariant]}
                      data={simulationData.data}
                      domainMax={simulationData.maxIntensity}
                      dataKey={mobileDataKey}
                      radarName={mobilePlotVariant === 'primary' ? 'Primary' : 'Secondary'}
                      displayMax={mobileDisplayMaxMap[mobileDataKey]}
                      labelPrefix={mobileLabelPrefix[activePolarimetryTab]}
                    />
                  </div>

                  {/* Desktop: two plots side by side */}
                  {activePolarimetryTab === 'anisotropy' && (
                    <div className="hidden md:grid md:grid-cols-2 gap-4 md:gap-6">
                      <PolarimetryPlot
                        title={<>Parallel (<InlineMath math="I_{\parallel}" />)</>}
                        subtitle="Polarizer ∥ Analyzer"
                        data={simulationData.data}
                        domainMax={simulationData.maxIntensity}
                        dataKey="parallel"
                        radarName="Parallel"
                        displayMax={simulationData.maxParallel}
                        labelPrefix="Polarizer"
                      />
                      <PolarimetryPlot
                        title={<>Crossed (<InlineMath math="I_{\perp}" />)</>}
                        subtitle="Polarizer ⊥ Analyzer"
                        data={simulationData.data}
                        domainMax={simulationData.maxIntensity}
                        dataKey="crossed"
                        radarName="Crossed"
                        displayMax={simulationData.maxCrossed}
                        labelPrefix="Polarizer"
                      />
                    </div>
                  )}

                  {activePolarimetryTab === 'polarizer' && (
                    <div className="hidden md:grid md:grid-cols-2 gap-4 md:gap-6">
                      <PolarimetryPlot
                        title="Analyzer at 0°"
                        subtitle="Fixed Analyzer"
                        data={simulationData.data}
                        domainMax={simulationData.maxIntensity}
                        dataKey="pol_a0"
                        radarName="Analyzer 0°"
                        displayMax={simulationData.maxPolA0}
                        labelPrefix="Polarizer"
                      />
                      <PolarimetryPlot
                        title="Analyzer at 90°"
                        subtitle="Fixed Analyzer"
                        data={simulationData.data}
                        domainMax={simulationData.maxIntensity}
                        dataKey="pol_a90"
                        radarName="Analyzer 90°"
                        displayMax={simulationData.maxPolA90}
                        labelPrefix="Polarizer"
                      />
                    </div>
                  )}

                  {activePolarimetryTab === 'analyzer' && (
                    <div className="hidden md:grid md:grid-cols-2 gap-4 md:gap-6">
                      <PolarimetryPlot
                        title="Polarizer at 0°"
                        subtitle="Fixed Polarizer"
                        data={simulationData.data}
                        domainMax={simulationData.maxIntensity}
                        dataKey="ana_p0"
                        radarName="Polarizer 0°"
                        displayMax={simulationData.maxAnaP0}
                        labelPrefix="Analyzer"
                      />
                      <PolarimetryPlot
                        title="Polarizer at 90°"
                        subtitle="Fixed Polarizer"
                        data={simulationData.data}
                        domainMax={simulationData.maxIntensity}
                        dataKey="ana_p90"
                        radarName="Polarizer 90°"
                        displayMax={simulationData.maxAnaP90}
                        labelPrefix="Analyzer"
                      />
                    </div>
                  )}

                  {independentComponents.length > 0 && (
                    <div className="mt-6 text-center text-xs opacity-50">
                      Note: The angle shown in the plots represents the {activePolarimetryTab === 'analyzer' ? 'analyzer' : 'polarizer'} angle. 0° corresponds to the Lab X-axis, and 90° corresponds to the Lab Y-axis.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Equations Section */}
      <div className="mt-12 border-t border-ink border-opacity-10 pt-8">
        <button 
          onClick={() => setShowEquations(!showEquations)}
          className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity mx-auto"
        >
          {showEquations ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          {showEquations ? 'Hide Mathematical Details' : 'Show Mathematical Details'}
        </button>

        {showEquations && (
          <div className="mt-8 bg-white/50 border border-ink p-6 md:p-8 space-y-8 animate-in slide-in-from-top-4 duration-300">
            <div className="space-y-4">
              <h3 className="text-lg font-serif italic">Mathematical Model</h3>
              <p className="text-sm opacity-70 leading-relaxed">
                The SHG intensity <InlineMath math="I" /> is calculated based on the incident electric field <InlineMath math="\vec{E}_{in}" /> and the resulting source polarization <InlineMath math="\vec{S}" />.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h4 className="text-[10px] uppercase tracking-[0.2em] opacity-50">1. Incident Field</h4>
                <p className="text-sm opacity-70 leading-relaxed">
                  The incident light propagates along the Lab Z-axis. The electric field vector is defined by the polarizer angle <InlineMath math="\theta_{pol}" />:
                </p>
                <div className="bg-ink/5 p-4 overflow-x-auto">
                  <BlockMath math="\vec{E}_{in} = \begin{pmatrix} E_X \\ E_Y \\ 0 \end{pmatrix} = E_0 \begin{pmatrix} \cos(\theta_{pol}) \\ \sin(\theta_{pol}) \\ 0 \end{pmatrix}" />
                </div>
              </div>

              <div className="space-y-4 md:col-span-2">
                <h4 className="text-[10px] uppercase tracking-[0.2em] opacity-50">2. Source Terms (Lab Frame)</h4>
                <p className="text-sm opacity-70 leading-relaxed">
                  For the selected point group and crystal orientation, the source terms evaluate to:
                </p>
                <div className="bg-ink/5 p-4 overflow-x-auto space-y-6">
                  {symbolicExpressions && (
                    <div className="space-y-4">
                      <div className="text-xs font-bold uppercase tracking-widest opacity-50 mb-2">
                        Symbolic (<InlineMath math="\varphi_x, \varphi_y, \psi" /> dependence)
                      </div>
                      {symbolicExpressions.source.filter(term => term.component === 'S_X' || term.component === 'S_Y').map((term, i) => {
                        const formatted = formatSymbolicSourceTerm(term.symbolicPoly);
                        return (
                          <div key={`sym-${i}`} className="flex items-center gap-4 font-mono text-sm whitespace-nowrap">
                            <div><TensorTerm term={term.component} isNull={formatted === '0'} /></div>
                            <div>=</div>
                            <div><TensorTerm term={formatted} isNull={formatted === '0'} /></div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <div className="space-y-4 pt-4 border-t border-ink/10">
                    <div className="text-xs font-bold uppercase tracking-widest opacity-50 mb-2">As functions of <InlineMath math="E_X, E_Y" /></div>
                    {sourceTermsExEy.filter(term => term.component === 'S_X' || term.component === 'S_Y').map((term, i) => (
                      <div key={`exey-${i}`} className="flex items-center gap-4 font-mono text-sm whitespace-nowrap">
                        <div><TensorTerm term={term.component} isNull={term.expression === '0'} /></div>
                        <div>=</div>
                        <div><TensorTerm term={term.expression} isNull={term.expression === '0'} /></div>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-4 pt-4 border-t border-ink/10">
                    <div className="text-xs font-bold uppercase tracking-widest opacity-50 mb-2">As functions of <InlineMath math="\theta_{pol}" /></div>
                    {sourceTerms.filter(term => term.component === 'S_X' || term.component === 'S_Y').map((term, i) => (
                      <div key={`theta-${i}`} className="flex items-center gap-4 font-mono text-sm whitespace-nowrap">
                        <div><TensorTerm term={`${term.component}(\\theta_{pol})`} isNull={term.expression === '0'} /></div>
                        <div>=</div>
                        <div><TensorTerm term={term.expression} isNull={term.expression === '0'} /></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4 md:col-span-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] uppercase tracking-[0.2em] opacity-50">3. Detected Intensity Formulas</h4>
                  <button 
                    onClick={() => setVerboseFormulas(!verboseFormulas)}
                    className="text-[10px] uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity flex items-center gap-1"
                  >
                    {verboseFormulas ? 'Show Short' : 'Show Expanded'}
                  </button>
                </div>
                <p className="text-sm opacity-70 leading-relaxed">
                  The plotted intensities <InlineMath math="I \propto |E_{out}|^2" /> correspond to the following configurations, where <InlineMath math="\theta" /> is the angle shown on the polar plot:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-ink/5 p-4 space-y-4">
                    <div className="text-xs font-bold uppercase tracking-widest opacity-50">Anisotropy</div>
                    <div className="space-y-2">
                      <div className="text-xs opacity-70">Parallel (<InlineMath math="\theta_{pol} = \theta_{ana} = \theta" />):</div>
                      <div className="overflow-x-auto pb-2"><BlockMath math={verboseFormulas && expandedFormulas ? expandedFormulas.aniPar : "I_{\\parallel} = |S_X(\\theta) \\cos\\theta + S_Y(\\theta) \\sin\\theta|^2"} /></div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-xs opacity-70">Crossed (<InlineMath math="\theta_{pol} = \theta, \theta_{ana} = \theta + 90^\circ" />):</div>
                      <div className="overflow-x-auto pb-2"><BlockMath math={verboseFormulas && expandedFormulas ? expandedFormulas.aniPerp : "I_{\\perp} = |-S_X(\\theta) \\sin\\theta + S_Y(\\theta) \\cos\\theta|^2"} /></div>
                    </div>
                  </div>
                  
                  <div className="bg-ink/5 p-4 space-y-4">
                    <div className="text-xs font-bold uppercase tracking-widest opacity-50">Polarizer</div>
                    <div className="space-y-2">
                      <div className="text-xs opacity-70">Analyzer 0° (<InlineMath math="\theta_{ana} = 0^\circ, \theta_{pol} = \theta" />):</div>
                      <div className="overflow-x-auto pb-2"><BlockMath math={verboseFormulas && expandedFormulas ? expandedFormulas.polA0 : "I = |S_X(\\theta)|^2"} /></div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-xs opacity-70">Analyzer 90° (<InlineMath math="\theta_{ana} = 90^\circ, \theta_{pol} = \theta" />):</div>
                      <div className="overflow-x-auto pb-2"><BlockMath math={verboseFormulas && expandedFormulas ? expandedFormulas.polA90 : "I = |S_Y(\\theta)|^2"} /></div>
                    </div>
                  </div>

                  <div className="bg-ink/5 p-4 space-y-4">
                    <div className="text-xs font-bold uppercase tracking-widest opacity-50">Analyzer</div>
                    <div className="space-y-2">
                      <div className="text-xs opacity-70">Polarizer 0° (<InlineMath math="\theta_{pol} = 0^\circ, \theta_{ana} = \theta" />):</div>
                      <div className="overflow-x-auto pb-2"><BlockMath math={verboseFormulas && expandedFormulas ? expandedFormulas.anaP0 : "I = |S_X(0^\\circ) \\cos\\theta + S_Y(0^\\circ) \\sin\\theta|^2"} /></div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-xs opacity-70">Polarizer 90° (<InlineMath math="\theta_{pol} = 90^\circ, \theta_{ana} = \theta" />):</div>
                      <div className="overflow-x-auto pb-2"><BlockMath math={verboseFormulas && expandedFormulas ? expandedFormulas.anaP90 : "I = |S_X(90^\\circ) \\cos\\theta + S_Y(90^\\circ) \\sin\\theta|^2"} /></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
