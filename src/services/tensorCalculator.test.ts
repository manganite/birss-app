import { describe, it, expect } from 'vitest';
import {
  calculateTensorComponents,
  isCentrosymmetric,
  getSymmetryOperations,
  formatCoeff,
} from './tensorCalculator';
import { POINT_GROUPS } from '../data/pointGroups';

/**
 * Order (number of symmetry operations) of each of the 32 crystallographic point groups,
 * per International Tables for Crystallography Vol. A.
 */
const TYPE_I_ORDER: Record<string, number> = {
  '1': 1, '-1': 2,
  '2': 2, 'm': 2, '2/m': 4,
  '222': 4, 'mm2': 4, 'mmm': 8,
  '4': 4, '-4': 4, '4/m': 8, '422': 8, '4mm': 8, '-42m': 8, '4/mmm': 16,
  '3': 3, '-3': 6, '32': 6, '3m': 6, '-3m': 12,
  '6': 6, '-6': 6, '6/m': 12, '622': 12, '6mm': 12, '-6m2': 12, '6/mmm': 24,
  '23': 12, 'm-3': 24, '432': 24, '-43m': 24, 'm-3m': 48,
};

/** Alternative Hermann-Mauguin spellings that appear once primes are stripped from Type III symbols. */
const FAMILY_ALIASES: Record<string, string> = { 'm3': 'm-3', 'm3m': 'm-3m', '2mm': 'mm2', '-62m': '-6m2', '-4m2': '-42m' };

/**
 * Expected order of a magnetic point group:
 * - Type I: the standard crystallographic order.
 * - Type II (grey, "G1'"): twice the order of G (every operation gains a time-reversed partner).
 * - Type III (black-and-white): same order as the Type-I family obtained by dropping all primes.
 */
