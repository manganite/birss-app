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
    brief: 'Polar 3rd-rank tensor -- the dominant SHG source. Strictly forbidden in centrosymmetric groups for i-type symmetry.',
    helpTab: 'physics',
  },
  {
    id: 'md',
    term: 'Magnetic Dipole (MD)',
    brief: 'Axial 3rd-rank tensor. Unlike ED, MD contributions can survive in centrosymmetric groups -- a parity effect independent of time-reversal.',
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
    brief: 'Symmetric under time reversal T. Characteristic of non-magnetic properties (electric, structural). Allowed in all group types -- Type I, II (gray), and III.',
    helpTab: 'physics',
  },
  {
    id: 'c-type',
    term: 'c-type (Time-Odd)',
    brief: "Antisymmetric under time reversal T. Relevant for magnetic and magnetoelectric properties. Non-zero only in Type I or Type III groups.",
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
    term: 'Type I -- Ordinary',
    brief: 'Standard crystallographic point group with no time-reversal operation among its elements.',
    helpTab: 'physics',
  },
  {
    id: 'type-ii',
    term: "Type II -- Gray",
    brief: "G·1' -- the group G augmented by time reversal 1'. All c-type tensors vanish; i-type tensors behave as in parent G.",
    helpTab: 'physics',
  },
  {
    id: 'type-iii',
    term: 'Type III -- Magnetic (Black & White)',
    brief: 'A halving subgroup H of G, with the remaining cosets combined with time reversal. Both i-type and c-type tensors can be non-zero.',
    helpTab: 'physics',
  },
  {
    id: 'crystal-cut',
    term: 'Crystal Cut',
    brief: 'The crystal surface normal, aligned with the incident beam direction k. [hkl] labels use Miller-index notation -- e.g. [001] means the c-axis faces the beam.',
    helpTab: 'simulation',
  },
  {
    id: 'crystal-rotation',
    term: 'Crystal Rotation',
    brief: 'Additional tilt applied after aligning the crystal cut: φx and φy tilt the crystal about the lab X/Y axes; ψ rotates it about the beam (azimuth).',
    helpTab: 'simulation',
  },
  {
    id: 'chi-components',
    term: 'Independent χ Components',
    brief: 'Non-zero tensor components after applying group symmetry. Subscripts (e.g. xxz) give the crystal-frame polarization directions; relative amplitudes and phases are tunable.',
    helpTab: 'simulation',
  },
  {
    id: 'shg-polarimetry',
    term: 'SHG Intensity Polarimetry',
    brief: 'SHG intensity measured as a function of light polarization angles. The resulting polar pattern encodes the tensor symmetry and is the primary experimental observable.',
    helpTab: 'simulation',
  },
  {
    id: 'anisotropy-config',
    term: 'Anisotropy',
    brief: 'Parallel (I∥) and crossed (I⊥) SHG intensity vs. polarizer angle -- both plotted together. Probes the full orientational dependence of the tensor.',
    helpTab: 'simulation',
  },
  {
    id: 'polarizer-config',
    term: 'Polarizer Scan',
    brief: 'SHG intensity vs. incoming polarizer angle at a fixed analyzer (0° or 90°). Shows how input polarization direction selects among tensor components.',
    helpTab: 'simulation',
  },
  {
    id: 'analyzer-config',
    term: 'Analyzer Scan',
    brief: 'SHG intensity vs. outgoing analyzer angle at a fixed polarizer (0° or 90°). Shows which output polarization directions the tensor generates.',
    helpTab: 'simulation',
  },
];
