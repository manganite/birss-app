import { useState, type ReactNode } from 'react';
import { Activity } from 'lucide-react';
import { InlineMath } from 'react-katex';
import { isCentrosymmetric } from '../services/tensorCalculator';
import { PolarimetryPlot } from './PolarimetryPlot';
import { TermInfo } from './TermInfo';
import type { PointGroupData } from '../data/pointGroups';
import type { TensorConfig } from '../types';
import type { useSimulatorState } from '../hooks/useSimulatorState';

interface PolarimetrySectionProps {
  selectedGroup: PointGroupData;
  tensorConfig: TensorConfig;
  independentComponents: string[];
  simulationData: ReturnType<typeof useSimulatorState>['simulationData'];
  onNavigate?: (view: string, tab?: string) => void;
}

export function PolarimetrySection({
  selectedGroup,
  tensorConfig,
  independentComponents,
  simulationData,
  onNavigate,
}: PolarimetrySectionProps) {
  const { type: selectedTensorType, timeReversal: selectedTimeReversal } = tensorConfig;
  const [activePolarimetryTab, setActivePolarimetryTab] = useState<'anisotropy' | 'polarizer' | 'analyzer'>('anisotropy');
  const [mobilePlotVariant, setMobilePlotVariant] = useState<'primary' | 'secondary'>('primary');

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

  return (
    <div className="md:sticky md:top-20 self-start z-10 space-y-6">
      <div className="text-[10px] uppercase tracking-[0.2em] opacity-50 flex items-center gap-2">
        <Activity className="w-3 h-3" />
        SHG Intensity Polarimetry
        <TermInfo id="shg-polarimetry" onNavigate={onNavigate} />
      </div>

      <div className="bg-white/50 border border-ink overflow-hidden">
        {/* Tab Menu */}
        <div className="flex overflow-x-auto border-b border-ink border-opacity-20 bg-white/30 hide-scrollbar">
          <div className="flex items-center">
            <button
              onClick={() => setActivePolarimetryTab('anisotropy')}
              className={`px-4 md:px-6 py-4 text-xs font-medium uppercase tracking-wider whitespace-nowrap transition-colors ${activePolarimetryTab === 'anisotropy' ? 'bg-ink text-paper' : 'hover:bg-ink/5 text-ink/70'}`}
            >
              <span className="md:hidden">Aniso</span>
              <span className="hidden md:inline">Anisotropy</span>
            </button>
            <span className="px-1"><TermInfo id="anisotropy-config" onNavigate={onNavigate} /></span>
          </div>
          <div className="flex items-center border-l border-ink border-opacity-10">
            <button
              onClick={() => setActivePolarimetryTab('polarizer')}
              className={`px-4 md:px-6 py-4 text-xs font-medium uppercase tracking-wider whitespace-nowrap transition-colors ${activePolarimetryTab === 'polarizer' ? 'bg-ink text-paper' : 'hover:bg-ink/5 text-ink/70'}`}
            >
              <span className="md:hidden">Pol</span>
              <span className="hidden md:inline">Polarizer</span>
            </button>
            <span className="px-1"><TermInfo id="polarizer-config" onNavigate={onNavigate} /></span>
          </div>
          <div className="flex items-center border-l border-ink border-opacity-10">
            <button
              onClick={() => setActivePolarimetryTab('analyzer')}
              className={`px-4 md:px-6 py-4 text-xs font-medium uppercase tracking-wider whitespace-nowrap transition-colors ${activePolarimetryTab === 'analyzer' ? 'bg-ink text-paper' : 'hover:bg-ink/5 text-ink/70'}`}
            >
              <span className="md:hidden">Ana</span>
              <span className="hidden md:inline">Analyzer</span>
            </button>
            <span className="px-1"><TermInfo id="analyzer-config" onNavigate={onNavigate} /></span>
          </div>
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
  );
}
