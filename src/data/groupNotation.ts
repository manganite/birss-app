/**
 * groupNotation.ts — supplementary Birss/ITC notation for the point-group explorer popup.
 *
 * These maps (`SHUBNIKOV`, `FULL_HM`, `REFERENCE_AXES`) are transcribed from the two vendored,
 * canonical reference tables — not raw Birss data. `SHUBNIKOV` and `FULL_HM` come from
 * `birss-tables/table-nomenclature.md` (Table A + Table C); `REFERENCE_AXES` comes from
 * `birss-tables/table-4a.md`. Within those tables the columns have mixed provenance, documented in
 * the tables themselves: the full Hermann–Mauguin and Schoenflies symbols are ITC-derived, the 32
 * grey Shubnikov symbols are derived by the ⊗{1,1′} rule, and only the 90 non-grey Shubnikov
 * symbols are Birss (Table 6). So the data is authoritative-per-its-source, not "verbatim from
 * Birss" — never derive any of it from the app's own output.
 *
 * Two anti-drift guard tests (`groupNotation.test.ts`) re-parse those source markdown tables at
 * test time and assert these maps equal the parsed tables entry-for-entry, so the TypeScript can
 * never silently drift from the canonical tables.
 *
 * Notation: app group keys keep the inversion bar on the cubic 3 (`m-3`, `m'-3'm'`) where the
 * Birss tables print a bare `m3` — see `birss-tables/table-nomenclature.md` ("App notation
 * conventions"), which is the app's canonical notation reference and reconciles the two.
 */

import { TABLE7_BW_ROWS } from './table7Data';
import { BOOK_ERROR_WARNING } from '../services/conventionMapping';
import type { GroupType, Parity, TimeParity, GroupKey } from '../types';

/**
 * Shubnikov (Birss dot/colon) symbol for every one of the 122 magnetic point groups — the 32
 * classical (Type I), 58 black-and-white (Type III), and 32 grey (Type II) groups — keyed by the
 * app group key.
 *
 * Source: `birss-tables/table-nomenclature.md` (the canonical, CI-drift-guarded nomenclature
 * reference), Shubnikov column of Table A (the 90 non-grey groups) and Table C (the 32 grey
 * groups). The guard test re-parses both tables and asserts equality entry-for-entry.
 */
