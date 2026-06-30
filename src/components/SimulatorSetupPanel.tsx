import { useState } from 'react';
import { InlineMath } from 'react-katex';
import { ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';
import { FormatPointGroup, getPresetsForSystem, KDirectionSelector } from './MathComponents';
import { TensorClassificationControl, TimeReversalControl, CrystalSettingControl } from './TensorSetupControls';
import { TermInfo } from './TermInfo';
import type { PointGroupData } from '../data/pointGroups';
import type { TensorConfig, OrientationState } from '../types';
import type { useSimulatorState } from '../hooks/useSimulatorState';

interface SimulatorSetupPanelProps {
  selectedGroup: PointGroupData;
  tensorConfig: TensorConfig;
  orientation: OrientationState;
  labFrame: ReturnType<typeof useSimulatorState>['labFrame'];
  onNavigate?: (view: string, tab?: string) => void;
}

export function SimulatorSetupPanel({
  selectedGroup,
  tensorConfig,
  orientation,
  labFrame,
  onNavigate,
}: SimulatorSetupPanelProps) {
  const { type: selectedTensorType, setType: setSelectedTensorType, timeReversal: selectedTimeReversal, setTimeReversal: setSelectedTimeReversal, setting: selectedSetting, setSetting: setSelectedSetting } = tensorConfig;
  const { thetaX, setThetaX, thetaY, setThetaY, psi0, setPsi0, phiX, setPhiX, phiY, setPhiY, psi, setPsi } = orientation;
  const [mobileSetupExpanded, setMobileSetupExpanded] = useState(false);
  const [showRotation, setShowRotation] = useState(phiX !== 0 || phiY !== 0 || psi !== 0);

  const rotationActive = phiX !== 0 || phiY !== 0 || psi !== 0;
  const activePreset = getPresetsForSystem(selectedGroup.crystalSystem).find(p => p.tx === thetaX && p.ty === thetaY && p.psi0 === psi0);

  return (
    <div className="bg-white/50 border border-ink p-6 md:p-8 space-y-8">
      {/* Mobile compact summary */}
      <button
        type="button"
        aria-expanded={mobileSetupExpanded}
        aria-controls="simulator-setup-controls"
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
      <div id="simulator-setup-controls" className={mobileSetupExpanded ? '' : 'hidden md:block'}>
        <div className="flex flex-col md:flex-row gap-8">
          <TensorClassificationControl
            value={selectedTensorType}
            onChange={setSelectedTensorType}
            onNavigate={onNavigate}
          />
          <TimeReversalControl
            value={selectedTimeReversal}
            onChange={setSelectedTimeReversal}
            onNavigate={onNavigate}
          />
        </div>

        <CrystalSettingControl
          groupName={selectedGroup.name}
          crystalSystem={selectedGroup.crystalSystem}
          value={selectedSetting}
          onChange={setSelectedSetting}
          onNavigate={onNavigate}
          className="border-t border-ink border-opacity-10 pt-6 mt-8"
        />

        <div className="border-t border-ink border-opacity-10 pt-6 mt-8">
          <KDirectionSelector
            crystalSystem={selectedGroup.crystalSystem}
            thetaX={thetaX} thetaY={thetaY} psi0={psi0}
            setThetaX={setThetaX} setThetaY={setThetaY} setPsi0={setPsi0}
            labFrame={labFrame}
            onNavigate={onNavigate}
          />
        </div>
      </div>

      <div className="hidden md:block space-y-4 border-t border-ink border-opacity-10 pt-6">
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-expanded={showRotation}
            onClick={() => setShowRotation(!showRotation)}
            className="flex flex-1 items-center gap-2 text-[10px] uppercase tracking-[0.2em] opacity-50 hover:opacity-100 transition-opacity"
          >
            {showRotation ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            <span>Crystal Rotation</span>
            {rotationActive && !showRotation && (
              <span className="normal-case tracking-normal text-[11px] ml-2 opacity-70">
                ({phiX !== 0 ? `φ_x = ${phiX}°` : ''}{phiX !== 0 && (phiY !== 0 || psi !== 0) ? ', ' : ''}{phiY !== 0 ? `φ_y = ${phiY}°` : ''}{(phiX !== 0 || phiY !== 0) && psi !== 0 ? ', ' : ''}{psi !== 0 ? `ψ = ${psi}°` : ''})
              </span>
            )}
          </button>
          <TermInfo id="crystal-rotation" onNavigate={onNavigate} />
        </div>

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
  );
}
