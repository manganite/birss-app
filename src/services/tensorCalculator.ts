/**
 * tensorCalculator.ts
 *
 * Public barrel for the tensor-calculation services. Physics/group-theory lives in
 * symmetryGroups.ts, numeric projection in tensorProjection.ts, and LaTeX rendering
 * in latexFormatting.ts -- see AGENTS.md for the module dependency direction.
 */

export { isCentrosymmetric, getSymmetryOperations } from './symmetryGroups';
export {
  type TensorType,
  type TensorTimeReversal,
  type SHGExpression,
  type SHGResult,
  formatCoeff,
  calculateSHGExpressions,
  getLabFrameVectors,
} from './tensorProjection';
export { calculateTensorComponents, formatSubstitutedPolySum } from './latexFormatting';
