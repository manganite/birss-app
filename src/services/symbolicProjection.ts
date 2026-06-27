/**
 * symbolicProjection.ts
 *
 * Parallel symbolic path for SHG source-term computation. Produces source terms
 * with TrigPoly coefficients (symbolic in phiX, phiY, psi) while keeping the
 * crystal-frame basis computation numeric. The numeric path in tensorProjection.ts
 * remains unchanged and is used for live Simulator evaluation.
 */

import { type TrigPoly, trigConst, trigCos, trigSin, trigAdd, trigMul, trigScale, trigIsZero, trigSimplify, TRIG_ZERO } from './trigPoly';
import {
  type SHGOptions, type SHGExpression,
  rotX, rotY, rotZ, mat3mul,
  averageTensor, getIndices, getLabel, formatCoeff, cleanupExpressionSigns,
} from './tensorProjection';
import { EPSILON, GENERATORS, getCachedFullGroup, getTransformedGenerators } from './symmetryGroups';

export type SymPoly = Map<string, Map<string, TrigPoly>>;

export interface SymbolicSHGExpression {
  component: string;
  symbolicPoly: SymPoly;
}

export interface SymbolicSHGResult {
  induced: SHGExpression[];
  source: SymbolicSHGExpression[];
}

export type TrigMat3 = TrigPoly[][];

function trigMat3Mul(A: TrigMat3, B: TrigMat3): TrigMat3 {
  const R: TrigMat3 = Array.from({ length: 3 }, () =>
    Array.from({ length: 3 }, () => TRIG_ZERO)
  );
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 3; j++) {
      let sum = TRIG_ZERO;
      for (let k = 0; k < 3; k++)
        sum = trigAdd(sum, trigMul(A[i][k], B[k][j]));
      R[i][j] = sum;
    }
  return R;
}

function numToTrigMat3(m: number[][]): TrigMat3 {
  return m.map(row => row.map(v => trigConst(v)));
}

function symRotX(): TrigMat3 {
  const c = trigCos('phiX'), s = trigSin('phiX');
  const one = trigConst(1), zero = TRIG_ZERO, ns = trigScale(s, -1);
  return [
    [one, zero, zero],
    [zero, c, ns],
    [zero, s, c],
  ];
}

function symRotY(): TrigMat3 {
  const c = trigCos('phiY'), s = trigSin('phiY');
  const one = trigConst(1), zero = TRIG_ZERO, ns = trigScale(s, -1);
  return [
    [c, zero, s],
    [zero, one, zero],
    [ns, zero, c],
  ];
}

function symRotZ(): TrigMat3 {
  const c = trigCos('psi'), s = trigSin('psi');
  const one = trigConst(1), zero = TRIG_ZERO, ns = trigScale(s, -1);
  return [
    [c, ns, zero],
    [s, c, zero],
    [zero, zero, one],
  ];
}

export function buildSymbolicR(thetaX: number, thetaY: number, psi0 = 0): TrigMat3 {
  const R_preset = numToTrigMat3(mat3mul(rotZ(psi0), mat3mul(rotY(thetaY), rotX(thetaX))));
  return trigMat3Mul(symRotZ(), trigMat3Mul(symRotY(), trigMat3Mul(symRotX(), R_preset)));
}

function multiplyLinearSym(A: TrigPoly[], B: TrigPoly[]): Record<string, TrigPoly> {
  const res: Record<string, TrigPoly> = {
    '00': TRIG_ZERO, '11': TRIG_ZERO, '22': TRIG_ZERO,
    '01': TRIG_ZERO, '02': TRIG_ZERO, '12': TRIG_ZERO,
  };
  for (let i = 0; i < 3; i++) {
    for (let m = 0; m < 3; m++) {
      const coeff = trigMul(A[i], B[m]);
      if (!trigIsZero(coeff)) {
        const key = i <= m ? `${i}${m}` : `${m}${i}`;
        res[key] = trigAdd(res[key], coeff);
      }
    }
  }
  return res;
}

function addPolySym(a: SymPoly, b: SymPoly, scaleB: TrigPoly): SymPoly {
  const res: SymPoly = new Map();
  const add = (p: SymPoly, scale: TrigPoly) => {
    for (const [chi, pairMap] of p.entries()) {
      if (!res.has(chi)) res.set(chi, new Map());
      const resPairMap = res.get(chi)!;
      for (const [pair, coeff] of pairMap.entries()) {
        const scaled = trigMul(coeff, scale);
        const existing = resPairMap.get(pair) || TRIG_ZERO;
        resPairMap.set(pair, trigAdd(existing, scaled));
      }
    }
  };
  add(a, trigConst(1));
  add(b, scaleB);
  return res;
}

