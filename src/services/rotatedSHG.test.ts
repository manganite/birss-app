import { describe, it, expect } from 'vitest';
import { calculateSHGExpressions, getLabFrameVectors } from './tensorCalculator';
import { rotX, rotY, rotZ, mat3mul } from './tensorProjection';
import { ROTATED_SHG_FIXTURES, LAB_FRAME_FIXTURES } from './rotatedSHG.fixtures';

const EPSILON = 1e-10;

function expectMatrixClose(A: number[][], B: number[][], tol = EPSILON) {
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 3; j++)
      expect(Math.abs(A[i][j] - B[i][j])).toBeLessThan(tol);
}

const I3: number[][] = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];

describe('rotation matrix primitives', () => {
  it.each([
    ['rotX', rotX],
    ['rotY', rotY],
    ['rotZ', rotZ],
  ])('%s(0) returns identity', (_name, fn) => {
    expectMatrixClose(fn(0), I3);
  });

  it('rotZ(90) returns [[0,-1,0],[1,0,0],[0,0,1]]', () => {
    expectMatrixClose(rotZ(90), [[0, -1, 0], [1, 0, 0], [0, 0, 1]]);
  });

  it('rotX(90) returns [[1,0,0],[0,0,-1],[0,1,0]]', () => {
    expectMatrixClose(rotX(90), [[1, 0, 0], [0, 0, -1], [0, 1, 0]]);
  });

  it('rotY(-90) returns [[0,0,-1],[0,1,0],[1,0,0]]', () => {
    expectMatrixClose(rotY(-90), [[0, 0, -1], [0, 1, 0], [1, 0, 0]]);
  });

  it('mat3mul(I, A) = A', () => {
    const A = rotZ(37);
    expectMatrixClose(mat3mul(I3, A), A);
  });

  it('mat3mul(A, I) = A', () => {
    const A = rotX(53);
    expectMatrixClose(mat3mul(A, I3), A);
  });
});

describe('composition equivalence: mat3mul(rotY(ty), rotX(tx)) matches hand-expanded R', () => {
  function handExpandedR(thetaX: number, thetaY: number): number[][] {
    const cx = Math.cos(thetaX * Math.PI / 180);
    const sx = Math.sin(thetaX * Math.PI / 180);
    const cy = Math.cos(thetaY * Math.PI / 180);
    const sy = Math.sin(thetaY * Math.PI / 180);
    return [
      [cy, sx * sy, cx * sy],
      [0, cx, -sx],
      [-sy, sx * cy, cx * cy],
    ];
  }

  it.each([
    [0, 0],
    [0, -90],
    [90, 0],
    [30, 45],
    [45, -60],
    [-15, 72],
  ])('(thetaX=%d, thetaY=%d)', (tx, ty) => {
    const composed = mat3mul(rotY(ty), rotX(tx));
    const hand = handExpandedR(tx, ty);
    expectMatrixClose(composed, hand);
  });
});

describe('calculateSHGExpressions - rotated golden references', () => {
  for (const f of ROTATED_SHG_FIXTURES) {
    it(`${f.id}: ${f.groupName} ${f.tensorType} ${f.trType}-type at (${f.thetaX}, ${f.thetaY}) — ${f.note}`, () => {
      const result = calculateSHGExpressions({
        groupName: f.groupName,
        tensorType: f.tensorType,
        trType: f.trType,
        thetaX: f.thetaX,
        thetaY: f.thetaY,
      });

      const induced = result.induced.map(e => ({ component: e.component, expression: e.expression }));
      const source = result.source.map(e => ({ component: e.component, expression: e.expression }));

      expect(induced).toEqual(f.expectedInduced);
      expect(source).toEqual(f.expectedSource);
    });
  }
});

describe('getLabFrameVectors - rotated golden references', () => {
  for (const f of LAB_FRAME_FIXTURES) {
    it(`(${f.thetaX}, ${f.thetaY}) returns correct crystal-to-lab mapping`, () => {
      const lf = getLabFrameVectors({ thetaX: f.thetaX, thetaY: f.thetaY });
      expect(lf).toEqual(f.expected);
    });
  }
});