export const SHUBNIKOV: Record<string, string> = {
  // Triclinic
  '1': '1',
  '-1': '-2',
  "-1'": "-2'",
  // Monoclinic
  '2': '2',
  "2'": "2'",
  m: 'm',
  "m'": "m'",
  '2/m': '2:m',
  "2'/m'": "2':m'",
  "2/m'": "2:m'",
  "2'/m": "2':m",
  // Orthorhombic
  '222': '2:2',
  "2'2'2": "2:2'",
  mm2: '2.m',
  "m'm'2": "2.m'",
  "2'm'm": "2'.m",
  mmm: 'm.2:m',
  "m'm'm": "m'.2:m",
  "m'm'm'": "m'.2:m'",
  "mmm'": "m.2:m'",
  // Tetragonal
  '4': '4',
  "4'": "4'",
  '-4': '-4',
  "-4'": "-4'",
  '4/m': '4:m',
  "4'/m": "4':m",
  "4/m'": "4:m'",
  "4'/m'": "4':m'",
  '422': '4:2',
  "4'22'": "4':2",
  "42'2'": "4:2'",
  '4mm': '4.m',
  "4'mm'": "4'.m",
  "4m'm'": "4.m'",
  '-42m': '-4.m',
  "-4'2m'": "-4'.m'",
  "-4'm2'": "-4'.m",
  "-42'm'": "-4.m'",
  '4/mmm': 'm.4:m',
  "4'/mmm'": "m.4':m",
  "4/mm'm'": "m'.4:m",
  "4/m'm'm'": "m'.4:m'",
  "4/m'mm": "m.4:m'",
  "4'/m'm'm": "m.4':m'",
  // Trigonal
  '3': '3',
  '-3': '-6',
  "-3'": "-6'",
  '32': '3:2',
  "32'": "3:2'",
  '3m': '3.m',
  "3m'": "3.m'",
  '-3m': '-6.m',
  "-3m'": "-6.m'",
  "-3'm'": "-6'.m'",
  "-3'm": "-6'.m",
  // Hexagonal
  '6': '6',
  "6'": "6'",
  '-6': '3:m',
  "-6'": "3:m'",
  '6/m': '6:m',
  "6'/m'": "6':m'",
  "6/m'": "6:m'",
  "6'/m": "6':m",
  '622': '6:2',
  "6'22'": "6':2",
  "62'2'": "6:2'",
  '6mm': '6.m',
  "6'mm'": "6'.m",
  "6m'm'": "6.m'",
  '-6m2': 'm.3:m',
  "-6'2m'": "m'.3:m'",
  "-6'm2'": "m.3:m'",
  "-6m'2'": "m'.3:m",
  '6/mmm': 'm.6:m',
  "6'/m'mm'": "m.6':m'",
  "6/mm'm'": "m'.6:m",
  "6/m'm'm'": "m'.6:m'",
  "6/m'mm": "m.6:m'",
  "6'/mm'm": "m.6':m",
  // Cubic
  '23': '3/2',
  'm-3': '-6/2',
  "m'-3'": "-6'/2",
  '432': '3/4',
  "4'32'": "3/4'",
  '-43m': '3/-4',
  "-4'3m'": "3/-4'",
  'm-3m': '-6/4',
  "m-3m'": "-6/4'",
  "m'-3'm'": "-6'/4",
  "m'-3'm": "-6'/4'",
  // Grey (Type II) — Table C
  "11'": "11'",
  "-11'": "-21'",
  "21'": "21'",
  "m1'": "m1'",
  "2/m1'": "2:m1'",
  "2221'": "2:21'",
  "mm21'": "2.m1'",
  "mmm1'": "m.2:m1'",
  "41'": "41'",
  "-41'": "-41'",
  "4/m1'": "4:m1'",
  "4221'": "4:21'",
  "4mm1'": "4.m1'",
  "-42m1'": "-4.m1'",
  "4/mmm1'": "m.4:m1'",
  "31'": "31'",
  "-31'": "-61'",
  "321'": "3:21'",
  "3m1'": "3.m1'",
  "-3m1'": "-6.m1'",
  "61'": "61'",
  "-61'": "3:m1'",
  "6/m1'": "6:m1'",
  "6221'": "6:21'",
  "6mm1'": "6.m1'",
  "-6m21'": "m.3:m1'",
  "6/mmm1'": "m.6:m1'",
  "231'": "3/21'",
  "m-31'": "-6/21'",
  "4321'": "3/41'",
  "-43m1'": "3/-41'",
  "m-3m1'": "-6/41'",
};

/**
 * Full Hermann–Mauguin symbol (app/Birss setting) for every one of the 122 magnetic point groups,
 * keyed by the app group key. Multi-position symbols keep the space-separated positional generators
 * (e.g. `4/m 2/m 2/m`); the cubic bar is written `-3` per the app notation convention.
 *
 * Source: `birss-tables/table-nomenclature.md` "HM full" column of Table A (90 non-grey) and
 * Table C (32 grey). The guard test re-parses both tables and asserts equality entry-for-entry.
 */