export function calculateSymbolicSHGExpressions(options: SHGOptions): SymbolicSHGResult {
  const { groupName, tensorType, trType, thetaX = 0, thetaY = 0, psi0 = 0, setting = 1 } = options;

  const generators = setting > 1
    ? getTransformedGenerators(groupName, setting)
    : GENERATORS[groupName];
  if (!generators || generators.length === 0) return { induced: [], source: [] };

  const cacheKey = setting > 1 ? `${groupName}::setting${setting}` : groupName;
  const group = getCachedFullGroup(cacheKey, generators);
  const rank = tensorType === 'EQ' ? 4 : 3;
  const isAxial = tensorType === 'MD';
  const isTimeOdd = trType === 'c';
  const dim = Math.pow(3, rank);
  const tLabels = ['x', 'y', 'z'];

  const R_sym = buildSymbolicR(thetaX, thetaY, psi0);

  // E_vec_lab_in_cryst: E_cryst_i = R[0][i]*E_X + R[1][i]*E_Y (E_Z=0 transverse)
  const E_vec_lab_in_cryst_sym: TrigPoly[][] = [
    [R_sym[0][0], R_sym[1][0], TRIG_ZERO],
    [R_sym[0][1], R_sym[1][1], TRIG_ZERO],
    [R_sym[0][2], R_sym[1][2], TRIG_ZERO],
  ];

  const E_vec_full = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];

  const outputCount = tensorType === 'EQ' ? 9 : 3;
  const inducedPolysLab: SymPoly[] = [];
  const inducedExprs: SHGExpression[] = [];

  for (let outIdx = 0; outIdx < outputCount; outIdx++) {
    const outIndices = tensorType === 'EQ' ? [Math.floor(outIdx / 3), outIdx % 3] : [outIdx];
    const outLabel = tensorType === 'EQ'
      ? `Q_${tLabels[outIndices[0]]}${tLabels[outIndices[1]]}`
      : `${tensorType === 'ED' ? 'P' : 'M'}_${tLabels[outIndices[0]]}`;

    const terms: Map<string, Map<string, number>> = new Map();
    let termsTransverse: SymPoly = new Map();

    for (let j = 0; j < 3; j++) {
      for (let k = 0; k < 3; k++) {
        const fullIndices = [...outIndices, j, k];
        let flatIdx = 0;
        for (let r = 0; r < rank; r++)
          flatIdx += fullIndices[r] * Math.pow(3, rank - 1 - r);

        const swappedIndices = [...fullIndices];
        const temp = swappedIndices[rank - 1];
        swappedIndices[rank - 1] = swappedIndices[rank - 2];
        swappedIndices[rank - 2] = temp;
        let swappedIdx = 0;
        for (let r = 0; r < rank; r++)
          swappedIdx += swappedIndices[r] * Math.pow(3, rank - 1 - r);

        const basisVector = new Array(dim).fill(0);
        basisVector[flatIdx] = 1;
        if (flatIdx !== swappedIdx) basisVector[swappedIdx] = 1;
        const averaged = averageTensor(basisVector, group, rank, isAxial, isTimeOdd);

        let foundRelation: { label: string; coeff: number } | null = null;
        for (let i = 0; i < dim; i++) {
          if (Math.abs(averaged[i]) > EPSILON) {
            foundRelation = { label: getLabel(getIndices(i, rank)), coeff: averaged[flatIdx] / averaged[i] };
            break;
          }
        }

        if (foundRelation) {
          // Crystal-frame induced polynomial (numeric, for display)
          for (let ii = 0; ii < 3; ii++)
            for (let mm = 0; mm < 3; mm++) {
              const c = E_vec_full[ii][j] * E_vec_full[mm][k];
              if (Math.abs(c) > EPSILON) {
                const key = ii <= mm ? `${ii}${mm}` : `${mm}${ii}`;
                if (!terms.has(foundRelation.label)) terms.set(foundRelation.label, new Map());
                const pm = terms.get(foundRelation.label)!;
                pm.set(key, (pm.get(key) || 0) + foundRelation.coeff * c);
              }
            }

          // Lab-frame induced polynomial (symbolic)
          const polyLab = multiplyLinearSym(E_vec_lab_in_cryst_sym[j], E_vec_lab_in_cryst_sym[k]);
          for (const [pair, pCoeffSym] of Object.entries(polyLab)) {
            if (!trigIsZero(pCoeffSym)) {
              const totalCoeffSym = trigScale(pCoeffSym, foundRelation.coeff);
              if (!termsTransverse.has(foundRelation.label)) termsTransverse.set(foundRelation.label, new Map());
              const pairMap = termsTransverse.get(foundRelation.label)!;
              pairMap.set(pair, trigAdd(pairMap.get(pair) || TRIG_ZERO, totalCoeffSym));
            }
          }
        }
      }
    }

    inducedPolysLab.push(termsTransverse);

    // Format crystal-frame induced expression (numeric)
    const inducedParts: string[] = [];
    const fieldLabels: Record<string, string> = {
      '00': 'E_x^2', '11': 'E_y^2', '22': 'E_z^2',
      '01': 'E_x E_y', '02': 'E_x E_z', '12': 'E_y E_z',
    };
    for (const chi of Array.from(terms.keys()).sort()) {
      const pairMap = terms.get(chi)!;
      const fieldParts: { pair: string; coeff: number }[] = [];
      for (const pair of Array.from(pairMap.keys()).sort()) {
        const coeff = pairMap.get(pair)!;
        if (Math.abs(coeff) > EPSILON) fieldParts.push({ pair, coeff });
      }
      if (fieldParts.length === 0) continue;
      if (fieldParts.length === 1) {
        const { pair, coeff } = fieldParts[0];
        inducedParts.push(`${coeff < 0 ? '-' : ''}${formatCoeff(coeff)}${chi}${fieldLabels[pair]}`);
      } else {
        const inner = fieldParts.map((fp, idx) => {
          const coeffStr = formatCoeff(fp.coeff);
          if (idx === 0) return `${fp.coeff < 0 ? '-' : ''}${coeffStr}${fieldLabels[fp.pair]}`;
          return `${fp.coeff < 0 ? '-' : '+'} ${coeffStr}${fieldLabels[fp.pair]}`;
        }).join(' ');
        inducedParts.push(`${chi}(${inner})`);
      }
    }

    inducedExprs.push({
      component: outLabel,
      expression: inducedParts.length > 0 ? cleanupExpressionSigns(inducedParts.join(' + ')) : '0',
    });
  }

  // Source terms — symbolic contraction
  const sourceExprs: SymbolicSHGExpression[] = [];
  const tLabelsLab = ['X', 'Y', 'Z'];

  for (let I = 0; I < 3; I++) {
    const outLabel = `S_${tLabelsLab[I]}`;
    let sPoly: SymPoly = new Map();

    if (tensorType === 'ED') {
      for (let i = 0; i < 3; i++)
        sPoly = addPolySym(sPoly, inducedPolysLab[i], R_sym[I][i]);
    } else if (tensorType === 'MD') {
      if (I === 0) {
        for (let i = 0; i < 3; i++)
          sPoly = addPolySym(sPoly, inducedPolysLab[i], trigScale(R_sym[1][i], -1));
      } else if (I === 1) {
        for (let i = 0; i < 3; i++)
          sPoly = addPolySym(sPoly, inducedPolysLab[i], R_sym[0][i]);
      }
    } else if (tensorType === 'EQ') {
      for (let i = 0; i < 3; i++)
        for (let j = 0; j < 3; j++) {
          const coeff = trigMul(R_sym[2][i], R_sym[I][j]);
          sPoly = addPolySym(sPoly, inducedPolysLab[i * 3 + j], coeff);
        }
    }

    // Simplify all TrigPoly coefficients
    const simplified: SymPoly = new Map();
    for (const [chi, pairMap] of sPoly) {
      const simplifiedPairMap = new Map<string, TrigPoly>();
      for (const [pair, tp] of pairMap) {
        const s = trigSimplify(tp);
        if (!trigIsZero(s)) simplifiedPairMap.set(pair, s);
      }
      if (simplifiedPairMap.size > 0) simplified.set(chi, simplifiedPairMap);
    }

    sourceExprs.push({ component: outLabel, symbolicPoly: simplified });
  }

  return { induced: inducedExprs, source: sourceExprs };
}
