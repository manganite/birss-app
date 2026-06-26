/**
 * tensorProjection.ts
 *
 * Numeric core: projects ED/MD/EQ tensors onto a magnetic point group's symmetry
 * operations (transform + average + basis reduction), and computes SHG source-term
 * polynomials and lab-frame basis vectors. Also hosts a handful of small,
 * dependency-free label/formatting helpers (getIndices, getLabel, formatCoeff,
 * cleanupExpressionSigns) shared by both this module and latexFormatting.ts.
 */

import { type Matrix3x3, EPSILON, AXIS_EPSILON, GENERATORS, getCachedFullGroup, det } from './symmetryGroups';

export type TensorType = 'ED' | 'MD' | 'EQ';
export type TensorTimeReversal = 'i' | 'c'; // i = time-even, c = time-odd

const DEG = Math.PI / 180;

export function rotX(deg: number): number[][] {
  const c = Math.cos(deg * DEG), s = Math.sin(deg * DEG);
  return [[1, 0, 0], [0, c, -s], [0, s, c]];
}

export function rotY(deg: number): number[][] {
  const c = Math.cos(deg * DEG), s = Math.sin(deg * DEG);
  return [[c, 0, s], [0, 1, 0], [-s, 0, c]];
}

export function rotZ(deg: number): number[][] {
  const c = Math.cos(deg * DEG), s = Math.sin(deg * DEG);
  return [[c, -s, 0], [s, c, 0], [0, 0, 1]];
}

export function mat3mul(A: number[][], B: number[][]): number[][] {
  const R: number[][] = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 3; j++)
      for (let k = 0; k < 3; k++)
        R[i][j] += A[i][k] * B[k][j];
  return R;
}

/** formatCoeff's "is this an integer / matches a simple fraction" tolerance (same value as AXIS_EPSILON, kept separate -- unrelated quantities). */
const COEFF_EPSILON = 1e-5;
/** formatCoeff's irrational-root (sqrt) matching tolerance. */
const ROOT_MATCH_EPSILON = 1e-4;

/** Collapses "+ -X" into "- X" after joining signed terms into a display string. */
export const cleanupExpressionSigns = (s: string): string => s.replace(/\+ -/g, "- ");

export function getIndices(idx: number, rank: number): number[] {
  const indices = [];
  let temp = idx;
  for (let i = 0; i < rank; i++) {
    indices.unshift(temp % 3);
    temp = Math.floor(temp / 3);
  }
  return indices;
}

export function getLabel(indices: number[]): string {
  const chars = ['x', 'y', 'z'];
  return '\\chi_{' + indices.map(i => chars[i]).join('') + '}';
}