export const FULL_HM: Record<string, string> = {
  // Triclinic
  '1': '1',
  '-1': '-1',
  "-1'": "-1'",
  // Monoclinic
  '2': '112',
  "2'": "112'",
  m: '11m',
  "m'": "11m'",
  '2/m': '11 2/m',
  "2'/m'": "11 2'/m'",
  "2/m'": "11 2/m'",
  "2'/m": "11 2'/m",
  // Orthorhombic
  '222': '222',
  "2'2'2": "2'2'2",
  mm2: 'mm2',
  "m'm'2": "m'm'2",
  "2'm'm": "2'm'm",
  mmm: '2/m 2/m 2/m',
  "m'm'm": "2'/m' 2'/m' 2/m",
  "m'm'm'": "2/m' 2/m' 2/m'",
  "mmm'": "2'/m 2'/m 2/m'",
  // Tetragonal
  '4': '4',
  "4'": "4'",
  '-4': '-4',
  "-4'": "-4'",
  '4/m': '4/m',
  "4'/m": "4'/m",
  "4/m'": "4/m'",
  "4'/m'": "4'/m'",
  '422': '422',
  "4'22'": "4'22'",
  "42'2'": "42'2'",
  '4mm': '4mm',
  "4'mm'": "4'mm'",
  "4m'm'": "4m'm'",
  '-42m': '-42m',
  "-4'2m'": "-4'2m'",
  "-4'm2'": "-4'm2'",
  "-42'm'": "-42'm'",
  '4/mmm': '4/m 2/m 2/m',
  "4'/mmm'": "4'/m 2/m 2'/m'",
  "4/mm'm'": "4/m 2'/m' 2'/m'",
  "4/m'm'm'": "4/m' 2/m' 2/m'",
  "4/m'mm": "4/m' 2'/m 2'/m",
  "4'/m'm'm": "4'/m' 2/m' 2'/m",
  // Trigonal
  '3': '3',
  '-3': '-3',
  "-3'": "-3'",
  '32': '321',
  "32'": "32'1",
  '3m': '3m1',
  "3m'": "3m'1",
  '-3m': '-3 2/m 1',
  "-3m'": "-3 2'/m' 1",
  "-3'm'": "-3' 2/m' 1",
  "-3'm": "-3' 2'/m 1",
  // Hexagonal
  '6': '6',
  "6'": "6'",
  '-6': '-6',
  "-6'": "-6'",
  '6/m': '6/m',
  "6'/m'": "6'/m'",
  "6/m'": "6/m'",
  "6'/m": "6'/m",
  '622': '622',
  "6'22'": "6'22'",
  "62'2'": "62'2'",
  '6mm': '6mm',
  "6'mm'": "6'mm'",
  "6m'm'": "6m'm'",
  '-6m2': '-6m2',
  "-6'2m'": "-6'2m'",
  "-6'm2'": "-6'm2'",
  "-6m'2'": "-6m'2'",
  '6/mmm': '6/m 2/m 2/m',
  "6'/m'mm'": "6'/m' 2/m 2'/m'",
  "6/mm'm'": "6/m 2'/m' 2'/m'",
  "6/m'm'm'": "6/m' 2/m' 2/m'",
  "6/m'mm": "6/m' 2'/m 2'/m",
  "6'/mm'm": "6'/m 2/m' 2'/m",
  // Cubic
  '23': '23',
  'm-3': '2/m -3',
  "m'-3'": "2/m' -3'",
  '432': '432',
  "4'32'": "4'32'",
  '-43m': '-43m',
  "-4'3m'": "-4'3m'",
  'm-3m': '4/m -3 2/m',
  "m-3m'": "4'/m -3 2'/m'",
  "m'-3'm'": "4/m' -3' 2/m'",
  "m'-3'm": "4'/m' -3' 2'/m",
  // Grey (Type II) — Table C
  "11'": "11'",
  "-11'": "-11'",
  "21'": "1121'",
  "m1'": "11m1'",
  "2/m1'": "11 2/m1'",
  "2221'": "2221'",
  "mm21'": "mm21'",
  "mmm1'": "2/m 2/m 2/m1'",
  "41'": "41'",
  "-41'": "-41'",
  "4/m1'": "4/m1'",
  "4221'": "4221'",
  "4mm1'": "4mm1'",
  "-42m1'": "-42m1'",
  "4/mmm1'": "4/m 2/m 2/m1'",
  "31'": "31'",
  "-31'": "-31'",
  "321'": "3211'",
  "3m1'": "3m11'",
  "-3m1'": "-3 2/m 11'",
  "61'": "61'",
  "-61'": "-61'",
  "6/m1'": "6/m1'",
  "6221'": "6221'",
  "6mm1'": "6mm1'",
  "-6m21'": "-6m21'",
  "6/mmm1'": "6/m 2/m 2/m1'",
  "231'": "231'",
  "m-31'": "2/m -31'",
  "4321'": "4321'",
  "-43m1'": "-43m1'",
  "m-3m1'": "4/m -3 2/m1'",
};

