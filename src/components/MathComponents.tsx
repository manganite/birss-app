import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';

export const TensorTerm = ({ term, isNull }: { term?: string; isNull: boolean; key?: any }) => {
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

export const SymmetryOperation = ({ symbol }: { symbol: string; key?: any }) => {
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
