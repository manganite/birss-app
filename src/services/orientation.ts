import { rotX, rotY, mat3mul } from './tensorProjection';

export interface Orientation {
  /** Inner tilt about lab-x (deg), aligns the surface normal toward the beam. */
  tx: number;
  /** Inner tilt about lab-y (deg), aligns the surface normal toward the beam. */
  ty: number;
  /**
   * Preset azimuth offset about the beam axis (deg). Anchors ψ=0 so that, for
   * non-principal surfaces, the projection of the crystal c-axis [001] onto the
   * sample surface lands at azimuth 0 (reproducible, lab-independent). Zero for
   * principal cuts [100]/[010]/[001], whose frame is already anchored by x∥a.
   */
  psi0: number;
}

/**
 * Map Miller indices (interpreted as a direction in the orthonormal convention
 * frame, x∥a / z∥c) to the preset orientation that places that direction along
 * the beam axis, with the azimuth-zero convention applied (ROADMAP §"Azimuth-zero").
 *
 * Full preset rotation is R_preset = Rz(psi0) · Ry(ty) · Rx(tx).
 *
 * NOTE: for non-cubic systems the orthonormal interpretation is the [uvw]
 * direction, not the (hkl) plane normal — see TODO C1.
 */
export function hklToPresetAngles(h: number, k: number, l: number): Orientation | null {
  if (h === 0 && k === 0 && l === 0) return null;
  const norm = Math.sqrt(h * h + k * k + l * l);
  const nx = h / norm;
  const ny = k / norm;
  const nz = l / norm;
  const tx = Math.atan2(ny, nz) * 180 / Math.PI;
  const ty = Math.atan2(-nx, Math.sqrt(ny * ny + nz * nz)) * 180 / Math.PI;

  // Principal cut (exactly one nonzero index): keep the established x∥a frame.
  const nonzero = [h, k, l].filter((v) => v !== 0).length;
  if (nonzero <= 1) return { tx, ty, psi0: 0 };

  // Non-principal: rotate about the beam so the c-axis projection sits at azimuth 0.
  // For non-principal cuts the c-axis is never parallel to the beam, so the
  // in-plane projection is well-defined.
  const Rp = mat3mul(rotY(ty), rotX(tx));
  const cLab = [Rp[0][2], Rp[1][2], Rp[2][2]]; // R_preset · [0,0,1]
  const psi0 = -Math.atan2(cLab[1], cLab[0]) * 180 / Math.PI;
  return { tx, ty, psi0 };
}
