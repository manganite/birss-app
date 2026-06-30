import { useState } from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { Box, Hexagon, Triangle, Layers, Compass, Info, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { hklToPresetAngles } from '../services/orientation';
import { isCentrosymmetric, getParentGroup, getHalvingSubgroup, getSHGConsequence, getAlternateSettings } from '../services/tensorCalculator';
import { PointGroupData } from '../data/pointGroups';

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
  psi0: number;
}

function makePreset(label: string, h: number, k: number, l: number): KPreset {
  const o = hklToPresetAngles(h, k, l)!;
  return { label, math: `k \\parallel ${label}`, tx: o.tx, ty: o.ty, psi0: o.psi0 };
}

const PRESET_Y = makePreset('[010]', 0, 1, 0);

const ORTHO_PRESETS: KPreset[] = [
  makePreset('[100]', 1, 0, 0),
  makePreset('[010]', 0, 1, 0),
  makePreset('[001]', 0, 0, 1),
];

const HEX_TRIG_PRESETS: KPreset[] = [
  makePreset('[001]', 0, 0, 1),
  makePreset('[100]', 1, 0, 0),
  { label: '[120]', math: 'k \\parallel [120]', tx: PRESET_Y.tx, ty: PRESET_Y.ty, psi0: PRESET_Y.psi0 },
];

const MONO_TRI_PRESETS: KPreset[] = [
  makePreset('[001]', 0, 0, 1),
  makePreset('[100]', 1, 0, 0),
  { label: '[010] ∥ b*', math: 'k \\parallel [010] \\parallel b^*', tx: PRESET_Y.tx, ty: PRESET_Y.ty, psi0: PRESET_Y.psi0 },
];

const PRESETS_BY_SYSTEM: Record<string, KPreset[]> = {
  Cubic: [makePreset('[100]', 1, 0, 0), makePreset('[111]', 1, 1, 1), makePreset('[110]', 1, 1, 0)],
  Tetragonal: [makePreset('[001]', 0, 0, 1), makePreset('[100]', 1, 0, 0), makePreset('[110]', 1, 1, 0)],
  Orthorhombic: ORTHO_PRESETS,
  Hexagonal: HEX_TRIG_PRESETS,
  Trigonal: HEX_TRIG_PRESETS,
  Monoclinic: MONO_TRI_PRESETS,
  Triclinic: MONO_TRI_PRESETS,
};

export function getPresetsForSystem(crystalSystem: string): KPreset[] {
  return PRESETS_BY_SYSTEM[crystalSystem] ?? ORTHO_PRESETS;
}

export function LabFrameOrientation({ labFrame }: { labFrame: { X: string; Y: string; Z: string; inverse: { X: string; Y: string; Z: string } } }) {
  const [showInverse, setShowInverse] = useState(false);
  const [showLegend, setShowLegend] = useState(false);
  const fwd = labFrame;
  const inv = labFrame.inverse;

  return (
    <div className="flex-1 bg-ink/5 p-4 border border-ink/10 rounded-sm w-full">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-[10px] uppercase tracking-[0.2em] opacity-50">
          {showInverse ? 'Lab axes in the crystal frame' : 'Crystal axes in the lab frame'}
        </h4>
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => setShowInverse(v => !v)}
            className="text-[9px] opacity-40 hover:opacity-80 transition-opacity px-1.5 py-0.5 border border-ink/10 rounded-sm"
            title={showInverse ? 'Show crystal → lab' : 'Show lab → crystal'}
          >{showInverse ? '↔ crystal' : '↔ inverse'}</button>
          <button type="button" onClick={() => setShowLegend(v => !v)}
            className="opacity-40 hover:opacity-80 transition-opacity p-0.5"
            title="Symbol legend"
          ><Info className="w-3 h-3" /></button>
        </div>
      </div>
      <div className="flex flex-col gap-3 text-sm font-mono">
        {showInverse ? (
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <InlineMath math={`\\mathbf{X}_{LAB} = ${inv.X}`} />
            <InlineMath math={`\\mathbf{Y}_{LAB} = ${inv.Y}`} />
            <InlineMath math={`\\mathbf{Z}_{LAB} = ${inv.Z}`} />
          </div>
        ) : (
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <InlineMath math={`\\mathbf{x}_{crys} = ${fwd.X}`} />
            <InlineMath math={`\\mathbf{y}_{crys} = ${fwd.Y}`} />
            <InlineMath math={`\\mathbf{z}_{crys} = ${fwd.Z}`} />
          </div>
        )}
      </div>
      {showLegend && (
        <div className="mt-3 pt-3 border-t border-ink/10 text-[10px] opacity-60 leading-relaxed space-y-1">
          <p><strong>x, y, z</strong> (crys) — crystal Cartesian axes (z∥c, y∥b*, x per system convention)</p>
          <p><strong>X, Y, Z</strong> (LAB) — lab axes: Z = beam direction (k), X/Y = polarization plane (0°/90°)</p>
          <p>At zero tilt, the selected crystal cut normal is aligned with Z (the beam).</p>
        </div>
      )}
    </div>
  );
}

