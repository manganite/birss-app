import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { Box, Hexagon, Triangle, Layers } from 'lucide-react';

export const getCrystalIcon = (system: string) => {
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

export interface KPreset {
  label: string;
  math: string;
  tx: number;
  ty: number;
}

const PRINCIPAL_PRESETS: KPreset[] = [
  { label: '[001]', math: 'k \\parallel [001]', tx: 0, ty: 0 },
  { label: '[100]', math: 'k \\parallel [100]', tx: 0, ty: -90 },
  { label: '[010]', math: 'k \\parallel [010]', tx: 90, ty: 0 },
];

const PRESET_110: KPreset = { label: '[110]', math: 'k \\parallel [110]', tx: 90, ty: -45 };
const PRESET_111: KPreset = { label: '[111]', math: 'k \\parallel [111]', tx: 45, ty: -(Math.atan(1 / Math.SQRT2) * 180 / Math.PI) };

const PRESETS_BY_SYSTEM: Record<string, KPreset[]> = {
  Cubic: [...PRINCIPAL_PRESETS, PRESET_110, PRESET_111],
  Tetragonal: [...PRINCIPAL_PRESETS, PRESET_110],
  Orthorhombic: PRINCIPAL_PRESETS,
  Hexagonal: PRINCIPAL_PRESETS,
  Trigonal: PRINCIPAL_PRESETS,
  Monoclinic: PRINCIPAL_PRESETS,
  Triclinic: PRINCIPAL_PRESETS,
};

export function getPresetsForSystem(crystalSystem: string): KPreset[] {
  return PRESETS_BY_SYSTEM[crystalSystem] ?? PRINCIPAL_PRESETS;
}

export const LabFrameOrientation = ({ labFrame }: { labFrame: { X: string; Y: string; Z: string } }) => (
  <div className="flex-1 bg-ink/5 p-4 border border-ink/10 rounded-sm w-full">
    <h4 className="text-[10px] uppercase tracking-[0.2em] opacity-50 mb-3">Crystal Orientation in Lab Frame</h4>
    <div className="flex flex-col gap-3 text-sm font-mono">
      <div className="flex flex-wrap gap-x-6 gap-y-2">
        <InlineMath math={`\\mathbf{x}_{crys} = ${labFrame.X}`} />
        <InlineMath math={`\\mathbf{y}_{crys} = ${labFrame.Y}`} />
        <InlineMath math={`\\mathbf{z}_{crys} = ${labFrame.Z}`} />
      </div>
    </div>
  </div>
);

export const TensorTerm = ({ term, isNull }: { term?: string; isNull: boolean }) => {
  if (!term) return null;
  
  return (
    <span className={isNull ? 'opacity-30' : 'text-ink'}>
      <InlineMath math={term} />
    </span>
  );
};

export const FormatPointGroup = ({ name }: { name: string }) => {
  const latex = name.replace(/-([1-6])/g, '\\bar{$1}');
  return <InlineMath math={latex} />;
};

export const SymmetryOperation = ({ symbol }: { symbol: string }) => {
  const match = symbol.match(/^(-?\d|m)(?:_([a-z\[\]0-9-°]+))?([⁺⁻])?(')?$/);
  if (!match) return <span className="inline-flex items-center text-xs bg-white/50 px-2 py-1 border border-ink border-opacity-10 rounded-sm"><InlineMath math={symbol} /></span>;
  
  const [, base, axis, sign, prime] = match;
  
  let latex = '';
  
  if (base.startsWith('-')) {
    latex += `\\bar{${base.slice(1)}}`;
  } else {
    latex += base;
  }
  
  if (axis) {
    let cleanAxis = axis.replace('°', '^\\circ');
    latex += `_{${cleanAxis}}`;
  }
  
  let sup = '';
  if (sign === '⁺') sup += '+';
  if (sign === '⁻') sup += '-';
  if (prime) sup += '\\prime';
  
  if (sup) {
    latex += `^{${sup}}`;
  }
  
  return (
    <span className="inline-flex items-center text-xs bg-white/50 px-2 py-1 border border-ink border-opacity-10 rounded-sm">
      <InlineMath math={latex} />
    </span>
  );
};
