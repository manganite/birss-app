# The Birss App — Agent Guidelines

> **Content:** Working agreement for anyone (human or agent) changing this repo: build, architecture, conventions, git workflow, and the documentation map.
> **Status:** living
> **Authority:** authoritative for process and conventions. Where another doc disagrees on process, this one wins.

Scientific React SPA that calculates non-zero susceptibility tensor components (ED, MD, EQ) and SHG source terms for all 32 crystallographic and 122 magnetic point groups.

## Current work (next cycle)

**Start with `STATUS.md` (root)** — the canonical index for the current cycle:
what is done, what is open, and what the standing decisions are.

Its **section 1 is the only list of open, in-scope work.** Everything deferred lives in
**`docs/planning/BACKLOG.md`**; the record of how past series were decided lives in
**`docs/planning/LEDGER.md`** (from 2026-07-31) and **`docs/planning/TODO-next.md`** (frozen
archive of everything before that). The full picture is in the documentation map below.

Working rules for this cycle:

- **Orientation-(in)dependence split** is the organising principle: the Calculator
  owns crystal-frame, orientation-free results (tensor form, induced response, source
  term *frozen at the cut*); the Simulator owns lab-frame, orientation-dependent
  results (*swept* source terms, polarimetry). Group / tensor type / time-reversal /
  setting are a shared group context.
- **Safety net first.** For any data/math item, extend the relevant golden / rotated
  fixture (`goldenTensors.fixtures.ts`, `rotatedSHG.fixtures.ts`) **first** and require
  it green, then change code. Two fixture classes with distinct rules: **correctness
  goldens** (e.g. `goldenTensors.fixtures.ts`) trace to print-verified literature, directly or
  through a calibrated derivation (the three provenance classes are set out under Architecture),
  never from app output; **behavioral regression pins** (`rotatedSHG.fixtures.ts`,
  `shgUnification.pins.test.ts`) are captured from a known-good app revision and are
  regenerated only by re-capturing from a known-good base -- never edited to turn a
  red pin green.
- **Resolve before coding.** An item tagged *Open decision* or *Derivation /
  verification pending* must have that resolved (and its `Status:` updated) before its
  implementation branch opens.
- **Verify, don't guess.** Check claims against the code (or ask) before acting;
  several `docs/planning/TODO-next.md` items are marked *provisional* for exactly this reason.
- **Ask when in doubt.** If the intent, rationale, or scope of a TODO or ROADMAP
  item is unclear, ask for clarification rather than interpreting on your own. The
  items encode specific design decisions and physics reasoning — guessing risks
  implementing the wrong thing.

## Documentation map (normative)

This section is the rule; the folder READMEs are descriptions of it. If they disagree, this wins.

### What each file is for

| file | role | status |
| --- | --- | --- |
| `STATUS.md` | Current release, **section 1 = the only open-work list**, and the standing decisions (§ 5). | living |
| `CHANGELOG.md` | Per-release user-facing changes; correction entries say what was wrong and since when it is fixed. | living |
| `README.md` | Public overview. | living |
| `AGENTS.md` | This file: process, conventions, architecture, and this map. | living |
| `SECURITY.md` | Vulnerability reporting. | living |
| `CLAUDE.md` | Pointer to this file. Non-authoritative. | living |
| `docs/planning/BACKLOG.md` | The idea inventory: everything deferred, tagged and with provenance. Nothing here is scheduled. | living |
| `docs/planning/LEDGER.md` | Append-only series record from 2026-07-31 onward, plus standing observation points. | living |
| `docs/planning/TODO-next.md` | The v0.12-era working draft and the completed series ledgers (E/T/F/R/A/Q/T7-BC). The process record. | frozen |
| `docs/planning/ROADMAP.md`, `ROADMAP-next.md`, `DESIGN-tables-feature.md` | Closed-out plans, kept for their reasoning. | frozen |
| `docs/findings/*` | Dated investigation records. | frozen by default |
| `docs/references/BIRSS-APP-CONVENTIONS-REFERENCE.md`, `BIRSS-ITC-CONVENTION-DIVERGENCES.md` | The app's convention contracts. | living, authoritative |
| `docs/references/DECISION-*.md` | Accepted decision records. | living |
| `docs/references/ITC-table-*.md` | Transcribed ITC tables, re-parsed by the reference tests. | source-side |
| `birss-tables/*` | **Vendored** Birss transcriptions (git subtree). | source-side |

