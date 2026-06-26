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

export const K_ORIENTATION_PRESETS = [
  { label: 'k || z', math: 'k \\parallel z', tx: 0, ty: 0 },
  { label: 'k || x', math: 'k \\parallel x', tx: 0, ty: -90 },
  { label: 'k || y', math: 'k \\parallel y', tx: 90, ty: 0 },
];

export const LabFrameOrientation = ({ labFrame }: { labFrame: { X: string; Y: string; Z: string } }) => (
  <div className="flex-1 bg-[#141414]/5 p-4 border border-[#141414]/10 rounded-sm w-full">
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
    <span className={isNull ? 'opacity-30' : 'text-[#141414]'}>
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
  if (!match) return <span className="inline-flex items-center text-xs bg-white/50 px-2 py-1 border border-[#141414] border-opacity-10 rounded-sm"><InlineMath math={symbol} /></span>;
  
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
    <span className="inline-flex items-center text-xs bg-white/50 px-2 py-1 border border-[#141414] border-opacity-10 rounded-sm">
      <InlineMath math={latex} />
    </span>
  );
};
