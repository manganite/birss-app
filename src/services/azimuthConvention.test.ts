import { describe, it, expect } from 'vitest';
import { hklToPresetAngles } from './orientation';
import { rotX, rotY, rotZ, mat3mul } from './tensorProjection';

/** Build R_preset = Rz(psi0)·Ry(ty)·Rx(tx) and return the c-axis [001] in lab frame. */
function cAxisInLab(h: number, k: number, l: number) {
  const o = hklToPresetAngles(h, k, l)!;
  const R = mat3mul(rotZ(o.psi0), mat3mul(rotY(o.ty), rotX(o.tx)));
  return { o, c: [R[0][2], R[1][2], R[2][2]] as [number, number, number] };
}

function normalInLab(h: number, k: number, l: number) {
  const o = hklToPresetAngles(h, k, l)!;
  const R = mat3mul(rotZ(o.psi0), mat3mul(rotY(o.ty), rotX(o.tx)));
  const n = Math.hypot(h, k, l);
  const v = [h / n, k / n, l / n];
  return [0, 1, 2].map((i) => R[i][0] * v[0] + R[i][1] * v[1] + R[i][2] * v[2]);
}

describe('azimuth-zero convention (ROADMAP §Azimuth-zero)', () => {
  it('aligns the surface normal with the beam axis for every cut', () => {
    for (const [h, k, l] of [[1, 0, 0], [0, 0, 1], [1, 1, 0], [1, 1, 1], [1, 2, 3], [0, 1, 1]]) {
      const v = normalInLab(h, k, l);
      expect(v[0]).toBeCloseTo(0, 10);
      expect(v[1]).toBeCloseTo(0, 10);
      expect(v[2]).toBeCloseTo(1, 10);
    }
  });

  it('anchors non-principal cuts so the c-axis projection lands at azimuth 0', () => {
    for (const [h, k, l] of [[1, 1, 0], [1, 1, 1], [1, 2, 3], [0, 1, 1], [2, 1, 3]]) {
      const { c } = cAxisInLab(h, k, l);
      const projMag = Math.hypot(c[0], c[1]);
      expect(projMag).toBeGreaterThan(1e-6); // c not parallel to beam for non-principal cuts
      const azimuth = Math.atan2(c[1], c[0]) * 180 / Math.PI;
      expect(azimuth).toBeCloseTo(0, 9);
    }
  });

  it('leaves principal cuts unchanged (psi0 = 0)', () => {
    for (const [h, k, l] of [[1, 0, 0], [0, 1, 0], [0, 0, 1]]) {
      expect(hklToPresetAngles(h, k, l)!.psi0).toBe(0);
    }
  });

  it('returns null for the zero vector', () => {
    expect(hklToPresetAngles(0, 0, 0)).toBeNull();
  });
});
