/**
 * tensorService.ts
 * 
 * This service calculates the non-zero and independent components of a tensor
 * under the symmetry operations of a crystallographic point group.
 */

export type TensorType = 'ED' | 'MD' | 'EQ';
export type TensorTimeReversal = 'i' | 'c'; // i = time-even, c = time-odd

interface Matrix3x3 {
  m: number[][];
  isAntiUnitary?: boolean; // Combined with time reversal 1'
}

const identity: Matrix3x3 = {
  m: [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1]
  ]
};

const inversion: Matrix3x3 = {
  m: [
    [-1, 0, 0],
    [0, -1, 0],
    [0, 0, -1]
  ]
};

// Rotation matrices
function getRotationZ(angleDeg: number): Matrix3x3 {
  const rad = (angleDeg * Math.PI) / 180;
  const c = Math.cos(rad);
  const s = Math.sin(rad);
  return {
    m: [
      [c, -s, 0],
      [s, c, 0],
      [0, 0, 1]
    ]
  };
}

function getRotationX(angleDeg: number): Matrix3x3 {
  const rad = (angleDeg * Math.PI) / 180;
  const c = Math.cos(rad);
  const s = Math.sin(rad);
  return {
    m: [
      [1, 0, 0],
      [0, c, -s],
      [0, s, c]
    ]
  };
}

function getRotationY(angleDeg: number): Matrix3x3 {
  const rad = (angleDeg * Math.PI) / 180;
  const c = Math.cos(rad);
  const s = Math.sin(rad);
  return {
    m: [
      [c, 0, s],
      [0, 1, 0],
      [-s, 0, c]
    ]
  };
}

function multiply(a: Matrix3x3, b: Matrix3x3): Matrix3x3 {
  const res = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      for (let k = 0; k < 3; k++) {
        res[i][j] += a.m[i][k] * b.m[k][j];
      }
    }
  }
  return { 
    m: res, 
    isAntiUnitary: (a.isAntiUnitary || false) !== (b.isAntiUnitary || false) 
  };
}

function det(a: Matrix3x3): number {
  return a.m[0][0] * (a.m[1][1] * a.m[2][2] - a.m[1][2] * a.m[2][1]) -
         a.m[0][1] * (a.m[1][0] * a.m[2][2] - a.m[1][2] * a.m[2][0]) +
         a.m[0][2] * (a.m[1][0] * a.m[2][1] - a.m[1][1] * a.m[2][0]);
}

const timeReversal: Matrix3x3 = { ...identity, isAntiUnitary: true };

