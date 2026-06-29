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
/** Matrix-entry values every group element is expected to be an exact combination of. */
const SNAP_VALUES = [0, 1, -1, 0.5, -0.5, Math.SQRT2 / 2, -Math.SQRT2 / 2, Math.sqrt(3) / 2, -Math.sqrt(3) / 2];
/** Tolerance for snapping a matrix entry to one of SNAP_VALUES during group closure. */
const SNAP_EPSILON = 1e-9;
/** Safety cap on closure size -- no magnetic point group exceeds 96 elements (e.g. m-3m1'). */
const MAX_GROUP_SIZE = 200;

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
  "32": [getRotationZ(120), getRotationY(180)],
  "3m": [getRotationZ(120), { m: [[1, 0, 0], [0, -1, 0], [0, 0, 1]] }],
  "-3m": [getRotationZ(120), getRotationY(180), inversion],
  "6": [getRotationZ(60)],
  "-6": [multiply(getRotationZ(60), inversion)],
  "6/m": [getRotationZ(60), inversion],
  "622": [getRotationZ(60), getRotationY(180)],
  "6mm": [getRotationZ(60), { m: [[1, 0, 0], [0, -1, 0], [0, 0, 1]] }],
  "-6m2": [multiply(getRotationZ(60), inversion), { m: [[1, 0, 0], [0, -1, 0], [0, 0, 1]] }],
  "6/mmm": [getRotationZ(60), getRotationY(180), inversion],
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
  "321'": [getRotationZ(120), getRotationY(180), timeReversal],
  "3m1'": [getRotationZ(120), { m: [[1, 0, 0], [0, -1, 0], [0, 0, 1]] }, timeReversal],
  "-3m1'": [getRotationZ(120), getRotationY(180), inversion, timeReversal],
  "61'": [getRotationZ(60), timeReversal],
  "-61'": [multiply(getRotationZ(60), inversion), timeReversal],
  "6/m1'": [getRotationZ(60), inversion, timeReversal],
  "6221'": [getRotationZ(60), getRotationY(180), timeReversal],
  "6mm1'": [getRotationZ(60), { m: [[1, 0, 0], [0, -1, 0], [0, 0, 1]] }, timeReversal],
  "-6m21'": [multiply(getRotationZ(60), inversion), { m: [[1, 0, 0], [0, -1, 0], [0, 0, 1]] }, timeReversal],
  "6/mmm1'": [getRotationZ(60), getRotationY(180), inversion, timeReversal],
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
  "-4'm2'": [multiply(multiply(getRotationZ(90), inversion), timeReversal), multiply(getRotationX(180), timeReversal)],
  "-42'm'": [multiply(getRotationZ(90), inversion), multiply(getRotationX(180), timeReversal)],
  "4/m'm'm'": [getRotationZ(90), getRotationX(180), multiply(inversion, timeReversal)],
  "4/m'mm": [getRotationZ(90), { m: [[-1, 0, 0], [0, 1, 0], [0, 0, 1]] }, multiply(inversion, timeReversal)],
  "4'/mmm'": [multiply(getRotationZ(90), timeReversal), getRotationX(180), inversion],
  "4'/m'm'm": [multiply(getRotationZ(90), timeReversal), { m: [[-1, 0, 0], [0, 1, 0], [0, 0, 1]] }, multiply(inversion, timeReversal)],
  "4/mm'm'": [getRotationZ(90), inversion, multiply(getRotationX(180), timeReversal)],
  "-3'": [getRotationZ(120), multiply(inversion, timeReversal)],
  "32'": [getRotationZ(120), multiply(getRotationY(180), timeReversal)],
  "3m'": [getRotationZ(120), multiply({ m: [[1, 0, 0], [0, -1, 0], [0, 0, 1]] }, timeReversal)],
  "-3'm'": [getRotationZ(120), multiply(getRotationY(180), timeReversal), multiply(inversion, timeReversal)],
  "-3'm": [getRotationZ(120), { m: [[1, 0, 0], [0, -1, 0], [0, 0, 1]] }, multiply(inversion, timeReversal)],
  "-3m'": [getRotationZ(120), inversion, multiply(getRotationY(180), timeReversal)],
  "6'": [multiply(getRotationZ(60), timeReversal)],
  "-6'": [multiply(multiply(getRotationZ(60), inversion), timeReversal)],
  "6'/m'": [multiply(getRotationZ(60), timeReversal), multiply(inversion, timeReversal)],
  "6/m'": [getRotationZ(60), multiply(inversion, timeReversal)],
  "6'/m": [multiply(getRotationZ(60), timeReversal), inversion],
  "6'22'": [multiply(getRotationZ(60), timeReversal), getRotationY(180)],
  "62'2'": [getRotationZ(60), multiply(getRotationY(180), timeReversal)],
  "6'mm'": [multiply(getRotationZ(60), timeReversal), { m: [[1, 0, 0], [0, -1, 0], [0, 0, 1]] }],
  "6m'm'": [getRotationZ(60), multiply({ m: [[1, 0, 0], [0, -1, 0], [0, 0, 1]] }, timeReversal)],
  "-6'2m'": [multiply(multiply(getRotationZ(60), inversion), timeReversal), getRotationY(180)],
  "-6'm2'": [multiply(multiply(getRotationZ(60), inversion), timeReversal), { m: [[1, 0, 0], [0, -1, 0], [0, 0, 1]] }],
  "-6m'2'": [multiply(getRotationZ(60), inversion), multiply({ m: [[1, 0, 0], [0, -1, 0], [0, 0, 1]] }, timeReversal)],
  "6/m'm'm'": [getRotationZ(60), getRotationY(180), multiply(inversion, timeReversal)],
  "6/m'mm": [getRotationZ(60), { m: [[1, 0, 0], [0, -1, 0], [0, 0, 1]] }, multiply(inversion, timeReversal)],
  "6'/m'mm'": [multiply(getRotationZ(60), timeReversal), getRotationY(180), inversion],
  "6'/mm'm": [multiply(getRotationZ(60), timeReversal), { m: [[1, 0, 0], [0, -1, 0], [0, 0, 1]] }, multiply(inversion, timeReversal)],
  "6/mm'm'": [getRotationZ(60), inversion, multiply(getRotationY(180), timeReversal)],
  "m'-3'": [getRotationZ(180), getRotationX(180), { m: [[0, 0, 1], [1, 0, 0], [0, 1, 0]] }, multiply(inversion, timeReversal)],
  "4'32'": [getRotationZ(180), getRotationX(180), { m: [[0, 0, 1], [1, 0, 0], [0, 1, 0]] }, multiply(getRotationZ(90), timeReversal)],
  "-4'3m'": [getRotationZ(180), getRotationX(180), { m: [[0, 0, 1], [1, 0, 0], [0, 1, 0]] }, multiply(multiply(getRotationZ(90), inversion), timeReversal)],
  "m'-3'm'": [multiply(getRotationZ(90), timeReversal), { m: [[0, 0, 1], [1, 0, 0], [0, 1, 0]] }, multiply(inversion, timeReversal)],
  "m'-3'm": [getRotationZ(90), { m: [[0, 0, 1], [1, 0, 0], [0, 1, 0]] }, multiply(inversion, timeReversal)],
  "m-3m'": [inversion, { m: [[0, 0, 1], [1, 0, 0], [0, 1, 0]] }, multiply(getRotationZ(90), timeReversal)],
};

