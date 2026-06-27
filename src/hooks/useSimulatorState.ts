import React, { useEffect, useMemo } from 'react';
import { PointGroupData } from '../data/pointGroups';
import {
  TensorType,
  TensorTimeReversal,
  getLabFrameVectors,
  calculateSHGExpressions,
  formatSubstitutedPolySum
} from '../services/tensorCalculator';

export function useSimulatorState(
  selectedGroup: PointGroupData | null,
  selectedTensorType: TensorType,
  selectedTimeReversal: TensorTimeReversal,
  thetaX: number,
  thetaY: number,
  psi0: number,
  phiX: number,
  phiY: number,
  psi: number,
  selectedSetting: number,
  amplitudes: Record<string, number>,
  setAmplitudes: React.Dispatch<React.SetStateAction<Record<string, number>>>,
  phases: Record<string, number>,
  setPhases: React.Dispatch<React.SetStateAction<Record<string, number>>>,
) {
  const labFrame = useMemo(() => getLabFrameVectors({ thetaX, thetaY, psi0, phiX, phiY, psi }), [thetaX, thetaY, psi0, phiX, phiY, psi]);

  const sourceTerms = useMemo(() => {
    if (!selectedGroup) return [];
    return calculateSHGExpressions({
      groupName: selectedGroup.name,
      tensorType: selectedTensorType,
      trType: selectedTimeReversal,
      thetaX,
      thetaY,
      psi0,
      phiX,
      phiY,
      psi,
      setting: selectedSetting,
      labFrameDisplayMode: 'E0_THETA',
    }).source;
  }, [selectedGroup, selectedTensorType, selectedTimeReversal, thetaX, thetaY, psi0, phiX, phiY, psi, selectedSetting]);

  const sourceTermsExEy = useMemo(() => {
    if (!selectedGroup) return [];
    return calculateSHGExpressions({
      groupName: selectedGroup.name,
      tensorType: selectedTensorType,
      trType: selectedTimeReversal,
      thetaX,
      thetaY,
      psi0,
      phiX,
      phiY,
      psi,
      setting: selectedSetting,
      labFrameDisplayMode: 'EX_EY',
    }).source;
  }, [selectedGroup, selectedTensorType, selectedTimeReversal, thetaX, thetaY, psi0, phiX, phiY, psi, selectedSetting]);

  const expandedFormulas = useMemo(() => {
    const sxTermTheta = sourceTerms.find(t => t.component === 'S_X')?.rawPoly;
    const syTermTheta = sourceTerms.find(t => t.component === 'S_Y')?.rawPoly;
    const sxTermExEy = sourceTermsExEy.find(t => t.component === 'S_X')?.rawPoly;
    const syTermExEy = sourceTermsExEy.find(t => t.component === 'S_Y')?.rawPoly;

    if (!sxTermTheta || !syTermTheta || !sxTermExEy || !syTermExEy) return null;

    const aniParStr = formatSubstitutedPolySum([
      { poly: sxTermTheta, mode: 'THETA', scale: 1, multiplyTrig: '\\cos\\theta' },
      { poly: syTermTheta, mode: 'THETA', scale: 1, multiplyTrig: '\\sin\\theta' }
    ]);

    const aniPerpStr = formatSubstitutedPolySum([
      { poly: sxTermTheta, mode: 'THETA', scale: -1, multiplyTrig: '\\sin\\theta' },
      { poly: syTermTheta, mode: 'THETA', scale: 1, multiplyTrig: '\\cos\\theta' }
    ]);

    const polA0Str = formatSubstitutedPolySum([
      { poly: sxTermTheta, mode: 'THETA' }
    ]);

    const polA90Str = formatSubstitutedPolySum([
      { poly: syTermTheta, mode: 'THETA' }
    ]);

    const anaP0Str = formatSubstitutedPolySum([
      { poly: sxTermExEy, mode: 'ZERO', scale: 1, multiplyTrig: '\\cos\\theta' },
      { poly: syTermExEy, mode: 'ZERO', scale: 1, multiplyTrig: '\\sin\\theta' }
    ]);

    const anaP90Str = formatSubstitutedPolySum([
      { poly: sxTermExEy, mode: 'NINETY', scale: 1, multiplyTrig: '\\cos\\theta' },
      { poly: syTermExEy, mode: 'NINETY', scale: 1, multiplyTrig: '\\sin\\theta' }
    ]);

    return {
      aniPar: `I_{\\parallel} = |${aniParStr}|^2`,
      aniPerp: `I_{\\perp} = |${aniPerpStr}|^2`,
      polA0: `I = |${polA0Str}|^2`,
      polA90: `I = |${polA90Str}|^2`,
      anaP0: `I = |${anaP0Str}|^2`,
      anaP90: `I = |${anaP90Str}|^2`,
    };
  }, [sourceTerms, sourceTermsExEy]);

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
      const I_par = calcIntensity(angleRad, angleRad);
      const I_perp = calcIntensity(angleRad, angleRad + Math.PI / 2);

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

  return { labFrame, sourceTerms, sourceTermsExEy, expandedFormulas, independentComponents, simulationData };
}
