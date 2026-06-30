import { useState } from 'react';
import { Info } from 'lucide-react';
import { GLOSSARY_TERMS } from '../data/glossary';

interface TermInfoProps {
  id: string;
  onNavigate?: (view: string, tab?: string) => void;
}

export function TermInfo({ id, onNavigate }: TermInfoProps) {
  const [open, setOpen] = useState(false);
  const term = GLOSSARY_TERMS.find(t => t.id === id);
  if (!term) return null;

  return (
    <span className="relative inline-flex items-center">
      <button
        type="button"
        aria-expanded={open}
        aria-label={`About: ${term.term}`}
        onClick={(e) => { e.stopPropagation(); setOpen(v => !v); }}
        className="opacity-40 hover:opacity-80 transition-opacity leading-none"
      >
        <Info className="w-3 h-3" />
      </button>
      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          />
          <div className="absolute top-5 left-0 z-20 w-56 bg-paper border border-ink/20 shadow-md p-3 space-y-2 text-left">
            <p className="text-[11px] font-semibold opacity-80">{term.term}</p>
            <p className="text-[11px] opacity-60 leading-relaxed">{term.brief}</p>
            {term.helpTab && onNavigate && (
              <button
                type="button"
                onClick={() => { onNavigate('help', term.helpTab); setOpen(false); }}
                className="text-[10px] uppercase tracking-wider opacity-50 hover:opacity-100 transition-opacity"
              >
                Learn more →
              </button>
            )}
          </div>
        </>
      )}
    </span>
  );
}
