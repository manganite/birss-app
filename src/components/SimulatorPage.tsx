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
      if (term.rawPoly) {
        Array.from(term.rawPoly.keys()).forEach(chi => components.add(chi));
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

    const sXPoly = sourceTerms.find(t => t.component === 'S_X')?.rawPoly;
    const sYPoly = sourceTerms.find(t => t.component === 'S_Y')?.rawPoly;

    if (!sXPoly || !sYPoly) return { data: [], maxIntensity: 0, maxParallel: 0, maxCrossed: 0 };

    for (let phiDeg = 0; phiDeg < 360; phiDeg += 2) {
      const phi = (phiDeg * Math.PI) / 180;
      const Ex = Math.cos(phi);
      const Ey = Math.sin(phi);

      const evaluatePoly = (poly: Map<string, Map<string, number>>) => {
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

      const Sx = evaluatePoly(sXPoly);
      const Sy = evaluatePoly(sYPoly);

      // Parallel Analyzer: analyzer at angle phi
      const ax_par = Math.cos(phi);
      const ay_par = Math.sin(phi);
      const E_par_real = Sx.real * ax_par + Sy.real * ay_par;
      const E_par_imag = Sx.imag * ax_par + Sy.imag * ay_par;
      const I_par = E_par_real * E_par_real + E_par_imag * E_par_imag;

      // Crossed Analyzer: analyzer at angle phi + 90 deg
      const ax_perp = -Math.sin(phi);
      const ay_perp = Math.cos(phi);
      const E_perp_real = Sx.real * ax_perp + Sy.real * ay_perp;
      const E_perp_imag = Sx.imag * ax_perp + Sy.imag * ay_perp;
      const I_perp = E_perp_real * E_perp_real + E_perp_imag * E_perp_imag;

      maxIntensity = Math.max(maxIntensity, I_par, I_perp);
      maxParallel = Math.max(maxParallel, I_par);
      maxCrossed = Math.max(maxCrossed, I_perp);

      data.push({
        angle: phiDeg,
        parallel: I_par,
        crossed: I_perp
      });
    }

    return { data, maxIntensity, maxParallel, maxCrossed };
  }, [sourceTerms, amplitudes, phases]);

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

          <div className="bg-white/50 border border-[#141414] p-6 md:p-8">
            {independentComponents.length === 0 ? (
              <div className="h-[400px] flex items-center justify-center text-sm opacity-50 italic">
                Zero intensity
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Parallel Plot */}
                <div className="flex flex-col items-center space-y-4">
                  <h3 className="text-lg font-serif italic text-center">Parallel (<InlineMath math="I_{\parallel}" />)</h3>
                  <div className="text-[10px] uppercase tracking-widest opacity-50">Polarizer || Analyzer</div>
                  <div className="w-full aspect-square max-w-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="90%" data={simulationData.data}>
                        <PolarGrid stroke="#141414" strokeOpacity={0.1} />
                        <PolarAngleAxis dataKey="angle" type="number" domain={[0, 360]} ticks={[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330] as any} tickFormatter={(val) => `${val}°`} stroke="#141414" strokeOpacity={0.5} tick={{ fontSize: 10 }} />
                        <PolarRadiusAxis angle={90} domain={[0, Math.max(1e-6, simulationData.maxParallel)]} tick={false} axisLine={false} />
                        <Radar name="Parallel" dataKey="parallel" stroke="#141414" strokeWidth={2} fill="#141414" fillOpacity={0.1} isAnimationActive={false} />
                        <Tooltip 
                          formatter={(value: number) => value.toFixed(4)}
                          labelFormatter={(label) => `Angle: ${label}°`}
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
                      <RadarChart cx="50%" cy="50%" outerRadius="90%" data={simulationData.data}>
                        <PolarGrid stroke="#141414" strokeOpacity={0.1} />
                        <PolarAngleAxis dataKey="angle" type="number" domain={[0, 360]} ticks={[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330] as any} tickFormatter={(val) => `${val}°`} stroke="#141414" strokeOpacity={0.5} tick={{ fontSize: 10 }} />
                        <PolarRadiusAxis angle={90} domain={[0, Math.max(1e-6, simulationData.maxCrossed)]} tick={false} axisLine={false} />
                        <Radar name="Crossed" dataKey="crossed" stroke="#141414" strokeWidth={2} fill="#141414" fillOpacity={0.1} isAnimationActive={false} />
                        <Tooltip 
                          formatter={(value: number) => value.toFixed(4)}
                          labelFormatter={(label) => `Angle: ${label}°`}
                          contentStyle={{ backgroundColor: '#E4E3E0', border: '1px solid #141414', borderRadius: '0px' }}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="text-[10px] font-mono opacity-50">Max: {simulationData.maxCrossed.toFixed(4)}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
