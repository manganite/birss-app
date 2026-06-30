import { Activity } from 'lucide-react';
import { GroupIdentityHeader } from './MathComponents';
import { SimulatorSetupPanel } from './SimulatorSetupPanel';
import { TensorComponentControls } from './TensorComponentControls';
import { PolarimetrySection } from './PolarimetrySection';
import { SimulatorEquationPanel } from './SimulatorEquationPanel';
import { useSimulatorState } from '../hooks/useSimulatorState';
import type { PointGroupData } from '../data/pointGroups';
import type { TensorConfig, OrientationState, SimulationState } from '../types';

interface SimulatorPageProps {
  selectedGroup: PointGroupData | null;
  tensorConfig: TensorConfig;
  orientation: OrientationState;
  simulation: SimulationState;
  onNavigate?: (view: string, tab?: string) => void;
}

export function SimulatorPage({
  selectedGroup,
  tensorConfig,
  orientation,
  simulation,
  onNavigate,
}: SimulatorPageProps) {
  const { thetaX, thetaY, psi0, phiX, phiY, psi } = orientation;
  const { amplitudes, setAmplitudes, phases, setPhases } = simulation;
  const { type: selectedTensorType, timeReversal: selectedTimeReversal, setting: selectedSetting } = tensorConfig;

  const { labFrame, sourceTerms, sourceTermsExEy, expandedFormulas, independentComponents, simulationData } =
    useSimulatorState(selectedGroup, selectedTensorType, selectedTimeReversal, thetaX, thetaY, psi0, phiX, phiY, psi, selectedSetting, amplitudes, setAmplitudes, phases, setPhases);

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
      <div className="hidden md:block">
        <GroupIdentityHeader group={selectedGroup} setting={selectedSetting} onNavigate={onNavigate} />
      </div>

      <SimulatorSetupPanel
        selectedGroup={selectedGroup}
        tensorConfig={tensorConfig}
        orientation={orientation}
        labFrame={labFrame}
        onNavigate={onNavigate}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 order-last lg:order-first">
          <TensorComponentControls
            selectedGroup={selectedGroup}
            tensorConfig={tensorConfig}
            simulation={simulation}
            independentComponents={independentComponents}
            onNavigate={onNavigate}
          />
        </div>
        <div className="lg:col-span-8">
          <PolarimetrySection
            selectedGroup={selectedGroup}
            tensorConfig={tensorConfig}
            independentComponents={independentComponents}
            simulationData={simulationData}
            onNavigate={onNavigate}
          />
        </div>
      </div>

      <SimulatorEquationPanel
        sourceTerms={sourceTerms}
        sourceTermsExEy={sourceTermsExEy}
        expandedFormulas={expandedFormulas}
      />
    </div>
  );
}
