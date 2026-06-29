import { describe, it, expect } from 'vitest';
import { calculateSymbolicSHGExpressions, buildSymbolicR, type SymPoly } from './symbolicProjection';
import { calculateSHGExpressions, rotX, rotY, rotZ, mat3mul, type SHGOptions } from './tensorProjection';
import { trigEval, trigIsConst, trigGetConst } from './trigPoly';
import { ROTATED_SHG_FIXTURES } from './rotatedSHG.fixtures';

const EPSILON = 1e-6;

/** Evaluate a SymPoly at given angles, producing the same Poly structure as numeric path */
function evalSymPoly(sym: SymPoly, phiX: number, phiY: number, psi: number): Map<string, Map<string, number>> {
  const result = new Map<string, Map<string, number>>();
  for (const [chi, pairMap] of sym) {
    const numPairMap = new Map<string, number>();
    for (const [pair, tp] of pairMap) {
      const v = trigEval(tp, phiX, phiY, psi);
      if (Math.abs(v) > 1e-12) numPairMap.set(pair, v);
    }
    if (numPairMap.size > 0) result.set(chi, numPairMap);
  }
  return result;
}

function comparePolys(symPoly: Map<string, Map<string, number>>, numPoly: Map<string, Map<string, number>>, label: string) {
  const allChis = new Set([...symPoly.keys(), ...numPoly.keys()]);
  for (const chi of allChis) {
    const symPairs = symPoly.get(chi) || new Map();
    const numPairs = numPoly.get(chi) || new Map();
    const allPairs = new Set([...symPairs.keys(), ...numPairs.keys()]);
    for (const pair of allPairs) {
      const sv = symPairs.get(pair) || 0;
      const nv = numPairs.get(pair) || 0;
      if (Math.abs(sv - nv) >= EPSILON) {
        throw new Error(`${label}: chi=${chi} pair=${pair}: symbolic=${sv} numeric=${nv}`);
      }
    }
  }
}

describe('buildSymbolicR', () => {
  it('evaluates to numeric R at (0,0,0) for k||z preset', () => {
    const R_sym = buildSymbolicR(0, 0);
    const R_num = mat3mul(rotZ(0), mat3mul(rotY(0), mat3mul(rotX(0), mat3mul(rotY(0), rotX(0)))));
    for (let i = 0; i < 3; i++)
      for (let j = 0; j < 3; j++)
        expect(Math.abs(trigEval(R_sym[i][j], 0, 0, 0) - R_num[i][j])).toBeLessThan(1e-12);
  });

  it('evaluates to numeric R at (30, 45, 60) for k||z', () => {
    const R_sym = buildSymbolicR(0, 0);
    const R_preset = mat3mul(rotY(0), rotX(0));
    const R_num = mat3mul(rotY(45), mat3mul(rotX(30), mat3mul(rotZ(60), R_preset)));
    for (let i = 0; i < 3; i++)
      for (let j = 0; j < 3; j++)
        expect(Math.abs(trigEval(R_sym[i][j], 30, 45, 60) - R_num[i][j])).toBeLessThan(1e-10);
  });

  it('evaluates to numeric R at (30, 45, 60) for k||x preset', () => {
    const R_sym = buildSymbolicR(0, -90);
    const R_preset = mat3mul(rotY(-90), rotX(0));
    const R_num = mat3mul(rotY(45), mat3mul(rotX(30), mat3mul(rotZ(60), R_preset)));
    for (let i = 0; i < 3; i++)
      for (let j = 0; j < 3; j++)
        expect(Math.abs(trigEval(R_sym[i][j], 30, 45, 60) - R_num[i][j])).toBeLessThan(1e-10);
  });

  it('evaluates to numeric R at (15, -20, 75) for k||y preset', () => {
    const R_sym = buildSymbolicR(90, 0);
    const R_preset = mat3mul(rotY(0), rotX(90));
    const R_num = mat3mul(rotY(-20), mat3mul(rotX(15), mat3mul(rotZ(75), R_preset)));
    for (let i = 0; i < 3; i++)
      for (let j = 0; j < 3; j++)
        expect(Math.abs(trigEval(R_sym[i][j], 15, -20, 75) - R_num[i][j])).toBeLessThan(1e-10);
  });
});

