/**
 * latexFormatting.ts
 *
 * Converts the numeric results from tensorProjection.ts into the LaTeX strings
 * shown in the UI: independent tensor-component relations (calculateTensorComponents)
 * and the polarization-dependent SHG source-term sums (formatSubstitutedPolySum).
 */

import { EPSILON } from './symmetryGroups';
import {
  type TensorTimeReversal,
  calculateTensorBasisResults,
  getIndices,
  getLabel,
  formatCoeff,
  cleanupExpressionSigns,
} from './tensorProjection';

export function calculateTensorComponents(groupName: string, tensorType: 'ED' | 'MD' | 'EQ', trType: TensorTimeReversal): string[] {
  const result = calculateTensorBasisResults(groupName, tensorType, trType);
  if (!result) return ["Point group not supported."];
  return formatResults(result.basisResults, result.rank, trType === 'c');
}

export function formatSubstitutedPolySum(
  terms: { poly: Map<string, Map<string, number>>, mode: 'THETA' | 'ZERO' | 'NINETY', scale?: number, multiplyTrig?: '\\cos\\theta' | '\\sin\\theta' }[]
): string {
  const allChis = new Set<string>();
  for (const term of terms) {
    for (const chi of term.poly.keys()) {
      allChis.add(chi);
    }
  }

  const sortedChis = Array.from(allChis).sort();
  const finalParts: string[] = [];
  const allMergedChiTerms: { chi: string, terms: { coeff: number, fieldStr: string }[] }[] = [];

  for (const chi of sortedChis) {
    const powerChiTerms: { coeff: number, fieldStr: string }[] = [];
    const harmonicChiTerms: { coeff: number, fieldStr: string }[] = [];

    for (const term of terms) {
      const pairMap = term.poly.get(chi);
      if (!pairMap) continue;

      const scale = term.scale ?? 1;
      const mode = term.mode;
      const multiplyTrig = term.multiplyTrig;

      type HarmonicTerm = { harmonic: string, factor: number };
      let powerMappings: Record<string, HarmonicTerm[]>;
      let harmonicMappings: Record<string, HarmonicTerm[]>;

      if (mode === 'THETA') {
        if (multiplyTrig === '\\cos\\theta') {
          powerMappings = {
            '00': [{ harmonic: '\\cos^3\\theta', factor: 1 }],
            '11': [{ harmonic: '\\cos\\theta \\sin^2\\theta', factor: 1 }],
            '22': [],
            '01': [{ harmonic: '\\cos^2\\theta \\sin\\theta', factor: 1 }],
            '02': [], '12': []
          };
          harmonicMappings = {
            '00': [{ harmonic: '\\cos\\theta', factor: 0.75 }, { harmonic: '\\cos 3\\theta', factor: 0.25 }],
            '11': [{ harmonic: '\\cos\\theta', factor: 0.25 }, { harmonic: '\\cos 3\\theta', factor: -0.25 }],
            '22': [],
            '01': [{ harmonic: '\\sin\\theta', factor: 0.25 }, { harmonic: '\\sin 3\\theta', factor: 0.25 }],
            '02': [], '12': []
          };
        } else if (multiplyTrig === '\\sin\\theta') {
          powerMappings = {
            '00': [{ harmonic: '\\cos^2\\theta \\sin\\theta', factor: 1 }],
            '11': [{ harmonic: '\\sin^3\\theta', factor: 1 }],
            '22': [],
            '01': [{ harmonic: '\\cos\\theta \\sin^2\\theta', factor: 1 }],
            '02': [], '12': []
          };
          harmonicMappings = {
            '00': [{ harmonic: '\\sin\\theta', factor: 0.25 }, { harmonic: '\\sin 3\\theta', factor: 0.25 }],
            '11': [{ harmonic: '\\sin\\theta', factor: 0.75 }, { harmonic: '\\sin 3\\theta', factor: -0.25 }],
            '22': [],
            '01': [{ harmonic: '\\cos\\theta', factor: 0.25 }, { harmonic: '\\cos 3\\theta', factor: -0.25 }],
            '02': [], '12': []
          };
        } else {
          powerMappings = {
            '00': [{ harmonic: '\\cos^2\\theta', factor: 1 }],
            '11': [{ harmonic: '\\sin^2\\theta', factor: 1 }],
            '22': [],
            '01': [{ harmonic: '\\cos\\theta \\sin\\theta', factor: 1 }],
            '02': [], '12': []
          };
          harmonicMappings = {
            '00': [{ harmonic: '1', factor: 0.5 }, { harmonic: '\\cos 2\\theta', factor: 0.5 }],
            '11': [{ harmonic: '1', factor: 0.5 }, { harmonic: '\\cos 2\\theta', factor: -0.5 }],
            '22': [],
            '01': [{ harmonic: '\\sin 2\\theta', factor: 0.5 }],
            '02': [], '12': []
          };
        }
      } else {
        const multiplied = multiplyTrig ? multiplyTrig : '1';
        powerMappings = {
          '00': [{ harmonic: multiplied, factor: 1 }],
          '11': [{ harmonic: multiplied, factor: 1 }],
          '22': [], '01': [], '02': [], '12': []
        };
        harmonicMappings = powerMappings;
      }

      const sortedPairs = Array.from(pairMap.keys()).sort();
      for (const pair of sortedPairs) {
        let baseCoeff = pairMap.get(pair)! * scale;
        if (Math.abs(baseCoeff) > EPSILON) {
          if (mode === 'ZERO' && pair !== '00') continue;
          if (mode === 'NINETY' && pair !== '11') continue;

          const pMappings = powerMappings[pair] || [];
          for (const mapping of pMappings) {
            const coeff = baseCoeff * mapping.factor;
            if (Math.abs(coeff) > EPSILON) {
              powerChiTerms.push({ coeff, fieldStr: mapping.harmonic });
            }
          }

          const hMappings = harmonicMappings[pair] || [];
          for (const mapping of hMappings) {
            const coeff = baseCoeff * mapping.factor;
            if (Math.abs(coeff) > EPSILON) {
              harmonicChiTerms.push({ coeff, fieldStr: mapping.harmonic });
            }
          }
        }
      }
    }

    const combineTerms = (chiTerms: { coeff: number, fieldStr: string }[]) => {
      const combined = new Map<string, number>();
      for (const ct of chiTerms) {
        combined.set(ct.fieldStr, (combined.get(ct.fieldStr) || 0) + ct.coeff);
      }
      const merged: { coeff: number, fieldStr: string }[] = [];
      for (const [fieldStr, coeff] of combined.entries()) {
        if (Math.abs(coeff) > EPSILON) {
          merged.push({ coeff, fieldStr });
        }
      }
      return merged;
    };

    const mergedPower = combineTerms(powerChiTerms);
    const mergedHarmonic = combineTerms(harmonicChiTerms);

    if (mergedPower.length === 0 && mergedHarmonic.length === 0) continue;

    let mergedChiTerms = mergedPower;
    if (mergedHarmonic.length < mergedPower.length) {
      mergedChiTerms = mergedHarmonic;
    } else if (mergedHarmonic.length === mergedPower.length && mergedHarmonic.length === 1) {
      mergedChiTerms = mergedHarmonic;
    }

    const harmonicWeight = (h: string) => {
      if (h === '1') return 0;
      if (h === '\\cos\\theta') return 1;
      if (h === '\\sin\\theta') return 2;
      if (h === '\\cos^2\\theta') return 3;
      if (h === '\\sin^2\\theta') return 4;
      if (h === '\\cos\\theta \\sin\\theta') return 5;
      if (h === '\\cos 2\\theta') return 6;
      if (h === '\\sin 2\\theta') return 7;
      if (h === '\\cos^3\\theta') return 8;
      if (h === '\\sin^3\\theta') return 9;
      if (h === '\\cos^2\\theta \\sin\\theta') return 10;
      if (h === '\\cos\\theta \\sin^2\\theta') return 11;
      if (h === '\\cos 3\\theta') return 12;
      if (h === '\\sin 3\\theta') return 13;
      return 20;
    };

    mergedChiTerms.sort((a, b) => harmonicWeight(a.fieldStr) - harmonicWeight(b.fieldStr));
    allMergedChiTerms.push({ chi, terms: mergedChiTerms });
  }

  if (allMergedChiTerms.length > 0) {
    const firstChi = allMergedChiTerms[0];
    if (firstChi.terms.length > 0 && firstChi.terms[0].coeff < 0) {
      for (const chiObj of allMergedChiTerms) {
        for (const term of chiObj.terms) {
          term.coeff *= -1;
        }
      }
    }
  }

  for (const { chi, terms: mergedChiTerms } of allMergedChiTerms) {
    if (mergedChiTerms.length === 1) {
      const { coeff, fieldStr } = mergedChiTerms[0];
      const sign = coeff < 0 ? "-" : "";
      const displayFieldStr = fieldStr === '1' ? '' : ` ${fieldStr}`;
      finalParts.push(`${sign}${formatCoeff(coeff)}${chi} E_0^2${displayFieldStr}`);
    } else {
      const innerExpr = mergedChiTerms.map((ct, idx) => {
        const fieldStr = ct.fieldStr;
        const c = ct.coeff;
        const coeffStr = formatCoeff(c);

        let termStr = '';
        if (fieldStr === '1') {
          termStr = coeffStr === '' ? '1' : coeffStr;
        } else {
          termStr = coeffStr === '' ? fieldStr : `${coeffStr} ${fieldStr}`;
        }

        if (idx === 0) {
          return `${c < 0 ? '-' : ''}${termStr}`;
        } else {
          return `${c < 0 ? '-' : '+'} ${termStr}`;
        }
      }).join(" ");
      finalParts.push(`${chi} E_0^2(${innerExpr})`);
    }
  }
  return finalParts.length > 0 ? cleanupExpressionSigns(finalParts.join(" + ")) : "0";
}

function formatResults(basisResults: number[][], rank: number, isTimeOdd: boolean): string[] {
  const dim = Math.pow(3, rank);
  const output: string[] = [];

  for (const basis of basisResults) {
    const members: string[] = [];
    let leadIdx = -1;
    const addedLabels = new Set<string>();

    for (let i = 0; i < dim; i++) {
      if (Math.abs(basis[i]) > EPSILON) {
        const label = getLabel(getIndices(i, rank));
        if (addedLabels.has(label)) continue;
        addedLabels.add(label);

        if (leadIdx === -1) leadIdx = i;
        const scale = basis[i] / basis[leadIdx];
        const sign = scale > 0 ? (members.length === 0 ? "" : " = ") : " = -";
        const scaleStr = formatCoeff(scale);
        members.push(`${sign}${scaleStr}${label}`);
      }
    }

    if (members.length > 0) {
      output.push(members.join(""));
    }
  }

  return output.length > 0 ? output : ["All components are zero."];
}
