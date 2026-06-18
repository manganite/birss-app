import { describe, it, expect } from 'vitest';
import { GENERATORS, getCachedFullGroup, multiply, isSameMatrix, snapMatrix } from './symmetryGroups';
import { POINT_GROUPS } from '../data/pointGroups';

/**
 * Tier 1b: true closure. getFullGroup() builds each group by repeatedly multiplying
 * pairs of elements until no new elements appear; this test independently verifies
 * the *result* actually is closed under multiplication -- i.e. for every pair of
 * elements in the closed group, their product is itself a member. This is what
 * the element-snapping in getFullGroup is meant to guarantee despite floating-point
 * drift across repeated products.
 */
describe('getCachedFullGroup - true closure (Tier 1b)', () => {
  for (const pg of POINT_GROUPS) {
    it(`${pg.name} (type ${pg.type}) is closed under multiplication`, () => {
      const group = getCachedFullGroup(pg.name, GENERATORS[pg.name]);
      for (const a of group) {
        for (const b of group) {
          const prod = snapMatrix(multiply(a, b));
          expect(group.some(m => isSameMatrix(m, prod))).toBe(true);
        }
      }
    });
  }
});
