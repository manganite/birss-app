import React, { useState } from 'react';
import { PointGroupData } from '../data/pointGroups';
import { TensorType, TensorTimeReversal, isCentrosymmetric, type SymbolicSHGResult, formatSymbolicSourceTerm } from '../services/tensorCalculator';
import { InlineMath, BlockMath } from 'react-katex';
import { Zap, Compass, Sliders, Activity, ChevronDown, ChevronUp, Info, RotateCcw } from 'lucide-react';
import { TensorTerm, FormatPointGroup, getPresetsForSystem, LabFrameOrientation } from './MathComponents';
import { PolarimetryPlot } from './PolarimetryPlot';
import { useSimulatorState } from '../hooks/useSimulatorState';

interface SimulatorPageProps {
  selectedGroup: PointGroupData | null;
  selectedTensorType: TensorType;
  setSelectedTensorType: (t: TensorType) => void;
  selectedTimeReversal: TensorTimeReversal;
  setSelectedTimeReversal: (t: TensorTimeReversal) => void;
  thetaX: number;
  setThetaX: (t: number) => void;
  thetaY: number;
  setThetaY: (t: number) => void;
  phiX: number;
  setPhiX: (v: number) => void;
  phiY: number;
  setPhiY: (v: number) => void;
  psi: number;
  setPsi: (v: number) => void;
  selectedSetting: number;
  symbolicExpressions: SymbolicSHGResult | null;
  amplitudes: Record<string, number>;
  setAmplitudes: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  phases: Record<string, number>;
  setPhases: React.Dispatch<React.SetStateAction<Record<string, number>>>;
}