// Point Group Generators
const GENERATORS: Record<string, Matrix3x3[]> = {
  // Type I: Standard Point Groups
  "1": [identity],
  "-1": [inversion],
  "2": [getRotationZ(180)],
  "m": [{ m: [[1, 0, 0], [0, 1, 0], [0, 0, -1]] }],
  "2/m": [getRotationZ(180), inversion],
  "222": [getRotationZ(180), getRotationX(180)],
  "mm2": [getRotationZ(180), { m: [[-1, 0, 0], [0, 1, 0], [0, 0, 1]] }],
  "mmm": [getRotationZ(180), getRotationX(180), inversion],
  "4": [getRotationZ(90)],
  "-4": [multiply(getRotationZ(90), inversion)],
  "4/m": [getRotationZ(90), inversion],
  "422": [getRotationZ(90), getRotationX(180)],
  "4mm": [getRotationZ(90), { m: [[-1, 0, 0], [0, 1, 0], [0, 0, 1]] }],
  "-42m": [multiply(getRotationZ(90), inversion), getRotationX(180)],
  "4/mmm": [getRotationZ(90), getRotationX(180), inversion],
  "3": [getRotationZ(120)],
  "-3": [multiply(getRotationZ(120), inversion)],
  "32": [getRotationZ(120), getRotationX(180)],
  "3m": [getRotationZ(120), { m: [[-1, 0, 0], [0, 1, 0], [0, 0, 1]] }],
  "-3m": [getRotationZ(120), getRotationX(180), inversion],
  "6": [getRotationZ(60)],
  "-6": [multiply(getRotationZ(60), inversion)],
  "6/m": [getRotationZ(60), inversion],
  "622": [getRotationZ(60), getRotationX(180)],
  "6mm": [getRotationZ(60), { m: [[-1, 0, 0], [0, 1, 0], [0, 0, 1]] }],
  "-62m": [multiply(getRotationZ(60), inversion), getRotationX(180)],
  "6/mmm": [getRotationZ(60), getRotationX(180), inversion],
  "23": [getRotationZ(180), getRotationX(180), { m: [[0, 0, 1], [1, 0, 0], [0, 1, 0]] }],
  "m-3": [getRotationZ(180), getRotationX(180), { m: [[0, 0, 1], [1, 0, 0], [0, 1, 0]] }, inversion],
  "432": [getRotationZ(90), getRotationX(90), { m: [[0, 0, 1], [1, 0, 0], [0, 1, 0]] }],
  "-43m": [multiply(getRotationZ(90), inversion), { m: [[0, 0, 1], [1, 0, 0], [0, 1, 0]] }, { m: [[0, 1, 0], [1, 0, 0], [0, 0, 1]] }],
  "m-3m": [getRotationZ(90), getRotationX(90), { m: [[0, 0, 1], [1, 0, 0], [0, 1, 0]] }, inversion],

  // Type II: Gray Groups (G + 1'G)
  "11'": [timeReversal],
  "-11'": [inversion, timeReversal],
  "21'": [getRotationZ(180), timeReversal],
  "m1'": [{ m: [[1, 0, 0], [0, 1, 0], [0, 0, -1]] }, timeReversal],
  "2/m1'": [getRotationZ(180), inversion, timeReversal],
  "2221'": [getRotationZ(180), getRotationX(180), timeReversal],
  "mm21'": [getRotationZ(180), { m: [[-1, 0, 0], [0, 1, 0], [0, 0, 1]] }, timeReversal],
  "mmm1'": [getRotationZ(180), getRotationX(180), inversion, timeReversal],
  "41'": [getRotationZ(90), timeReversal],
  "-41'": [multiply(getRotationZ(90), inversion), timeReversal],
  "4/m1'": [getRotationZ(90), inversion, timeReversal],
  "4221'": [getRotationZ(90), getRotationX(180), timeReversal],
  "4mm1'": [getRotationZ(90), { m: [[-1, 0, 0], [0, 1, 0], [0, 0, 1]] }, timeReversal],
  "-42m1'": [multiply(getRotationZ(90), inversion), getRotationX(180), timeReversal],
  "4/mmm1'": [getRotationZ(90), getRotationX(180), inversion, timeReversal],
  "31'": [getRotationZ(120), timeReversal],
  "-31'": [multiply(getRotationZ(120), inversion), timeReversal],
  "321'": [getRotationZ(120), getRotationX(180), timeReversal],
  "3m1'": [getRotationZ(120), { m: [[-1, 0, 0], [0, 1, 0], [0, 0, 1]] }, timeReversal],
  "-3m1'": [getRotationZ(120), getRotationX(180), inversion, timeReversal],
  "61'": [getRotationZ(60), timeReversal],
  "-61'": [multiply(getRotationZ(60), inversion), timeReversal],
  "6/m1'": [getRotationZ(60), inversion, timeReversal],
  "6221'": [getRotationZ(60), getRotationX(180), timeReversal],
  "6mm1'": [getRotationZ(60), { m: [[-1, 0, 0], [0, 1, 0], [0, 0, 1]] }, timeReversal],
  "-62m1'": [multiply(getRotationZ(60), inversion), getRotationX(180), timeReversal],
  "6/mmm1'": [getRotationZ(60), getRotationX(180), inversion, timeReversal],
  "231'": [getRotationZ(180), getRotationX(180), { m: [[0, 0, 1], [1, 0, 0], [0, 1, 0]] }, timeReversal],
  "m-31'": [getRotationZ(180), getRotationX(180), { m: [[0, 0, 1], [1, 0, 0], [0, 1, 0]] }, inversion, timeReversal],
  "4321'": [getRotationZ(90), getRotationX(90), { m: [[0, 0, 1], [1, 0, 0], [0, 1, 0]] }, timeReversal],
  "-43m1'": [multiply(getRotationZ(90), inversion), { m: [[0, 0, 1], [1, 0, 0], [0, 1, 0]] }, { m: [[0, 1, 0], [1, 0, 0], [0, 0, 1]] }, timeReversal],
  "m-3m1'": [getRotationZ(90), getRotationX(90), { m: [[0, 0, 1], [1, 0, 0], [0, 1, 0]] }, inversion, timeReversal],

  // Type III: Black-and-White Groups (H + 1'(G-H))
  "-1'": [multiply(inversion, timeReversal)],
  "2'": [multiply(getRotationZ(180), timeReversal)],
  "m'": [multiply({ m: [[1, 0, 0], [0, 1, 0], [0, 0, -1]] }, timeReversal)],
  "2'/m'": [multiply(getRotationZ(180), timeReversal), inversion],
  "2/m'": [getRotationZ(180), multiply(inversion, timeReversal)],
  "2'/m": [multiply(getRotationZ(180), timeReversal), multiply(inversion, timeReversal)],
  "2'2'2": [getRotationZ(180), multiply(getRotationX(180), timeReversal)],
  "m'm'2": [getRotationZ(180), multiply({ m: [[-1, 0, 0], [0, 1, 0], [0, 0, 1]] }, timeReversal)],
  "2'm'm": [multiply(getRotationZ(180), timeReversal), multiply({ m: [[-1, 0, 0], [0, 1, 0], [0, 0, 1]] }, timeReversal)],
  "m'm'm'": [getRotationZ(180), getRotationX(180), multiply(inversion, timeReversal)],
  "mmm'": [getRotationZ(180), inversion, multiply(getRotationX(180), timeReversal)],
  "m'm'm": [getRotationZ(180), { m: [[-1, 0, 0], [0, 1, 0], [0, 0, 1]] }, multiply(inversion, timeReversal)],
  "4'": [multiply(getRotationZ(90), timeReversal)],
  "-4'": [multiply(multiply(getRotationZ(90), inversion), timeReversal)],
  "4'/m'": [multiply(getRotationZ(90), timeReversal), multiply(inversion, timeReversal)],
  "4/m'": [getRotationZ(90), multiply(inversion, timeReversal)],
  "4'/m": [multiply(getRotationZ(90), timeReversal), inversion],
  "4'22'": [multiply(getRotationZ(90), timeReversal), getRotationX(180)],
  "42'2'": [getRotationZ(90), multiply(getRotationX(180), timeReversal)],
  "4'mm'": [multiply(getRotationZ(90), timeReversal), { m: [[-1, 0, 0], [0, 1, 0], [0, 0, 1]] }],
  "4m'm'": [getRotationZ(90), multiply({ m: [[-1, 0, 0], [0, 1, 0], [0, 0, 1]] }, timeReversal)],
  "-4'2m'": [multiply(multiply(getRotationZ(90), inversion), timeReversal), getRotationX(180)],
  "-4'2'm": [multiply(multiply(getRotationZ(90), inversion), timeReversal), multiply(getRotationX(180), timeReversal)],
  "-42'm'": [multiply(getRotationZ(90), inversion), multiply(getRotationX(180), timeReversal)],
  "4/m'm'm'": [getRotationZ(90), getRotationX(180), multiply(inversion, timeReversal)],
  "4/m'mm": [getRotationZ(90), { m: [[-1, 0, 0], [0, 1, 0], [0, 0, 1]] }, multiply(inversion, timeReversal)],
  "4'/mmm'": [multiply(getRotationZ(90), timeReversal), getRotationX(180), inversion],
  "4'/m'm'm": [multiply(getRotationZ(90), timeReversal), { m: [[-1, 0, 0], [0, 1, 0], [0, 0, 1]] }, multiply(inversion, timeReversal)],
  "4/mm'm'": [getRotationZ(90), inversion, multiply(getRotationX(180), timeReversal)],
  "-3'": [getRotationZ(120), multiply(inversion, timeReversal)],
  "32'": [getRotationZ(120), multiply(getRotationX(180), timeReversal)],
  "3m'": [getRotationZ(120), multiply({ m: [[-1, 0, 0], [0, 1, 0], [0, 0, 1]] }, timeReversal)],
  "-3'm'": [getRotationZ(120), multiply(getRotationX(180), timeReversal), multiply(inversion, timeReversal)],
  "-3'm": [getRotationZ(120), { m: [[-1, 0, 0], [0, 1, 0], [0, 0, 1]] }, multiply(inversion, timeReversal)],
  "-3m'": [getRotationZ(120), inversion, multiply(getRotationX(180), timeReversal)],
  "6'": [multiply(getRotationZ(60), timeReversal)],
  "-6'": [multiply(multiply(getRotationZ(60), inversion), timeReversal)],
  "6'/m'": [multiply(getRotationZ(60), timeReversal), multiply(inversion, timeReversal)],
  "6/m'": [getRotationZ(60), multiply(inversion, timeReversal)],
  "6'/m": [multiply(getRotationZ(60), timeReversal), inversion],
  "6'22'": [multiply(getRotationZ(60), timeReversal), getRotationX(180)],
  "62'2'": [getRotationZ(60), multiply(getRotationX(180), timeReversal)],
  "6'mm'": [multiply(getRotationZ(60), timeReversal), { m: [[-1, 0, 0], [0, 1, 0], [0, 0, 1]] }],
  "6m'm'": [getRotationZ(60), multiply({ m: [[-1, 0, 0], [0, 1, 0], [0, 0, 1]] }, timeReversal)],
  "-6'2m'": [multiply(multiply(getRotationZ(60), inversion), timeReversal), getRotationX(180)],
  "-6'm2'": [multiply(multiply(getRotationZ(60), inversion), timeReversal), { m: [[-1, 0, 0], [0, 1, 0], [0, 0, 1]] }],
  "-6m'2'": [multiply(getRotationZ(60), inversion), multiply({ m: [[-1, 0, 0], [0, 1, 0], [0, 0, 1]] }, timeReversal)],
  "6/m'm'm'": [getRotationZ(60), getRotationX(180), multiply(inversion, timeReversal)],
  "6/m'mm": [getRotationZ(60), { m: [[-1, 0, 0], [0, 1, 0], [0, 0, 1]] }, multiply(inversion, timeReversal)],
  "6'/mmm'": [multiply(getRotationZ(60), timeReversal), getRotationX(180), inversion],
  "6'/m'mm'": [multiply(getRotationZ(60), timeReversal), { m: [[-1, 0, 0], [0, 1, 0], [0, 0, 1]] }, multiply(inversion, timeReversal)],
  "6/mm'm'": [getRotationZ(60), inversion, multiply(getRotationX(180), timeReversal)],
  "m'3": [getRotationZ(180), getRotationX(180), { m: [[0, 0, 1], [1, 0, 0], [0, 1, 0]] }, multiply(inversion, timeReversal)],
  "4'32'": [getRotationZ(180), getRotationX(180), { m: [[0, 0, 1], [1, 0, 0], [0, 1, 0]] }, multiply(getRotationZ(90), timeReversal)],
  "-4'3m'": [getRotationZ(180), getRotationX(180), { m: [[0, 0, 1], [1, 0, 0], [0, 1, 0]] }, multiply(multiply(getRotationZ(90), inversion), timeReversal)],
  "m'3m'": [multiply(getRotationZ(90), timeReversal), { m: [[0, 0, 1], [1, 0, 0], [0, 1, 0]] }, multiply(inversion, timeReversal)],
  "m'3m": [getRotationZ(90), { m: [[0, 0, 1], [1, 0, 0], [0, 1, 0]] }, multiply(inversion, timeReversal)],
  "m3m'": [inversion, { m: [[0, 0, 1], [1, 0, 0], [0, 1, 0]] }, multiply(getRotationZ(90), timeReversal)],
};

