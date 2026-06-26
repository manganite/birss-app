import { describe, it, expect } from 'vitest';
import { calculateSHGExpressions, getLabFrameVectors } from './tensorCalculator';
import { ROTATED_SHG_FIXTURES, LAB_FRAME_FIXTURES } from './rotatedSHG.fixtures';

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