interface KDirectionSelectorProps {
  crystalSystem: string;
  thetaX: number; thetaY: number; psi0: number;
  setThetaX: (v: number) => void;
  setThetaY: (v: number) => void;
  setPsi0: (v: number) => void;
  labFrame: { X: string; Y: string; Z: string; inverse: { X: string; Y: string; Z: string } };
  compact?: boolean;
}

export function KDirectionSelector({ crystalSystem, thetaX, thetaY, psi0, setThetaX, setThetaY, setPsi0, labFrame, compact }: KDirectionSelectorProps) {
  const presets = getPresetsForSystem(crystalSystem);
  return (
    <div className="space-y-3">
      {!compact && (
        <h4 className="text-[10px] uppercase tracking-[0.2em] opacity-50 flex items-center gap-2">
          <Compass className="w-3 h-3" />
          Crystal Cut (surface normal ∥ k)
        </h4>
      )}
      {compact && (
        <span className="text-[10px] uppercase tracking-[0.2em] opacity-50 flex items-center gap-1">
          <Compass className="w-3 h-3" />
          Crystal Cut
        </span>
      )}
      <div className="flex flex-wrap gap-3 items-center">
        {presets.map((ori) => (
          <button
            key={ori.label}
            onClick={() => { setThetaX(ori.tx); setThetaY(ori.ty); setPsi0(ori.psi0); }}
            className={`${compact ? 'px-3 py-1.5 text-[11px]' : 'px-4 py-2 text-[12px]'} tracking-[0.1em] transition-all border border-ink ${
              thetaX === ori.tx && thetaY === ori.ty && psi0 === ori.psi0
                ? 'bg-ink text-paper'
                : `${compact ? '' : 'hover:bg-ink hover:text-paper'} opacity-50 ${compact ? '' : 'hover:opacity-100'} border-opacity-20`
            }`}
          >
            <InlineMath math={ori.math} />
          </button>
        ))}
      </div>
      {!compact && (
        <div className="flex flex-col md:flex-row gap-8 items-start mt-3">
          <LabFrameOrientation labFrame={labFrame} />
        </div>
      )}
    </div>
  );
}

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

export function AxisOrientationInfo({ crystalSystem }: { crystalSystem: string }) {
  let content = null;
  switch (crystalSystem) {
    case 'Triclinic':
      content = (
        <>
          <span className="font-mono font-medium">z</span> ∥ <InlineMath math="c" /><br/>
          <span className="font-mono font-medium">y</span> ∥ (<InlineMath math="c \times a" />) (∥ <InlineMath math="b^*" />)<br/>
          <span className="font-mono font-medium">x</span> = <InlineMath math="y \times z" /> (projection of <InlineMath math="a" /> onto plane ⊥ <InlineMath math="c" />)
        </>
      );
      break;
    case 'Monoclinic':
      content = (
        <>
          <span className="font-mono font-medium">z</span> ∥ <InlineMath math="c" /> (unique axis: ∥ 2-fold or ⊥ mirror)<br/>
          <span className="font-mono font-medium">x</span> ∥ <InlineMath math="a" /><br/>
          <span className="font-mono font-medium">y</span> ∥ <InlineMath math="b^*" /> (completing the right-handed frame)<br/>
          <span className="block mt-2 opacity-80">
            Every monoclinic group below has two <strong>settings</strong> — not two
            different groups, but two conventions for the same one: <em>First</em>{' '}
            (<InlineMath math="c" />-unique, Birss, shown above) and <em>Second</em>{' '}
            (<InlineMath math="b" />-unique, ITC). Pick whichever matches the
            convention your crystal data was published in.
          </span>
        </>
      );
      break;
    case 'Orthorhombic':
    case 'Tetragonal':
    case 'Cubic':
      content = (
        <>
          <span className="font-mono font-medium">x</span> ∥ <InlineMath math="[100]" />, <span className="font-mono font-medium">y</span> ∥ <InlineMath math="[010]" />, <span className="font-mono font-medium">z</span> ∥ <InlineMath math="[001]" />
        </>
      );
      break;
    case 'Trigonal':
    case 'Hexagonal':
      content = (
        <>
          <span className="font-mono font-medium">z</span> ∥ <InlineMath math="[001]" /> / <InlineMath math="[0001]" /> (c-axis)<br/>
          <span className="font-mono font-medium">x</span> ∥ <InlineMath math="[100]" /> / <InlineMath math="[2\bar{1}\bar{1}0]" /> (a-axis)<br/>
          <span className="font-mono font-medium">y</span> ∥ <InlineMath math="[120]" /> / <InlineMath math="[01\bar{1}0]" />
        </>
      );
      break;
  }

  if (!content) return null;

  return (
    <div className="p-4 border border-ink border-opacity-10 space-y-2 bg-ink/5">
      <p className="text-[10px] uppercase tracking-widest opacity-50 flex items-center gap-1.5">
        <Compass className="w-3 h-3" />
        Axis Orientation
      </p>
      <p className="text-xs leading-relaxed opacity-70">
        {content}
      </p>
    </div>
  );
}

