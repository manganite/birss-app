/**
 * trigPolyFormat.ts
 *
 * LaTeX formatting for TrigPoly values and SymPoly source-term polynomials.
 * Produces readable phi-dependent expressions for the Calculator and Simulator.
 */

import { type TrigPoly, trigIsZero, trigIsConst, trigGetConst } from './trigPoly';
import { formatCoeff, cleanupExpressionSigns } from './tensorProjection';
import type { SymPoly } from './symbolicProjection';

const COEFF_EPSILON = 1e-5;

const ANGLE_NAMES: Record<string, string> = {
  phiX: '\\varphi_x',
  phiY: '\\varphi_y',
  psi: '\\psi',
};

interface DecodedMonomial {
  cosPhiX: number; sinPhiX: number;
  cosPhiY: number; sinPhiY: number;
  cosPsi: number; sinPsi: number;
  coeff: number;
}

function decodeMonomial(key: string, coeff: number): DecodedMonomial {
  const exps = key.split(',').map(Number);
  return {
    cosPhiX: exps[0], sinPhiX: exps[1],
    cosPhiY: exps[2], sinPhiY: exps[3],
    cosPsi: exps[4], sinPsi: exps[5],
    coeff,
  };
}

function totalDegree(m: DecodedMonomial): number {
  return m.cosPhiX + m.sinPhiX + m.cosPhiY + m.sinPhiY + m.cosPsi + m.sinPsi;
}

function isConstant(m: DecodedMonomial): boolean {
  return totalDegree(m) === 0;
}

function formatMonomialTrigPart(m: DecodedMonomial): string {
  const parts: string[] = [];
  const pairs = [
    { cos: m.cosPhiX, sin: m.sinPhiX, angle: ANGLE_NAMES.phiX },
    { cos: m.cosPhiY, sin: m.sinPhiY, angle: ANGLE_NAMES.phiY },
    { cos: m.cosPsi, sin: m.sinPsi, angle: ANGLE_NAMES.psi },
  ];

  for (const { cos, sin, angle } of pairs) {
    if (cos === 1) parts.push(`\\cos ${angle}`);
    else if (cos > 1) parts.push(`\\cos^{${cos}} ${angle}`);

    if (sin === 1) parts.push(`\\sin ${angle}`);
    else if (sin > 1) parts.push(`\\sin^{${sin}} ${angle}`);
  }

  return parts.join(' ');
}

function sortKey(m: DecodedMonomial): string {
  const deg = totalDegree(m);
  const anglePriority = m.cosPhiX + m.sinPhiX > 0 ? 0
    : m.cosPhiY + m.sinPhiY > 0 ? 1 : 2;
  const cosFirst = (m.cosPhiX > 0 || m.cosPhiY > 0 || m.cosPsi > 0) ? 0 : 1;
  return `${deg.toString().padStart(2, '0')}_${anglePriority}_${cosFirst}_${m.cosPhiX}_${m.sinPhiX}_${m.cosPhiY}_${m.sinPhiY}_${m.cosPsi}_${m.sinPsi}`;
}

export function formatTrigPoly(p: TrigPoly): string {
  if (trigIsZero(p)) return '0';

  if (trigIsConst(p)) {
    const c = trigGetConst(p);
    if (Math.abs(c) < COEFF_EPSILON) return '0';
    const sign = c < 0 ? '-' : '';
    const fc = formatCoeff(c);
    return `${sign}${fc || '1'}`;
  }

  const monomials: DecodedMonomial[] = [];
  for (const [key, coeff] of p.terms) {
    if (Math.abs(coeff) < COEFF_EPSILON) continue;
    monomials.push(decodeMonomial(key, coeff));
  }

  if (monomials.length === 0) return '0';

  monomials.sort((a, b) => {
    const ka = sortKey(a);
    const kb = sortKey(b);
    return ka < kb ? -1 : ka > kb ? 1 : 0;
  });

  const parts: string[] = [];
  for (let i = 0; i < monomials.length; i++) {
    const m = monomials[i];
    const absC = Math.abs(m.coeff);
    const isNeg = m.coeff < 0;

    let term: string;
    if (isConstant(m)) {
      const fc = formatCoeff(m.coeff);
      term = fc === '' ? '1' : fc;
    } else {
      const trigPart = formatMonomialTrigPart(m);
      const coeffStr = Math.abs(absC - 1) < COEFF_EPSILON ? '' : formatCoeff(m.coeff);
      term = coeffStr ? `${coeffStr} ${trigPart}` : trigPart;
    }

    if (i === 0) {
      parts.push(isNeg ? `-${term}` : term);
    } else {
      parts.push(isNeg ? `- ${term}` : `+ ${term}`);
    }
  }

  return parts.join(' ');
}

const FIELD_LABELS: Record<string, string> = {
  '00': 'E_X^2', '11': 'E_Y^2', '22': 'E_Z^2',
  '01': 'E_X E_Y', '02': 'E_X E_Z', '12': 'E_Y E_Z',
};

export function formatSymbolicSourceTerm(poly: SymPoly): string {
  if (poly.size === 0) return '0';

  const sortedChis = Array.from(poly.keys()).sort();
  const finalParts: string[] = [];

  for (const chi of sortedChis) {
    const pairMap = poly.get(chi)!;
    const fieldParts: { pair: string; formatted: string; isNeg: boolean }[] = [];

    for (const pair of Array.from(pairMap.keys()).sort()) {
      const tp = pairMap.get(pair)!;
      if (trigIsZero(tp)) continue;

      const fieldStr = FIELD_LABELS[pair] || pair;
      const coeffStr = formatTrigPoly(tp);
      if (coeffStr === '0') continue;

      const isNeg = coeffStr.startsWith('-');
      const cleanCoeff = isNeg ? coeffStr.slice(1).trim() : coeffStr;

      if (cleanCoeff === '1' || cleanCoeff === '') {
        fieldParts.push({ pair, formatted: fieldStr, isNeg });
      } else if (trigIsConst(tp)) {
        fieldParts.push({ pair, formatted: `${cleanCoeff}${fieldStr}`, isNeg });
      } else {
        fieldParts.push({ pair, formatted: `(${cleanCoeff}) ${fieldStr}`, isNeg });
      }
    }

    if (fieldParts.length === 0) continue;

    if (fieldParts.length === 1) {
      const fp = fieldParts[0];
      const sign = fp.isNeg ? '-' : '';
      finalParts.push(`${sign}${chi}${fp.formatted}`);
    } else {
      const innerExpr = fieldParts.map((fp, idx) => {
        if (idx === 0) {
          return `${fp.isNeg ? '-' : ''}${fp.formatted}`;
        }
        return `${fp.isNeg ? '-' : '+'} ${fp.formatted}`;
      }).join(' ');
      finalParts.push(`${chi}(${innerExpr})`);
    }
  }

  return finalParts.length > 0 ? cleanupExpressionSigns(finalParts.join(' + ')) : '0';
}
