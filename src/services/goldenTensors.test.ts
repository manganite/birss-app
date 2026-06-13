import { describe, it, expect } from 'vitest';
import { calculateTensorComponents } from './tensorCalculator';
import { GOLDEN_FIXTURES } from './goldenTensors.fixtures';

/**
 * Literature- and derivation-cited golden tensor-relation fixtures (Tier 3, extended).
 *
 * Each fixture pins down the *identity* of a magnetic point group's hand-curated
 * GENERATORS entry, not just its order (Tier 1) or invariants (Tier 2). See
 * goldenTensors.fixtures.ts for the per-fixture `source`/`note` citations.
 */
describe('calculateTensorComponents - extended golden fixtures (Tier 3)', () => {
  for (const f of GOLDEN_FIXTURES) {
    it(`${f.group} ${f.tensor} ${f.tr}-type matches the cited derivation`, () => {
      expect(calculateTensorComponents(f.group, f.tensor, f.tr)).toEqual(f.expected);
    });
  }
});
