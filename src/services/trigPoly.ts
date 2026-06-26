/**
 * trigPoly.ts
 *
 * Trigonometric polynomial algebra for three rotation angles (phiX, phiY, psi).
 * A TrigPoly is a sum of monomials of the form:
 *   c * cos^a(phiX) * sin^b(phiX) * cos^d(phiY) * sin^e(phiY) * cos^f(psi) * sin^g(psi)
 *
 * Used by the symbolic projection pipeline to produce phi-dependent source terms.
 */

const TRIG_EPSILON = 1e-12;

export type TrigAngle = 'phiX' | 'phiY' | 'psi';

export interface TrigPoly {
  terms: Map<string, number>;
}

function encodeKey(exps: number[]): string {
  return exps.join(',');
}

function decodeKey(key: string): number[] {
  return key.split(',').map(Number);
}

const ZERO_KEY = '0,0,0,0,0,0';

const ANGLE_OFFSETS: Record<TrigAngle, number> = {
  phiX: 0,
  phiY: 2,
  psi: 4,
};

export function trigConst(c: number): TrigPoly {
  if (Math.abs(c) < TRIG_EPSILON) return { terms: new Map() };
  return { terms: new Map([[ZERO_KEY, c]]) };
}

export function trigCos(angle: TrigAngle): TrigPoly {
  const exps = [0, 0, 0, 0, 0, 0];
  exps[ANGLE_OFFSETS[angle]] = 1;
  return { terms: new Map([[encodeKey(exps), 1]]) };
}

export function trigSin(angle: TrigAngle): TrigPoly {
  const exps = [0, 0, 0, 0, 0, 0];
  exps[ANGLE_OFFSETS[angle] + 1] = 1;
  return { terms: new Map([[encodeKey(exps), 1]]) };
}

export function trigAdd(a: TrigPoly, b: TrigPoly): TrigPoly {
  const terms = new Map(a.terms);
  for (const [key, coeff] of b.terms) {
    terms.set(key, (terms.get(key) || 0) + coeff);
  }
  pruneZeros(terms);
  return { terms };
}

export function trigSub(a: TrigPoly, b: TrigPoly): TrigPoly {
  return trigAdd(a, trigNeg(b));
}

export function trigScale(p: TrigPoly, c: number): TrigPoly {
  if (Math.abs(c) < TRIG_EPSILON) return { terms: new Map() };
  const terms = new Map<string, number>();
  for (const [key, coeff] of p.terms) {
    const v = coeff * c;
    if (Math.abs(v) >= TRIG_EPSILON) terms.set(key, v);
  }
  return { terms };
}

export function trigMul(a: TrigPoly, b: TrigPoly): TrigPoly {
  const terms = new Map<string, number>();
  for (const [keyA, coeffA] of a.terms) {
    const expsA = decodeKey(keyA);
    for (const [keyB, coeffB] of b.terms) {
      const expsB = decodeKey(keyB);
      const exps = expsA.map((e, i) => e + expsB[i]);
      const key = encodeKey(exps);
      const c = coeffA * coeffB;
      terms.set(key, (terms.get(key) || 0) + c);
    }
  }
  pruneZeros(terms);
  return { terms };
}

export function trigNeg(p: TrigPoly): TrigPoly {
  const terms = new Map<string, number>();
  for (const [key, coeff] of p.terms) {
    terms.set(key, -coeff);
  }
  return { terms };
}

export function trigIsZero(p: TrigPoly, eps: number = TRIG_EPSILON): boolean {
  for (const coeff of p.terms.values()) {
    if (Math.abs(coeff) >= eps) return false;
  }
  return true;
}

export function trigIsConst(p: TrigPoly, eps: number = TRIG_EPSILON): boolean {
  for (const [key, coeff] of p.terms) {
    if (Math.abs(coeff) < eps) continue;
    if (key !== ZERO_KEY) return false;
  }
  return true;
}

export function trigGetConst(p: TrigPoly): number {
  return p.terms.get(ZERO_KEY) || 0;
}

export function trigEval(p: TrigPoly, phiXDeg: number, phiYDeg: number, psiDeg: number): number {
  const DEG = Math.PI / 180;
  const cx = Math.cos(phiXDeg * DEG), sx = Math.sin(phiXDeg * DEG);
  const cy = Math.cos(phiYDeg * DEG), sy = Math.sin(phiYDeg * DEG);
  const cp = Math.cos(psiDeg * DEG), sp = Math.sin(psiDeg * DEG);

  let result = 0;
  for (const [key, coeff] of p.terms) {
    const exps = decodeKey(key);
    result += coeff
      * Math.pow(cx, exps[0]) * Math.pow(sx, exps[1])
      * Math.pow(cy, exps[2]) * Math.pow(sy, exps[3])
      * Math.pow(cp, exps[4]) * Math.pow(sp, exps[5]);
  }
  return result;
}

export function trigSimplify(p: TrigPoly): TrigPoly {
  let terms = new Map(p.terms);
  pruneZeros(terms);

  let changed = true;
  while (changed) {
    changed = false;
    changed = applyPythagorean(terms) || changed;
    pruneZeros(terms);
  }

  return { terms };
}

function pruneZeros(terms: Map<string, number>): void {
  for (const [key, coeff] of terms) {
    if (Math.abs(coeff) < TRIG_EPSILON) terms.delete(key);
  }
}

/**
 * Detect cos^2(a) + sin^2(a) = 1 patterns and simplify.
 * For each angle, find pairs of terms that differ only in having
 * cos^2 vs sin^2 of that angle, with equal coefficients.
 */
function applyPythagorean(terms: Map<string, number>): boolean {
  let changed = false;

  for (let angleIdx = 0; angleIdx < 6; angleIdx += 2) {
    const cosIdx = angleIdx;
    const sinIdx = angleIdx + 1;

    const entries = Array.from(terms.entries());
    for (let i = 0; i < entries.length; i++) {
      const [keyA, coeffA] = entries[i];
      if (Math.abs(coeffA) < TRIG_EPSILON) continue;

      const expsA = decodeKey(keyA);
      if (expsA[cosIdx] < 2) continue;

      const expsB = [...expsA];
      expsB[cosIdx] -= 2;
      expsB[sinIdx] += 2;
      const keyB = encodeKey(expsB);
      const coeffB = terms.get(keyB);

      if (coeffB === undefined || Math.abs(coeffB) < TRIG_EPSILON) continue;

      const minCoeff = Math.abs(coeffA) < Math.abs(coeffB) ? coeffA : coeffB;
      if (Math.sign(coeffA) !== Math.sign(coeffB)) continue;

      const expsReduced = [...expsA];
      expsReduced[cosIdx] -= 2;
      const keyReduced = encodeKey(expsReduced);

      terms.set(keyReduced, (terms.get(keyReduced) || 0) + minCoeff);
      terms.set(keyA, coeffA - minCoeff);
      terms.set(keyB, coeffB - minCoeff);

      changed = true;
    }
  }

  return changed;
}

export const TRIG_ZERO: TrigPoly = Object.freeze({ terms: new Map() });
export const TRIG_ONE: TrigPoly = Object.freeze({ terms: new Map([[ZERO_KEY, 1]]) });
