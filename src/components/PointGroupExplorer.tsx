import { useState, useMemo } from 'react';
import { Box, Hexagon, Triangle, Layers } from 'lucide-react';
import { POINT_GROUPS, PointGroupData } from '../data/pointGroups';
import { FormatPointGroup } from './MathComponents';
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
}

export const PointGroupExplorer = ({ onSelectGroupForCalculator }: PointGroupExplorerProps) => {
  const [selectedGroup, setSelectedGroup] = useState<PointGroupData | null>(null);

  const getCrystalIcon = (system: string) => {
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

  return (
    <div className="w-full">
      <div className="mb-12">
        <h1 className="text-4xl font-medium tracking-tight mb-4">Magnetic Point Groups</h1>
        <p className="text-lg opacity-70 max-w-3xl">
          Explore the 122 magnetic point groups categorized by crystal system and type. 
          Click on any point group to view its symmetry operations.
        </p>
      </div>

      <div className="space-y-16">
        {CRYSTAL_SYSTEMS.map(system => {
          const systemGroups = groupsBySystem[system];
          // Determine the max number of rows needed for this crystal system
          const maxRows = Math.max(
            systemGroups.I.length,
            systemGroups.II.length,
            systemGroups.III.length
          );

          if (maxRows === 0) return null;

          return (
            <div key={system} className="border border-[#141414]">
              <div className="bg-[#141414] text-[#E4E3E0] p-4 flex items-center gap-3">
                {getCrystalIcon(system)}
                <h2 className="text-xl font-medium uppercase tracking-widest">{system}</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#141414]">
                {/* Column Headers */}
                <div className="hidden md:block p-4 border-b border-[#141414] bg-white/30">
                  <h3 className="text-xs uppercase tracking-[0.2em] font-bold">Type I (Ordinary)</h3>
                  <p className="text-[10px] opacity-60 mt-1">32 crystallographic point groups</p>
                </div>
                <div className="hidden md:block p-4 border-b border-[#141414] bg-white/30">
                  <h3 className="text-xs uppercase tracking-[0.2em] font-bold">Type II (Gray)</h3>
                  <p className="text-[10px] opacity-60 mt-1">32 groups with time-reversal</p>
                </div>
                <div className="hidden md:block p-4 border-b border-[#141414] bg-white/30">
                  <h3 className="text-xs uppercase tracking-[0.2em] font-bold">Type III (Black & White)</h3>
                  <p className="text-[10px] opacity-60 mt-1">58 magnetic point groups</p>
                </div>

                {/* Mobile headers are rendered inline if needed, but for simplicity we'll just stack them with labels on mobile */}
                
                {/* Type I Column */}
                <div className="flex flex-col">
                  <div className="md:hidden p-4 border-b border-[#141414] bg-white/30">
                    <h3 className="text-xs uppercase tracking-[0.2em] font-bold">Type I (Ordinary)</h3>
                  </div>
                  <div className="p-4 flex flex-wrap gap-2">
                    {systemGroups.I.map(group => (
                      <button
                        key={group.name}
                        onClick={() => setSelectedGroup(group)}
                        className="px-3 py-2 border border-[#141414] hover:bg-[#141414] hover:text-[#E4E3E0] transition-colors text-lg min-w-[3rem]"
                      >
                        <FormatPointGroup name={group.name} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Type II Column */}
                <div className="flex flex-col">
                  <div className="md:hidden p-4 border-b border-[#141414] bg-white/30">
                    <h3 className="text-xs uppercase tracking-[0.2em] font-bold">Type II (Gray)</h3>
                  </div>
                  <div className="p-4 flex flex-wrap gap-2">
                    {systemGroups.II.map(group => (
                      <button
                        key={group.name}
                        onClick={() => setSelectedGroup(group)}
                        className="px-3 py-2 border border-[#141414] hover:bg-[#141414] hover:text-[#E4E3E0] transition-colors text-lg min-w-[3rem]"
                      >
                        <FormatPointGroup name={group.name} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Type III Column */}
                <div className="flex flex-col">
                  <div className="md:hidden p-4 border-b border-[#141414] bg-white/30">
                    <h3 className="text-xs uppercase tracking-[0.2em] font-bold">Type III (Black & White)</h3>
                  </div>
                  <div className="p-4 flex flex-wrap gap-2">
                    {systemGroups.III.map(group => (
                      <button
                        key={group.name}
                        onClick={() => setSelectedGroup(group)}
                        className="px-3 py-2 border border-[#141414] hover:bg-[#141414] hover:text-[#E4E3E0] transition-colors text-lg min-w-[3rem]"
                      >
                        <FormatPointGroup name={group.name} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {selectedGroup && (
          <OperationsModal 
            group={selectedGroup} 
            onClose={() => setSelectedGroup(null)} 
            onOpenInCalculator={onSelectGroupForCalculator ? () => onSelectGroupForCalculator(selectedGroup) : undefined}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
