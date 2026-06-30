import { useState, useEffect } from 'react';
import { Sliders, Info } from 'lucide-react';
import { isCentrosymmetric } from '../services/tensorCalculator';
import { TensorTerm, SectionHeader } from './MathComponents';
import { TermInfo } from './TermInfo';
import type { PointGroupData } from '../data/pointGroups';
import type { TensorConfig, SimulationState } from '../types';

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

interface TensorComponentControlsProps {
  selectedGroup: PointGroupData;
  tensorConfig: TensorConfig;
  simulation: SimulationState;
  independentComponents: string[];
  onNavigate?: (view: string, tab?: string) => void;
}

export function TensorComponentControls({
  selectedGroup,
  tensorConfig,
  simulation,
  independentComponents,
  onNavigate,
}: TensorComponentControlsProps) {
  const { type: selectedTensorType, setType: setSelectedTensorType, timeReversal: selectedTimeReversal, setTimeReversal: setSelectedTimeReversal } = tensorConfig;
  const { amplitudes, setAmplitudes, phases, setPhases } = simulation;
  const [mobileActiveComponent, setMobileActiveComponent] = useState<string | null>(null);

  useEffect(() => {
    if (independentComponents.length > 0 && (!mobileActiveComponent || !independentComponents.includes(mobileActiveComponent))) {
      setMobileActiveComponent(independentComponents[0]);
    }
  }, [independentComponents, mobileActiveComponent]);

  return (
    <div className="space-y-6">
      <div className="hidden md:block">
        <SectionHeader icon={<Sliders className="w-3 h-3" />}>
          Independent Tensor Components
          <TermInfo id="chi-components" onNavigate={onNavigate} />
        </SectionHeader>
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

      {/* Desktop: all components */}
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
  );
}