describe('symbolic vs numeric reproduction at (0,0,0)', () => {
  const GROUPS = ['1', 'mm2', '3m', '4mm', '6mm', '-43m', 'm-3m', '2', '-1', '-6m2', "4'mm'", "-3'm"];
  const TENSOR_TYPES: Array<'ED' | 'MD' | 'EQ'> = ['ED', 'MD', 'EQ'];
  const TR_TYPES: Array<'i' | 'c'> = ['i', 'c'];

  for (const group of GROUPS) {
    for (const tt of TENSOR_TYPES) {
      for (const tr of TR_TYPES) {
        it(`${group} ${tt} ${tr}-type at (0,0,0)`, () => {
          const opts: SHGOptions = { groupName: group, tensorType: tt, trType: tr, thetaX: 0, thetaY: 0 };

          const numResult = calculateSHGExpressions(opts);
          const symResult = calculateSymbolicSHGExpressions(opts);

          expect(symResult.source.length).toBe(numResult.source.length);

          for (let s = 0; s < symResult.source.length; s++) {
            const symSource = symResult.source[s];
            const numSource = numResult.source[s];
            expect(symSource.component).toBe(numSource.component);

            const evaluatedPoly = evalSymPoly(symSource.symbolicPoly, 0, 0, 0);
            const numPoly = numSource.rawPoly!;
            comparePolys(evaluatedPoly, numPoly, `${group} ${tt} ${tr} ${symSource.component}`);
          }
        });
      }
    }
  }
});

describe('symbolic vs numeric reproduction at rotated angles', () => {
  const TEST_ANGLES = [
    { phiX: 30, phiY: 0, psi: 0 },
    { phiX: 0, phiY: 45, psi: 0 },
    { phiX: 0, phiY: 0, psi: 60 },
    { phiX: 20, phiY: 35, psi: 0 },
    { phiX: 15, phiY: -25, psi: 50 },
  ];

  const GROUPS = ['mm2', '3m', '-43m', "4'mm'"];

  for (const group of GROUPS) {
    for (const angles of TEST_ANGLES) {
      it(`${group} ED i-type at (${angles.phiX},${angles.phiY},${angles.psi})`, () => {
        const opts: SHGOptions = {
          groupName: group, tensorType: 'ED', trType: 'i',
          thetaX: 0, thetaY: 0,
          phiX: angles.phiX, phiY: angles.phiY, psi: angles.psi,
        };

        const numResult = calculateSHGExpressions(opts);
        const symResult = calculateSymbolicSHGExpressions({ ...opts, phiX: 0, phiY: 0, psi: 0 });

        for (let s = 0; s < symResult.source.length; s++) {
          const evaluatedPoly = evalSymPoly(
            symResult.source[s].symbolicPoly,
            angles.phiX, angles.phiY, angles.psi
          );
          const numPoly = numResult.source[s].rawPoly!;
          comparePolys(evaluatedPoly, numPoly,
            `${group} ${symResult.source[s].component} at (${angles.phiX},${angles.phiY},${angles.psi})`);
        }
      });
    }
  }
});

describe('symbolic vs numeric at non-zero preset (k||x, k||y)', () => {
  const PRESETS = [
    { thetaX: 0, thetaY: -90, label: 'k||x' },
    { thetaX: 90, thetaY: 0, label: 'k||y' },
  ];

  for (const preset of PRESETS) {
    it(`mm2 ED i-type at ${preset.label}, (0,0,0)`, () => {
      const opts: SHGOptions = {
        groupName: 'mm2', tensorType: 'ED', trType: 'i',
        thetaX: preset.thetaX, thetaY: preset.thetaY,
      };
      const numResult = calculateSHGExpressions(opts);
      const symResult = calculateSymbolicSHGExpressions(opts);

      for (let s = 0; s < symResult.source.length; s++) {
        const evaluatedPoly = evalSymPoly(symResult.source[s].symbolicPoly, 0, 0, 0);
        comparePolys(evaluatedPoly, numResult.source[s].rawPoly!,
          `${preset.label} ${symResult.source[s].component}`);
      }
    });

    it(`mm2 ED i-type at ${preset.label}, (30,45,60)`, () => {
      const opts: SHGOptions = {
        groupName: 'mm2', tensorType: 'ED', trType: 'i',
        thetaX: preset.thetaX, thetaY: preset.thetaY,
        phiX: 30, phiY: 45, psi: 60,
      };
      const numResult = calculateSHGExpressions(opts);
      const symResult = calculateSymbolicSHGExpressions({
        ...opts, phiX: 0, phiY: 0, psi: 0,
      });

      for (let s = 0; s < symResult.source.length; s++) {
        const evaluatedPoly = evalSymPoly(symResult.source[s].symbolicPoly, 30, 45, 60);
        comparePolys(evaluatedPoly, numResult.source[s].rawPoly!,
          `${preset.label} ${symResult.source[s].component} rotated`);
      }
    });
  }
});

