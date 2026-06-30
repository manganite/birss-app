export interface GlossaryTerm {
  id: string;
  term: string;
  brief: string;
  helpTab?: 'overview' | 'conventions' | 'physics' | 'simulation' | 'deeper';
}

export const GLOSSARY_TERMS: GlossaryTerm[] = [
  {
    id: 'ed',
    term: 'Electric Dipole (ED)',
    brief: 'Polar 3rd-rank tensor — the dominant SHG source. Strictly forbidden in centrosymmetric groups for i-type symmetry.',
    helpTab: 'physics',
  },
  {
    id: 'md',
    term: 'Magnetic Dipole (MD)',
    brief: 'Axial 3rd-rank tensor. Unlike ED, MD contributions can survive in centrosymmetric groups — a parity effect independent of time-reversal.',
    helpTab: 'physics',
  },
  {
    id: 'eq',
    term: 'Electric Quadrupole (EQ)',
    brief: 'Polar 4th-rank tensor. Even-rank, so it survives spatial inversion; generates bulk SHG even in centrosymmetric crystals.',
    helpTab: 'physics',
  },
  {
    id: 'i-type',
    term: 'i-type (Time-Even)',
    brief: 'Symmetric under time reversal T. Relevant for electric properties. Vanishes for all c-type tensors in gray groups (G1’).',
    helpTab: 'physics',
  },
  {
    id: 'c-type',
    term: 'c-type (Time-Odd)',
    brief: 'Anti-symmetric under time reversal T. Relevant for magnetic and magneto-electric properties. Non-zero only in Type I or Type III groups.',
    helpTab: 'physics',
  },
  {
    id: 'crystal-setting',
    term: 'Crystal Setting',
    brief: 'An alternative axis convention for the same group. Two mechanisms exist: axis reorientation (non-monoclinic) and c/b-unique choice (monoclinic).',
    helpTab: 'conventions',
  },
  {
    id: 'type-i',
    term: 'Type I — Ordinary',
    brief: 'Standard crystallographic point group with no time-reversal operation among its elements.',
    helpTab: 'physics',
  },
  {
    id: 'type-ii',
    term: 'Type II — Gray',
    brief: 'G·1’ — the group G augmented by time reversal 1’. All c-type tensors vanish; i-type tensors behave as in parent G.',
    helpTab: 'physics',
  },
  {
    id: 'type-iii',
    term: 'Type III — Magnetic (Black & White)',
    brief: 'A halving subgroup H of G, with the remaining cosets combined with time reversal. Both i-type and c-type tensors can be non-zero.',
    helpTab: 'physics',
  },
];
