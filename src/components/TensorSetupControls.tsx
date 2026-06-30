import { Activity, Zap } from 'lucide-react';
import { getAlternateSettings, getFutureSettingCount } from '../services/tensorCalculator';
import type { TensorType, TensorTimeReversal } from '../services/tensorCalculator';
import { TENSOR_META } from '../types';
import { SectionHeader } from './MathComponents';
import { TermInfo } from './TermInfo';

interface NavigateProp {
  onNavigate?: (view: string, tab?: string) => void;
}

export function TensorClassificationControl({
  value,
  onChange,
  onNavigate,
}: {
  value: TensorType;
  onChange: (t: TensorType) => void;
} & NavigateProp) {
  return (
    <div className="flex-1 space-y-4">
      <SectionHeader icon={<Zap className="w-3 h-3" />}>Tensor Classification</SectionHeader>
      <div className="flex flex-wrap gap-2">
        {(['ED', 'MD', 'EQ'] as const).map((type) => (
          <div key={type} className="flex items-center gap-1">
            <button
              type="button"
              aria-pressed={value === type}
              onClick={() => onChange(type)}
              className={`px-4 py-2 text-xs font-medium transition-colors border border-ink ${
                value === type
                  ? 'bg-ink text-paper'
                  : 'hover:bg-ink/5 opacity-50 hover:opacity-100 border-opacity-20'
              }`}
            >
              {TENSOR_META[type].label}
            </button>
            <TermInfo id={type.toLowerCase()} onNavigate={onNavigate} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function TimeReversalControl({
  value,
  onChange,
  onNavigate,
}: {
  value: TensorTimeReversal;
  onChange: (tr: TensorTimeReversal) => void;
} & NavigateProp) {
  return (
    <div className="flex-1 space-y-4">
      <SectionHeader icon={<Activity className="w-3 h-3" />}>Time-Reversal Symmetry</SectionHeader>
      <div className="flex flex-wrap gap-2">
        {(['i', 'c'] as const).map((tr) => (
          <div key={tr} className="flex items-center gap-1">
            <button
              type="button"
              aria-pressed={value === tr}
              onClick={() => onChange(tr)}
              className={`px-4 py-2 text-xs font-medium transition-colors border border-ink ${
                value === tr
                  ? 'bg-ink text-paper'
                  : 'hover:bg-ink/5 opacity-50 hover:opacity-100 border-opacity-20'
              }`}
            >
              {tr === 'i' ? 'i-type (Time-Even)' : 'c-type (Time-Odd)'}
            </button>
            <TermInfo id={`${tr}-type`} onNavigate={onNavigate} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function CrystalSettingControl({
  groupName,
  crystalSystem,
  value,
  onChange,
  onNavigate,
  className = '',
}: {
  groupName: string;
  crystalSystem: string;
  value: number;
  onChange: (s: number) => void;
  className?: string;
} & NavigateProp) {
  const altSettings = getAlternateSettings(groupName);
  const futureCount = getFutureSettingCount(groupName);
  if (!altSettings && !futureCount) return null;
  return (
    <div className={`space-y-3${className ? ` ${className}` : ''}`}>
      <SectionHeader>
        Crystal Setting <TermInfo id="crystal-setting" onNavigate={onNavigate} />
      </SectionHeader>
      {altSettings ? (
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            aria-pressed={value === 1}
            onClick={() => onChange(1)}
            className={`px-4 py-2 text-[10px] uppercase tracking-[0.2em] transition-all border border-ink ${
              value === 1
                ? 'bg-ink text-paper'
                : 'hover:bg-ink hover:text-paper opacity-50 hover:opacity-100 border-opacity-20'
            }`}
          >
            {crystalSystem === 'Monoclinic' ? 'First (c-unique, Birss)' : 'Default'}
          </button>
          {altSettings.map((s, i) => (
            <button
              key={s.name}
              type="button"
              aria-pressed={value === i + 2}
              onClick={() => onChange(i + 2)}
              className={`px-4 py-2 text-[10px] uppercase tracking-[0.2em] transition-all border border-ink ${
                value === i + 2
                  ? 'bg-ink text-paper'
                  : 'hover:bg-ink hover:text-paper opacity-50 hover:opacity-100 border-opacity-20'
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>
      ) : (
        <p className="text-xs opacity-40 italic">{futureCount} settings — selection coming</p>
      )}
    </div>
  );
}
