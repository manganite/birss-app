/**
 * tensorCalculator.ts
 *
 * Public barrel for the tensor-calculation services. Physics/group-theory lives in
 * symmetryGroups.ts, numeric projection in tensorProjection.ts, and LaTeX rendering
 * in latexFormatting.ts -- see AGENTS.md for the module dependency direction.
 */

export {
  isCentrosymmetric,
  getSymmetryOperations,
  getGeneratorSymbols,
  getAlternateSettings,
  getFutureSettingCount,
  getTransformedGenerators,
  type SettingDef,
} from './symmetryGroups';
export {
  type TensorType,
  type TensorTimeReversal,
  type SHGExpression,
  type SHGResult,
  type SHGOptions,
  type LabFrameOptions,
  formatCoeff,
  calculateSHGExpressions,
  getLabFrameVectors,
} from './tensorProjection';
export { calculateTensorComponents, formatSubstitutedPolySum } from './latexFormatting';
export {
  type SymPoly,
  type SymbolicSHGExpression,
  type SymbolicSHGResult,
  calculateSymbolicSHGExpressions,
} from './symbolicProjection';
export { type TrigPoly } from './trigPoly';
export { formatTrigPoly, formatSymbolicSourceTerm } from './trigPolyFormat';