/**
 * Birss orientation of reference axes for each of the 32 classical symmetry classes, keyed by the
 * app classical group key. `//` denotes a parallel axis; `any` means unconstrained.
 *
 * Source: `birss-tables/table-4a.md` ("Orientation of reference axes" column). The two cubic
 * centrosymmetric rows are printed there as `m3`/`m3m`; they are keyed here under the app's
 * `m-3`/`m-3m` per the app notation convention (values are unchanged).
 */
export const REFERENCE_AXES: Record<string, string> = {
  '1': 'any',
  '-1': 'any',
  '2': '2//z',
  m: '-2//z',
  '2/m': '2//z',
  '222': '2//x, 2//y',
  mm2: '-2//x, -2//y',
  mmm: '2//x, 2//y',
  '4': '4//z',
  '-4': '-4//z',
  '4/m': '4//z',
  '422': '4//z, 2//y',
  '4mm': '4//z, -2//y',
  '-42m': '-4//z, 2//y',
  '4/mmm': '4//z, 2//y',
  '3': '3//z',
  '-3': '-3//z',
  '32': '3//z, 2//y',
  '3m': '3//z, -2//y',
  '-3m': '-3//z, 2//y',
  '6': '6//z',
  '-6': '-3//z',
  '6/m': '6//z',
  '622': '6//z, 2//y',
  '6mm': '6//z, -2//y',
  '-6m2': '3//z, -2//y',
  '6/mmm': '6//z, 2//y',
  '23': '2//x, 2//y',
  'm-3': '2//x, 2//y',
  '432': '4//x, 4//y',
  '-43m': '-4//x, -4//y',
  'm-3m': '4//x, 4//y',
};

/** The 32 classical symmetry-class keys (also the `REFERENCE_AXES` keys). */
const CLASSICAL_CLASSES = new Set(Object.keys(REFERENCE_AXES));

/**
 * The three "bracketed" (rotated-setting) magnetic groups whose primed HM symbol is written in a
 * rotated axis frame, so plain prime-stripping yields a re-ordered string that is not the classical
 * family key. Each maps to its classical family (the Schoenflies parent's app key): `2'm'm` =
 * C₂ᵥ(Cₛ) → `mm2`, `-4'm2'` = D₂d(C₂ᵥ) → `-42m`, `-6'2m'` = D₃ₕ(D₃) → `-6m2`. Flagged as
 * "bracketed: rotated setting" in `birss-tables/table-nomenclature.md`.
 */
const BRACKETED_FAMILY: Record<string, string> = {
  '2mm': 'mm2',
  '-4m2': '-42m',
  '-62m': '-6m2',
};

/**
 * The classical symmetry-class family of any of the 122 magnetic point groups — the key into
 * `REFERENCE_AXES`. Type I: the group itself. Type II (grey): the group without its trailing `1'`.
 * Type III (black-and-white): the group with all time-reversal primes stripped (with the three
 * bracketed rotated-setting groups remapped to their classical family).
 */
