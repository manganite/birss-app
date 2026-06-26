import React, { useState } from 'react';
import { PointGroupData } from '../data/pointGroups';
import { TensorType, TensorTimeReversal, isCentrosymmetric } from '../services/tensorCalculator';
import { InlineMath, BlockMath } from 'react-katex';
import { Zap, Compass, Sliders, Activity, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { TensorTerm, K_ORIENTATION_PRESETS, LabFrameOrientation } from './MathComponents';
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
  amplitudes,
  setAmplitudes,
  phases,
  setPhases
}: SimulatorPageProps) {
  const [activePolarimetryTab, setActivePolarimetryTab] = useState<'anisotropy' | 'polarizer' | 'analyzer'>('anisotropy');
  const [showEquations, setShowEquations] = useState(false);
  const [verboseFormulas, setVerboseFormulas] = useState(false);

  const { labFrame, sourceTerms, sourceTermsExEy, expandedFormulas, independentComponents, simulationData } =
    useSimulatorState(selectedGroup, selectedTensorType, selectedTimeReversal, thetaX, thetaY, phiX, phiY, psi, amplitudes, setAmplitudes, phases, setPhases);

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

        <div className="space-y-4 border-t border-ink border-opacity-10 pt-6">
          <h4 className="text-[10px] uppercase tracking-[0.2em] opacity-50 flex items-center gap-2">
            <Compass className="w-3 h-3" /> Crystal Orientation (k vector)
          </h4>
          <div className="flex flex-wrap gap-3">
            {K_ORIENTATION_PRESETS.map((ori) => (
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

      {/* Main Simulator Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Sliders */}
        <div className="lg:col-span-4 space-y-6">
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
              independentComponents.map(comp => (
                <div key={comp} className="space-y-4 border-b border-ink border-opacity-10 pb-6 last:border-0 last:pb-0">
                  <div className="font-mono text-lg font-medium">
                    <TensorTerm term={comp} isNull={false} />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs opacity-60">
                      <span>Amplitude</span>
                      <span className="font-mono">{amplitudes[comp]?.toFixed(2) || '1.00'}</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" max="1" step="0.01"
                      value={amplitudes[comp] ?? 1}
                      onChange={(e) => setAmplitudes(p => ({ ...p, [comp]: parseFloat(e.target.value) }))}
                      className="w-full accent-ink"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs opacity-60">
                      <span>Phase (deg)</span>
                      <span className="font-mono">{phases[comp] ?? 0}°</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" max="360" step="1"
                      value={phases[comp] ?? 0}
                      onChange={(e) => setPhases(p => ({ ...p, [comp]: parseInt(e.target.value, 10) }))}
                      className="w-full accent-ink"
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Polar Plots */}
        <div className="lg:col-span-8 space-y-6">
          <div className="text-[10px] uppercase tracking-[0.2em] opacity-50 flex items-center gap-2">
            <Activity className="w-3 h-3" />
            SHG Intensity Polarimetry
          </div>

          <div className="bg-white/50 border border-ink overflow-hidden">
            {/* Tab Menu */}
            <div className="flex overflow-x-auto border-b border-ink border-opacity-20 bg-white/30 hide-scrollbar">
              <button
                onClick={() => setActivePolarimetryTab('anisotropy')}
                className={`px-6 py-4 text-xs font-medium uppercase tracking-wider whitespace-nowrap transition-colors ${activePolarimetryTab === 'anisotropy' ? 'bg-ink text-paper' : 'hover:bg-ink/5 text-ink/70'}`}
              >
                Anisotropy
              </button>
              <button
                onClick={() => setActivePolarimetryTab('polarizer')}
                className={`px-6 py-4 text-xs font-medium uppercase tracking-wider whitespace-nowrap transition-colors border-l border-ink border-opacity-10 ${activePolarimetryTab === 'polarizer' ? 'bg-ink text-paper' : 'hover:bg-ink/5 text-ink/70'}`}
              >
                Polarizer
              </button>
              <button
                onClick={() => setActivePolarimetryTab('analyzer')}
                className={`px-6 py-4 text-xs font-medium uppercase tracking-wider whitespace-nowrap transition-colors border-l border-ink border-opacity-10 ${activePolarimetryTab === 'analyzer' ? 'bg-ink text-paper' : 'hover:bg-ink/5 text-ink/70'}`}
              >
                Analyzer
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
                  <div className="space-y-4">
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