### Authority hierarchy

1. **The app's convention contract wins over the book compilation.** Where
   `BIRSS-APP-CONVENTIONS-REFERENCE.md` and a vendored table appear to disagree about what the
   *app* does, the contract is authoritative; the vendored table is authoritative about what the
   *book* says. (Where Birss and ITC themselves diverge, Birss wins — that rule is in the contract.)
2. **`BIRSS-ITC-CONVENTION-DIVERGENCES.md` wins over `docs/findings/DISCREPANCIES.md`** on every
   symbol/setting/orientation question. The latter is partially superseded and says so.
3. **Shipped, test-guarded behaviour wins over any design document.** A frozen design record
   describes an intent, not the product.

### Vendored files

`birss-tables/` arrives by `git subtree` from `manganite/birss-tables`. Do not add app-side
banners or app-side notes to it, and change a table only to correct it against print — the
reference tests re-parse these files at test time and CI regenerates `table-nomenclature.md` from
the generator and fails on drift.

### Where a decision goes

- **Convention or data-model decision** → `docs/references/DECISION-*.md`, dated. Superseded by a
  later dated decision, never edited in place.
- **A constraint that binds future work** → `STATUS.md` § 5 (standing decisions).
- **A decision made while executing a series** → the series entry in `LEDGER.md`. If it turns out
  to bind work beyond that series, promote it to § 5 and leave a pointer.

### Freeze discipline

- A **frozen** document changes only by a dated addendum or a supersession line in its banner.
  Its body is not rewritten — that is the whole point of freezing it.
- **Open state lives in `STATUS.md` § 1 and nowhere else.** A live item inside a frozen file is a
  bug; move it out (that is why T-obs moved to `LEDGER.md`).
- **Ledgers are append-only.** Correct an entry with a dated follow-up beneath it.

### Maintenance rule

Adding a new documentation file means, in the same commit: the three-line banner at the top, and
a line for it in the containing folder's `README.md`. Add both to the self-check of any work order
that creates documentation.

## Build & Dev

```bash
npm install          # install dependencies
npm run dev          # dev server on http://localhost:3000
npm run build        # production build → dist/
npm run lint         # TypeScript type-check only (tsc --noEmit)
npm run test         # run the Vitest suite once
npm run test:watch   # run Vitest in watch mode
npm run test:reference    # literature / vendored-table reference guards only
npm run test:audit        # audit-era exhaustive coverage checks only
npm run test:pins         # engine-derived behavioral regression pins only
npm run test:interaction  # jsdom interaction layer only
npm run deploy       # build + publish to GitHub Pages via gh-pages
```

### Test taxonomy (by filename suffix)

The suite encodes its test classes in the filename, selectable via the convenience scripts
above (substring filters on the vitest CLI). `npm run test` always runs everything and remains
the only gate -- the scripts are local tools, never CI lanes, so no file can silently escape CI
through a filter gap.

- `*.reference.test.ts` -- re-parse frozen literature / vendored tables at test time and assert
  the app equals them entry-for-entry. Red means the app's data or engine drifted from print
  (or the vendored table changed). Useful as a fast FIRST check after touching group data,
  tensor logic, or anything under `birss-tables/` -- but note it is only the reference-table
  SUBSET: goldens (`goldenTensors.test.ts`), the notation drift guards
  (`groupNotation.test.ts`, `pointGroups.test.ts`), the audits, and the convention/setting
  tests live outside this filter. Full assurance is `npm run test`, as always.
- `*.audit.test.ts` -- audit-era exhaustive coverage contracts. Red means a coverage guarantee
  broke.
- `*.pins.test.ts` -- engine-derived behavioral regression pins (see "Safety net first" above):
  captured from a known-good revision; regenerate only by re-capture, never edit to green.
- `*.interaction.test.tsx` -- the jsdom interaction layer (per-file `@vitest-environment jsdom`
  docblocks; the rest of the suite runs in the node environment). Run when touching hooks or UI
  wiring. NOTE: accessible-name queries are unusable against `<App/>` under jsdom (KaTeX MathML
  vs getComputedStyle -- see the App.interaction docblock).
- Unsuffixed `*.test.ts(x)` -- unit, service, golden-fixture and SSR-smoke tests; mixed weight
  (this class contains the heaviest sweeps).

