import { describe, it, expect } from 'vitest';
import {
  trigConst, trigCos, trigSin,
  trigAdd, trigSub, trigScale, trigMul, trigNeg,
  trigIsZero, trigIsConst, trigGetConst,
  trigEval, trigSimplify,
  TRIG_ZERO, TRIG_ONE,
  type TrigPoly,
} from './trigPoly';

const EPSILON = 1e-10;

function expectClose(a: number, b: number, msg?: string) {
  expect(Math.abs(a - b)).toBeLessThan(EPSILON);
}

function expectEvalClose(p: TrigPoly, phiX: number, phiY: number, psi: number, expected: number) {
  expectClose(trigEval(p, phiX, phiY, psi), expected);
}

describe('trigPoly constructors', () => {
  it('trigConst(0) produces zero polynomial', () => {
    expect(trigIsZero(trigConst(0))).toBe(true);
  });

  it('trigConst(c) evaluates to c at any angle', () => {
    const p = trigConst(3.5);
    expectEvalClose(p, 0, 0, 0, 3.5);
    expectEvalClose(p, 45, 30, 60, 3.5);
  });

  it('trigCos evaluates correctly', () => {
    const cX = trigCos('phiX');
    expectEvalClose(cX, 0, 0, 0, 1);
    expectEvalClose(cX, 90, 0, 0, 0);
    expectEvalClose(cX, 60, 0, 0, 0.5);

    const cY = trigCos('phiY');
    expectEvalClose(cY, 0, 45, 0, Math.SQRT2 / 2);

    const cP = trigCos('psi');
    expectEvalClose(cP, 0, 0, 180, -1);
  });

  it('trigSin evaluates correctly', () => {
    const sX = trigSin('phiX');
    expectEvalClose(sX, 0, 0, 0, 0);
    expectEvalClose(sX, 90, 0, 0, 1);
    expectEvalClose(sX, 30, 0, 0, 0.5);

    const sY = trigSin('phiY');
    expectEvalClose(sY, 0, 45, 0, Math.SQRT2 / 2);
  });
});

describe('trigPoly arithmetic', () => {
  it('addition combines like terms', () => {
    const a = trigConst(2);
    const b = trigConst(3);
    const sum = trigAdd(a, b);
    expectEvalClose(sum, 0, 0, 0, 5);
    expect(sum.terms.size).toBe(1);
  });

  it('addition of cos + sin evaluates correctly', () => {
    const p = trigAdd(trigCos('phiX'), trigSin('phiX'));
    expectEvalClose(p, 0, 0, 0, 1);
    expectEvalClose(p, 90, 0, 0, 1);
    expectEvalClose(p, 45, 0, 0, Math.SQRT2);
  });

  it('subtraction works', () => {
    const p = trigSub(trigCos('phiX'), trigCos('phiX'));
    expect(trigIsZero(p)).toBe(true);
  });

  it('scale multiplies all coefficients', () => {
    const p = trigScale(trigCos('phiX'), 3);
    expectEvalClose(p, 0, 0, 0, 3);
    expectEvalClose(p, 60, 0, 0, 1.5);
  });

  it('scale by 0 gives zero', () => {
    expect(trigIsZero(trigScale(trigCos('phiX'), 0))).toBe(true);
  });

  it('negation flips sign', () => {
    const p = trigNeg(trigConst(5));
    expectEvalClose(p, 0, 0, 0, -5);
  });

  it('multiplication of cos * sin', () => {
    const p = trigMul(trigCos('phiX'), trigSin('phiX'));
    expectEvalClose(p, 30, 0, 0, Math.cos(Math.PI / 6) * Math.sin(Math.PI / 6));
    expectEvalClose(p, 45, 0, 0, 0.5);
  });

  it('multiplication is commutative', () => {
    const a = trigCos('phiX');
    const b = trigSin('phiY');
    const ab = trigMul(a, b);
    const ba = trigMul(b, a);
    for (const [phiX, phiY, psi] of [[30, 45, 0], [60, 120, 90]]) {
      expectClose(trigEval(ab, phiX, phiY, psi), trigEval(ba, phiX, phiY, psi));
    }
  });

  it('multiplication is associative', () => {
    const a = trigCos('phiX');
    const b = trigSin('phiY');
    const c = trigCos('psi');
    const ab_c = trigMul(trigMul(a, b), c);
    const a_bc = trigMul(a, trigMul(b, c));
    for (const [phiX, phiY, psi] of [[30, 45, 60], [10, 20, 30]]) {
      expectClose(trigEval(ab_c, phiX, phiY, psi), trigEval(a_bc, phiX, phiY, psi));
    }
  });

  it('distributive law holds', () => {
    const a = trigCos('phiX');
    const b = trigSin('phiX');
    const c = trigCos('phiY');
    const left = trigMul(a, trigAdd(b, c));
    const right = trigAdd(trigMul(a, b), trigMul(a, c));
    for (const [phiX, phiY, psi] of [[30, 45, 0], [60, 120, 90]]) {
      expectClose(trigEval(left, phiX, phiY, psi), trigEval(right, phiX, phiY, psi));
    }
  });

  it('cos^2 produces correct exponents', () => {
    const cos2 = trigMul(trigCos('phiX'), trigCos('phiX'));
    expect(cos2.terms.size).toBe(1);
    expectEvalClose(cos2, 0, 0, 0, 1);
    expectEvalClose(cos2, 60, 0, 0, 0.25);
    expectEvalClose(cos2, 90, 0, 0, 0);
  });
});