export function formatCoeff(c: number): string {
  const absC = Math.abs(c);
  if (absC < COEFF_EPSILON) return "0";

  const rounded = Math.round(absC);
  if (Math.abs(absC - rounded) < COEFF_EPSILON) {
    if (rounded === 1) return "";
    return rounded.toString();
  }

  for (let d = 2; d <= 8; d++) {
    const num = Math.round(absC * d);
    if (Math.abs(absC - num / d) < COEFF_EPSILON) {
      return `\\frac{${num}}{${d}}`;
    }
  }

  // Common fractions
  const fractions = [
    { val: 0.5, str: "\\frac{1}{2}" },
    { val: 0.25, str: "\\frac{1}{4}" },
    { val: 0.75, str: "\\frac{3}{4}" },
    { val: 0.125, str: "\\frac{1}{8}" },
    { val: 0.375, str: "\\frac{3}{8}" },
    { val: 0.625, str: "\\frac{5}{8}" },
    { val: 0.875, str: "\\frac{7}{8}" },
    { val: 1.5, str: "\\frac{3}{2}" },
    { val: 2.5, str: "\\frac{5}{2}" },
    { val: 1/3, str: "\\frac{1}{3}" },
    { val: 2/3, str: "\\frac{2}{3}" },
    { val: 4/3, str: "\\frac{4}{3}" },
  ];

  for (const frac of fractions) {
    if (Math.abs(absC - frac.val) < COEFF_EPSILON) return frac.str;
  }

  // Square roots and their combinations
  const roots = [
    { val: Math.SQRT2, str: "\\sqrt{2}" },
    { val: Math.sqrt(3), str: "\\sqrt{3}" },
    { val: 1 / Math.SQRT2, str: "\\frac{1}{\\sqrt{2}}" },
    { val: Math.sqrt(3) / 2, str: "\\frac{\\sqrt{3}}{2}" },
    { val: 1 / Math.sqrt(3), str: "\\frac{1}{\\sqrt{3}}" },
    { val: 1 / (2 * Math.SQRT2), str: "\\frac{1}{2\\sqrt{2}}" },
    { val: 1 / (4 * Math.SQRT2), str: "\\frac{1}{4\\sqrt{2}}" },
    { val: Math.sqrt(3) / 4, str: "\\frac{\\sqrt{3}}{4}" },
    { val: 1 / (2 * Math.sqrt(3)), str: "\\frac{1}{2\\sqrt{3}}" },
    { val: Math.sqrt(3) / 8, str: "\\frac{\\sqrt{3}}{8}" },
    { val: 3 * Math.sqrt(3) / 8, str: "\\frac{3\\sqrt{3}}{8}" },
    { val: 2 * Math.SQRT2, str: "2\\sqrt{2}" },
    { val: 2 * Math.sqrt(3), str: "2\\sqrt{3}" },
    { val: Math.sqrt(2) / 3, str: "\\frac{\\sqrt{2}}{3}" },
    { val: 2 * Math.sqrt(2) / 3, str: "\\frac{2\\sqrt{2}}{3}" },
    { val: Math.sqrt(6), str: "\\sqrt{6}" },
    { val: Math.sqrt(6) / 2, str: "\\frac{\\sqrt{6}}{2}" },
    { val: Math.sqrt(6) / 3, str: "\\frac{\\sqrt{6}}{3}" },
    { val: Math.sqrt(6) / 4, str: "\\frac{\\sqrt{6}}{4}" },
  ];

  for (const root of roots) {
    if (Math.abs(absC - root.val) < ROOT_MATCH_EPSILON) return root.str;
  }

  return Number(absC.toFixed(3)).toString();
}

function transformTensor(tensor: number[], g: Matrix3x3, rank: number, isAxial: boolean, isTimeOdd: boolean): number[] {
  const dim = tensor.length;
  const result = new Array(dim).fill(0);
  const detG = det(g);

  let trFactor = 1;
  if (isTimeOdd && g.isAntiUnitary) {
    trFactor = -1;
  }

  const factor = (isAxial ? detG : 1) * trFactor;

  for (let idx = 0; idx < dim; idx++) {
    const indices = getIndices(idx, rank);
    for (let jdx = 0; jdx < dim; jdx++) {
      if (Math.abs(tensor[jdx]) < EPSILON) continue;
      const jIndices = getIndices(jdx, rank);
      let rProd = factor;
      for (let r = 0; r < rank; r++) {
        rProd *= g.m[indices[r]][jIndices[r]];
      }
      result[idx] += rProd * tensor[jdx];
    }
  }
  return result;
}

function averageTensor(tensor: number[], group: Matrix3x3[], rank: number, isAxial: boolean, isTimeOdd: boolean): number[] {
  const dim = tensor.length;
  const sum = new Array(dim).fill(0);

  for (const g of group) {
    const transformed = transformTensor(tensor, g, rank, isAxial, isTimeOdd);
    for (let i = 0; i < dim; i++) {
      sum[i] += transformed[i];
    }
  }

  return sum.map(v => v / group.length);
}

/**
 * Computes the independent, symmetrized tensor-component basis vectors for a group.
 * Returns null if the group is not in GENERATORS (caller decides how to report that).
 */
