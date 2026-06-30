import type { TensorType, TensorTimeReversal } from './tensorCalculator';

export interface RotatedSHGFixture {
  id: string;
  groupName: string;
  tensorType: TensorType;
  trType: TensorTimeReversal;
  thetaX: number;
  thetaY: number;
  note: string;
  expectedInduced: { component: string; expression: string }[];
  expectedSource: { component: string; expression: string }[];
}

export interface LabFrameFixture {
  thetaX: number;
  thetaY: number;
  expected: { X: string; Y: string; Z: string };
}

/**
 * Golden reference SHG outputs at non-zero rotation angles, captured from the
 * verified engine at v0.2.0 (commit 20c1990, after 1B.0 signature migration).
 * These pin down the rotated code path before the engine is refactored to use
 * composable matrix primitives (1B.1–1B.2).
 */
export const ROTATED_SHG_FIXTURES: RotatedSHGFixture[] = [
  // R1: mm2 ED i-type at k||x (0, -90)
  {
    id: 'R1',
    groupName: 'mm2',
    tensorType: 'ED',
    trType: 'i',
    thetaX: 0,
    thetaY: -90,
    note: 'k||x, orthorhombic',
    expectedInduced: [
      { component: 'P_x', expression: '2\\chi_{xxz}E_x E_z' },
      { component: 'P_y', expression: '2\\chi_{yyz}E_y E_z' },
      { component: 'P_z', expression: '\\chi_{zxx}E_x^2 + \\chi_{zyy}E_y^2 + \\chi_{zzz}E_z^2' },
    ],
    expectedSource: [
      { component: 'S_X', expression: '-\\chi_{zyy}E_Y^2 - \\chi_{zzz}E_X^2' },
      { component: 'S_Y', expression: '-2\\chi_{yyz}E_X E_Y' },
      { component: 'S_Z', expression: '0' },
    ],
  },
  // R2: mm2 ED i-type at k||y (90, 0)
  {
    id: 'R2',
    groupName: 'mm2',
    tensorType: 'ED',
    trType: 'i',
    thetaX: 90,
    thetaY: 0,
    note: 'k||y, orthorhombic',
    expectedInduced: [
      { component: 'P_x', expression: '2\\chi_{xxz}E_x E_z' },
      { component: 'P_y', expression: '2\\chi_{yyz}E_y E_z' },
      { component: 'P_z', expression: '\\chi_{zxx}E_x^2 + \\chi_{zyy}E_y^2 + \\chi_{zzz}E_z^2' },
    ],
    expectedSource: [
      { component: 'S_X', expression: '-2\\chi_{xxz}E_X E_Y' },
      { component: 'S_Y', expression: '-\\chi_{zxx}E_X^2 - \\chi_{zzz}E_Y^2' },
      { component: 'S_Z', expression: '0' },
    ],
  },
  // R3: 32 ED i-type at k||x (0, -90)
  {
    id: 'R3',
    groupName: '32',
    tensorType: 'ED',
    trType: 'i',
    thetaX: 0,
    thetaY: -90,
    note: 'k||x, trigonal',
    expectedInduced: [
      { component: 'P_x', expression: '2\\chi_{xxy}E_x E_y + 2\\chi_{xyz}E_y E_z' },
      { component: 'P_y', expression: '\\chi_{xxy}(E_x^2 - E_y^2) - 2\\chi_{xyz}E_x E_z' },
      { component: 'P_z', expression: '0' },
    ],
    expectedSource: [
      { component: 'S_X', expression: '0' },
      { component: 'S_Y', expression: '-\\chi_{xxy}E_Y^2' },
      { component: 'S_Z', expression: '-2\\chi_{xyz}E_X E_Y' },
    ],
  },
  // R4: 32 ED i-type at k||y (90, 0)
  {
    id: 'R4',
    groupName: '32',
    tensorType: 'ED',
    trType: 'i',
    thetaX: 90,
    thetaY: 0,
    note: 'k||y, trigonal',
    expectedInduced: [
      { component: 'P_x', expression: '2\\chi_{xxy}E_x E_y + 2\\chi_{xyz}E_y E_z' },
      { component: 'P_y', expression: '\\chi_{xxy}(E_x^2 - E_y^2) - 2\\chi_{xyz}E_x E_z' },
      { component: 'P_z', expression: '0' },
    ],
    expectedSource: [
      { component: 'S_X', expression: '0' },
      { component: 'S_Y', expression: '0' },
      { component: 'S_Z', expression: '\\chi_{xxy}E_X^2 + 2\\chi_{xyz}E_X E_Y' },
    ],
  },
  // R5: 4mm ED i-type at k||x (0, -90)
  {
    id: 'R5',
    groupName: '4mm',
    tensorType: 'ED',
    trType: 'i',
    thetaX: 0,
    thetaY: -90,
    note: 'k||x, tetragonal',
    expectedInduced: [
      { component: 'P_x', expression: '2\\chi_{xxz}E_x E_z' },
      { component: 'P_y', expression: '2\\chi_{xxz}E_y E_z' },
      { component: 'P_z', expression: '\\chi_{zxx}(E_x^2 + E_y^2) + \\chi_{zzz}E_z^2' },
    ],
    expectedSource: [
      { component: 'S_X', expression: '-\\chi_{zxx}E_Y^2 - \\chi_{zzz}E_X^2' },
      { component: 'S_Y', expression: '-2\\chi_{xxz}E_X E_Y' },
      { component: 'S_Z', expression: '0' },
    ],
  },
  // R6: -3'm' ED c-type at k||x (0, -90)
  {
    id: 'R6',
    groupName: "-3'm'",
    tensorType: 'ED',
    trType: 'c',
    thetaX: 0,
    thetaY: -90,
    note: 'k||x, magnetic BW c-type',
    expectedInduced: [
      { component: 'P_x', expression: '2\\chi_{xxy}E_x E_y + 2\\chi_{xyz}E_y E_z' },
      { component: 'P_y', expression: '\\chi_{xxy}(E_x^2 - E_y^2) - 2\\chi_{xyz}E_x E_z' },
      { component: 'P_z', expression: '0' },
    ],
    expectedSource: [
      { component: 'S_X', expression: '0' },
      { component: 'S_Y', expression: '-\\chi_{xxy}E_Y^2' },
      { component: 'S_Z', expression: '-2\\chi_{xyz}E_X E_Y' },
    ],
  },
  // R7: mm2 ED i-type at oblique (30, 45)
  {
    id: 'R7',
    groupName: 'mm2',
    tensorType: 'ED',
    trType: 'i',
    thetaX: 30,
    thetaY: 45,
    note: 'oblique angle',
    expectedInduced: [
      { component: 'P_x', expression: '2\\chi_{xxz}E_x E_z' },
      { component: 'P_y', expression: '2\\chi_{yyz}E_y E_z' },
      { component: 'P_z', expression: '\\chi_{zxx}E_x^2 + \\chi_{zyy}E_y^2 + \\chi_{zzz}E_z^2' },
    ],
    expectedSource: [
      { component: 'S_X', expression: '\\chi_{xxz}(\\frac{\\sqrt{6}}{4}E_X^2 - \\frac{1}{2}E_X E_Y) + \\chi_{yyz}(0.153E_X^2 + \\frac{1}{4}E_X E_Y - 0.306E_Y^2) + 0.306\\chi_{zxx}E_X^2 + \\chi_{zyy}(0.077E_X^2 + \\frac{3}{8}E_X E_Y + 0.459E_Y^2) + \\chi_{zzz}(0.23E_X^2 - \\frac{3}{8}E_X E_Y + 0.153E_Y^2)' },
      { component: 'S_Y', expression: '\\chi_{yyz}(\\frac{3}{8}E_X^2 + \\frac{\\sqrt{6}}{4}E_X E_Y - \\frac{3}{4}E_Y^2) - \\frac{1}{4}\\chi_{zxx}E_X^2 + \\chi_{zyy}(-0.062E_X^2 - 0.306E_X E_Y - \\frac{3}{8}E_Y^2) + \\chi_{zzz}(-0.187E_X^2 + 0.306E_X E_Y - \\frac{1}{8}E_Y^2)' },
      { component: 'S_Z', expression: '\\chi_{xxz}(-\\frac{\\sqrt{6}}{4}E_X^2 + \\frac{1}{2}E_X E_Y) + \\chi_{yyz}(0.153E_X^2 + \\frac{1}{4}E_X E_Y - 0.306E_Y^2) + 0.306\\chi_{zxx}E_X^2 + \\chi_{zyy}(0.077E_X^2 + \\frac{3}{8}E_X E_Y + 0.459E_Y^2) + \\chi_{zzz}(0.23E_X^2 - \\frac{3}{8}E_X E_Y + 0.153E_Y^2)' },
    ],
  },
  // R8: 32 MD i-type at k||x (0, -90)
  {
    id: 'R8',
    groupName: '32',
    tensorType: 'MD',
    trType: 'i',
    thetaX: 0,
    thetaY: -90,
    note: 'k||x, axial tensor',
    expectedInduced: [
      { component: 'M_x', expression: '2\\chi_{xxy}E_x E_y + 2\\chi_{xyz}E_y E_z' },
      { component: 'M_y', expression: '\\chi_{xxy}(E_x^2 - E_y^2) - 2\\chi_{xyz}E_x E_z' },
      { component: 'M_z', expression: '0' },
    ],
    expectedSource: [
      { component: 'S_X', expression: '\\chi_{xxy}E_Y^2' },
      { component: 'S_Y', expression: '0' },
      { component: 'S_Z', expression: '0' },
    ],
  },
];

export const LAB_FRAME_FIXTURES: LabFrameFixture[] = [
  // Identity: (0, 0)
  { thetaX: 0, thetaY: 0, expected: { X: '\\mathbf{X}_{LAB}', Y: '\\mathbf{Y}_{LAB}', Z: '\\mathbf{Z}_{LAB}' } },
  // k||x: (0, -90) — x_crys = Z_LAB, y_crys = Y_LAB, z_crys = -X_LAB
  { thetaX: 0, thetaY: -90, expected: { X: '\\mathbf{Z}_{LAB}', Y: '\\mathbf{Y}_{LAB}', Z: '-\\mathbf{X}_{LAB}' } },
  // k||y: (90, 0) — x_crys = X_LAB, y_crys = Z_LAB, z_crys = -Y_LAB
  { thetaX: 90, thetaY: 0, expected: { X: '\\mathbf{X}_{LAB}', Y: '\\mathbf{Z}_{LAB}', Z: '-\\mathbf{Y}_{LAB}' } },
];
