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
  "2/m'": [getRotationZ(180), multiply(inversion, timeReversal)],
  "2'/m": [multiply(getRotationZ(180), timeReversal), inversion],
  "2'/m'": [multiply(getRotationZ(180), timeReversal), multiply(inversion, timeReversal)],
  "222'": [getRotationZ(180), multiply(getRotationX(180), timeReversal)],
  "mm'2": [getRotationZ(180), multiply({ m: [[-1, 0, 0], [0, 1, 0], [0, 0, 1]] }, timeReversal)],
  "m'm'2": [multiply({ m: [[-1, 0, 0], [0, 1, 0], [0, 0, 1]] }, timeReversal), multiply({ m: [[1, 0, 0], [0, -1, 0], [0, 0, 1]] }, timeReversal)],
  "mmm'": [getRotationZ(180), getRotationX(180), multiply(inversion, timeReversal)],
  "4'": [multiply(getRotationZ(90), timeReversal)],
  "-4'": [multiply(multiply(getRotationZ(90), inversion), timeReversal)],
  "4/m'": [getRotationZ(90), multiply(inversion, timeReversal)],
  "4'/m": [multiply(getRotationZ(90), timeReversal), inversion],
  "4'/m'": [multiply(getRotationZ(90), timeReversal), multiply(inversion, timeReversal)],
  "42'2'": [getRotationZ(90), multiply(getRotationX(180), timeReversal)],
  "4'22'": [multiply(getRotationZ(90), timeReversal), multiply(getRotationX(180), timeReversal)],
  "4m'm'": [getRotationZ(90), multiply({ m: [[-1, 0, 0], [0, 1, 0], [0, 0, 1]] }, timeReversal)],
  "4'mm'": [multiply(getRotationZ(90), timeReversal), multiply({ m: [[-1, 0, 0], [0, 1, 0], [0, 0, 1]] }, timeReversal)],
  "-42'm'": [multiply(getRotationZ(90), inversion), multiply(getRotationX(180), timeReversal)],
  "-4'2m'": [multiply(multiply(getRotationZ(90), inversion), timeReversal), multiply(getRotationX(180), timeReversal)],
  "-4'2'm": [multiply(multiply(getRotationZ(90), inversion), timeReversal), getRotationX(180)],
  "4/mmm'": [getRotationZ(90), getRotationX(180), multiply(inversion, timeReversal)],
  "4'/mmm": [multiply(getRotationZ(90), timeReversal), getRotationX(180), inversion],
  "4/m'mm": [getRotationZ(90), multiply(getRotationX(180), timeReversal), inversion],
  "4'/m'mm'": [multiply(getRotationZ(90), timeReversal), multiply(inversion, timeReversal), multiply(getRotationX(180), timeReversal)],
  "32'": [getRotationZ(120), multiply(getRotationX(180), timeReversal)],
  "3m'": [getRotationZ(120), multiply({ m: [[-1, 0, 0], [0, 1, 0], [0, 0, 1]] }, timeReversal)],
  "-3m'": [getRotationZ(120), getRotationX(180), multiply(inversion, timeReversal)],
  "-3'm": [multiply(multiply(getRotationZ(120), inversion), timeReversal), getRotationX(180)],
  "-3'm'": [multiply(multiply(getRotationZ(120), inversion), timeReversal), multiply(getRotationX(180), timeReversal)],
  "6'": [multiply(getRotationZ(60), timeReversal)],
  "-6'": [multiply(multiply(getRotationZ(60), inversion), timeReversal)],
  "6/m'": [getRotationZ(60), multiply(inversion, timeReversal)],
  "6'/m": [multiply(getRotationZ(60), timeReversal), inversion],
  "6'/m'": [multiply(getRotationZ(60), timeReversal), multiply(inversion, timeReversal)],
  "62'2'": [getRotationZ(60), multiply(getRotationX(180), timeReversal)],
  "6'22'": [multiply(getRotationZ(60), timeReversal), multiply(getRotationX(180), timeReversal)],
  "6m'm'": [getRotationZ(60), multiply({ m: [[-1, 0, 0], [0, 1, 0], [0, 0, 1]] }, timeReversal)],
  "6'mm'": [multiply(getRotationZ(60), timeReversal), multiply({ m: [[-1, 0, 0], [0, 1, 0], [0, 0, 1]] }, timeReversal)],
  "-62'm'": [multiply(getRotationZ(60), inversion), multiply(getRotationX(180), timeReversal)],
  "-6'2m": [multiply(multiply(getRotationZ(60), inversion), timeReversal), getRotationX(180)],
  "-6'2'm'": [multiply(multiply(getRotationZ(60), inversion), timeReversal), multiply(getRotationX(180), timeReversal)],
  "6/mmm'": [getRotationZ(60), getRotationX(180), multiply(inversion, timeReversal)],
  "6'/mmm": [multiply(getRotationZ(60), timeReversal), getRotationX(180), inversion],
  "6/m'mm": [getRotationZ(60), multiply(getRotationX(180), timeReversal), inversion],
  "6'/m'mm'": [multiply(getRotationZ(60), timeReversal), multiply(inversion, timeReversal), multiply(getRotationX(180), timeReversal)],
  "m'3": [getRotationZ(180), getRotationX(180), { m: [[0, 0, 1], [1, 0, 0], [0, 1, 0]] }, multiply(inversion, timeReversal)],
  "432'": [getRotationZ(90), getRotationX(90), { m: [[0, 0, 1], [1, 0, 0], [0, 1, 0]] }, multiply(getRotationX(180), timeReversal)],
  "-43m'": [multiply(getRotationZ(90), inversion), { m: [[0, 0, 1], [1, 0, 0], [0, 1, 0]] }, multiply({ m: [[0, 1, 0], [1, 0, 0], [0, 0, 1]] }, timeReversal)],
  "m-3m'": [getRotationZ(90), getRotationX(90), { m: [[0, 0, 1], [1, 0, 0], [0, 1, 0]] }, multiply(inversion, timeReversal)],
  "m'3m": [getRotationZ(90), getRotationX(90), { m: [[0, 0, 1], [1, 0, 0], [0, 1, 0]] }, multiply({ m: [[-1, 0, 0], [0, 1, 0], [0, 0, 1]] }, timeReversal), inversion],
  "m'3m'": [getRotationZ(90), getRotationX(90), { m: [[0, 0, 1], [1, 0, 0], [0, 1, 0]] }, multiply({ m: [[-1, 0, 0], [0, 1, 0], [0, 0, 1]] }, timeReversal), multiply(inversion, timeReversal)],
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
  const sortedIndices = [...indices];
  if (sortedIndices.length >= 2) {
    const last = sortedIndices.pop()!;
    const secondLast = sortedIndices.pop()!;
    if (last < secondLast) {
      sortedIndices.push(last, secondLast);
    } else {
      sortedIndices.push(secondLast, last);
    }
  }
  return '\\chi_{' + sortedIndices.map(i => chars[i]).join('') + '}';
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
}