function getFullGroup(generators: Matrix3x3[]): Matrix3x3[] {
  const group = [...generators];
  let changed = true;
  while (changed) {
    changed = false;
    const currentSize = group.length;
    for (let i = 0; i < currentSize; i++) {
      for (let j = 0; j < currentSize; j++) {
        const prod = multiply(group[i], group[j]);
        if (!group.some(m => isSameMatrix(m, prod))) {
          group.push(prod);
          changed = true;
        }
      }
    }
  }
  return group;
}

function isSameMatrix(a: Matrix3x3, b: Matrix3x3): boolean {
  if ((a.isAntiUnitary || false) !== (b.isAntiUnitary || false)) return false;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (Math.abs(a.m[i][j] - b.m[i][j]) > 1e-6) return false;
    }
  }
  return true;
}

export function calculateTensorComponents(groupName: string, tensorType: 'ED' | 'MD' | 'EQ', trType: TensorTimeReversal): string[] {
  const generators = GENERATORS[groupName];
  if (!generators) return ["Point group not supported."];

  const group = getFullGroup(generators);
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
    const epsilon = 1e-6;
    
    if (averaged.every(v => Math.abs(v) < epsilon)) {
      isNew = false;
    } else {
      for (const existing of basisResults) {
        let ratio = 0;
        let match = true;
        for (let k = 0; k < dim; k++) {
          if (Math.abs(existing[k]) > epsilon) {
            const r = averaged[k] / existing[k];
            if (ratio === 0) ratio = r;
            else if (Math.abs(r - ratio) > epsilon) {
              match = false;
              break;
            }
          } else if (Math.abs(averaged[k]) > epsilon) {
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

  return formatResults(basisResults, rank, isTimeOdd);
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
      if (Math.abs(tensor[jdx]) < 1e-6) continue;
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

function getIndices(idx: number, rank: number): number[] {
  const indices = [];
  let temp = idx;
  for (let i = 0; i < rank; i++) {
    indices.unshift(temp % 3);
    temp = Math.floor(temp / 3);
  }
  return indices;
}

function getLabel(indices: number[]): string {
  const chars = ['x', 'y', 'z'];
  return '\\chi_{' + indices.map(i => chars[i]).join('') + '}';
}

export function isCentrosymmetric(groupName: string): boolean {
  const generators = GENERATORS[groupName];
  if (!generators) return false;
  const group = getFullGroup(generators);
  return group.some(m => isSameMatrix(m, inversion));
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

export function formatSubstitutedPoly(
  poly: Map<string, Map<string, number>>,
  mode: 'THETA' | 'ZERO' | 'NINETY',
  scale: number = 1,
  multiplyTrig?: '\\cos\\theta' | '\\sin\\theta'
): string {
  const finalParts: string[] = [];
  const sortedChis = Array.from(poly.keys()).sort();
  const epsilon = 1e-6;

  for (const chi of sortedChis) {
    const pairMap = poly.get(chi)!;
    const fieldParts: { pair: string, coeff: number }[] = [];
    const sortedPairs = Array.from(pairMap.keys()).sort();
    for (const pair of sortedPairs) {
      let coeff = pairMap.get(pair)! * scale;
      if (Math.abs(coeff) > epsilon) {
        if (mode === 'ZERO' && pair !== '00') continue;
        if (mode === 'NINETY' && pair !== '11') continue;
        fieldParts.push({ pair, coeff });
      }
    }
    
    if (fieldParts.length === 0) continue;

    let fieldLabels: Record<string, string>;
    
    if (mode === 'THETA') {
      if (multiplyTrig === '\\cos\\theta') {
        fieldLabels = {
          '00': '\\cos^3\\theta', '11': '\\cos\\theta \\sin^2\\theta', '22': '0',
          '01': '\\cos^2\\theta \\sin\\theta', '02': '0', '12': '0'
        };
      } else if (multiplyTrig === '\\sin\\theta') {
        fieldLabels = {
          '00': '\\cos^2\\theta \\sin\\theta', '11': '\\sin^3\\theta', '22': '0',
          '01': '\\cos\\theta \\sin^2\\theta', '02': '0', '12': '0'
        };
      } else {
        fieldLabels = {
          '00': '\\cos^2\\theta', '11': '\\sin^2\\theta', '22': '0',
          '01': '\\cos\\theta \\sin\\theta', '02': '0', '12': '0'
        };
      }
    } else {
      const multiplied = multiplyTrig ? multiplyTrig : '1';
      fieldLabels = {
        '00': multiplied, '11': multiplied, '22': '0',
        '01': '0', '02': '0', '12': '0'
      };
    }

    if (fieldParts.length === 1) {
      const { pair, coeff } = fieldParts[0];
      const fieldStr = fieldLabels[pair];
      const sign = coeff < 0 ? "-" : "";
      const displayFieldStr = fieldStr === '1' ? '' : ` ${fieldStr}`;
      finalParts.push(`${sign}${formatCoeff(coeff)}${chi} E_0^2${displayFieldStr}`);
    } else {
      const innerExpr = fieldParts.map((fp, idx) => {
        const fieldStr = fieldLabels[fp.pair];
        const c = fp.coeff;
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
  return finalParts.length > 0 ? finalParts.join(" + ").replace(/\+ -/g, "- ") : "0";
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
  const epsilon = 1e-6;
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
        if (Math.abs(baseCoeff) > epsilon) {
          if (mode === 'ZERO' && pair !== '00') continue;
          if (mode === 'NINETY' && pair !== '11') continue;
          
          const pMappings = powerMappings[pair] || [];
          for (const mapping of pMappings) {
            const coeff = baseCoeff * mapping.factor;
            if (Math.abs(coeff) > epsilon) {
              powerChiTerms.push({ coeff, fieldStr: mapping.harmonic });
            }
          }

          const hMappings = harmonicMappings[pair] || [];
          for (const mapping of hMappings) {
            const coeff = baseCoeff * mapping.factor;
            if (Math.abs(coeff) > epsilon) {
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
        if (Math.abs(coeff) > epsilon) {
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
  return finalParts.length > 0 ? finalParts.join(" + ").replace(/\+ -/g, "- ") : "0";
}

export function formatCoeff(c: number): string {
  const absC = Math.abs(c);
  if (absC < 1e-5) return "0";
  
  const rounded = Math.round(absC);
  if (Math.abs(absC - rounded) < 1e-5) {
    if (rounded === 1) return "";
    return rounded.toString();
  }
  
  for (let d = 2; d <= 8; d++) {
    const num = Math.round(absC * d);
    if (Math.abs(absC - num / d) < 1e-5) {
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
    if (Math.abs(absC - frac.val) < 1e-5) return frac.str;
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
    if (Math.abs(absC - root.val) < 1e-4) return root.str;
  }

  return Number(absC.toFixed(3)).toString();
}

export function calculateSHGExpressions(
  groupName: string,
  tensorType: TensorType,
  trType: TensorTimeReversal,
  thetaX: number = 0,
  thetaY: number = 0,
  labFrameDisplayMode: 'EX_EY' | 'E0_THETA' = 'EX_EY'
): SHGResult {
  const generators = GENERATORS[groupName];
  if (!generators) return { induced: [], source: [] };

  const group = getFullGroup(generators);
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
        if (Math.abs(coeff) > 1e-6) {
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
    const epsilon = 1e-6;

    for (const chi of sortedChis) {
      const pairMap = poly.get(chi)!;
      const fieldParts: { pair: string, coeff: number }[] = [];
      const sortedPairs = Array.from(pairMap.keys()).sort();
      for (const pair of sortedPairs) {
        let coeff = pairMap.get(pair)!;
        if (Math.abs(coeff) > epsilon) {
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
    return finalParts.length > 0 ? finalParts.join(" + ").replace(/\+ -/g, "- ") : "0";
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
          if (Math.abs(averaged[i]) > 1e-6) {
            const label = getLabel(getIndices(i, rank));
            const coeff = averaged[flatIdx] / averaged[i];
            foundRelation = { label, coeff };
            break;
          }
        }

        if (foundRelation) {
          const polyFull = multiplyLinear(E_vec_full[j], E_vec_full[k]);
          for (const [pair, pCoeff] of Object.entries(polyFull)) {
            if (Math.abs(pCoeff) > 1e-6) {
              const totalCoeff = foundRelation.coeff * pCoeff;
              if (!terms.has(foundRelation.label)) terms.set(foundRelation.label, new Map());
              const pairMap = terms.get(foundRelation.label)!;
              pairMap.set(pair, (pairMap.get(pair) || 0) + totalCoeff);
            }
          }

          const polyLab = multiplyLinear(E_vec_lab_in_cryst[j], E_vec_lab_in_cryst[k]);
          for (const [pair, pCoeff] of Object.entries(polyLab)) {
            if (Math.abs(pCoeff) > 1e-6) {
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
      if (Math.abs(c) > 1e-6) {
        const cStr = formatCoeff(c);
        const sign = c > 0 ? (parts.length === 0 ? "" : "+ ") : (parts.length === 0 ? "-" : "- ");
        parts.push(`${sign}${cStr}${labels[i]}`);
      }
    }
    return parts.length > 0 ? parts.join(" ").replace(/\+ -/g, "- ") : "0";
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

function formatResults(basisResults: number[][], rank: number, isTimeOdd: boolean): string[] {
  const dim = Math.pow(3, rank);
  const output: string[] = [];
  const epsilon = 1e-6;

  for (const basis of basisResults) {
    const members: string[] = [];
    let leadIdx = -1;
    const addedLabels = new Set<string>();
    
    for (let i = 0; i < dim; i++) {
      if (Math.abs(basis[i]) > epsilon) {
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

export function getSymmetryOperations(groupName: string): string[] {
  const generators = GENERATORS[groupName];
  if (!generators) return [];
  const group = getFullGroup(generators);
  
  const symbols = group.map(m => {
    const { m: mat, isAntiUnitary } = m;
    const tr = Math.round(mat[0][0] + mat[1][1] + mat[2][2]);
    const d = Math.round(det(m));
    const prime = isAntiUnitary ? "'" : "";
    let base = "";
    let axis = "";
    let sign = "";

    const formatAxis = (x: number, y: number, z: number) => {
      const max = Math.max(Math.abs(x), Math.abs(y), Math.abs(z));
      if (max < 1e-5) return "";
      let nx = x / max;
      let ny = y / max;
      let nz = z / max;
      
      if (nx < -1e-5 || (Math.abs(nx) < 1e-5 && ny < -1e-5) || (Math.abs(nx) < 1e-5 && Math.abs(ny) < 1e-5 && nz < -1e-5)) {
        nx = -nx; ny = -ny; nz = -nz;
      }
      
      if (Math.abs(nx - 1) < 1e-3 && Math.abs(ny) < 1e-3 && Math.abs(nz) < 1e-3) return "x";
      if (Math.abs(nx) < 1e-3 && Math.abs(ny - 1) < 1e-3 && Math.abs(nz) < 1e-3) return "y";
      if (Math.abs(nx) < 1e-3 && Math.abs(ny) < 1e-3 && Math.abs(nz - 1) < 1e-3) return "z";
      
      if (Math.abs(nz) < 1e-3) {
        let angle = Math.round(Math.atan2(ny, nx) * 180 / Math.PI);
        if (angle < 0) angle += 180;
        if (angle === 180) angle = 0;
        return `${angle}°`;
      }

      let bestMult = 1;
      let minError = 100;
      for (let mult = 1; mult <= 6; mult++) {
         const err = Math.abs(nx*mult - Math.round(nx*mult)) + 
                     Math.abs(ny*mult - Math.round(ny*mult)) + 
                     Math.abs(nz*mult - Math.round(nz*mult));
         if (err < minError) {
            minError = err;
            bestMult = mult;
         }
      }
      
      let rx, ry, rz;
      if (minError < 0.1) {
         rx = Math.round(nx * bestMult);
         ry = Math.round(ny * bestMult);
         rz = Math.round(nz * bestMult);
         const formatNum = (n: number) => n < 0 ? `-${Math.abs(n)}` : `${n}`;
         return `[${formatNum(rx)}${formatNum(ry)}${formatNum(rz)}]`;
      } else {
         rx = Number(nx.toFixed(2));
         ry = Number(ny.toFixed(2));
         rz = Number(nz.toFixed(2));
         return `[${rx},${ry},${rz}]`;
      }
    };

    if (d === 1) {
      if (tr === 3) return "1" + prime;
      if (tr === 2) base = "6";
      if (tr === 1) base = "4";
      if (tr === 0) base = "3";
      if (tr === -1) base = "2";

      if (base === "2") {
        const rx = mat[0][0] + 1, ry = mat[1][0], rz = mat[2][0];
        const cx = mat[0][1], cy = mat[1][1] + 1, cz = mat[2][1];
        const bx = mat[0][2], by = mat[1][2], bz = mat[2][2] + 1;
        let ax=0, ay=0, az=0;
        if (Math.abs(rx)>1e-5 || Math.abs(ry)>1e-5 || Math.abs(rz)>1e-5) { ax=rx; ay=ry; az=rz; }
        else if (Math.abs(cx)>1e-5 || Math.abs(cy)>1e-5 || Math.abs(cz)>1e-5) { ax=cx; ay=cy; az=cz; }
        else { ax=bx; ay=by; az=bz; }
        axis = formatAxis(ax, ay, az);
      } else {
        const vx = mat[2][1] - mat[1][2];
        const vy = mat[0][2] - mat[2][0];
        const vz = mat[1][0] - mat[0][1];
        axis = formatAxis(vx, vy, vz);
        
        let nx = 0, ny = 0, nz = 0;
        if (axis === "x") nx = 1;
        else if (axis === "y") ny = 1;
        else if (axis === "z") nz = 1;
        else if (axis.includes("°")) {
          const angle = parseInt(axis) * Math.PI / 180;
          nx = Math.cos(angle);
          ny = Math.sin(angle);
        } else {
          const match = axis.match(/\[(-?\d)(-?\d)(-?\d)\]/);
          if (match) {
            nx = parseInt(match[1]);
            ny = parseInt(match[2]);
            nz = parseInt(match[3]);
          }
        }
        
        const dot = vx * nx + vy * ny + vz * nz;
        if (dot > 1e-5) sign = "⁺";
        else if (dot < -1e-5) sign = "⁻";
      }
    } else {
      if (tr === -3) return "-1" + prime;
      if (tr === -2) base = "-6";
      if (tr === -1) base = "-4";
      if (tr === 0) base = "-3";
      if (tr === 1) base = "m";

      if (base === "m") {
        const rx = 1 - mat[0][0], ry = -mat[1][0], rz = -mat[2][0];
        const cx = -mat[0][1], cy = 1 - mat[1][1], cz = -mat[2][1];
        const bx = -mat[0][2], by = -mat[1][2], bz = 1 - mat[2][2];
        let ax=0, ay=0, az=0;
        if (Math.abs(rx)>1e-5 || Math.abs(ry)>1e-5 || Math.abs(rz)>1e-5) { ax=rx; ay=ry; az=rz; }
        else if (Math.abs(cx)>1e-5 || Math.abs(cy)>1e-5 || Math.abs(cz)>1e-5) { ax=cx; ay=cy; az=cz; }
        else { ax=bx; ay=by; az=bz; }
        axis = formatAxis(ax, ay, az);
      } else {
        const vx = -(mat[2][1] - mat[1][2]);
        const vy = -(mat[0][2] - mat[2][0]);
        const vz = -(mat[1][0] - mat[0][1]);
        axis = formatAxis(vx, vy, vz);
        
        let nx = 0, ny = 0, nz = 0;
        if (axis === "x") nx = 1;
        else if (axis === "y") ny = 1;
        else if (axis === "z") nz = 1;
        else if (axis.includes("°")) {
          const angle = parseInt(axis) * Math.PI / 180;
          nx = Math.cos(angle);
          ny = Math.sin(angle);
        } else {
          const match = axis.match(/\[(-?\d)(-?\d)(-?\d)\]/);
          if (match) {
            nx = parseInt(match[1]);
            ny = parseInt(match[2]);
            nz = parseInt(match[3]);
          }
        }
        
        const dot = vx * nx + vy * ny + vz * nz;
        if (dot > 1e-5) sign = "⁺";
        else if (dot < -1e-5) sign = "⁻";
      }
    }

    return `${base}${axis ? '_' + axis : ''}${sign}${prime}`;
  });

  const order = ["1", "-1", "2", "3", "4", "6", "-3", "-4", "-6", "m"];
  return symbols.sort((a, b) => {
    const getBase = (s: string) => s.replace(/_.*$/, '').replace(/[⁺⁻']/, '');
    const baseA = getBase(a);
    const baseB = getBase(b);
    const idxA = order.indexOf(baseA);
    const idxB = order.indexOf(baseB);
    if (idxA !== idxB) return idxA - idxB;
    
    const getAxis = (s: string) => {
      const match = s.match(/_([a-z\[\]0-9-°]+)/);
      return match ? match[1] : "";
    };
    const axisA = getAxis(a);
    const axisB = getAxis(b);
    if (axisA !== axisB) return axisA.localeCompare(axisB);
    
    const getSign = (s: string) => {
      if (s.includes("⁺")) return 1;
      if (s.includes("⁻")) return -1;
      return 0;
    };
    const signA = getSign(a);
    const signB = getSign(b);
    if (signA !== signB) return signB - signA;
    
    const primeA = a.includes("'") ? 1 : 0;
    const primeB = b.includes("'") ? 1 : 0;
    return primeA - primeB;
  });
}

export function getLabFrameVectors(tx: number, ty: number) {
  const cx = Math.cos(tx * Math.PI / 180);
  const sx = Math.sin(tx * Math.PI / 180);
  const cy = Math.cos(ty * Math.PI / 180);
  const sy = Math.sin(ty * Math.PI / 180);

  const formatVec = (v: number[]) => {
    const terms = [];
    const labels = ['X', 'Y', 'Z'];
    for (let i = 0; i < 3; i++) {
      if (Math.abs(v[i]) > 1e-5) {
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