Known naming impurities, documented rather than renamed: `groupNotation.test.ts` and
`pointGroups.test.ts` are drift guards by content (they parse `table-nomenclature.md`) despite
plain names; `sharingPartitions.reference.test.ts` guards GENERATED data rather than literature;
`handBirss.e2e.test.ts` is a named acceptance checkpoint, not a browser E2E test.

### The gates

**Six checks, and the list is quoted in full or not at all.** `.github/workflows/ci.yml` runs them in
this order on every push and pull request; any one of them failing fails the build:

1. `npm run lint` — `tsc --noEmit`
2. `npm run lint:eslint` — `eslint .`
3. `npm run format:check` — `prettier --check .`
4. `npm run build`
5. `npm run check:nomenclature` — regenerate `birss-tables/table-nomenclature.md` from
   `birss-tables/tools/generate_nomenclature.py`, then `git diff --exit-code` on it. Run it whenever
   `birss-tables/` is touched. It was the only check without a script until 2026-08-03, which is
   exactly why it fell out of an enumeration; giving it one removes the asymmetry rather than only
   documenting it.
6. `npm run test`

A work report that says "gates green" **cites all six by name**. If one is deliberately skipped, the
skip is stated in the report — a shortened list is indistinguishable from a complete one at a glance,
which is the Erratum-11 enumeration rule applied to process rather than to data. And **enumerating
means reading the step list, not grepping it for a pattern: a filter is a summary too**, and the item
that differs from the others is exactly the one a pattern drops.

Adopted 2026-08-03, in two goes. First after a branch reached review with `lint:eslint` and
`format:check` red while three gates were reported green — the prose this section replaced named only
two of the five npm gates, and the executor had never opened `ci.yml`. Then, the same day, the
replacement itself came up one short: it was built by grepping `ci.yml` for `npm run`, so the
nomenclature step — the only check that is not an npm script — fell straight through the filter. The
second failure is the sharper one, because it happened inside the fix for the first.

Tests for `tensorCalculator.ts` live in `src/services/tensorCalculator.test.ts` and cover: group-order sanity for all 122 point groups, parity invariants (e.g. ED vanishes for centrosymmetric groups, EQ never vanishes, grey groups `G1'` reproduce `G` for i-type), and `formatCoeff`/`isCentrosymmetric` unit tests, plus the convention-audit guardrails: the ~150 golden fixtures of `goldenTensors.fixtures.ts` (provenance classes below), the two reference tests (`nomenclature.reference.test.ts`, `operatorSet.reference.test.ts` — parse `birss-tables/table-nomenclature.md` at test time), the grey-c≡0 and particularization checks, and three hand-Birss end-to-end tests (`handBirss.e2e.test.ts`); see `docs/findings/AUDIT-convention-references.md` for the full coverage matrix.

`src/services/goldenTensors.fixtures.ts` + `goldenTensors.test.ts` extend this with golden component-relation fixtures for **every Type-III crystal family**, c-type ED (incl. the canonical Cr2O3 `-3'm'` magnetoelectric SHG tensor), and the axial (MD) `det(g)` branch — each pinning down the *identity* of a hand-curated `GENERATORS` entry, not just its order or invariants.

### Fixture provenance classes

Not every "golden" carries the same authority, and the distinction matters when one goes red. Three classes, in descending strength — the class is what a fixture's `source`/`note` field records, and the policy below is unchanged, only stated precisely:

- **(a) Direct print-verified.** The expected values were read off a printed source and cross-checked against it entry for entry: the vendored table transcriptions re-parsed by `*.reference.test.ts`, the Hoshi 1995 EQ goldens, the Yariv Table 16.1 scheme transcription, and the 11 `goldenTensors` fixtures carrying a `// VERIFIED:` comment (signed off against printed Birss Table 4e, 2026-07-02). A red one of these means the app disagrees with print.
- **(b) Analytically derived, calibrated against (a).** Most of the ~150 `goldenTensors` fixtures: derived from each group's generators via the rank-3/4 transformation law (Birss, *Symmetry and Magnetism* (1966), eq. 3.22/3.27), independently re-implemented and calibrated against the six pre-existing fixtures; F4 sign-off 2026-07-09 (`docs/findings/SIGNOFF-rank3-verify-2026-07-09.md`). These are strong, and they are **not** the same thing as a book read — the derivation shares an author with the code it guards, which is exactly why the calibration subset exists. A red one means the app disagrees with an independent re-implementation of the transformation law.
- **(c) Behavioral pins.** `*.pins.test.ts` and `rotatedSHG.fixtures.ts`: captured from a known-good software state. **Regression detectors only, never correctness authority.** They are regenerated by re-capture from a known-good base and never edited to turn a red pin green. A red one means behaviour changed — whether for better or worse is a separate question the pin cannot answer.