export function calculateTensorBasisResults(groupName: string, tensorType: TensorType, trType: TensorTimeReversal): { basisResults: number[][]; rank: number } | null {
  const generators = GENERATORS[groupName];
  if (!generators) return null;

  const group = getCachedFullGroup(groupName, generators);
  const rank = tensorType === 'EQ' ? 4 : 3;
  const isAxial = tensorType === 'MD';
  const isTimeOdd = trType === 'c';
  const dim = Math.pow(3, rank);

  const basisResults: number[][] = [];
  for (let i = 0; i < dim; i++) {
    const indices = getIndices(i, rank);
    const swappedIndices = [...indices];
    const temp = swappedIndices[rank - 1];
    swappedIndices[rank - 1] = swappedIndices[rank - 2];
    swappedIndices[rank - 2] = temp;

    let swappedIdx = 0;
    for (let r = 0; r < rank; r++) {
      swappedIdx += swappedIndices[r] * Math.pow(3, rank - 1 - r);
    }

    if (i > swappedIdx) continue; // Only process unique pairs

    const basisVector = new Array(dim).fill(0);
    basisVector[i] = 1;
    if (i !== swappedIdx) {
      basisVector[swappedIdx] = 1; // Symmetrize
    }
    const averaged = averageTensor(basisVector, group, rank, isAxial, isTimeOdd);

    let isNew = true;

    if (averaged.every(v => Math.abs(v) < EPSILON)) {
      isNew = false;
    } else {
      for (const existing of basisResults) {
        let ratio = 0;
        let match = true;
        for (let k = 0; k < dim; k++) {
          if (Math.abs(existing[k]) > EPSILON) {
            const r = averaged[k] / existing[k];
            if (ratio === 0) ratio = r;
            else if (Math.abs(r - ratio) > EPSILON) {
              match = false;
              break;
            }
          } else if (Math.abs(averaged[k]) > EPSILON) {
            match = false;
            break;
          }
        }
        if (match) {
          isNew = false;
          break;
        }
      }
    }

    if (isNew) {
      basisResults.push(averaged);
    }
  }

  return { basisResults, rank };
}

export interface SHGExpression {
  component: string;
  expression: string;
  relation?: string;
  rawPoly?: Map<string, Map<string, number>>;
}

export interface SHGResult {
  induced: SHGExpression[];
  source: SHGExpression[];
}

export interface SHGOptions {
  groupName: string;
  tensorType: TensorType;
  trType: TensorTimeReversal;
  thetaX?: number;
  thetaY?: number;
  labFrameDisplayMode?: 'EX_EY' | 'E0_THETA';
}

