/**
 * symmetryGroups.ts
 *
 * Group theory: 3x3 matrix algebra, the hand-curated GENERATORS table for all 122
 * magnetic point groups, group closure (with caching), and centrosymmetry / symmetry
 * operation queries derived from the closed groups.
 */

/** General tolerance for tensor/coefficient/matrix comparisons. */
export const EPSILON = 1e-6;
/** Geometric tolerance for normalized axis-vector "is zero" / dot-product sign checks. */
export const AXIS_EPSILON = 1e-5;
/** Cardinal-axis / in-plane-axis detection tolerance in formatAxis. */
const CARDINAL_AXIS_EPSILON = 1e-3;
/** Max per-component error when snapping a normalized axis to integer Miller indices. */
const MILLER_ERROR_THRESHOLD = 0.1;

export interface Matrix3x3 {
  m: number[][];
  isAntiUnitary?: boolean; // Combined with time reversal 1'
}

export const identity: Matrix3x3 = {
  m: [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1]
  ]
};

export const inversion: Matrix3x3 = {
  m: [
    [-1, 0, 0],
    [0, -1, 0],
    [0, 0, -1]
  ]
};

// Rotation matrices
export function getRotationZ(angleDeg: number): Matrix3x3 {
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

export function getRotationX(angleDeg: number): Matrix3x3 {
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

export function getRotationY(angleDeg: number): Matrix3x3 {
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

export function multiply(a: Matrix3x3, b: Matrix3x3): Matrix3x3 {
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

export function det(a: Matrix3x3): number {
  return a.m[0][0] * (a.m[1][1] * a.m[2][2] - a.m[1][2] * a.m[2][1]) -
         a.m[0][1] * (a.m[1][0] * a.m[2][2] - a.m[1][2] * a.m[2][0]) +
         a.m[0][2] * (a.m[1][0] * a.m[2][1] - a.m[1][1] * a.m[2][0]);
}

export const timeReversal: Matrix3x3 = { ...identity, isAntiUnitary: true };

// Point Group Generators
export const GENERATORS: Record<string, Matrix3x3[]> = {
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

export function getFullGroup(generators: Matrix3x3[]): Matrix3x3[] {
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

const fullGroupCache = new Map<string, Matrix3x3[]>();
export function getCachedFullGroup(groupName: string, generators: Matrix3x3[]): Matrix3x3[] {
  let group = fullGroupCache.get(groupName);
  if (!group) {
    group = getFullGroup(generators);
    fullGroupCache.set(groupName, group);
  }
  return group;
}

function isSameMatrix(a: Matrix3x3, b: Matrix3x3): boolean {
  if ((a.isAntiUnitary || false) !== (b.isAntiUnitary || false)) return false;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (Math.abs(a.m[i][j] - b.m[i][j]) > EPSILON) return false;
    }
  }
  return true;
}

export function isCentrosymmetric(groupName: string): boolean {
  const generators = GENERATORS[groupName];
  if (!generators) return false;
  const group = getCachedFullGroup(groupName, generators);
  return group.some(m => isSameMatrix(m, inversion));
}

export function getSymmetryOperations(groupName: string): string[] {
  const generators = GENERATORS[groupName];
  if (!generators) return [];
  const group = getCachedFullGroup(groupName, generators);

  const symbols = group.map(m => {
    const { m: mat, isAntiUnitary } = m;
    const tr = Math.round(mat[0][0] + mat[1][1] + mat[2][2]);
    const d = Math.round(det(m));
    const prime = isAntiUnitary ? "'" : "";
    let base = "";
    let axis = "";
    let sign = "";

    const formatAxis = (x: number, y: number, z: number): { label: string; nx: number; ny: number; nz: number } => {
      const max = Math.max(Math.abs(x), Math.abs(y), Math.abs(z));
      if (max < AXIS_EPSILON) return { label: "", nx: 0, ny: 0, nz: 0 };
      let nx = x / max;
      let ny = y / max;
      let nz = z / max;

      if (nx < -AXIS_EPSILON || (Math.abs(nx) < AXIS_EPSILON && ny < -AXIS_EPSILON) || (Math.abs(nx) < AXIS_EPSILON && Math.abs(ny) < AXIS_EPSILON && nz < -AXIS_EPSILON)) {
        nx = -nx; ny = -ny; nz = -nz;
      }

      if (Math.abs(nx - 1) < CARDINAL_AXIS_EPSILON && Math.abs(ny) < CARDINAL_AXIS_EPSILON && Math.abs(nz) < CARDINAL_AXIS_EPSILON) return { label: "x", nx, ny, nz };
      if (Math.abs(nx) < CARDINAL_AXIS_EPSILON && Math.abs(ny - 1) < CARDINAL_AXIS_EPSILON && Math.abs(nz) < CARDINAL_AXIS_EPSILON) return { label: "y", nx, ny, nz };
      if (Math.abs(nx) < CARDINAL_AXIS_EPSILON && Math.abs(ny) < CARDINAL_AXIS_EPSILON && Math.abs(nz - 1) < CARDINAL_AXIS_EPSILON) return { label: "z", nx, ny, nz };

      if (Math.abs(nz) < CARDINAL_AXIS_EPSILON) {
        let angle = Math.round(Math.atan2(ny, nx) * 180 / Math.PI);
        if (angle < 0) angle += 180;
        if (angle === 180) angle = 0;
        return { label: `${angle}°`, nx, ny, nz };
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

      if (minError < MILLER_ERROR_THRESHOLD) {
         const rx = Math.round(nx * bestMult);
         const ry = Math.round(ny * bestMult);
         const rz = Math.round(nz * bestMult);
         const formatNum = (n: number) => n < 0 ? `-${Math.abs(n)}` : `${n}`;
         return { label: `[${formatNum(rx)}${formatNum(ry)}${formatNum(rz)}]`, nx, ny, nz };
      } else {
         const rx = Number(nx.toFixed(2));
         const ry = Number(ny.toFixed(2));
         const rz = Number(nz.toFixed(2));
         return { label: `[${rx},${ry},${rz}]`, nx, ny, nz };
      }
    };

    /** "⁺"/"⁻"/"" based on the sign of a dot product, using AXIS_EPSILON as the zero threshold. */
    const signFromDot = (dot: number): string => {
      if (dot > AXIS_EPSILON) return "⁺";
      if (dot < -AXIS_EPSILON) return "⁻";
      return "";
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
        if (Math.abs(rx)>AXIS_EPSILON || Math.abs(ry)>AXIS_EPSILON || Math.abs(rz)>AXIS_EPSILON) { ax=rx; ay=ry; az=rz; }
        else if (Math.abs(cx)>AXIS_EPSILON || Math.abs(cy)>AXIS_EPSILON || Math.abs(cz)>AXIS_EPSILON) { ax=cx; ay=cy; az=cz; }
        else { ax=bx; ay=by; az=bz; }
        axis = formatAxis(ax, ay, az).label;
      } else {
        const vx = mat[2][1] - mat[1][2];
        const vy = mat[0][2] - mat[2][0];
        const vz = mat[1][0] - mat[0][1];
        const result = formatAxis(vx, vy, vz);
        axis = result.label;

        const dot = vx * result.nx + vy * result.ny + vz * result.nz;
        sign = signFromDot(dot);
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
        if (Math.abs(rx)>AXIS_EPSILON || Math.abs(ry)>AXIS_EPSILON || Math.abs(rz)>AXIS_EPSILON) { ax=rx; ay=ry; az=rz; }
        else if (Math.abs(cx)>AXIS_EPSILON || Math.abs(cy)>AXIS_EPSILON || Math.abs(cz)>AXIS_EPSILON) { ax=cx; ay=cy; az=cz; }
        else { ax=bx; ay=by; az=bz; }
        axis = formatAxis(ax, ay, az).label;
      } else {
        const vx = -(mat[2][1] - mat[1][2]);
        const vy = -(mat[0][2] - mat[2][0]);
        const vz = -(mat[1][0] - mat[0][1]);
        const result = formatAxis(vx, vy, vz);
        axis = result.label;

        const dot = vx * result.nx + vy * result.ny + vz * result.nz;
        sign = signFromDot(dot);
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