Class (a) and (b) together are the correctness goldens of the anti-circularity rule; class (c) is the other side of that rule's two-class split. Where earlier wording called the whole `goldenTensors` set "literature-anchored" or "table-anchored", read class (b) with an (a) calibration subset.

## Architecture

```
src/
  types.ts                       # Shared prop interfaces (TensorConfig, OrientationState, SimulationState), domain unions (CrystalSystem, Parity, TimeParity, GroupType, GroupKey) and TENSOR_META
  domainTypes.ts                 # Dependency-free domain unions (R2), imported by types.ts and the data modules
  data/pointGroups.ts            # Static registry of all 122 magnetic point groups
  services/                      # 17 non-test modules; the dependency direction is spelled out below
    tensorCalculator.ts          # Thin barrel re-exporting the public API below
    tolerances.ts                # Shared numeric epsilons (COEFF_EPSILON, ROOT_MATCH_EPSILON, …)
    symmetryGroups.ts            # Matrix algebra, GENERATORS table, group closure, getSymmetryOperations
    linalg.ts                    # rref/spanRank/isIndependentOf, 3x3 rotations, and the symbolic TrigMat3 helpers
    tensorProjection.ts          # Numeric tensor projection (transform/average/basis), SHG polynomials, lab-frame vectors, the Q0 constraint partition
    tensorForms.ts               # computeTensorForm — rank 0-4 x parity x i/c x intrinsic symmetry (the Tables engine)
    nyeScheme.ts                 # Dot-diagram view model over the Q0 constraint partition
    propertyFlags.ts             # isPolar / isChiral / isFerromagnetic / isMagnetoelectric
    conventionMapping.ts         # App ↔ Birss ↔ ITC group-symbol mapping and display names
    orientation.ts               # Miller index → preset angles (hklToPresetAngles), azimuth-zero convention
    orientationScene.ts          # Scene model for the Simulator's sample-orientation widget (slab, triads, anchor corner)
    trigPoly.ts                  # Trigonometric polynomial algebra for symbolic rotation angles (phiX, phiY, psi)
    symbolicProjection.ts        # Symbolic SHG source terms — parallel path producing TrigPoly coefficients
    trigPolyFormat.ts            # LaTeX formatting for TrigPoly and SymPoly expressions
    latexFormatting.ts           # LaTeX rendering: calculateTensorComponents, formatSubstitutedPolySum
    simulatorEngine.ts           # Pure polarimetry intensity sweep (extracted from useSimulatorState)
    groupSearch.ts               # Pure Explorer filter/search (filterGroups, getGroupCategory, normalizeString)
  components/
    MathComponents.tsx           # Shared KaTeX render helpers (TensorTerm, FormatPointGroup, SymmetryOperation)
    CalculatorPage.tsx           # Calculator page — tensor components, induced response, source terms
    PointGroupExplorer.tsx       # Explorer page — browse & filter the 122 groups
    OperationsModal.tsx          # Modal showing symmetry operations for a selected group
    SimulatorPage.tsx            # Simulator page — radar chart polarimetry, Fourier series formulas
    OrientationSceneView.tsx     # Simulator: the live sample-orientation scene beside the rotation sliders
    TablesPage.tsx               # Tables page — interactive Birss-table lookup
    tables/                      # Tables-page sub-views (LookupControls, LookupChain, TensorFormResult, GroupSharingList, …)
    help/                        # Help-page per-tab sub-views (Overview, Conventions, Physics, Simulation, Deeper)
    HelpPage.tsx                 # Help page shell — composes the per-tab views under help/
  App.tsx                        # Root: global state, tab routing, header, footer
```

All cross-page state (selected group, tensor type, time-reversal, rotation angles, amplitudes, phases) lives in `App.tsx` and is passed down via grouped prop objects (`TensorConfig`, `OrientationState`, `SimulationState` from `types.ts`). There is no state management library.

### `services/` module dependency direction

**This section is derived from a complete enumeration of the intra-`src` imports of every
non-test module in `src/services/`, not maintained by hand.** Regenerate it after any change to
the import graph; a map patched from memory drifts, and this one had (before 2026-07-31).