interface GroupIdentityHeaderProps {
  group: PointGroupData;
  setting: number;
  onNavigate?: (view: string) => void;
}

export function GroupIdentityHeader({ group, setting, onNavigate }: GroupIdentityHeaderProps) {
  const [expanded, setExpanded] = useState(false);
  const centro = isCentrosymmetric(group.name);
  const parent = getParentGroup(group.name);
  const halvingOps = getHalvingSubgroup(group.name);
  const shgLine = getSHGConsequence(group.name);
  const settings = getAlternateSettings(group.name);
  const settingCount = settings ? settings.length + 1 : 1;

  const panelId = `group-identity-panel-${group.name.replace(/[^a-zA-Z0-9]/g, '')}`;

  return (
    <div className="space-y-0">
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls={panelId}
        onClick={() => setExpanded(prev => !prev)}
        className="flex items-center justify-between w-full p-4 border border-ink border-opacity-10 bg-white/30"
      >
        <div className="flex items-center gap-3">
          {getCrystalIcon(group.crystalSystem)}
          <div className="text-left flex items-center flex-wrap gap-x-2 gap-y-1">
            <span className="text-lg font-serif italic"><FormatPointGroup name={group.name} /></span>
            {group.schoenflies && <span className="text-xs opacity-50">({group.schoenflies})</span>}
            <span className="text-xs opacity-50">{group.crystalSystem}</span>
            <span className="text-xs opacity-50">· Type {group.type}</span>
            <span className="text-xs opacity-50">· {centro ? 'Centrosymmetric' : 'Non-Centrosymmetric'}</span>
            {settingCount > 1 && (
              <span className="text-xs opacity-50">· Setting {setting}/{settingCount}</span>
            )}
          </div>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 opacity-50" /> : <ChevronDown className="w-4 h-4 opacity-50" />}
      </button>

      {expanded && (
        <section id={panelId} className="border border-ink border-opacity-10 border-t-0 p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <h2 className="text-4xl font-serif italic"><FormatPointGroup name={group.name} /></h2>
              {group.schoenflies && (
                <p className="text-sm opacity-60 mt-1">{group.schoenflies}</p>
              )}
              <p className="text-[10px] uppercase tracking-widest opacity-50 mt-1">
                {group.type === 'I' ? 'Standard' : group.type === 'II' ? 'Gray' : 'Magnetic'} Point Group
              </p>
            </div>
            <div className="flex items-center gap-3 p-4 border border-ink border-opacity-10">
              {getCrystalIcon(group.crystalSystem)}
              <div>
                <p className="text-sm font-medium">{group.crystalSystem}</p>
                <p className="text-[10px] uppercase tracking-widest opacity-50">Crystal System</p>
              </div>
            </div>
            <div className={`p-4 border border-ink ${centro ? 'bg-ink text-paper' : 'border-opacity-10'}`}>
              <p className="text-sm font-medium">{centro ? 'Centrosymmetric' : 'Non-Centrosymmetric'}</p>
              <p className={`text-[10px] uppercase tracking-widest ${centro ? 'opacity-70' : 'opacity-50'}`}>Symmetry Type</p>
            </div>
            <AxisOrientationInfo crystalSystem={group.crystalSystem} />
          </div>

          <div className="text-xs opacity-60 leading-relaxed">{shgLine}</div>

          {parent && (
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs opacity-60">
              <span>Parent group: <span className="font-serif italic"><FormatPointGroup name={parent} /></span></span>
              {halvingOps && (
                <span>H = {'{'}{halvingOps.join(', ')}{'}'}</span>
              )}
            </div>
          )}

          {onNavigate && (
            <button
              type="button"
              onClick={() => onNavigate('explorer')}
              className="flex items-center gap-1 text-xs opacity-50 hover:opacity-100 transition-opacity"
            >
              <ExternalLink className="w-3 h-3" />
              Open in Explorer
            </button>
          )}
        </section>
      )}
    </div>
  );
}
