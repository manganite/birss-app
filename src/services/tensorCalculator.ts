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
    const basisVector = new Array(dim).fill(0);
    basisVector[i] = 1;
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
  return 'χ_' + indices.map(i => chars[i]).join('');
}

export function isCentrosymmetric(groupName: string): boolean {
  const generators = GENERATORS[groupName];
  if (!generators) return false;
  const group = getFullGroup(generators);
  return group.some(m => isSameMatrix(m, inversion));
}

function formatResults(basisResults: number[][], rank: number, isTimeOdd: boolean): string[] {
  const dim = Math.pow(3, rank);
  const output: string[] = [];
  const epsilon = 1e-6;

  for (const basis of basisResults) {
    const members: string[] = [];
    let leadIdx = -1;
    
    for (let i = 0; i < dim; i++) {
      if (Math.abs(basis[i]) > epsilon) {
        if (leadIdx === -1) leadIdx = i;
        const scale = basis[i] / basis[leadIdx];
        const sign = scale > 0 ? (members.length === 0 ? "" : " = ") : " = -";
        const absScale = Math.abs(scale);
        const scaleStr = Math.abs(absScale - 1) < epsilon ? "" : absScale.toFixed(2);
        members.push(`${sign}${scaleStr}${getLabel(getIndices(i, rank))}`);
      }
    }
    
    if (members.length > 0) {
      output.push(members.join(""));
    }
  }

  return output.length > 0 ? output : ["All components are zero."];
}