describe('symbolic output evaluates correctly at (0,0,0)', () => {
  it('mm2 ED i-type symbolic source terms evaluate to correct numeric values at (0,0,0)', () => {
    const symResult = calculateSymbolicSHGExpressions({
      groupName: 'mm2', tensorType: 'ED', trType: 'i',
    });
    const numResult = calculateSHGExpressions({
      groupName: 'mm2', tensorType: 'ED', trType: 'i',
    });
    for (let s = 0; s < symResult.source.length; s++) {
      const evaluated = evalSymPoly(symResult.source[s].symbolicPoly, 0, 0, 0);
      comparePolys(evaluated, numResult.source[s].rawPoly!,
        `mm2 ${symResult.source[s].component}`);
    }
  });

  it('symbolic output contains non-constant TrigPoly (angle dependence is preserved)', () => {
    const result = calculateSymbolicSHGExpressions({
      groupName: 'mm2', tensorType: 'ED', trType: 'i',
    });
    let hasNonConst = false;
    for (const src of result.source) {
      for (const [, pairMap] of src.symbolicPoly) {
        for (const [, tp] of pairMap) {
          if (!trigIsConst(tp)) hasNonConst = true;
        }
      }
    }
    expect(hasNonConst).toBe(true);
  });
});

describe('MD and EQ tensor types', () => {
  it('MD source terms reproduce numeric at (0,0,0)', () => {
    const opts: SHGOptions = { groupName: '3m', tensorType: 'MD', trType: 'c' };
    const numResult = calculateSHGExpressions(opts);
    const symResult = calculateSymbolicSHGExpressions(opts);

    for (let s = 0; s < symResult.source.length; s++) {
      const evaluatedPoly = evalSymPoly(symResult.source[s].symbolicPoly, 0, 0, 0);
      comparePolys(evaluatedPoly, numResult.source[s].rawPoly!,
        `MD ${symResult.source[s].component}`);
    }
  });

  it('MD source terms reproduce numeric at (30, 45, 0)', () => {
    const opts: SHGOptions = {
      groupName: '3m', tensorType: 'MD', trType: 'c',
      phiX: 30, phiY: 45, psi: 0,
    };
    const numResult = calculateSHGExpressions(opts);
    const symResult = calculateSymbolicSHGExpressions({
      ...opts, phiX: 0, phiY: 0, psi: 0,
    });

    for (let s = 0; s < symResult.source.length; s++) {
      const evaluatedPoly = evalSymPoly(symResult.source[s].symbolicPoly, 30, 45, 0);
      comparePolys(evaluatedPoly, numResult.source[s].rawPoly!,
        `MD ${symResult.source[s].component} rotated`);
    }
  });

  it('EQ source terms reproduce numeric at (0,0,0)', () => {
    const opts: SHGOptions = { groupName: 'mm2', tensorType: 'EQ', trType: 'i' };
    const numResult = calculateSHGExpressions(opts);
    const symResult = calculateSymbolicSHGExpressions(opts);

    for (let s = 0; s < symResult.source.length; s++) {
      const evaluatedPoly = evalSymPoly(symResult.source[s].symbolicPoly, 0, 0, 0);
      comparePolys(evaluatedPoly, numResult.source[s].rawPoly!,
        `EQ ${symResult.source[s].component}`);
    }
  });

  it('EQ source terms reproduce numeric at (20, -15, 40)', () => {
    const opts: SHGOptions = {
      groupName: 'mm2', tensorType: 'EQ', trType: 'i',
      phiX: 20, phiY: -15, psi: 40,
    };
    const numResult = calculateSHGExpressions(opts);
    const symResult = calculateSymbolicSHGExpressions({
      ...opts, phiX: 0, phiY: 0, psi: 0,
    });

    for (let s = 0; s < symResult.source.length; s++) {
      const evaluatedPoly = evalSymPoly(symResult.source[s].symbolicPoly, 20, -15, 40);
      comparePolys(evaluatedPoly, numResult.source[s].rawPoly!,
        `EQ ${symResult.source[s].component} rotated`);
    }
  });
});

describe('induced expressions match', () => {
  it('crystal-frame induced expressions match numeric path', () => {
    const opts: SHGOptions = { groupName: 'mm2', tensorType: 'ED', trType: 'i' };
    const numResult = calculateSHGExpressions(opts);
    const symResult = calculateSymbolicSHGExpressions(opts);

    expect(symResult.induced.length).toBe(numResult.induced.length);
    for (let i = 0; i < symResult.induced.length; i++) {
      expect(symResult.induced[i].component).toBe(numResult.induced[i].component);
      expect(symResult.induced[i].expression).toBe(numResult.induced[i].expression);
    }
  });
});