/** Snaps each matrix entry to the nearest SNAP_VALUES member (within SNAP_EPSILON), to stop floating-point drift from accumulating across repeated products during closure. */
export function snapMatrix(a: Matrix3x3): Matrix3x3 {
  return {
    m: a.m.map(row => row.map(v => {
      for (const snap of SNAP_VALUES) {
        if (Math.abs(v - snap) < SNAP_EPSILON) return snap;
      }
      return v;
    })),
    isAntiUnitary: a.isAntiUnitary,
  };
}

export function getFullGroup(generators: Matrix3x3[], groupName = '<unknown>'): Matrix3x3[] {
  const group = generators.map(snapMatrix);
  let changed = true;
  while (changed) {
    changed = false;
    const currentSize = group.length;
    for (let i = 0; i < currentSize; i++) {
      for (let j = 0; j < currentSize; j++) {
        const prod = snapMatrix(multiply(group[i], group[j]));
        if (!group.some(m => isSameMatrix(m, prod))) {
          if (group.length >= MAX_GROUP_SIZE) {
            throw new Error(`Group closure failed to terminate for ${groupName} — check GENERATORS entry`);
          }
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
    group = getFullGroup(generators, groupName);
    fullGroupCache.set(groupName, group);
  }
  return group;
}

export function isSameMatrix(a: Matrix3x3, b: Matrix3x3): boolean {
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

export function getParentGroup(groupName: string): string | null {
  if (groupName.endsWith("1'")) return null; // Type II (grey) — no parent distinction
  if (!groupName.includes("'")) return null; // Type I — no parent
  const parent = groupName.replace(/'/g, '');
  return GENERATORS[parent] ? parent : null;
}

export function getHalvingSubgroup(groupName: string): string[] | null {
  if (!groupName.includes("'") || groupName.endsWith("1'")) return null;
  const generators = GENERATORS[groupName];
  if (!generators) return null;
  const group = getCachedFullGroup(groupName, generators);
  const unitary = group.filter(m => !m.isAntiUnitary);
  return unitary.map(formatMatrixSymbol).sort((a, b) => {
    const order = ["1", "-1", "2", "3", "4", "6", "-3", "-4", "-6", "m"];
    const getBase = (s: string) => s.replace(/_.*$/, '').replace(/[⁺⁻']/g, '');
    return order.indexOf(getBase(a)) - order.indexOf(getBase(b));
  });
}

export function getSHGConsequence(groupName: string): string {
  return isCentrosymmetric(groupName)
    ? 'Centrosymmetric → ED SHG forbidden (bulk); EQ/MD can contribute'
    : 'Non-centrosymmetric → ED SHG allowed';
}

export interface SettingDef {
  name: string;
  rotation: Matrix3x3;
}

const ORTHO_CYCLIC: Matrix3x3 = { m: [[0, 0, 1], [1, 0, 0], [0, 1, 0]] };
const ORTHO_REVERSE: Matrix3x3 = { m: [[0, 1, 0], [0, 0, 1], [1, 0, 0]] };
const MONO_YZ_SWAP: Matrix3x3 = { m: [[-1, 0, 0], [0, 0, 1], [0, 1, 0]] };

const ALTERNATE_SETTINGS: Record<string, SettingDef[]> = {
  // Phase 1 — Mechanism B (time-reversal-broken equivalence)
  "4'mm'":    [{ name: "σ_d primed", rotation: getRotationZ(45) }],
  "4'22'":    [{ name: "C₂' along ⟨110⟩", rotation: getRotationZ(45) }],
  "4'/m'm'm": [{ name: "σ_d primed", rotation: getRotationZ(45) }],
  "4'/mmm'":  [{ name: "σ_d' along ⟨110⟩", rotation: getRotationZ(45) }],
  "6'mm'":    [{ name: "σ_d primed", rotation: getRotationZ(30) }],
  "6'22'":    [{ name: "C₂' along ⟨210⟩", rotation: getRotationZ(30) }],
  "6'/m'mm'": [{ name: "σ_d primed", rotation: getRotationZ(30) }],
  "6'/mm'm":  [{ name: "σ_d' along ⟨210⟩", rotation: getRotationZ(30) }],

  // Phase 2 — Mechanism A (classical setting ambiguity)
  "-4'2m'":  [{ name: "σ' along ⟨100⟩", rotation: getRotationZ(45) }],
  "-4'm2'":  [{ name: "C₂' along ⟨100⟩", rotation: getRotationZ(45) }],
  "-42'm'":  [{ name: "C₂' along ⟨110⟩", rotation: getRotationZ(45) }],
  "32'":     [{ name: "C₂' along ⟨100⟩", rotation: getRotationZ(30) }],
  "3m'":     [{ name: "σ_d' mirrors", rotation: getRotationZ(30) }],
  "-3'm":    [{ name: "σ_d mirrors", rotation: getRotationZ(30) }],
  "-3'm'":   [{ name: "C₂' along ⟨100⟩", rotation: getRotationZ(30) }],
  "-3m'":    [{ name: "C₂' along ⟨100⟩", rotation: getRotationZ(30) }],
  "-6'2m'":  [{ name: "C₂ along ⟨100⟩", rotation: getRotationZ(30) }],
  "-6'm2'":  [{ name: "σ_d mirrors", rotation: getRotationZ(30) }],
  "-6m'2'":  [{ name: "σ_d' mirrors", rotation: getRotationZ(30) }],

  // Phase 2 — Orthorhombic axis orientation (3 settings)
  "2'2'2":  [{ name: "a-unique", rotation: ORTHO_CYCLIC }, { name: "b-unique", rotation: ORTHO_REVERSE }],
  "2'm'm":  [{ name: "a-unique", rotation: ORTHO_CYCLIC }, { name: "b-unique", rotation: ORTHO_REVERSE }],
  "m'm'2":  [{ name: "a-unique", rotation: ORTHO_CYCLIC }, { name: "b-unique", rotation: ORTHO_REVERSE }],
  "m'm'm":  [{ name: "a-unique", rotation: ORTHO_CYCLIC }, { name: "b-unique", rotation: ORTHO_REVERSE }],
  "mmm'":   [{ name: "a-unique", rotation: ORTHO_CYCLIC }, { name: "b-unique", rotation: ORTHO_REVERSE }],

  // Phase 2 — Monoclinic axis choice (z-unique Birss → b-unique ITC)
  "2'":     [{ name: "b-unique (ITC)", rotation: MONO_YZ_SWAP }],
  "m'":     [{ name: "b-unique (ITC)", rotation: MONO_YZ_SWAP }],
  "2'/m":   [{ name: "b-unique (ITC)", rotation: MONO_YZ_SWAP }],
  "2'/m'":  [{ name: "b-unique (ITC)", rotation: MONO_YZ_SWAP }],
  "2/m'":   [{ name: "b-unique (ITC)", rotation: MONO_YZ_SWAP }],

  // --- B1: Type I (colourless) ---
  // Orthorhombic axis orientation (3 settings)
  "222":   [{ name: "a-unique", rotation: ORTHO_CYCLIC }, { name: "b-unique", rotation: ORTHO_REVERSE }],
  "mm2":   [{ name: "a-unique", rotation: ORTHO_CYCLIC }, { name: "b-unique", rotation: ORTHO_REVERSE }],
  "mmm":   [{ name: "a-unique", rotation: ORTHO_CYCLIC }, { name: "b-unique", rotation: ORTHO_REVERSE }],
  // Monoclinic axis choice (z/c-unique Birss → b-unique ITC)
  "2":     [{ name: "b-unique (ITC)", rotation: MONO_YZ_SWAP }],
  "m":     [{ name: "b-unique (ITC)", rotation: MONO_YZ_SWAP }],
  "2/m":   [{ name: "b-unique (ITC)", rotation: MONO_YZ_SWAP }],
  // Mechanism A (classical setting ambiguity)
  "-42m":  [{ name: "-4m2", rotation: getRotationZ(45) }],
  "32":    [{ name: "312",  rotation: getRotationZ(30) }],
  "3m":    [{ name: "31m",  rotation: getRotationZ(30) }],
  "-3m":   [{ name: "-31m", rotation: getRotationZ(30) }],
  "-6m2":  [{ name: "-62m", rotation: getRotationZ(30) }],

  // --- B1: Type II (grey) — same transforms; ε preserved automatically ---
  "2221'":  [{ name: "a-unique", rotation: ORTHO_CYCLIC }, { name: "b-unique", rotation: ORTHO_REVERSE }],
  "mm21'":  [{ name: "a-unique", rotation: ORTHO_CYCLIC }, { name: "b-unique", rotation: ORTHO_REVERSE }],
  "mmm1'":  [{ name: "a-unique", rotation: ORTHO_CYCLIC }, { name: "b-unique", rotation: ORTHO_REVERSE }],
  "21'":    [{ name: "b-unique (ITC)", rotation: MONO_YZ_SWAP }],
  "m1'":    [{ name: "b-unique (ITC)", rotation: MONO_YZ_SWAP }],
  "2/m1'":  [{ name: "b-unique (ITC)", rotation: MONO_YZ_SWAP }],
  "-42m1'": [{ name: "-4m2", rotation: getRotationZ(45) }],
  "321'":   [{ name: "312",  rotation: getRotationZ(30) }],
  "3m1'":   [{ name: "31m",  rotation: getRotationZ(30) }],
  "-3m1'":  [{ name: "-31m", rotation: getRotationZ(30) }],
  "-6m21'": [{ name: "-62m", rotation: getRotationZ(30) }],
};

const GROUPS_WITH_FUTURE_SETTINGS: Record<string, number> = {
};

export function getAlternateSettings(groupName: string): SettingDef[] | null {
  return ALTERNATE_SETTINGS[groupName] ?? null;
}

export function getFutureSettingCount(groupName: string): number | null {
  return GROUPS_WITH_FUTURE_SETTINGS[groupName] ?? null;
}

export function transpose(a: Matrix3x3): Matrix3x3 {
  return {
    m: [
      [a.m[0][0], a.m[1][0], a.m[2][0]],
      [a.m[0][1], a.m[1][1], a.m[2][1]],
      [a.m[0][2], a.m[1][2], a.m[2][2]],
    ],
    isAntiUnitary: a.isAntiUnitary,
  };
}

export function getTransformedGenerators(groupName: string, setting: number): Matrix3x3[] {
  const baseGenerators = GENERATORS[groupName];
  if (!baseGenerators || setting <= 1) return baseGenerators ?? [];

  const settingDefs = ALTERNATE_SETTINGS[groupName];
  if (!settingDefs || setting > settingDefs.length + 1) return baseGenerators;

  const S = settingDefs[setting - 2].rotation;
  const S_inv = transpose(S);

  return baseGenerators.map(g => {
    const transformed = multiply(multiply(S, g), S_inv);
    return snapMatrix({ ...transformed, isAntiUnitary: g.isAntiUnitary });
  });
}

function formatMatrixSymbol(m: Matrix3x3): string {
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
}

export function getSymmetryOperations(groupName: string, setting?: number): string[] {
  const generators = setting && setting > 1
    ? getTransformedGenerators(groupName, setting)
    : GENERATORS[groupName];
  if (!generators || generators.length === 0) return [];
  const cacheKey = setting && setting > 1 ? `${groupName}::setting${setting}` : groupName;
  const group = getCachedFullGroup(cacheKey, generators);

  const symbols = group.map(formatMatrixSymbol);

  const order = ["1", "-1", "2", "3", "4", "6", "-3", "-4", "-6", "m"];
  return symbols.sort((a, b) => {
    const getBase = (s: string) => s.replace(/_.*$/, '').replace(/[⁺⁻']/g, '');
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

export function getGeneratorSymbols(groupName: string, setting?: number): string[] {
  const generators = setting && setting > 1
    ? getTransformedGenerators(groupName, setting)
    : GENERATORS[groupName];
  if (!generators || generators.length === 0) return [];
  return generators.map(formatMatrixSymbol);
}
