export function hklToPresetAngles(h: number, k: number, l: number): { tx: number; ty: number } | null {
  if (h === 0 && k === 0 && l === 0) return null;
  const norm = Math.sqrt(h * h + k * k + l * l);
  const nx = h / norm;
  const ny = k / norm;
  const nz = l / norm;
  const tx = Math.atan2(ny, nz) * 180 / Math.PI;
  const ty = Math.atan2(-nx, Math.sqrt(ny * ny + nz * nz)) * 180 / Math.PI;
  return { tx, ty };
}