function expectedOrder(name: string, type: 'I' | 'II' | 'III'): number {
  if (type === 'II') {
    const base = name.slice(0, -2); // strip trailing "1'"
    return 2 * TYPE_I_ORDER[base];
  }
  if (type === 'III') {
    const family = name.replace(/'/g, '');
    return TYPE_I_ORDER[FAMILY_ALIASES[family] ?? family];
  }
  return TYPE_I_ORDER[name];
}

describe('getSymmetryOperations - group order (Tier 1)', () => {
  for (const pg of POINT_GROUPS) {
    it(`${pg.name} (type ${pg.type}) has order ${expectedOrder(pg.name, pg.type)}`, () => {
      expect(getSymmetryOperations(pg.name).length).toBe(expectedOrder(pg.name, pg.type));
    });
  }
});

describe('calculateTensorComponents - parity invariants (Tier 2)', () => {
  // One `it` per group keeps each test well under the default timeout (rank-4 EQ tensors
  // are expensive) and pinpoints exactly which group regresses.
  for (const pg of POINT_GROUPS) {
    it(`${pg.name} (type ${pg.type}): ED i-type centrosymmetric parity, EQ non-vanishing, output shape`, () => {
      if (isCentrosymmetric(pg.name)) {
        // ED (polar, odd rank) must vanish for every centrosymmetric group, i-type.
        expect(calculateTensorComponents(pg.name, 'ED', 'i')).toEqual(['All components are zero.']);
      }

      // EQ (polar, even rank) never fully vanishes, i-type: an isotropic-tensor-like
      // invariant always survives, regardless of point group.
      expect(calculateTensorComponents(pg.name, 'EQ', 'i')).not.toEqual(['All components are zero.']);

      for (const t of ['ED', 'MD', 'EQ'] as const) {
        for (const tr of ['i', 'c'] as const) {
          const res = calculateTensorComponents(pg.name, t, tr);
          expect(res.length).toBeGreaterThan(0);
          for (const entry of res) {
            expect(entry === 'All components are zero.' || /^\\chi_\{[a-z]+\}/.test(entry)).toBe(true);
          }
        }
      }
    });
  }

  for (const pg of POINT_GROUPS.filter(p => p.type === 'I')) {
    it(`${pg.name}1' (grey group) reproduces the i-type results of ${pg.name}`, () => {
      for (const t of ['ED', 'MD', 'EQ'] as const) {
        expect(calculateTensorComponents(`${pg.name}1'`, t, 'i'))
          .toEqual(calculateTensorComponents(pg.name, t, 'i'));
      }
    });
  }
});

describe('formatCoeff', () => {
  it.each([
    [1, ''],
    [-1, ''],
    [2, '2'],
    [0, '0'],
    [0.5, '\\frac{1}{2}'],
    [1 / 3, '\\frac{1}{3}'],
    [2 / 3, '\\frac{2}{3}'],
    [0.2, '\\frac{1}{5}'],
    [Math.SQRT2, '\\sqrt{2}'],
    [Math.sqrt(3) / 2, '\\frac{\\sqrt{3}}{2}'],
    [0.123456, '0.123'],
  ])('formatCoeff(%p) === %p', (input, expected) => {
    expect(formatCoeff(input)).toBe(expected);
  });
});

describe('isCentrosymmetric', () => {
  it.each(['-1', '2/m', 'mmm', '4/m', '4/mmm', '-3', '-3m', '6/m', '6/mmm', 'm-3', 'm-3m'])(
    '%s is centrosymmetric',
    (name) => {
      expect(isCentrosymmetric(name)).toBe(true);
    }
  );

  it.each(['1', '2', 'm', '222', 'mm2', '4', '-4', '422', '4mm', '-42m', '3', '32', '3m', '6', '-6', '622', '6mm', '-6m2', '23', '432', '-43m'])(
    '%s is not centrosymmetric',
    (name) => {
      expect(isCentrosymmetric(name)).toBe(false);
    }
  );
});

/**
 * Golden ED (electric dipole, i-type) component relations for a handful of well-documented
 * point groups, cross-checked against the SHG d-tensor forms in Boyd, "Nonlinear Optics"
 * (Appendix), and Sirotin & Shaskol'skaya, "Fundamentals of Crystal Physics" (1982) -- both
 * use the same symmetrization convention on the last two tensor indices as this calculator.
 */
describe('calculateTensorComponents - golden ED (i-type) relations (Tier 3)', () => {
  it('point group 1: no symmetry constraints -> 18 independent components', () => {
    // 18 = the unique chi_ijk with j<=k (intrinsic last-two-index symmetrization),
    // and no relations *between* them since group 1 imposes no further constraints.
    const result = calculateTensorComponents('1', 'ED', 'i');
    expect(result).toHaveLength(18);
  });

  it('point group -1: centrosymmetric -> SHG identically zero', () => {
    expect(calculateTensorComponents('-1', 'ED', 'i')).toEqual(['All components are zero.']);
  });

  it('point group 222 (D2): only the chi_xyz-type permutations survive, each independent', () => {
    expect(calculateTensorComponents('222', 'ED', 'i')).toEqual([
      '\\chi_{xyz} = \\chi_{xzy}',
      '\\chi_{yxz} = \\chi_{yzx}',
      '\\chi_{zxy} = \\chi_{zyx}',
    ]);
  });

  it('point group mm2 (C2v): 5 independent components, no cross-relations', () => {
    expect(calculateTensorComponents('mm2', 'ED', 'i')).toEqual([
      '\\chi_{xxz} = \\chi_{xzx}',
      '\\chi_{yyz} = \\chi_{yzy}',
      '\\chi_{zxx}',
      '\\chi_{zyy}',
      '\\chi_{zzz}',
    ]);
  });

  it('point group 4mm (C4v): 3 independent components (d15=d24, d31=d32, d33)', () => {
    expect(calculateTensorComponents('4mm', 'ED', 'i')).toEqual([
      '\\chi_{xxz} = \\chi_{xzx} = \\chi_{yyz} = \\chi_{yzy}',
      '\\chi_{zxx} = \\chi_{zyy}',
      '\\chi_{zzz}',
    ]);
  });

  it('point group 32 (D3, quartz): d11/d14 family, each independent', () => {
    expect(calculateTensorComponents('32', 'ED', 'i')).toEqual([
      '\\chi_{xxy} = \\chi_{xyx} = \\chi_{yxx} = -\\chi_{yyy}',
      '\\chi_{xyz} = \\chi_{xzy} = -\\chi_{yxz} = -\\chi_{yzx}',
    ]);
  });
});