The graph is a DAG with six layers. A module may import from any layer below it and never from
its own or above — the two long-standing rules, *formatting may import physics but never the
reverse* and *the symbolic path imports from the numeric path but never the other way round*,
are both consequences of that layering rather than separate conventions.

| layer | modules | imports from |
| --- | --- | --- |
| 0 | `tolerances`, `trigPoly`, `simulatorEngine` | nothing in `src` |
| 1 | `symmetryGroups` | `tolerances` |
| 1 | `linalg` | `trigPoly` |
| 2 | `tensorProjection` | `symmetryGroups`, `linalg`, `tolerances` |
| 2 | `conventionMapping` | `symmetryGroups` |
| 3 | `tensorForms` | `symmetryGroups`, `tensorProjection`, `linalg` |
| 3 | `symbolicProjection` | `trigPoly`, `tensorProjection`, `linalg`, `symmetryGroups` |
| 3 | `latexFormatting` | `symmetryGroups`, `tensorProjection` |
| 3 | `propertyFlags` | `symmetryGroups`, `tensorProjection`, `data/` |
| 3 | `orientation` | `tensorProjection` |
| 3 | `orientationScene` | `tensorProjection`, `tolerances` |
| 3 | `groupSearch` | `conventionMapping`, `data/` |
| 4 | `nyeScheme` | `tensorForms` (type-only), `tensorProjection` |
| 4 | `trigPolyFormat` | `trigPoly`, `tensorProjection`, `symbolicProjection` (type-only), `tolerances` |
| 5 | `tensorCalculator` | the barrel — re-exports from seven of the above |

What each module is for, and the constraints that are not visible in the graph:

- **`tolerances.ts`** — the shared numeric epsilons. Layer 0 by design: an epsilon that lives
  next to one of its users drifts from the others.
- **`symmetryGroups.ts`** — `Matrix3x3`, the `GENERATORS` table, matrix algebra
  (`multiply`/`det`), group closure + caching, `isCentrosymmetric`, `getSymmetryOperations`, and
  the re-exported `EPSILON`/`AXIS_EPSILON` (kept re-exported so the many existing import sites
  stay unchanged — the definitions moved to `tolerances`).
- **`linalg.ts`** — `rref`, `spanRank`, `isIndependentOf` and the pivot epsilons, the numeric 3×3
  rotations, and the symbolic `TrigMat3` helpers. The `trigPoly` dependency comes from that last
  group only; the numeric half is independent of it.
- **`orientationScene.ts`** — the scene model behind the Simulator's sample-orientation widget:
  slab corners, camera-facing faces, the two triads and the anchor corner, already projected into
  SVG units. Like `nyeScheme` it is a VIEW over an existing derivation, not a second one — its
  rotation matrix is `tensorProjection.composeOrientationMatrix`, so the picture and the
  crystal-axes equation box cannot disagree.
- **`tensorProjection.ts`** — the numeric projection core (`calculateTensorBasisResults`,
  `calculateSHGExpressions`, `getLabFrameVectors`, `transformTensor`/`averageTensor`), the Q0
  constraint partition (`reducedPartition`, `formatReducedRelations`,
  `formatCompositeConstraint`), plus the dependency-free leaf helpers (`getIndices`, `getLabel`,
  `formatCoeff`, `cleanupExpressionSigns`). Those leaves are needed both here and by
  `latexFormatting`; per the "shared utilities live in the lower module" rule they are defined
  here, so `latexFormatting` can depend on `tensorProjection` without a reverse edge.
- **`tensorForms.ts`** — `computeTensorForm`, the rank-parametrized generalization of
  `calculateTensorBasisResults`, plus the form signatures behind the sharing partitions.
- **`nyeScheme.ts`** — the dot-diagram view model. A view over `reducedPartition`, deliberately
  not a second derivation of it, so the diagram and the relation list cannot disagree.
- **`trigPoly.ts`** — trigonometric polynomial representation (`TrigPoly`) and algebra
  (`trigAdd`, `trigMul`, `trigEval`, `trigSimplify`) for three rotation angles.
- **`symbolicProjection.ts`** — `calculateSymbolicSHGExpressions`: builds a symbolic rotation
  matrix with preset angles numeric and user angles symbolic, then contracts source terms with
  `TrigPoly` coefficients.
- **`trigPolyFormat.ts`** / **`latexFormatting.ts`** — the two LaTeX renderers, for the symbolic
  and numeric paths respectively.
