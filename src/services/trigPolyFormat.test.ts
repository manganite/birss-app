import { describe, it, expect } from 'vitest';
import { formatTrigPoly, formatSymbolicSourceTerm } from './trigPolyFormat';
import { trigConst, trigCos, trigSin, trigMul, trigAdd, trigScale, TRIG_ZERO, type TrigPoly } from './trigPoly';
import type { SymPoly } from './symbolicProjection';

describe('formatTrigPoly', () => {
  it('formats zero', () => {
    expect(formatTrigPoly(TRIG_ZERO)).toBe('0');
  });

  it('formats constant 1', () => {
    expect(formatTrigPoly(trigConst(1))).toBe('1');
  });

  it('formats constant -1', () => {
    expect(formatTrigPoly(trigConst(-1))).toBe('-1');
  });

  it('formats integer constant', () => {
    expect(formatTrigPoly(trigConst(3))).toBe('3');
  });

  it('formats negative constant', () => {
    expect(formatTrigPoly(trigConst(-2))).toBe('-2');
  });

  it('formats cos(phiX)', () => {
    expect(formatTrigPoly(trigCos('phiX'))).toBe('\\cos \\varphi_x');
  });

  it('formats sin(phiY)', () => {
    expect(formatTrigPoly(trigSin('phiY'))).toBe('\\sin \\varphi_y');
  });

  it('formats cos(psi)', () => {
    expect(formatTrigPoly(trigCos('psi'))).toBe('\\cos \\psi');
  });

  it('formats cos^2(phiX)', () => {
    const cos2 = trigMul(trigCos('phiX'), trigCos('phiX'));
    expect(formatTrigPoly(cos2)).toBe('\\cos^{2} \\varphi_x');
  });

  it('formats coefficient * trig', () => {
    const p = trigScale(trigCos('phiX'), 2);
    expect(formatTrigPoly(p)).toBe('2 \\cos \\varphi_x');
  });

  it('formats fraction * trig', () => {
    const p = trigScale(trigSin('phiY'), 0.5);
    expect(formatTrigPoly(p)).toBe('\\frac{1}{2} \\sin \\varphi_y');
  });

  it('formats sum of terms', () => {
    const p = trigAdd(trigCos('phiX'), trigSin('phiX'));
    const formatted = formatTrigPoly(p);
    expect(formatted).toContain('\\cos \\varphi_x');
    expect(formatted).toContain('\\sin \\varphi_x');
    expect(formatted).toContain('+');
  });

  it('formats cross-angle product', () => {
    const p = trigMul(trigCos('phiX'), trigSin('phiY'));
    expect(formatTrigPoly(p)).toBe('\\cos \\varphi_x \\sin \\varphi_y');
  });

  it('formats three-angle product', () => {
    const p = trigMul(trigCos('phiX'), trigMul(trigSin('phiY'), trigCos('psi')));
    expect(formatTrigPoly(p)).toBe('\\cos \\varphi_x \\sin \\varphi_y \\cos \\psi');
  });

  it('formats negative trig term', () => {
    const p = trigScale(trigCos('phiX'), -1);
    expect(formatTrigPoly(p)).toBe('-\\cos \\varphi_x');
  });

  it('formats sum with negative term', () => {
    const p = trigAdd(trigCos('phiX'), trigScale(trigSin('phiX'), -1));
    const formatted = formatTrigPoly(p);
    expect(formatted).toContain('\\cos \\varphi_x');
    expect(formatted).toContain('- \\sin \\varphi_x');
  });
});

describe('formatSymbolicSourceTerm', () => {
  it('formats empty poly as 0', () => {
    const poly: SymPoly = new Map();
    expect(formatSymbolicSourceTerm(poly)).toBe('0');
  });

  it('formats single constant coefficient', () => {
    const poly: SymPoly = new Map([
      ['\\chi_{xxz}', new Map([['01', trigConst(2)]])],
    ]);
    const formatted = formatSymbolicSourceTerm(poly);
    expect(formatted).toContain('\\chi_{xxz}');
    expect(formatted).toContain('2');
    expect(formatted).toContain('E_X E_Y');
  });

  it('formats symbolic coefficient', () => {
    const poly: SymPoly = new Map([
      ['\\chi_{zzz}', new Map([['00', trigCos('phiX')]])],
    ]);
    const formatted = formatSymbolicSourceTerm(poly);
    expect(formatted).toContain('\\chi_{zzz}');
    expect(formatted).toContain('\\cos \\varphi_x');
    expect(formatted).toContain('E_X^2');
  });

  it('formats multiple chi labels', () => {
    const poly: SymPoly = new Map([
      ['\\chi_{xxz}', new Map([['00', trigConst(1)]])],
      ['\\chi_{zzz}', new Map([['00', trigConst(1)]])],
    ]);
    const formatted = formatSymbolicSourceTerm(poly);
    expect(formatted).toContain('\\chi_{xxz}');
    expect(formatted).toContain('\\chi_{zzz}');
  });
});
