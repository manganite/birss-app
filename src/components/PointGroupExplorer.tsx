import { useState, useMemo } from 'react';
import { POINT_GROUPS, PointGroupData } from '../data/pointGroups';
import { FormatPointGroup, getCrystalIcon, AxisOrientationInfo } from './MathComponents';
import { OperationsModal } from './OperationsModal';
import { AnimatePresence } from 'motion/react';

const CRYSTAL_SYSTEMS = [
  "Triclinic",
  "Monoclinic",
  "Orthorhombic",
  "Tetragonal",
  "Trigonal",
  "Hexagonal",
  "Cubic"
];

interface PointGroupExplorerProps {
  onSelectGroupForCalculator?: (group: PointGroupData) => void;
  onSelectGroupForSimulator?: (group: PointGroupData) => void;
}

export const PointGroupExplorer = ({ onSelectGroupForCalculator, onSelectGroupForSimulator }: PointGroupExplorerProps) => {
  const [selectedGroup, setSelectedGroup] = useState<PointGroupData | null>(null);
  const [activeSystem, setActiveSystem] = useState(CRYSTAL_SYSTEMS[0]);

  const groupsBySystem = useMemo(() => {
    const grouped: Record<string, { I: PointGroupData[], II: PointGroupData[], III: PointGroupData[] }> = {};

    CRYSTAL_SYSTEMS.forEach(sys => {
      grouped[sys] = { I: [], II: [], III: [] };
    });

    POINT_GROUPS.forEach(group => {
      if (grouped[group.crystalSystem]) {
        grouped[group.crystalSystem][group.type].push(group);
      }
    });

    return grouped;
  }, []);

  const systemGroups = groupsBySystem[activeSystem];

  return (
    <div className="w-full">
      <div className="mb-12">
        <h1 className="text-4xl font-medium tracking-tight mb-4">Magnetic Point Groups</h1>
        <p className="text-lg opacity-70 max-w-3xl">
          Explore the 122 magnetic point groups categorized by crystal system and type.
          Click on any point group to view its symmetry operations.
        </p>
      </div>

      {/* Crystal system tab strip */}
      <div className="flex overflow-x-auto gap-1 mb-8 hide-scrollbar">
        {CRYSTAL_SYSTEMS.map(system => (
          <button
            key={system}
            onClick={() => setActiveSystem(system)}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs uppercase tracking-[0.15em] whitespace-nowrap border border-ink transition-all shrink-0 ${
              activeSystem === system
                ? 'bg-ink text-paper'
                : 'hover:bg-ink hover:text-paper opacity-50 hover:opacity-100 border-opacity-20'
            }`}
          >
            {getCrystalIcon(system)}
            {system}
          </button>
        ))}
      </div>

      {/* Active system content */}
      <div className="border border-ink">
        <div className="bg-ink text-paper p-4 flex items-center gap-3">
          {getCrystalIcon(activeSystem)}
          <h2 className="text-xl font-medium uppercase tracking-widest">{activeSystem}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-ink">
          {/* Column Headers */}
          <div className="hidden md:block p-4 border-b border-ink bg-white/30">
            <h3 className="text-xs uppercase tracking-[0.2em] font-bold">Type I (Ordinary)</h3>
            <p className="text-[10px] opacity-60 mt-1">{systemGroups.I.length} {systemGroups.I.length === 1 ? 'group' : 'groups'}</p>
          </div>
          <div className="hidden md:block p-4 border-b border-ink bg-white/30">
            <h3 className="text-xs uppercase tracking-[0.2em] font-bold">Type II (Gray)</h3>
            <p className="text-[10px] opacity-60 mt-1">{systemGroups.II.length} {systemGroups.II.length === 1 ? 'group' : 'groups'}</p>
          </div>
          <div className="hidden md:block p-4 border-b border-ink bg-white/30">
            <h3 className="text-xs uppercase tracking-[0.2em] font-bold">Type III (Black & White)</h3>
            <p className="text-[10px] opacity-60 mt-1">{systemGroups.III.length} {systemGroups.III.length === 1 ? 'group' : 'groups'}</p>
          </div>

          {/* Type I Column */}
          <div className="flex flex-col">
            <div className="md:hidden p-4 border-b border-ink bg-white/30">
              <h3 className="text-xs uppercase tracking-[0.2em] font-bold">Type I (Ordinary)</h3>
            </div>
            <div className="p-4 flex flex-wrap gap-2">
              {systemGroups.I.map(group => (
                <button
                  key={group.name}
                  onClick={() => setSelectedGroup(group)}
                  className="px-3 py-2 border border-ink hover:bg-ink hover:text-paper transition-colors text-lg min-w-[3rem]"
                >
                  <FormatPointGroup name={group.name} />
                </button>
              ))}
            </div>
          </div>

          {/* Type II Column */}
          <div className="flex flex-col">
            <div className="md:hidden p-4 border-b border-ink bg-white/30">
              <h3 className="text-xs uppercase tracking-[0.2em] font-bold">Type II (Gray)</h3>
            </div>
            <div className="p-4 flex flex-wrap gap-2">
              {systemGroups.II.map(group => (
                <button
                  key={group.name}
                  onClick={() => setSelectedGroup(group)}
                  className="px-3 py-2 border border-ink hover:bg-ink hover:text-paper transition-colors text-lg min-w-[3rem]"
                >
                  <FormatPointGroup name={group.name} />
                </button>
              ))}
            </div>
          </div>

          {/* Type III Column */}
          <div className="flex flex-col">
            <div className="md:hidden p-4 border-b border-ink bg-white/30">
              <h3 className="text-xs uppercase tracking-[0.2em] font-bold">Type III (Black & White)</h3>
            </div>
            <div className="p-4 flex flex-wrap gap-2">
              {systemGroups.III.map(group => (
                <button
                  key={group.name}
                  onClick={() => setSelectedGroup(group)}
                  className="px-3 py-2 border border-ink hover:bg-ink hover:text-paper transition-colors text-lg min-w-[3rem]"
                >
                  <FormatPointGroup name={group.name} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Crystal system reference panel */}
      <div className="mt-6">
        <AxisOrientationInfo crystalSystem={activeSystem} />
      </div>

      <AnimatePresence>
        {selectedGroup && (
          <OperationsModal
            group={selectedGroup}
            onClose={() => setSelectedGroup(null)}
            onOpenInCalculator={onSelectGroupForCalculator ? () => onSelectGroupForCalculator(selectedGroup) : undefined}
            onOpenInSimulator={onSelectGroupForSimulator ? () => onSelectGroupForSimulator(selectedGroup) : undefined}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