- **`propertyFlags.ts`**, **`conventionMapping.ts`**, **`orientation.ts`**, **`groupSearch.ts`**,
  **`simulatorEngine.ts`** — leaf services for the Explorer, the convention toggle, the crystal
  cut and the polarimetry sweep.
- **`tensorCalculator.ts`** — a barrel. It only re-exports and should stay short.

## Key Conventions

### Convention references (authoritative — read before touching group data or tensor logic)
The following cross-linked documents are the single source of truth for how the
app maps onto the Birss/ITC conventions:
- **`docs/references/BIRSS-APP-CONVENTIONS-REFERENCE.md`** — the convention contract &
  verification ladder. Self-contained: axis orientation per crystal system, the σ(0)–σ(9)
  generator pool, bracketed/rotated groups, tensor particularization, and a per-step
  anti-circular test. Where Birss and ITC diverge, **Birss wins**.
- **`birss-tables/table-nomenclature.md`** — the 122-group table: app key → Schoenflies
  → full HM → Shubnikov → symmetry operators → generators σ(N)/σ'(N) → type, with every
  App↔Birss↔ITC divergence flagged.
- **`docs/references/BIRSS-ITC-CONVENTION-DIVERGENCES.md`** — authoritative for all
  Birss↔ITC symbol/orientation questions: the two string divergences, the 30° position-2
  offset (trigonal/hexagonal), monoclinic c-vs-b, and Birss's Table-7 parenthesis
  (rotated-axes) semantics. Consult before interpreting ITC sources or any user report of
  a "wrong" symbol/component. Evidence record:
  `docs/findings/SESSION-FINDINGS-2026-07-04-6pmmpm-and-table7.md`.

Together they trace the chain **app key → Schoenflies / full HM → operators / generators →
tensor form**. All expected values are anchored to the frozen Birss tables (`birss-tables/`,
in-repo) or ITC 1.5.2.3 — **never** derived from the app's own output (anti-circularity).

### Physics / Domain
- **Tensor types**: `'ED'` (Electric Dipole, χ²), `'MD'` (Magnetic Dipole), `'EQ'` (Electric Quadrupole).
- **Time-reversal**: `'i'` = time-even (i-type), `'c'` = time-odd (c-type). Represented by `TensorTimeReversal` in `tensorCalculator.ts`.
- **Point group types**: `'I'` Standard (32), `'II'` Gray (32), `'III'` Black & White (58) — defined in `PointGroupData.type`.
- Light propagates along the **Z-axis** in the Lab Frame → `E_Z = 0` by convention throughout.
- Crystal rotation is parameterised by **phiX**, **phiY** (lab-fixed tilts) and **psi** (crystal-tied azimuth), in degrees -- see `trigPoly.ts` / `tensorProjection.ts` for the composition `R = Ry(phiY) * Rx(phiX) * Rz(psi) * R_preset`.
- Anti-unitary operations (time-reversal combined) are flagged via `isAntiUnitary?: boolean` on the `Matrix3x3` interface.

### Math rendering
- All in-line math uses `<InlineMath math="..." />` from `react-katex`.
- Block math uses `<BlockMath math="..." />`.
- `import 'katex/dist/katex.min.css'` is required wherever KaTeX components are used.
- The `FormatPointGroup` component converts Hermann–Mauguin notation to KaTeX (e.g. `-6` → `\bar{6}`).

### Styling
- **Tailwind CSS v4** (via `@tailwindcss/vite` plugin, not the classic PostCSS config).
- Global palette: background `#E4E3E0`, foreground/text `#141414`.
- No CSS Modules, no Styled Components. All styling is inline Tailwind utility classes.
- One custom utility in `index.css`: `.overline` for text-decoration.
- **Section header pattern**: `text-xs uppercase tracking-[0.2em] text-ink/70 flex items-center gap-2` — use the shared `SectionHeader` component from `notation.tsx` rather than inlining this string.

### Component patterns
- All page components receive state as grouped prop objects from `App.tsx` (`TensorConfig`, `OrientationState`, etc.) — no Context API or Zustand.
- `useMemo` is used extensively in `SimulatorPage.tsx` and `App.tsx` for expensive tensor calculations.
- Animations use `motion` from `motion/react` (Framer Motion v12), with `AnimatePresence` for exit animations.
- Icons come exclusively from `lucide-react`.

### Path aliases
- `@/*` maps to `src/` (defined in both `tsconfig.json` and `vite.config.ts`).