export interface SHGResult {
  induced: SHGExpression[];
  source: SHGExpression[];
}

export function calculateSHGExpressions(
  groupName: string,
  tensorType: TensorType,
  trType: TensorTimeReversal,
  thetaX: number = 0,
  thetaY: number = 0
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

      const fieldLabels: Record<string, string> = isLabFrame ? { 
        '00': 'E_X^2', '11': 'E_Y^2', '22': 'E_Z^2', 
        '01': 'E_X E_Y', '02': 'E_X E_Z', '12': 'E_Y E_Z' 
      } : { 
        '00': 'E_x^2', '11': 'E_y^2', '22': 'E_z^2', 
        '01': 'E_x E_y', '02': 'E_x E_z', '12': 'E_y E_z' 
      };

      if (fieldParts.length === 1) {
        const { pair, coeff } = fieldParts[0];
        const fieldStr = fieldLabels[pair];
        if (Math.abs(coeff - 1) < epsilon) finalParts.push(`${chi}${fieldStr}`);
        else if (Math.abs(coeff + 1) < epsilon) finalParts.push(`-${chi}${fieldStr}`);
        else finalParts.push(`${Number(coeff.toFixed(3))}${chi}${fieldStr}`);
      } else {
        const innerExpr = fieldParts.map((fp, idx) => {
          const fieldStr = fieldLabels[fp.pair];
          const c = fp.coeff;
          let term = "";
          if (Math.abs(c - 1) < epsilon) term = fieldStr;
          else if (Math.abs(c + 1) < epsilon) term = `-${fieldStr}`;
          else term = `${Number(c.toFixed(3))}${fieldStr}`;
          
          if (idx > 0 && c > 0) return `+ ${term}`;
          if (idx > 0 && c < 0) return `- ${term.substring(1)}`;
          return term;
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
        const absC = Math.abs(c);
        const cStr = Math.abs(absC - 1) < 1e-6 ? "" : Number(absC.toFixed(3)).toString();
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
      relation
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
        const absScale = Math.abs(scale);
        const scaleStr = Math.abs(absScale - 1) < epsilon ? "" : Number(absScale.toFixed(2)).toString();
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
