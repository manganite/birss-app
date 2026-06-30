import type { Dispatch, SetStateAction } from 'react';
import type { TensorType, TensorTimeReversal } from './services/tensorCalculator';

export const TENSOR_META = {
  ED: { label: 'Electric Dipole', rank: '3', type: 'POLAR' },
  MD: { label: 'Magnetic Dipole', rank: '3', type: 'AXIAL' },
  EQ: { label: 'Electric Quadrupole', rank: '4', type: 'POLAR' },
} as const satisfies Record<TensorType, { label: string; rank: string; type: string }>;

export interface TensorConfig {
  type: TensorType;
  setType: (t: TensorType) => void;
  timeReversal: TensorTimeReversal;
  setTimeReversal: (t: TensorTimeReversal) => void;
  setting: number;
  setSetting: (s: number) => void;
}

export interface OrientationState {
  thetaX: number; setThetaX: (v: number) => void;
  thetaY: number; setThetaY: (v: number) => void;
  psi0: number; setPsi0: (v: number) => void;
  phiX: number; setPhiX: (v: number) => void;
  phiY: number; setPhiY: (v: number) => void;
  psi: number; setPsi: (v: number) => void;
}

export interface PresetAnglesState {
  thetaX: number; setThetaX: (v: number) => void;
  thetaY: number; setThetaY: (v: number) => void;
  psi0: number; setPsi0: (v: number) => void;
}

export interface SimulationState {
  amplitudes: Record<string, number>;
  setAmplitudes: Dispatch<SetStateAction<Record<string, number>>>;
  phases: Record<string, number>;
  setPhases: Dispatch<SetStateAction<Record<string, number>>>;
}
