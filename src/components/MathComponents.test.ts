import { describe, it, expect } from 'vitest';
import { hklToPresetAngles } from './MathComponents';

describe('hklToPresetAngles', () => {
  const EPSILON = 1e-10;

  it('returns null for [0 0 0]', () => {
    expect(hklToPresetAngles(0, 0, 0)).toBeNull();
  });

  it('[0 0 1] → tx=0, ty=0 (identity)', () => {
    const r = hklToPresetAngles(0, 0, 1)!;
    expect(r.tx).toBeCloseTo(0, 10);
    expect(r.ty).toBeCloseTo(0, 10);
  });

  it('[1 0 0] → tx=0, ty=-90', () => {
    const r = hklToPresetAngles(1, 0, 0)!;
    expect(r.tx).toBeCloseTo(0, 10);
    expect(r.ty).toBeCloseTo(-90, 10);
  });

  it('[0 1 0] → tx=90, ty=0', () => {
    const r = hklToPresetAngles(0, 1, 0)!;
    expect(r.tx).toBeCloseTo(90, 10);
    expect(r.ty).toBeCloseTo(0, 10);
  });

  it('[1 1 0] → tx=90, ty=-45', () => {
    const r = hklToPresetAngles(1, 1, 0)!;
    expect(r.tx).toBeCloseTo(90, 10);
    expect(r.ty).toBeCloseTo(-45, 10);
  });

  it('[1 1 1] matches the curated [111] preset angles', () => {
    const r = hklToPresetAngles(1, 1, 1)!;
    expect(r.tx).toBeCloseTo(45, 10);
    expect(r.ty).toBeCloseTo(-(Math.atan(1 / Math.SQRT2) * 180 / Math.PI), 10);
  });

  it('[0 0 -1] → tx=180, ty=0 (Rx flips z)', () => {
    const r = hklToPresetAngles(0, 0, -1)!;
    expect(Math.abs(r.tx)).toBeCloseTo(180, 10);
    expect(r.ty).toBeCloseTo(0, 10);
  });

  it('scaling [hkl] does not change the result', () => {
    const r1 = hklToPresetAngles(1, 2, 3)!;
    const r2 = hklToPresetAngles(2, 4, 6)!;
    expect(r1.tx).toBeCloseTo(r2.tx, 10);
    expect(r1.ty).toBeCloseTo(r2.ty, 10);
  });

  it('Ry(ty)·Rx(tx) maps [hkl] to [0,0,1] for arbitrary input', () => {
    const cases = [[1,2,3], [0,1,1], [3,0,1], [-1,1,0], [2,-1,3]];
    for (const [h, k, l] of cases) {
      const r = hklToPresetAngles(h, k, l)!;
      const txRad = r.tx * Math.PI / 180;
      const tyRad = r.ty * Math.PI / 180;
      const norm = Math.sqrt(h*h + k*k + l*l);
      const nx = h/norm, ny = k/norm, nz = l/norm;
      // Rx(tx)
      const x1 = nx;
      const y1 = ny * Math.cos(txRad) - nz * Math.sin(txRad);
      const z1 = ny * Math.sin(txRad) + nz * Math.cos(txRad);
      // Ry(ty)
      const x2 = x1 * Math.cos(tyRad) + z1 * Math.sin(tyRad);
      const y2 = y1;
      const z2 = -x1 * Math.sin(tyRad) + z1 * Math.cos(tyRad);
      expect(Math.abs(x2)).toBeLessThan(EPSILON);
      expect(Math.abs(y2)).toBeLessThan(EPSILON);
      expect(z2).toBeCloseTo(1, 10);
    }
  });
});