export function getFamilyClass(name: string): string {
  if (!name.includes("'")) return name; // Type I — classical group is itself
  if (name.endsWith("1'")) {
    const parent = name.slice(0, -2);
    if (CLASSICAL_CLASSES.has(parent)) return parent; // Type II grey — parent + 1'
  }
  const stripped = name.replace(/'/g, ''); // Type III — strip time-reversal primes
  return BRACKETED_FAMILY[stripped] ?? stripped;
}

/** The Birss symbol-class letter (A–U) a classical symmetry class maps to, per tensor type. `null`
 * = the table prints `-` for that type (the tensor vanishes identically for the class). */
export interface ClassLetters {
  polarEven: string | null;
  axialEven: string | null;
  polarOdd: string | null;
  axialOdd: string | null;
}

/**
 * Birss Table 4a, columns "Polar/Axial tensor of even/odd rank" (columns 3–6): the symbol-class
 * letter each of the 32 classical symmetry classes maps to, per tensor type. Keyed by the app
 * classical class key (cubic `m3`/`m3m` printed in the table are keyed here as `m-3`/`m-3m`).
 *
 * Source: `birss-tables/table-4a.md`. Re-parsed and compared entry-for-entry by the anti-drift
 * guard in `groupNotation.test.ts`.
 */
export const TABLE_4A_CLASS_LETTERS: Record<string, ClassLetters> = {
  '1': { polarEven: 'A', axialEven: 'A', polarOdd: 'A', axialOdd: 'A' },
  '-1': { polarEven: 'A', axialEven: null, polarOdd: null, axialOdd: 'A' },
  '2': { polarEven: 'B', axialEven: 'B', polarOdd: 'B', axialOdd: 'B' },
  m: { polarEven: 'B', axialEven: 'C', polarOdd: 'C', axialOdd: 'B' },
  '2/m': { polarEven: 'B', axialEven: null, polarOdd: null, axialOdd: 'B' },
  '222': { polarEven: 'D', axialEven: 'D', polarOdd: 'D', axialOdd: 'D' },
  mm2: { polarEven: 'D', axialEven: 'E', polarOdd: 'E', axialOdd: 'D' },
  mmm: { polarEven: 'D', axialEven: null, polarOdd: null, axialOdd: 'D' },
  '4': { polarEven: 'F', axialEven: 'F', polarOdd: 'F', axialOdd: 'F' },
  '-4': { polarEven: 'F', axialEven: 'G', polarOdd: 'G', axialOdd: 'F' },
  '4/m': { polarEven: 'F', axialEven: null, polarOdd: null, axialOdd: 'F' },
  '422': { polarEven: 'H', axialEven: 'H', polarOdd: 'H', axialOdd: 'H' },
  '4mm': { polarEven: 'H', axialEven: 'I', polarOdd: 'I', axialOdd: 'H' },
  '-42m': { polarEven: 'H', axialEven: 'J', polarOdd: 'J', axialOdd: 'H' },
  '4/mmm': { polarEven: 'H', axialEven: null, polarOdd: null, axialOdd: 'H' },
  '3': { polarEven: 'K', axialEven: 'K', polarOdd: 'K', axialOdd: 'K' },
  '-3': { polarEven: 'K', axialEven: null, polarOdd: null, axialOdd: 'K' },
  '32': { polarEven: 'L', axialEven: 'L', polarOdd: 'L', axialOdd: 'L' },
  '3m': { polarEven: 'L', axialEven: 'M', polarOdd: 'M', axialOdd: 'L' },
  '-3m': { polarEven: 'L', axialEven: null, polarOdd: null, axialOdd: 'L' },
  '6': { polarEven: 'N', axialEven: 'N', polarOdd: 'N', axialOdd: 'N' },
  '-6': { polarEven: 'N', axialEven: 'O', polarOdd: 'O', axialOdd: 'N' },
  '6/m': { polarEven: 'N', axialEven: null, polarOdd: null, axialOdd: 'N' },
  '622': { polarEven: 'P', axialEven: 'P', polarOdd: 'P', axialOdd: 'P' },
  '6mm': { polarEven: 'P', axialEven: 'Q', polarOdd: 'Q', axialOdd: 'P' },
  '-6m2': { polarEven: 'P', axialEven: 'R', polarOdd: 'R', axialOdd: 'P' },
  '6/mmm': { polarEven: 'P', axialEven: null, polarOdd: null, axialOdd: 'P' },
  '23': { polarEven: 'S', axialEven: 'S', polarOdd: 'S', axialOdd: 'S' },
  'm-3': { polarEven: 'S', axialEven: null, polarOdd: null, axialOdd: 'S' },
  '432': { polarEven: 'T', axialEven: 'T', polarOdd: 'T', axialOdd: 'T' },
  '-43m': { polarEven: 'T', axialEven: 'U', polarOdd: 'U', axialOdd: 'T' },
  'm-3m': { polarEven: 'T', axialEven: null, polarOdd: null, axialOdd: 'T' },
};

/**
 * The Birss symbol-class letter for a group's tensor of the given parity and rank, via its classical
 * family (`getFamilyClass`) and Table 4a. Even rank (0, 2, 4) reads the even-rank column, odd rank
 * (1, 3) the odd-rank column — rank 0 uses the even-rank letter, following the table's even/odd
 * split. Returns `null` when the class prints `-` (no allowed form of that type). This is the
 * classical-family lookup (Table 4a); the magnetic i/c reassignment (Table 7) is not applied.
 */
export function getClassLetter(name: GroupKey, parity: Parity, rank: number): string | null {
  const row = TABLE_4A_CLASS_LETTERS[getFamilyClass(name)];
  if (!row) return null;
  const even = rank % 2 === 0;
  if (parity === 'polar') return even ? row.polarEven : row.polarOdd;
  return even ? row.axialEven : row.axialOdd;
}

/**
 * Whether the classical Table-4a lookup chain (`getFamilyClass` → `getClassLetter`) determines the
 * displayed tensor form. True for time-even (i) tensors of any group — primes act only spatially,
 * so an i-tensor reduces to its classical family class — and for all Type I groups, which have no
 * antiunitary elements (so c coincides with i). For c-tensors of magnetic (Type II/III) groups
 * Birss's lookup instead runs via Table 7 (magnetic classes); that chain is rendered by
 * `getTable7Chain` (Type III) or as the grey-group tail (Type II). This gate still selects which
 * breadcrumb branch renders: the classical letter / "no allowed form" tail would contradict the
 * computed form for those cases.
 */
export function classicalChainApplies(groupType: GroupType, timeParity: TimeParity): boolean {
  return timeParity === 'i' || groupType === 'I';
}

// --- Table-7 lookup chain for magnetic c-tensors (Type III) -------------------------------------
// Alternate-setting source spellings -> Table-4a family key (strip brackets + primes first). Mirrors
// the Table-7 guard's familyKeyOf; `-6m2`/`-42m`/`mm2` etc. are already 4a keys.
const T7_ALT_TO_4A: Record<string, string> = {
  m2m: 'mm2',
  '2mm': 'mm2',
  '-4m2': '-42m',
  '-62m': '-6m2',
  m3: 'm-3',
  m3m: 'm-3m',
};
const t7FamilyKey = (sym: string) => {
  const s = sym.replace(/[()']/g, '');
  return T7_ALT_TO_4A[s] ?? s;
};

// Human transform label for a bracketed (rotated-setting) source group, keyed by its printed symbol.
const T7_TRANSFORM_LABEL: Record<string, string> = {
  m2m: 'z↔y permutation',
  '2mm': 'z↔x permutation',
  "2'm'm": 'z↔x permutation',
  '-4m2': 'Rz(45°)',
  '-42m': 'Rz(45°)',
  "-4'm2'": 'Rz(45°)',
  '-62m': 'Rz(30°)',
  "-6'2m'": 'Rz(30°)',
};

/**
 * The Table-7 lookup chain that determines a magnetic (Type III) group's c-tensor form (Birss's
 * cross-formula, verified in `table7Ranks0124.reference.test.ts`). Makes the parity crossover, the
 * associated classical source group A/B (with any rotated-setting badge), the Table-4a column read,
 * the class letter, and the final rank table row explicit for the breadcrumb.
 */
export interface Table7Chain {
  /** the Table-7 c-column, e.g. `c-Polar-even` (derived from parity + rank) */
  column: string;
  source: 'A' | 'B';
  /** associated classical group symbol as printed in Table 7 (brackets stripped) */
  sourceSymbol: string;
  /** effective bracket state (true = rotated setting), after the `-6m'2'` book-error override */
  sourceBracketed: boolean;
  /** the source's Table-4a family key (index into REFERENCE_AXES / TABLE_4A_CLASS_LETTERS) */
  sourceClass: string;
  /** human transform label when bracketed (`Rz(45°)`, `Rz(30°)`, `z↔y permutation`, …); else null */
  transformLabel: string | null;
  /** which Table-4a column is read — `Axial-even` | `Polar-odd` */
  fourAColumn: string;
  /** true when `fourAColumn`'s parity differs from the tensor's parity (polar-even, axial-odd) */
  parityCrossover: boolean;
  /** the Birss class letter, or null = the class prints `-` (no allowed form) */
  letter: string | null;
  /** documented Birss Table-7 misprint note (reused from conventionMapping), or null */
  bookErrorNote: string | null;
}

/**
 * The Table-7 chain for a Type III group's c-tensor of the given parity and rank. Returns null for
 * groups without a Table-7 black-white row (Type I and Type II grey groups — the UI renders those
 * branches separately). Cross-formula: polar-even → B/Axial-even, axial-even → A/Axial-even,
 * polar-odd → A/Polar-odd, axial-odd → B/Polar-odd (even rank → even columns, odd → odd).
 */
export function getTable7Chain(groupName: GroupKey, parity: Parity, rank: number): Table7Chain | null {
  const row = TABLE7_BW_ROWS[groupName];
  if (!row) return null;

  const even = rank % 2 === 0;
  let source: 'A' | 'B';
  let fourAKey: 'axialEven' | 'polarOdd';
  let fourAColumn: string;
  let parityCrossover: boolean;
  if (parity === 'polar' && even) {
    source = 'B';
    fourAKey = 'axialEven';
    fourAColumn = 'Axial-even';
    parityCrossover = true;
  } else if (parity === 'axial' && even) {
    source = 'A';
    fourAKey = 'axialEven';
    fourAColumn = 'Axial-even';
    parityCrossover = false;
  } else if (parity === 'polar' && !even) {
    source = 'A';
    fourAKey = 'polarOdd';
    fourAColumn = 'Polar-odd';
    parityCrossover = false;
  } else {
    source = 'B';
    fourAKey = 'polarOdd';
    fourAColumn = 'Polar-odd';
    parityCrossover = true;
  } // axial odd

  const sourceSymbol = source === 'A' ? row.a : row.b;
  let sourceBracketed = source === 'A' ? row.aBracketed : row.bBracketed;
  let forcedLabel: string | null = null;
  let bookErrorNote: string | null = null;

  // `-6m'2'` book error: A is misprinted UNBRACKETED (`-6m2`), contradicting the row's own Table-6
  // generator; the A-sourced columns are physically the rotated Rz(30°) form (see the guard's
  // FORCED_TRANSFORM). Force the effective bracket + label + note to reflect the real physics.
  if (groupName === "-6m'2'" && source === 'A') {
    sourceBracketed = true;
    forcedLabel = 'Rz(30°)';
    bookErrorNote = BOOK_ERROR_WARNING;
  }

  const sourceClass = t7FamilyKey(sourceSymbol);
  const letter = TABLE_4A_CLASS_LETTERS[sourceClass]?.[fourAKey] ?? null;
  const transformLabel = forcedLabel ?? (sourceBracketed ? (T7_TRANSFORM_LABEL[sourceSymbol] ?? null) : null);
  const column = `c-${parity === 'polar' ? 'Polar' : 'Axial'}-${even ? 'even' : 'odd'}`;

  return {
    column,
    source,
    sourceSymbol,
    sourceBracketed,
    sourceClass,
    transformLabel,
    fourAColumn,
    parityCrossover,
    letter,
    bookErrorNote,
  };
}