export function calculateSHGExpressions(options: SHGOptions): SHGResult {
  const { groupName, tensorType, trType, thetaX = 0, thetaY = 0, labFrameDisplayMode = 'EX_EY' } = options;
  const generators = GENERATORS[groupName];
  if (!generators) return { induced: [], source: [] };

  const group = getCachedFullGroup(groupName, generators);
  const rank = tensorType === 'EQ' ? 4 : 3;
  const isAxial = tensorType === 'MD';
  const isTimeOdd = trType === 'c';
  const dim = Math.pow(3, rank);

  const tLabels = ['x', 'y', 'z'];

  const cx = Math.cos(thetaX * Math.PI / 180);
  const sx = Math.sin(thetaX * Math.PI / 180);
  const cy = Math.cos(thetaY * Math.PI / 180);
  const sy = Math.sin(thetaY * Math.PI / 180);

  // R maps Crystal to Lab: V_lab = R * V_cryst
  const R = [
    [cy, sx * sy, cx * sy],
    [0, cx, -sx],
    [-sy, sx * cy, cx * cy]
  ];

  // E_vec_lab_in_cryst maps Lab E-field (E_X, E_Y, 0) to Crystal E-field
  // E_cryst_i = R_0i E_X + R_1i E_Y
  const E_vec_lab_in_cryst = [
    [R[0][0], R[1][0], 0],
    [R[0][1], R[1][1], 0],
    [R[0][2], R[1][2], 0]
  ];

  const E_vec_full = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];

  function multiplyLinear(A: number[], B: number[]): Record<string, number> {
    const res: Record<string, number> = { '00': 0, '11': 0, '22': 0, '01': 0, '02': 0, '12': 0 };
    for (let i=0; i<3; i++) {
      for (let m=0; m<3; m++) {
        const coeff = A[i] * B[m];
        if (Math.abs(coeff) > EPSILON) {
          const key = i <= m ? `${i}${m}` : `${m}${i}`;
          res[key] += coeff;
        }
      }
    }
    return res;
  }

  type Poly = Map<string, Map<string, number>>;

  function addPoly(a: Poly, b: Poly, scaleB: number = 1): Poly {
    const res: Poly = new Map();
    const add = (p: Poly, scale: number) => {
      for (const [chi, pairMap] of p.entries()) {
        if (!res.has(chi)) res.set(chi, new Map());
        const resPairMap = res.get(chi)!;
        for (const [pair, coeff] of pairMap.entries()) {
          resPairMap.set(pair, (resPairMap.get(pair) || 0) + coeff * scale);
        }
      }
    };
    add(a, 1);
    add(b, scaleB);
    return res;
  }

  function formatPoly(poly: Poly, isLabFrame: boolean = false): string {
    const finalParts: string[] = [];
    const sortedChis = Array.from(poly.keys()).sort();

    for (const chi of sortedChis) {
      const pairMap = poly.get(chi)!;
      const fieldParts: { pair: string, coeff: number }[] = [];
      const sortedPairs = Array.from(pairMap.keys()).sort();
      for (const pair of sortedPairs) {
        let coeff = pairMap.get(pair)!;
        if (Math.abs(coeff) > EPSILON) {
          fieldParts.push({ pair, coeff });
        }
      }

      if (fieldParts.length === 0) continue;

      const fieldLabels: Record<string, string> = isLabFrame ? (
        labFrameDisplayMode === 'E0_THETA' ? {
          '00': 'E_0^2 \\cos^2(\\theta_{pol})', '11': 'E_0^2 \\sin^2(\\theta_{pol})', '22': '0',
          '01': 'E_0^2 \\cos(\\theta_{pol}) \\sin(\\theta_{pol})', '02': '0', '12': '0'
        } : {
          '00': 'E_X^2', '11': 'E_Y^2', '22': 'E_Z^2',
          '01': 'E_X E_Y', '02': 'E_X E_Z', '12': 'E_Y E_Z'
        }
      ) : {
        '00': 'E_x^2', '11': 'E_y^2', '22': 'E_z^2',
        '01': 'E_x E_y', '02': 'E_x E_z', '12': 'E_y E_z'
      };

      if (fieldParts.length === 1) {
        const { pair, coeff } = fieldParts[0];
        const fieldStr = fieldLabels[pair];
        const sign = coeff < 0 ? "-" : "";
        finalParts.push(`${sign}${formatCoeff(coeff)}${chi}${fieldStr}`);
      } else {
        const innerExpr = fieldParts.map((fp, idx) => {
          const fieldStr = fieldLabels[fp.pair];
          const c = fp.coeff;
          const coeffStr = formatCoeff(c);
          if (idx === 0) {
            return `${c < 0 ? '-' : ''}${coeffStr}${fieldStr}`;
          } else {
            return `${c < 0 ? '-' : '+'} ${coeffStr}${fieldStr}`;
          }
        }).join(" ");
        finalParts.push(`${chi}(${innerExpr})`);
      }
    }
    return finalParts.length > 0 ? cleanupExpressionSigns(finalParts.join(" + ")) : "0";
  }

  const outputCount = tensorType === 'EQ' ? 9 : 3;
  const inducedPolys: Poly[] = [];
  const inducedPolysLab: Poly[] = [];
  const inducedExprs: SHGExpression[] = [];

  for (let outIdx = 0; outIdx < outputCount; outIdx++) {
    const outIndices = tensorType === 'EQ' ? [Math.floor(outIdx / 3), outIdx % 3] : [outIdx];
    const outLabel = tensorType === 'EQ' ? `Q_${tLabels[outIndices[0]]}${tLabels[outIndices[1]]}` : `${tensorType === 'ED' ? 'P' : 'M'}_${tLabels[outIndices[0]]}`;

    const terms: Poly = new Map();
    const termsTransverse: Poly = new Map();

    for (let j = 0; j < 3; j++) {
      for (let k = 0; k < 3; k++) {
        const fullIndices = [...outIndices, j, k];
        let flatIdx = 0;
        for (let r = 0; r < rank; r++) {
          flatIdx += fullIndices[r] * Math.pow(3, rank - 1 - r);
        }

        const swappedIndices = [...fullIndices];
        const temp = swappedIndices[rank - 1];
        swappedIndices[rank - 1] = swappedIndices[rank - 2];
        swappedIndices[rank - 2] = temp;

        let swappedIdx = 0;
        for (let r = 0; r < rank; r++) {
          swappedIdx += swappedIndices[r] * Math.pow(3, rank - 1 - r);
        }

        const basisVector = new Array(dim).fill(0);
        basisVector[flatIdx] = 1;
        if (flatIdx !== swappedIdx) {
          basisVector[swappedIdx] = 1;
        }
        const averaged = averageTensor(basisVector, group, rank, isAxial, isTimeOdd);

        let foundRelation: { label: string, coeff: number } | null = null;
        for (let i = 0; i < dim; i++) {
          if (Math.abs(averaged[i]) > EPSILON) {
            const label = getLabel(getIndices(i, rank));
            const coeff = averaged[flatIdx] / averaged[i];
            foundRelation = { label, coeff };
            break;
          }
        }

        if (foundRelation) {
          const polyFull = multiplyLinear(E_vec_full[j], E_vec_full[k]);
          for (const [pair, pCoeff] of Object.entries(polyFull)) {
            if (Math.abs(pCoeff) > EPSILON) {
              const totalCoeff = foundRelation.coeff * pCoeff;
              if (!terms.has(foundRelation.label)) terms.set(foundRelation.label, new Map());
              const pairMap = terms.get(foundRelation.label)!;
              pairMap.set(pair, (pairMap.get(pair) || 0) + totalCoeff);
            }
          }

          const polyLab = multiplyLinear(E_vec_lab_in_cryst[j], E_vec_lab_in_cryst[k]);
          for (const [pair, pCoeff] of Object.entries(polyLab)) {
            if (Math.abs(pCoeff) > EPSILON) {
              const totalCoeff = foundRelation.coeff * pCoeff;
              if (!termsTransverse.has(foundRelation.label)) termsTransverse.set(foundRelation.label, new Map());
              const pairMap = termsTransverse.get(foundRelation.label)!;
              pairMap.set(pair, (pairMap.get(pair) || 0) + totalCoeff);
            }
          }
        }
      }
    }

    inducedPolys.push(terms);
    inducedPolysLab.push(termsTransverse);
    inducedExprs.push({
      component: outLabel,
      expression: formatPoly(terms)
    });
  }

  const sourceExprs: SHGExpression[] = [];

  function formatRelation(coeffs: number[], labels: string[]): string {
    const parts: string[] = [];
    for (let i = 0; i < coeffs.length; i++) {
      const c = coeffs[i];
      if (Math.abs(c) > EPSILON) {
        const cStr = formatCoeff(c);
        const sign = c > 0 ? (parts.length === 0 ? "" : "+ ") : (parts.length === 0 ? "-" : "- ");
        parts.push(`${sign}${cStr}${labels[i]}`);
      }
    }
    return parts.length > 0 ? cleanupExpressionSigns(parts.join(" ")) : "0";
  }

  const tLabelsLab = ['X', 'Y', 'Z'];
  for (let I = 0; I < 3; I++) {
    const outLabel = `S_${tLabelsLab[I]}`;
    let sPoly: Poly = new Map();
    let relation = "";

    if (tensorType === 'ED') {
      const labels = ['P_x', 'P_y', 'P_z'];
      const coeffs = [0, 0, 0];

      for (let i = 0; i < 3; i++) {
        const coeff = R[I][i];
        coeffs[i] = coeff;
        sPoly = addPoly(sPoly, inducedPolysLab[i], coeff);
      }
      relation = formatRelation(coeffs, labels);
    } else if (tensorType === 'MD') {
      const labels = ['M_x', 'M_y', 'M_z'];
      const coeffs = [0, 0, 0];
      if (I === 0) {
        for (let i = 0; i < 3; i++) {
          const coeff = -R[1][i];
          coeffs[i] = coeff;
          sPoly = addPoly(sPoly, inducedPolysLab[i], coeff);
        }
      } else if (I === 1) {
        for (let i = 0; i < 3; i++) {
          const coeff = R[0][i];
          coeffs[i] = coeff;
          sPoly = addPoly(sPoly, inducedPolysLab[i], coeff);
        }
      }

      relation = formatRelation(coeffs, labels);
    } else if (tensorType === 'EQ') {
      const labels = ['Q_{xx}', 'Q_{xy}', 'Q_{xz}', 'Q_{yx}', 'Q_{yy}', 'Q_{yz}', 'Q_{zx}', 'Q_{zy}', 'Q_{zz}'];
      const coeffs = new Array(9).fill(0);

      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          const coeff = R[2][i] * R[I][j];
          const flatIdx = i * 3 + j;
          coeffs[flatIdx] = coeff;
          sPoly = addPoly(sPoly, inducedPolysLab[flatIdx], coeff);
        }
      }
      relation = formatRelation(coeffs, labels);
    }

    const expr = formatPoly(sPoly, true);
    sourceExprs.push({
      component: outLabel,
      expression: expr,
      relation,
      rawPoly: sPoly
    });
  }

  return {
    induced: inducedExprs,
    source: sourceExprs
  };
}