## Git Workflow & Releases

Single-maintainer project using **GitHub Flow + Semantic Versioning**. `main` is
always shippable (and CI-checked via `.github/workflows/ci.yml`), but merging to it
does **not** by itself go live — the deployed site only updates on a `vX.Y.Z` release
tag (see `.github/workflows/deploy.yml`). This decouples "merged" from "released":
`main` can accumulate tested changes, and going live is the deliberate act of cutting
a release (see "Cutting a release" below). **Never commit directly to `main`.**

### GitHub hygiene
Regularly check the GitHub repository for items that need attention:
- **PR review findings** (independent agent review, human reviewers, and any automated reviewer
  comments that still appear) — address before merging.
- **Code scanning alerts** — fix promptly; CodeQL runs on every push to `main` and weekly.
- **Dependabot alerts and PRs** — review vulnerability alerts and routine version-update PRs.
- **Open issues** — triage and respond.

### Branches
- Every change goes through a short-lived branch, merged back into `main` with
  `--no-ff` (keeps a merge commit marking the change as a unit) and deleted
  afterward. There is no `develop` branch.
- Prefixes (lowercase, words separated by hyphens):

  | Prefix      | Purpose                                     | Example                          |
  |-------------|---------------------------------------------|----------------------------------|
  | `feature/`  | New functionality                           | `feature/domain-export`          |
  | `fix/`      | Bug fix                                     | `fix/phase-angle-rounding`       |
  | `hotfix/`   | Urgent fix applied directly to a release    | `hotfix/crash-on-export`         |
  | `refactor/` | Behavior-preserving restructuring           | `refactor/signature-migration`   |
  | `docs/`     | Documentation-only changes                  | `docs/oblique-axis-convention`   |
  | `chore/`    | Tooling, CI, dependencies, non-code cleanup | `chore/color-tokens`             |

```bash
git switch main && git pull
git switch -c feature/<short-name>
# ... work, commit (Conventional Commits — see below) ...
```

### Merging: local merge vs. pull request

Use the merge method that fits the risk level of the change:

| Change type | Method | Why |
|---|---|---|
| Physics output (generators, tensor logic, group data) | **Pull request** | Gets an independent agent review, CodeQL runs pre-merge, creates auditable record for changes that affect calculated results |
| New features, UI changes, refactors touching multiple files | **Pull request** | Benefits from an independent agent review and a visible diff summary |
| Process or normative docs (`AGENTS.md`, `STATUS.md` § 5, `DECISION-*`, convention references) | **Pull request** | Changes the rules every later change is judged by; gets an independent agent review |
| Chores (CI config, dependency bumps, doc formatting, typos) | **Local merge** | Low risk, no review needed, faster |

**Pull request workflow:**
```bash
git push -u origin feature/<short-name>
gh pr create --title "..." --body "..."
# Run the independent agent review (below); address its findings and add them with their
# disposition to the PR body (gh pr edit --body ...); wait for CI checks
# Merge via GitHub UI (use "Create a merge commit", not squash)
# Delete remote branch via GitHub UI
git switch main && git pull
git branch -d feature/<short-name>
```

**Independent agent review** (maintainer, 2026-11-21; replaces the Copilot review, which runs into
its usage limits too quickly to be practical; switch Copilot review off in the repository settings
rather than leave it half-running). Every pull request gets one before the PR is handed to the
maintainer or merged. Whoever did the work (agent or maintainer) starts a separate agent that does
not know the work: it gets only the repository, the branch and the purpose of the change — not the
author's reasoning or conclusions — and checks the diff for errors, edge cases, contradictions with
this file, the standing decisions in `STATUS.md` § 5 and the convention references, and domain
claims (physics, conventions, provenance) against the code and the sources. Every finding is
verified before acting on it, then fixed or answered, and the PR description lists the findings
and their disposition under a **Review** heading.

How this review meets the post-verdict rule below: the branch has a **clean verdict** when the
review leaves no unresolved *important* finding (nits may be answered instead of fixed). Fixes
made in answer to findings are post-verdict commits — they merge without another round only under
the four conditions below; otherwise a **fresh** independent agent reviews the delta, given the
same three inputs plus the previous findings. The PR description's **Review** section is the
review ledger (condition 3) and the place for the merge report (condition 4).

**Post-verdict commits on an already-reviewed branch.** Once a branch has a clean review verdict,
a further commit normally needs a delta re-review before merging. It may merge without that second
round-trip only when **all four** of these hold:

1. it is **docs- or comment-only** (no change to any executed code path);
2. it is **responsive** to a review comment or a verdict note (not new, self-directed scope);
3. it stays **within the paths already enumerated** by the work order or the review ledger; and
4. the **merge report quotes the diff**, so the merge record shows exactly what was added after
   the verdict.

Anything failing one of the four — including a one-line code fix, however trivial — goes back for
a delta re-review.

**Local merge workflow** (still merges a branch — never commit directly on main):
```bash
# Before merging: ensure `npm run lint && npm run test` pass locally
git switch main && git pull
git merge --no-ff feature/<short-name>
git branch -d feature/<short-name>
git push origin main
```

### Versioning
- The app version (`package.json` `version`) is injected into the footer via Vite's `define` (`__APP_VERSION__`, declared in `src/vite-env.d.ts`). Keep `package-lock.json`'s top-level `version` in sync (`npm install --package-lock-only`).
- Follow [Semantic Versioning](https://semver.org/):

  | Change                                        | Bump  | Example           |
  |------------------------------------------------|-------|-------------------|
  | New feature                                     | MINOR | `v1.2.0 → v1.3.0` |
  | Corrected error in calculated output            | PATCH | `v1.3.0 → v1.3.1` |
  | Incompatible change to output format/values     | MAJOR | `v1.3.1 → v2.0.0` |

### Changelog
- On every user-facing change (behavior, UI, or capability — Added/Changed/Fixed/Removed in the Keep a Changelog sense), add an entry under `## [Unreleased]` in `CHANGELOG.md`. For corrections to calculated output, record **what** was wrong and **from which version** it's fixed — needed to interpret old results correctly later. Internal-only changes (chores, tests, CI, tooling/config with no runtime effect) generally don't need an entry.

### Cutting a release
1. Bump `version` in `package.json`/`package-lock.json`.
2. Move the `Unreleased` entries under a new `## [x.y.z] - YYYY-MM-DD` heading, and update the compare/release links at the bottom of `CHANGELOG.md`.
3. Bump `STATUS.md`'s current-release block (the `## Current release: vX.Y.Z` heading, its one-line summary, the `_Last updated:_` date, and demote the previous release to a `### vX.Y.Z` past entry). Keeps the canonical cycle index from going stale.
4. Commit, then on `main`: `git tag -a vX.Y.Z -m "..."` and `git push origin main --tags`.
5. Pushing the tag triggers two workflows: `release.yml` creates the GitHub Release automatically, using the matching `## [x.y.z]` section of `CHANGELOG.md` as the release notes; `deploy.yml` builds and publishes the tagged commit to GitHub Pages — this is the point where the live site actually updates.

### Commit messages
- [Conventional Commits](https://www.conventionalcommits.org/): `type(scope): lowercase summary`, e.g. `feat(simulator): add polarimetry tooltip`. Common types are `feat`, `fix`, `refactor`, `test`, `docs`, `chore`. Scope is optional and usually the affected component/module. Keep the summary line short (~72 chars); use the body for details.
- For fixes affecting calculated output, mention which output values are affected.

### License
- MIT (`LICENSE` at repo root). Keep the `@license SPDX-License-Identifier: MIT` header in `App.tsx` consistent with this.

### Release checklist
- [ ] All feature/fix branches merged (`--no-ff`) and deleted
- [ ] `main` up to date locally (`git pull`)
- [ ] `npm run lint && npm run test` pass
- [ ] Version bumped per SemVer
- [ ] `CHANGELOG.md` updated
- [ ] `STATUS.md` current-release block bumped (heading, summary, `_Last updated:_`, previous release demoted)
- [ ] Tag created and pushed with `--tags` (triggers the GitHub Release via `release.yml` and the live deploy via `deploy.yml`)

## Important Constraints

- **No backend**: all tensor math runs client-side in `tensorCalculator.ts`. Do not add server-side routes.
- **PWA**: the app registers a service worker (`vite-plugin-pwa`). Manifest assets (`favicon.svg`, `icon-192.svg`, `icon-512.svg`) live in `public/`. Do not rename or remove them.
- **TypeScript strict mode is on** (`strict: true` in `tsconfig.json`), enforced by `npm run lint` in CI.
- **Vitest is the test framework** — see `npm run test` above. Do not switch to Jest or another runner without explicit instruction.
