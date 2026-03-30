import React, { useState, useMemo, useEffect } from 'react';
import { PointGroupData } from '../data/pointGroups';
import { TensorType, TensorTimeReversal } from '../services/tensorCalculator';
import { calculateSHGExpressions } from '../services/tensorCalculator';
import { InlineMath } from 'react-katex';
import { Zap, Compass, Sliders, Activity } from 'lucide-react';
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { TensorTerm } from './MathComponents';

interface SimulatorPageProps {
  selectedGroup: PointGroupData | null;
  selectedTensorType: TensorType;
  setSelectedTensorType: (t: TensorType) => void;
  selectedTimeReversal: TensorTimeReversal;
  setSelectedTimeReversal: (t: TensorTimeReversal) => void;
  thetaX: number;
  setThetaX: (t: number) => void;
  thetaY: number;
  setThetaY: (t: number) => void;
}

export function SimulatorPage({
  selectedGroup,
  selectedTensorType,
  setSelectedTensorType,
  selectedTimeReversal,
  setSelectedTimeReversal,
  thetaX,
  setThetaX,
  thetaY,
  setThetaY
}: SimulatorPageProps) {
  const [amplitudes, setAmplitudes] = useState<Record<string, number>>({});
  const [phases, setPhases] = useState<Record<string, number>>({});
  const [activePolarimetryTab, setActivePolarimetryTab] = useState<'anisotropy' | 'polarizer' | 'analyzer'>('anisotropy');

  const sourceTerms = useMemo(() => {
    if (!selectedGroup) return [];
    return calculateSHGExpressions(
      selectedGroup.name,
      selectedTensorType,
      selectedTimeReversal,
      thetaX,
      thetaY
    ).source;
  }, [selectedGroup, selectedTensorType, selectedTimeReversal, thetaX, thetaY]);

  // Extract unique independent tensor components from the raw polynomials
  const independentComponents = useMemo(() => {
    const components = new Set<string>();
    sourceTerms.forEach(term => {
      if ((term.component === 'S_X' || term.component === 'S_Y') && term.rawPoly) {
        for (const [chi, pairMap] of term.rawPoly.entries()) {
          let hasNonZero = false;
          for (const coeff of pairMap.values()) {
            if (Math.abs(coeff) > 1e-6) {
              hasNonZero = true;
              break;
            }
          }
          if (hasNonZero) {
            components.add(chi);
          }
        }
      }
    });
    return Array.from(components).sort();
  }, [sourceTerms]);

  // Initialize amplitudes and phases when components change
  useEffect(() => {
    setAmplitudes(prev => {
      const next = { ...prev };
      independentComponents.forEach(comp => {
        if (next[comp] === undefined) next[comp] = 1;
      });
      return next;
    });
    setPhases(prev => {
      const next = { ...prev };
      independentComponents.forEach(comp => {
        if (next[comp] === undefined) next[comp] = 0;
      });
      return next;
    });
  }, [independentComponents]);

  const simulationData = useMemo(() => {
    const data = [];
    let maxIntensity = 0;
    let maxParallel = 0;
    let maxCrossed = 0;
    let maxPolA0 = 0;
    let maxPolA90 = 0;
    let maxAnaP0 = 0;
    let maxAnaP90 = 0;

    const sXPoly = sourceTerms.find(t => t.component === 'S_X')?.rawPoly;
    const sYPoly = sourceTerms.find(t => t.component === 'S_Y')?.rawPoly;

    if (!sXPoly || !sYPoly) return { data: [], maxIntensity: 0, maxParallel: 0, maxCrossed: 0, maxPolA0: 0, maxPolA90: 0, maxAnaP0: 0, maxAnaP90: 0 };

    const evaluatePoly = (poly: Map<string, Map<string, number>>, Ex: number, Ey: number) => {
      let real = 0;
      let imag = 0;

      for (const [chi, pairMap] of poly.entries()) {
        const A = amplitudes[chi] ?? 1;
        const deltaDeg = phases[chi] ?? 0;
        const delta = (deltaDeg * Math.PI) / 180;
        
        const chiReal = A * Math.cos(delta);
        const chiImag = A * Math.sin(delta);

        let fieldFactor = 0;
        for (const [pair, coeff] of pairMap.entries()) {
          let E_val = 0;
          if (pair === '00') E_val = Ex * Ex;
          else if (pair === '11') E_val = Ey * Ey;
          else if (pair === '22') E_val = 0; // Ez = 0
          else if (pair === '01') E_val = Ex * Ey;
          else if (pair === '02') E_val = 0;
          else if (pair === '12') E_val = 0;
          
          fieldFactor += coeff * E_val;
        }

        real += chiReal * fieldFactor;
        imag += chiImag * fieldFactor;
      }
      return { real, imag };
    };

    const calcIntensity = (polRad: number, anaRad: number) => {
      const Ex = Math.cos(polRad);
      const Ey = Math.sin(polRad);
      const Sx = evaluatePoly(sXPoly, Ex, Ey);
      const Sy = evaluatePoly(sYPoly, Ex, Ey);

      const ax = Math.cos(anaRad);
      const ay = Math.sin(anaRad);
      const E_real = Sx.real * ax + Sy.real * ay;
      const E_imag = Sx.imag * ax + Sy.imag * ay;
      return E_real * E_real + E_imag * E_imag;
    };

    for (let angleDeg = 0; angleDeg < 360; angleDeg += 2) {
      const angleRad = (angleDeg * Math.PI) / 180;

      // 1. Anisotropy (angle = polarizer angle, analyzer = angle or angle + 90)
      // Note: original code used analyzerDeg as the angle, and polarizer was analyzerDeg or analyzerDeg - 90
      // Let's stick to the original logic for Anisotropy: angle = analyzer angle
      // Wait, original logic:
      // Parallel: polarizer = analyzerRad
      // Crossed: polarizer = analyzerRad - 90
      const I_par = calcIntensity(angleRad, angleRad);
      const I_perp = calcIntensity(angleRad - Math.PI / 2, angleRad);

      // 2. Polarizer (angle = polarizer angle, analyzer = 0 or 90)
      const I_pol_a0 = calcIntensity(angleRad, 0);
      const I_pol_a90 = calcIntensity(angleRad, Math.PI / 2);

      // 3. Analyzer (angle = analyzer angle, polarizer = 0 or 90)
      const I_ana_p0 = calcIntensity(0, angleRad);
      const I_ana_p90 = calcIntensity(Math.PI / 2, angleRad);

      maxIntensity = Math.max(maxIntensity, I_par, I_perp, I_pol_a0, I_pol_a90, I_ana_p0, I_ana_p90);
      maxParallel = Math.max(maxParallel, I_par);
      maxCrossed = Math.max(maxCrossed, I_perp);
      maxPolA0 = Math.max(maxPolA0, I_pol_a0);
      maxPolA90 = Math.max(maxPolA90, I_pol_a90);
      maxAnaP0 = Math.max(maxAnaP0, I_ana_p0);
      maxAnaP90 = Math.max(maxAnaP90, I_ana_p90);

      data.push({
        angle: angleDeg,
        parallel: I_par,
        crossed: I_perp,
        pol_a0: I_pol_a0,
        pol_a90: I_pol_a90,
        ana_p0: I_ana_p0,
        ana_p90: I_ana_p90
      });
    }

    return { data, maxIntensity, maxParallel, maxCrossed, maxPolA0, maxPolA90, maxAnaP0, maxAnaP90 };
  }, [sourceTerms, amplitudes, phases]);

  const formatPolarAngle = (val: number) => {
    if (val === 0) return '0° (X)';
    if (val === 90) return '90° (Y)';
    return `${val}°`;
  };

  if (!selectedGroup) {
    return (
      <div className="h-[50vh] flex flex-col items-center justify-center text-center space-y-8">
        <div className="w-24 h-24 border border-[#141414] border-dashed rounded-full flex items-center justify-center animate-spin-slow">
          <Activity className="w-8 h-8 opacity-20" />
        </div>
        <div className="space-y-2">
          <p className="text-xl font-serif italic opacity-40">Select a point group to begin simulation</p>
          <p className="text-[10px] uppercase tracking-[0.3em] opacity-30">Go to Explorer or use Search</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Top Controls */}
      <div className="bg-white/50 border border-[#141414] p-6 md:p-8 space-y-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1 space-y-4">
            <h4 className="text-[10px] uppercase tracking-[0.2em] opacity-50 flex items-center gap-2">
              <Zap className="w-3 h-3" /> Tensor Classification
            </h4>
            <div className="flex flex-wrap gap-2">
              {(['ED', 'MD', 'EQ'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedTensorType(type)}
                  className={`px-4 py-2 text-xs font-medium transition-colors border border-[#141414] ${
                    selectedTensorType === type 
                      ? 'bg-[#141414] text-[#E4E3E0]' 
                      : 'hover:bg-[#141414]/5 opacity-50 hover:opacity-100 border-opacity-20'
                  }`}
                >
                  {type === 'ED' ? 'Electric Dipole' : type === 'MD' ? 'Magnetic Dipole' : 'Electric Quadrupole'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 space-y-4">
            <h4 className="text-[10px] uppercase tracking-[0.2em] opacity-50 flex items-center gap-2">
              <Activity className="w-3 h-3" /> Time Reversal Symmetry
            </h4>
            <div className="flex flex-wrap gap-2">
              {(['i', 'c'] as const).map((tr) => (
                <button
                  key={tr}
                  onClick={() => setSelectedTimeReversal(tr)}
                  className={`px-4 py-2 text-xs font-medium transition-colors border border-[#141414] ${
                    selectedTimeReversal === tr 
                      ? 'bg-[#141414] text-[#E4E3E0]' 
                      : 'hover:bg-[#141414]/5 opacity-50 hover:opacity-100 border-opacity-20'
                  }`}
                >
                  {tr === 'i' ? 'i-type (Time-Even)' : 'c-type (Time-Odd)'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4 border-t border-[#141414] border-opacity-10 pt-6">
          <h4 className="text-[10px] uppercase tracking-[0.2em] opacity-50 flex items-center gap-2">
            <Compass className="w-3 h-3" /> Crystal Orientation (k vector)
          </h4>
          <div className="flex flex-wrap gap-3">
            {[
              { label: 'k || z', math: 'k \\parallel z', tx: 0, ty: 0 },
              { label: 'k || x', math: 'k \\parallel x', tx: 0, ty: -90 },
              { label: 'k || y', math: 'k \\parallel y', tx: 90, ty: 0 },
              { label: 'k || xy', math: 'k \\parallel xy', tx: 90, ty: -45 },
              { label: 'k || xz', math: 'k \\parallel xz', tx: 0, ty: -45 },
              { label: 'k || yz', math: 'k \\parallel yz', tx: 45, ty: 0 },
            ].map((ori) => (
              <button
                key={ori.label}
                onClick={() => {
                  setThetaX(ori.tx);
                  setThetaY(ori.ty);
                }}
                className={`px-4 py-2 text-[12px] tracking-[0.1em] transition-all border border-[#141414] ${
                  thetaX === ori.tx && thetaY === ori.ty
                    ? 'bg-[#141414] text-[#E4E3E0]' 
                    : 'hover:bg-[#141414] hover:text-[#E4E3E0] opacity-50 hover:opacity-100 border-opacity-20'
                }`}
              >
                <InlineMath math={ori.math} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Simulator Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Sliders */}
        <div className="lg:col-span-4 space-y-6">
          <div className="text-[10px] uppercase tracking-[0.2em] opacity-50 flex items-center gap-2">
            <Sliders className="w-3 h-3" />
            Independent Tensor Components
          </div>
          
          <div className="bg-white/50 border border-[#141414] p-6 space-y-8">
            {independentComponents.length === 0 ? (
              <div className="text-sm opacity-50 italic text-center py-8">
                No non-zero components for this configuration.
              </div>
            ) : (
              independentComponents.map(comp => (
                <div key={comp} className="space-y-4 border-b border-[#141414] border-opacity-10 pb-6 last:border-0 last:pb-0">
                  <div className="font-mono text-lg font-medium">
                    <TensorTerm term={comp} isNull={false} />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs opacity-60">
                      <span>Amplitude</span>
                      <span className="font-mono">{amplitudes[comp]?.toFixed(2) || '1.00'}</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" max="1" step="0.01"
                      value={amplitudes[comp] ?? 1}
                      onChange={(e) => setAmplitudes(p => ({ ...p, [comp]: parseFloat(e.target.value) }))}
                      className="w-full accent-[#141414]"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs opacity-60">
                      <span>Phase (deg)</span>
                      <span className="font-mono">{phases[comp] || 0}°</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" max="360" step="1"
                      value={phases[comp] ?? 0}
                      onChange={(e) => setPhases(p => ({ ...p, [comp]: parseInt(e.target.value) }))}
                      className="w-full accent-[#141414]"
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Polar Plots */}
        <div className="lg:col-span-8 space-y-6">
          <div className="text-[10px] uppercase tracking-[0.2em] opacity-50 flex items-center gap-2">
            <Activity className="w-3 h-3" />
            SHG Intensity Polarimetry
          </div>

          <div className="bg-white/50 border border-[#141414] overflow-hidden">
            {/* Tab Menu */}
            <div className="flex overflow-x-auto border-b border-[#141414] border-opacity-20 bg-white/30 hide-scrollbar">
              <button
                onClick={() => setActivePolarimetryTab('anisotropy')}
                className={`px-6 py-4 text-xs font-medium uppercase tracking-wider whitespace-nowrap transition-colors ${activePolarimetryTab === 'anisotropy' ? 'bg-[#141414] text-[#E4E3E0]' : 'hover:bg-[#141414]/5 text-[#141414]/70'}`}
              >
                Anisotropy
              </button>
              <button
                onClick={() => setActivePolarimetryTab('polarizer')}
                className={`px-6 py-4 text-xs font-medium uppercase tracking-wider whitespace-nowrap transition-colors border-l border-[#141414] border-opacity-10 ${activePolarimetryTab === 'polarizer' ? 'bg-[#141414] text-[#E4E3E0]' : 'hover:bg-[#141414]/5 text-[#141414]/70'}`}
              >
                Polarizer
              </button>
              <button
                onClick={() => setActivePolarimetryTab('analyzer')}
                className={`px-6 py-4 text-xs font-medium uppercase tracking-wider whitespace-nowrap transition-colors border-l border-[#141414] border-opacity-10 ${activePolarimetryTab === 'analyzer' ? 'bg-[#141414] text-[#E4E3E0]' : 'hover:bg-[#141414]/5 text-[#141414]/70'}`}
              >
                Analyzer
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-6 md:p-8 min-h-[400px]">
              {independentComponents.length === 0 ? (
                <div className="h-[400px] flex items-center justify-center text-sm opacity-50 italic">
                  Zero intensity
                </div>
              ) : (
                <div className="animate-in fade-in duration-300">
                  {activePolarimetryTab === 'anisotropy' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Parallel Plot */}
                      <div className="flex flex-col items-center space-y-4">
                        <h3 className="text-lg font-serif italic text-center">Parallel (<InlineMath math="I_{\parallel}" />)</h3>
                        <div className="text-[10px] uppercase tracking-widest opacity-50">Polarizer || Analyzer</div>
                        <div className="w-full aspect-square max-w-[350px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={simulationData.data}>
                              <PolarGrid gridType="circle" stroke="#141414" strokeOpacity={0.1} />
                              <PolarAngleAxis dataKey="angle" type="number" domain={[0, 360]} ticks={[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330] as any} tickFormatter={formatPolarAngle} stroke="#141414" strokeOpacity={0.5} tick={{ fontSize: 10 }} axisLineType="circle" />
                              <PolarRadiusAxis angle={90} domain={[0, Math.max(1e-6, simulationData.maxIntensity) / 0.95]} tick={false} axisLine={false} />
                              <Radar name="Parallel" dataKey="parallel" stroke="#141414" strokeWidth={2} fill="#141414" fillOpacity={0.1} isAnimationActive={false} />
                              <Tooltip 
                                formatter={(value: number) => value.toFixed(4)}
                                labelFormatter={(label) => `Analyzer Angle: ${label}°`}
                                contentStyle={{ backgroundColor: '#E4E3E0', border: '1px solid #141414', borderRadius: '0px' }}
                              />
                            </RadarChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="text-[10px] font-mono opacity-50">Max: {simulationData.maxParallel.toFixed(4)}</div>
                      </div>

                      {/* Crossed Plot */}
                      <div className="flex flex-col items-center space-y-4">
                        <h3 className="text-lg font-serif italic text-center">Crossed (<InlineMath math="I_{\perp}" />)</h3>
                        <div className="text-[10px] uppercase tracking-widest opacity-50">Polarizer ⊥ Analyzer</div>
                        <div className="w-full aspect-square max-w-[350px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={simulationData.data}>
                              <PolarGrid gridType="circle" stroke="#141414" strokeOpacity={0.1} />
                              <PolarAngleAxis dataKey="angle" type="number" domain={[0, 360]} ticks={[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330] as any} tickFormatter={formatPolarAngle} stroke="#141414" strokeOpacity={0.5} tick={{ fontSize: 10 }} axisLineType="circle" />
                              <PolarRadiusAxis angle={90} domain={[0, Math.max(1e-6, simulationData.maxIntensity) / 0.95]} tick={false} axisLine={false} />
                              <Radar name="Crossed" dataKey="crossed" stroke="#141414" strokeWidth={2} fill="#141414" fillOpacity={0.1} isAnimationActive={false} />
                              <Tooltip 
                                formatter={(value: number) => value.toFixed(4)}
                                labelFormatter={(label) => `Analyzer Angle: ${label}°`}
                                contentStyle={{ backgroundColor: '#E4E3E0', border: '1px solid #141414', borderRadius: '0px' }}
                              />
                            </RadarChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="text-[10px] font-mono opacity-50">Max: {simulationData.maxCrossed.toFixed(4)}</div>
                      </div>
                    </div>
                  )}

                  {activePolarimetryTab === 'polarizer' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Analyzer = 0 */}
                      <div className="flex flex-col items-center space-y-4">
                        <h3 className="text-lg font-serif italic text-center">Analyzer at 0°</h3>
                        <div className="text-[10px] uppercase tracking-widest opacity-50">Fixed Analyzer</div>
                        <div className="w-full aspect-square max-w-[350px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={simulationData.data}>
                              <PolarGrid gridType="circle" stroke="#141414" strokeOpacity={0.1} />
                              <PolarAngleAxis dataKey="angle" type="number" domain={[0, 360]} ticks={[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330] as any} tickFormatter={formatPolarAngle} stroke="#141414" strokeOpacity={0.5} tick={{ fontSize: 10 }} axisLineType="circle" />
                              <PolarRadiusAxis angle={90} domain={[0, Math.max(1e-6, simulationData.maxIntensity) / 0.95]} tick={false} axisLine={false} />
                              <Radar name="Analyzer 0°" dataKey="pol_a0" stroke="#141414" strokeWidth={2} fill="#141414" fillOpacity={0.1} isAnimationActive={false} />
                              <Tooltip 
                                formatter={(value: number) => value.toFixed(4)}
                                labelFormatter={(label) => `Polarizer Angle: ${label}°`}
                                contentStyle={{ backgroundColor: '#E4E3E0', border: '1px solid #141414', borderRadius: '0px' }}
                              />
                            </RadarChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="text-[10px] font-mono opacity-50">Max: {simulationData.maxPolA0.toFixed(4)}</div>
                      </div>

                      {/* Analyzer = 90 */}
                      <div className="flex flex-col items-center space-y-4">
                        <h3 className="text-lg font-serif italic text-center">Analyzer at 90°</h3>
                        <div className="text-[10px] uppercase tracking-widest opacity-50">Fixed Analyzer</div>
                        <div className="w-full aspect-square max-w-[350px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={simulationData.data}>
                              <PolarGrid gridType="circle" stroke="#141414" strokeOpacity={0.1} />
                              <PolarAngleAxis dataKey="angle" type="number" domain={[0, 360]} ticks={[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330] as any} tickFormatter={formatPolarAngle} stroke="#141414" strokeOpacity={0.5} tick={{ fontSize: 10 }} axisLineType="circle" />
                              <PolarRadiusAxis angle={90} domain={[0, Math.max(1e-6, simulationData.maxIntensity) / 0.95]} tick={false} axisLine={false} />
                              <Radar name="Analyzer 90°" dataKey="pol_a90" stroke="#141414" strokeWidth={2} fill="#141414" fillOpacity={0.1} isAnimationActive={false} />
                              <Tooltip 
                                formatter={(value: number) => value.toFixed(4)}
                                labelFormatter={(label) => `Polarizer Angle: ${label}°`}
                                contentStyle={{ backgroundColor: '#E4E3E0', border: '1px solid #141414', borderRadius: '0px' }}
                              />
                            </RadarChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="text-[10px] font-mono opacity-50">Max: {simulationData.maxPolA90.toFixed(4)}</div>
                      </div>
                    </div>
                  )}

                  {activePolarimetryTab === 'analyzer' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Polarizer = 0 */}
                      <div className="flex flex-col items-center space-y-4">
                        <h3 className="text-lg font-serif italic text-center">Polarizer at 0°</h3>
                        <div className="text-[10px] uppercase tracking-widest opacity-50">Fixed Polarizer</div>
                        <div className="w-full aspect-square max-w-[350px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={simulationData.data}>
                              <PolarGrid gridType="circle" stroke="#141414" strokeOpacity={0.1} />
                              <PolarAngleAxis dataKey="angle" type="number" domain={[0, 360]} ticks={[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330] as any} tickFormatter={formatPolarAngle} stroke="#141414" strokeOpacity={0.5} tick={{ fontSize: 10 }} axisLineType="circle" />
                              <PolarRadiusAxis angle={90} domain={[0, Math.max(1e-6, simulationData.maxIntensity) / 0.95]} tick={false} axisLine={false} />
                              <Radar name="Polarizer 0°" dataKey="ana_p0" stroke="#141414" strokeWidth={2} fill="#141414" fillOpacity={0.1} isAnimationActive={false} />
                              <Tooltip 
                                formatter={(value: number) => value.toFixed(4)}
                                labelFormatter={(label) => `Analyzer Angle: ${label}°`}
                                contentStyle={{ backgroundColor: '#E4E3E0', border: '1px solid #141414', borderRadius: '0px' }}
                              />
                            </RadarChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="text-[10px] font-mono opacity-50">Max: {simulationData.maxAnaP0.toFixed(4)}</div>
                      </div>

                      {/* Polarizer = 90 */}
                      <div className="flex flex-col items-center space-y-4">
                        <h3 className="text-lg font-serif italic text-center">Polarizer at 90°</h3>
                        <div className="text-[10px] uppercase tracking-widest opacity-50">Fixed Polarizer</div>
                        <div className="w-full aspect-square max-w-[350px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={simulationData.data}>
                              <PolarGrid gridType="circle" stroke="#141414" strokeOpacity={0.1} />
                              <PolarAngleAxis dataKey="angle" type="number" domain={[0, 360]} ticks={[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330] as any} tickFormatter={formatPolarAngle} stroke="#141414" strokeOpacity={0.5} tick={{ fontSize: 10 }} axisLineType="circle" />
                              <PolarRadiusAxis angle={90} domain={[0, Math.max(1e-6, simulationData.maxIntensity) / 0.95]} tick={false} axisLine={false} />
                              <Radar name="Polarizer 90°" dataKey="ana_p90" stroke="#141414" strokeWidth={2} fill="#141414" fillOpacity={0.1} isAnimationActive={false} />
                              <Tooltip 
                                formatter={(value: number) => value.toFixed(4)}
                                labelFormatter={(label) => `Analyzer Angle: ${label}°`}
                                contentStyle={{ backgroundColor: '#E4E3E0', border: '1px solid #141414', borderRadius: '0px' }}
                              />
                            </RadarChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="text-[10px] font-mono opacity-50">Max: {simulationData.maxAnaP90.toFixed(4)}</div>
                      </div>
                    </div>
                  )}

                  {independentComponents.length > 0 && (
                    <div className="mt-8 text-center text-xs opacity-50">
                      Note: The angle shown in the plots represents the {activePolarimetryTab === 'polarizer' ? 'polarizer' : 'analyzer'} angle. 0° corresponds to the Lab X-axis, and 90° corresponds to the Lab Y-axis.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