export interface LabFrameOptions {
  thetaX?: number;
  thetaY?: number;
}

export function getLabFrameVectors(options: LabFrameOptions = {}) {
  const { thetaX: tx = 0, thetaY: ty = 0 } = options;
  const cx = Math.cos(tx * Math.PI / 180);
  const sx = Math.sin(tx * Math.PI / 180);
  const cy = Math.cos(ty * Math.PI / 180);
  const sy = Math.sin(ty * Math.PI / 180);

  const formatVec = (v: number[]) => {
    const terms: string[] = [];
    const labels = ['X', 'Y', 'Z'];
    for (let i = 0; i < 3; i++) {
      if (Math.abs(v[i]) > AXIS_EPSILON) {
        const coeff = formatCoeff(v[i]);
        const sign = v[i] < 0 ? "-" : (terms.length > 0 ? "+" : "");
        terms.push(`${sign}${coeff}\\mathbf{${labels[i]}}_{LAB}`);
      }
    }
    return terms.length > 0 ? terms.join(" ") : "0";
  };

  // R maps Crystal to Lab: V_lab = R * V_cryst
  // So V_cryst = R^T * V_lab
  // x_crys = R_00 X_lab + R_10 Y_lab + R_20 Z_lab
  // y_crys = R_01 X_lab + R_11 Y_lab + R_21 Z_lab
  // z_crys = R_02 X_lab + R_12 Y_lab + R_22 Z_lab

  const x_crys = [cy, 0, -sy];
  const y_crys = [sx * sy, cx, sx * cy];
  const z_crys = [cx * sy, -sx, cx * cy];

  return {
    X: formatVec(x_crys),
    Y: formatVec(y_crys),
    Z: formatVec(z_crys)
  };
}