describe('trigPoly predicates', () => {
  it('trigIsZero detects zero', () => {
    expect(trigIsZero(TRIG_ZERO)).toBe(true);
    expect(trigIsZero(trigConst(0))).toBe(true);
    expect(trigIsZero(trigConst(1))).toBe(false);
  });

  it('trigIsConst detects constants', () => {
    expect(trigIsConst(trigConst(5))).toBe(true);
    expect(trigIsConst(TRIG_ZERO)).toBe(true);
    expect(trigIsConst(TRIG_ONE)).toBe(true);
    expect(trigIsConst(trigCos('phiX'))).toBe(false);
  });

  it('trigGetConst returns constant value', () => {
    expectClose(trigGetConst(trigConst(3.14)), 3.14);
    expectClose(trigGetConst(TRIG_ZERO), 0);
  });
});

describe('trigPoly evaluation', () => {
  it('evaluates at standard angles', () => {
    const p = trigAdd(
      trigMul(trigConst(2), trigCos('phiX')),
      trigMul(trigConst(3), trigSin('phiY'))
    );
    expectEvalClose(p, 0, 0, 0, 2);
    expectEvalClose(p, 0, 90, 0, 5);
    expectEvalClose(p, 90, 90, 0, 3);
  });

  it('evaluates three-angle cross-term', () => {
    const p = trigMul(trigCos('phiX'), trigMul(trigSin('phiY'), trigCos('psi')));
    const expected = Math.cos(Math.PI / 6) * Math.sin(Math.PI / 4) * Math.cos(Math.PI / 3);
    expectEvalClose(p, 30, 45, 60, expected);
  });

  it('TRIG_ONE evaluates to 1 everywhere', () => {
    expectEvalClose(TRIG_ONE, 0, 0, 0, 1);
    expectEvalClose(TRIG_ONE, 45, 90, 180, 1);
  });
});

describe('trigSimplify', () => {
  it('cos^2 + sin^2 = 1', () => {
    const cos2 = trigMul(trigCos('phiX'), trigCos('phiX'));
    const sin2 = trigMul(trigSin('phiX'), trigSin('phiX'));
    const sum = trigSimplify(trigAdd(cos2, sin2));
    expect(trigIsConst(sum)).toBe(true);
    expectClose(trigGetConst(sum), 1);
  });

  it('cos^2 + sin^2 = 1 for each angle', () => {
    for (const angle of ['phiX', 'phiY', 'psi'] as const) {
      const cos2 = trigMul(trigCos(angle), trigCos(angle));
      const sin2 = trigMul(trigSin(angle), trigSin(angle));
      const sum = trigSimplify(trigAdd(cos2, sin2));
      expect(trigIsConst(sum)).toBe(true);
      expectClose(trigGetConst(sum), 1);
    }
  });

  it('2*cos^2 + 2*sin^2 = 2', () => {
    const cos2 = trigScale(trigMul(trigCos('phiY'), trigCos('phiY')), 2);
    const sin2 = trigScale(trigMul(trigSin('phiY'), trigSin('phiY')), 2);
    const sum = trigSimplify(trigAdd(cos2, sin2));
    expect(trigIsConst(sum)).toBe(true);
    expectClose(trigGetConst(sum), 2);
  });

  it('preserves non-reducible terms', () => {
    const p = trigCos('phiX');
    const simplified = trigSimplify(p);
    expectEvalClose(simplified, 45, 0, 0, Math.SQRT2 / 2);
    expect(simplified.terms.size).toBe(1);
  });

  it('simplifies cos^2(a)*cos(b) + sin^2(a)*cos(b) = cos(b)', () => {
    const cos2a = trigMul(trigCos('phiX'), trigCos('phiX'));
    const sin2a = trigMul(trigSin('phiX'), trigSin('phiX'));
    const cosb = trigCos('phiY');
    const sum = trigSimplify(trigAdd(
      trigMul(cos2a, cosb),
      trigMul(sin2a, cosb)
    ));
    for (const [phiX, phiY] of [[30, 45], [60, 120], [0, 0]]) {
      expectClose(trigEval(sum, phiX, phiY, 0), Math.cos(phiY * Math.PI / 180));
    }
  });

  it('prunes near-zero terms', () => {
    const p = trigAdd(trigConst(1e-15), trigCos('phiX'));
    const simplified = trigSimplify(p);
    expect(simplified.terms.size).toBe(1);
  });
});

describe('trigPoly edge cases', () => {
  it('multiplication by zero gives zero', () => {
    const p = trigMul(TRIG_ZERO, trigCos('phiX'));
    expect(trigIsZero(p)).toBe(true);
  });

  it('multiplication by one gives identity', () => {
    const p = trigMul(TRIG_ONE, trigCos('phiX'));
    expectEvalClose(p, 60, 0, 0, 0.5);
    expect(p.terms.size).toBe(1);
  });

  it('adding zero gives identity', () => {
    const p = trigAdd(trigCos('phiX'), TRIG_ZERO);
    expectEvalClose(p, 60, 0, 0, 0.5);
    expect(p.terms.size).toBe(1);
  });

  it('handles high-degree monomials (degree 6 for EQ)', () => {
    const r1 = trigMul(trigCos('phiX'), trigMul(trigSin('phiY'), trigCos('psi')));
    const r2 = trigMul(trigSin('phiX'), trigMul(trigCos('phiY'), trigSin('psi')));
    const product = trigMul(r1, r2);

    const expected =
      Math.cos(Math.PI / 6) * Math.sin(Math.PI / 4) * Math.cos(Math.PI / 3) *
      Math.sin(Math.PI / 6) * Math.cos(Math.PI / 4) * Math.sin(Math.PI / 3);
    expectEvalClose(product, 30, 45, 60, expected);
  });
});
