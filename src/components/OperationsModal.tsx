import { useRef } from 'react';
import { motion } from 'motion/react';
import { X, Calculator } from 'lucide-react';
import { getSymmetryOperations } from '../services/tensorCalculator';
import { FormatPointGroup, SymmetryOperation } from './MathComponents';
import { PointGroupData } from '../data/pointGroups';
import { useDialogA11y } from '../hooks/useDialogA11y';

interface OperationsModalProps {
  group: PointGroupData;
  onClose: () => void;
  onOpenInCalculator?: () => void;
}

export const OperationsModal = ({ group, onClose, onOpenInCalculator }: OperationsModalProps) => {
  const operations = getSymmetryOperations(group.name);
  const containerRef = useRef<HTMLDivElement>(null);
  useDialogA11y({ onClose, containerRef });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/80 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="operations-modal-title"
        tabIndex={-1}
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-paper w-full max-w-2xl border border-ink shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-ink shrink-0">
          <div className="flex items-center gap-4">
            <h2 id="operations-modal-title" className="text-xl font-medium tracking-tight">
              <FormatPointGroup name={group.name} />
            </h2>
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest opacity-60 hidden sm:flex">
              <span>{group.crystalSystem}</span>
              <span>•</span>
              <span>Type {group.type}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-2 hover:bg-ink/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          <h3 className="text-xs uppercase tracking-[0.2em] opacity-50 mb-4">Symmetry Operations ({operations.length})</h3>
          <div className="flex flex-wrap gap-2">
            {operations.map((op, idx) => (
              <SymmetryOperation key={idx} symbol={op} />
            ))}
          </div>
        </div>

        {onOpenInCalculator && (
          <div className="p-4 border-t border-ink bg-ink/5 flex justify-end shrink-0">
            <button
              onClick={() => {
                onOpenInCalculator();
                onClose();
              }}
              className="px-4 py-2 bg-ink text-paper text-sm uppercase tracking-widest hover:bg-transparent hover:text-ink border border-ink transition-colors flex items-center gap-2"
            >
              <Calculator className="w-4 h-4" />
              Open in Calculator
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