export function SimulatorPage({
  selectedGroup,
  selectedTensorType,
  setSelectedTensorType,
  selectedTimeReversal,
  setSelectedTimeReversal,
  thetaX,
  setThetaX,
  thetaY,
  setThetaY,
  phiX,
  setPhiX,
  phiY,
  setPhiY,
  psi,
  setPsi,
  selectedSetting,
  symbolicExpressions,
  amplitudes,
  setAmplitudes,
  phases,
  setPhases
}: SimulatorPageProps) {
  const [activePolarimetryTab, setActivePolarimetryTab] = useState<'anisotropy' | 'polarizer' | 'analyzer'>('anisotropy');
  const [showEquations, setShowEquations] = useState(false);
  const [verboseFormulas, setVerboseFormulas] = useState(false);
  const [showRotation, setShowRotation] = useState(phiX !== 0 || phiY !== 0 || psi !== 0);
  const [phaseOverrides, setPhaseOverrides] = useState<Map<string, boolean>>(new Map());
  const [mobileSetupExpanded, setMobileSetupExpanded] = useState(false);

  const rotationActive = phiX !== 0 || phiY !== 0 || psi !== 0;

  const activePreset = getPresetsForSystem(selectedGroup?.crystalSystem ?? '').find(p => p.tx === thetaX && p.ty === thetaY);

  const { labFrame, sourceTerms, sourceTermsExEy, expandedFormulas, independentComponents, simulationData } =
    useSimulatorState(selectedGroup, selectedTensorType, selectedTimeReversal, thetaX, thetaY, phiX, phiY, psi, selectedSetting, amplitudes, setAmplitudes, phases, setPhases);

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

          <div className="space-y-4 border-t border-ink border-opacity-10 pt-6 mt-8">
            <h4 className="text-[10px] uppercase tracking-[0.2em] opacity-50 flex items-center gap-2">
              <Compass className="w-3 h-3" /> Crystal Orientation (k vector)
            </h4>
            <div className="flex flex-wrap gap-3">
              {getPresetsForSystem(selectedGroup.crystalSystem).map((ori) => (
                <button
                  key={ori.label}
                  onClick={() => {
                    setThetaX(ori.tx);
                    setThetaY(ori.ty);
                  }}
                  className={`px-4 py-2 text-[12px] tracking-[0.1em] transition-all border border-ink ${
                    thetaX === ori.tx && thetaY === ori.ty
                      ? 'bg-ink text-paper'
                      : 'hover:bg-ink hover:text-paper opacity-50 hover:opacity-100 border-opacity-20'
                  }`}
                >
                  <InlineMath math={ori.math} />
                </button>
              ))}
            </div>
            <div className="flex flex-col md:flex-row gap-8 items-start mt-6">
              <LabFrameOrientation labFrame={labFrame} />
            </div>
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
          <div className="text-[10px] uppercase tracking-[0.2em] opacity-50 flex items-center gap-2">
            <Sliders className="w-3 h-3" />
            Independent Tensor Components
          </div>

          {(selectedGroup.crystalSystem === 'Triclinic' || selectedGroup.crystalSystem === 'Monoclinic') && (
            <div className="p-3 border border-ink border-opacity-10 bg-ink/5 text-xs opacity-70 leading-relaxed">
              Component values and polarimetry orientations depend on the in-plane Cartesian convention (see Help). Different monoclinic angles are represented by adjusting component values, not a separate control. Birefringence is not modeled.
            </div>
          )}

          <div className="bg-white/50 border border-ink p-6 space-y-8">
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
              independentComponents.map(comp => {
                const phaseVal = phases[comp] ?? 0;
                const override = phaseOverrides.get(comp);
                const phaseExpanded = override !== undefined ? override : (phaseVal !== 0);
                return (
                  <div key={comp} className="space-y-2 border-b border-ink border-opacity-10 pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between">
                      <div className="font-mono text-lg font-medium">
                        <TensorTerm term={comp} isNull={false} />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="0" max="1" step="0.01"
                        value={amplitudes[comp] ?? 1}
                        onChange={(e) => setAmplitudes(p => ({ ...p, [comp]: parseFloat(e.target.value) }))}
                        className="flex-1 accent-ink"
                      />
                      <input
                        type="number"
                        min="0" max="1" step="0.01"
                        value={amplitudes[comp] ?? 1}
                        onChange={(e) => {
                          const v = parseFloat(e.target.value);
                          if (!isNaN(v)) setAmplitudes(p => ({ ...p, [comp]: Math.max(0, Math.min(1, v)) }));
                        }}
                        className="w-16 text-right text-xs font-mono bg-white/50 border border-ink/20 px-2 py-1 rounded-sm focus:border-ink/60 focus:outline-none"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => setPhaseOverrides(prev => {
                        const next = new Map(prev);
                        next.set(comp, !phaseExpanded);
                        return next;
                      })}
                      className="flex items-center gap-1 text-xs opacity-50 hover:opacity-100 transition-opacity"
                    >
                      {phaseExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      Phase{!phaseExpanded && phaseVal !== 0 ? `: ${phaseVal}°` : ''}
                    </button>

                    {phaseExpanded && (
                      <div className="flex items-center gap-2">
                        <div className="flex-1 relative">
                          <input
                            type="range"
                            min="0" max="360" step="1"
                            value={phaseVal}
                            onChange={(e) => setPhases(p => ({ ...p, [comp]: parseInt(e.target.value, 10) }))}
                            className="w-full accent-ink"
                          />
                          <div className="flex justify-between text-[9px] opacity-30 px-0.5 -mt-1" aria-hidden="true">
                            <span>0</span>
                            <span>90</span>
                            <span>180</span>
                            <span>270</span>
                            <span>360</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <input
                            type="number"
                            min="0" max="360" step="1"
                            value={phaseVal}
                            onChange={(e) => {
                              const v = parseInt(e.target.value, 10);
                              if (!isNaN(v)) setPhases(p => ({ ...p, [comp]: Math.max(0, Math.min(360, v)) }));
                            }}
                            className="w-16 text-right text-xs font-mono bg-white/50 border border-ink/20 px-2 py-1 rounded-sm focus:border-ink/60 focus:outline-none"
                          />
                          <span className="text-xs opacity-50">°</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Polar Plots — sticky on both mobile and desktop */}
        <div className="lg:col-span-8 sticky top-16 md:top-20 self-start z-10 space-y-6">
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
            <div className="p-6 md:p-8 min-h-[400px]">
              {independentComponents.length === 0 ? (
                <div className="h-[400px] flex flex-col items-center justify-center gap-4 text-sm opacity-50">
                  <span className="italic">Zero intensity</span>
                  <span className="text-xs">
                    {selectedTensorType === 'ED' && isCentrosymmetric(selectedGroup.name) && selectedTimeReversal === 'i'
                      ? 'ED SHG is symmetry-forbidden for centrosymmetric groups.'
                      : selectedGroup.type === 'II' && selectedTimeReversal === 'c'
                      ? "c-type tensors vanish for grey groups."
                      : ''}
                  </span>
                </div>
              ) : (
                <div className="animate-in fade-in duration-300">
                  {activePolarimetryTab === 'anisotropy' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <PolarimetryPlot
                        title={<>Parallel (<InlineMath math="I_{\parallel}" />)</>}
                        subtitle="Polarizer || Analyzer"
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                    <div className="mt-8 text-center text-xs opacity-50">
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
                <h4 className="text-[10px] uppercase tracking-[0.2em] opacity-50">2. Source Terms (Current Configuration)</h4>
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
