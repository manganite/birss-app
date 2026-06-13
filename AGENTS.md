# The Birss App — Agent Guidelines

Scientific React SPA that calculates non-zero susceptibility tensor components (ED, MD, EQ) and SHG source terms for all 32 crystallographic and 122 magnetic point groups.

## Build & Dev

```bash
npm install          # install dependencies
npm run dev          # dev server on http://localhost:3000
npm run build        # production build → dist/
npm run lint         # TypeScript type-check only (tsc --noEmit)
npm run test         # run the Vitest suite once
npm run test:watch   # run Vitest in watch mode
npm run deploy       # build + publish to GitHub Pages via gh-pages
```

`npm run lint` and `npm run test` are the automated quality gates (run in CI via `.github/workflows/ci.yml`). Tests for `tensorCalculator.ts` live in `src/services/tensorCalculator.test.ts` and cover: group-order sanity for all 122 point groups, parity invariants (e.g. ED vanishes for centrosymmetric groups, EQ never vanishes, grey groups `G1'` reproduce `G` for i-type), and `formatCoeff`/`isCentrosymmetric` unit tests, plus a small set of literature-verified "golden" ED i-type component relations for six Type-I groups (see Sirotin & Shaskol'skaya / Boyd references in `HelpPage.tsx`).

`src/services/goldenTensors.fixtures.ts` + `goldenTensors.test.ts` extend this with golden component-relation fixtures for **every Type-III crystal family**, c-type ED (incl. the canonical Cr2O3 `-3'm'` magnetoelectric SHG tensor), and the axial (MD) `det(g)` branch — each pinning down the *identity* of a hand-curated `GENERATORS` entry, not just its order or invariants. Most of these fixtures are derived directly from each group's generators via the rank-3/4 transformation law (Birss, *Symmetry and Magnetism* (1966), eq. 3.22/3.27), independently re-implemented and calibrated against the six pre-existing fixtures; see each fixture's `source`/`note` for the citation and any group-theory cross-checks. Treat these as `// VERIFY:`-class fixtures pending human sign-off against the printed Birss tables.

## Architecture

```
src/
  data/pointGroups.ts            # Static registry of all 122 magnetic point groups
  services/
    tensorCalculator.ts          # Thin barrel re-exporting the public API below
    symmetryGroups.ts            # Matrix algebra, GENERATORS table, group closure, getSymmetryOperations
    tensorProjection.ts          # Numeric tensor projection (transform/average/basis), SHG polynomials, lab-frame vectors
    latexFormatting.ts           # LaTeX rendering: calculateTensorComponents, formatSubstitutedPolySum
  components/
    MathComponents.tsx           # Shared KaTeX render helpers (TensorTerm, FormatPointGroup, SymmetryOperation)
    PointGroupExplorer.tsx       # Explorer page — browse & filter the 122 groups
    OperationsModal.tsx          # Modal showing symmetry operations for a selected group
    SimulatorPage.tsx            # Simulator page — radar chart polarimetry, Fourier series formulas
    HelpPage.tsx                 # Physics background & usage docs
  App.tsx                        # Root: global state, tab routing, Calculator page UI
```

All cross-page state (selected group, tensor type, time-reversal, rotation angles, amplitudes, phases) lives in `App.tsx` and is passed down as props. There is no state management library.

### `services/` module dependency direction

`tensorCalculator.ts` is a barrel: it only re-exports symbols from the three modules
below and should stay short. Dependencies flow one way —
**`latexFormatting` → `tensorProjection` → `symmetryGroups`** (formatting may import
physics, never the reverse):

- **`symmetryGroups.ts`** — `Matrix3x3`, the `GENERATORS` table, matrix algebra
  (`multiply`/`det`), group closure + caching, `isCentrosymmetric`,
  `getSymmetryOperations`, and the shared `EPSILON`/`AXIS_EPSILON` constants. No
  dependencies on the other two modules.
- **`tensorProjection.ts`** — the numeric projection core
  (`calculateTensorBasisResults`, `calculateSHGExpressions`, `getLabFrameVectors`,
  `transformTensor`/`averageTensor`), plus four dependency-free leaf helpers
  (`getIndices`, `getLabel`, `formatCoeff`, `cleanupExpressionSigns`). These leaves
  are needed by both this module (`calculateSHGExpressions`, `getLabFrameVectors`)
  and by `latexFormatting.ts` (`formatResults`, `formatSubstitutedPolySum`); per the
  "shared utilities live in the lower module" rule they're defined here rather than
  in `latexFormatting.ts`, so that `latexFormatting` can depend on `tensorProjection`
  without creating a reverse dependency. Depends only on `symmetryGroups`.
- **`latexFormatting.ts`** — `calculateTensorComponents` (thin wrapper around
  `calculateTensorBasisResults` + a local `formatResults`) and
  `formatSubstitutedPolySum`. Depends on `tensorProjection` and `symmetryGroups`.

## Key Conventions

### Physics / Domain
- **Tensor types**: `'ED'` (Electric Dipole, χ²), `'MD'` (Magnetic Dipole), `'EQ'` (Electric Quadrupole).
- **Time-reversal**: `'i'` = time-even (i-type), `'c'` = time-odd (c-type). Represented by `TensorTimeReversal` in `tensorCalculator.ts`.
- **Point group types**: `'I'` Standard (32), `'II'` Gray (32), `'III'` Black & White (58) — defined in `PointGroupData.type`.
- Light propagates along the **Z-axis** in the Lab Frame → `E_Z = 0` by convention throughout.
- Crystal rotation is parameterised by **thetaX** and **thetaY** (degrees), applied as sequential rotation matrices in `tensorCalculator.ts`.
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

### Component patterns
- All page components receive state as explicit props from `App.tsx` — no Context API or Zustand.
- `useMemo` is used extensively in `SimulatorPage.tsx` and `App.tsx` for expensive tensor calculations.
- Animations use `motion` from `motion/react` (Framer Motion v12), with `AnimatePresence` for exit animations.
- Icons come exclusively from `lucide-react`.

### Path aliases
- `@/*` maps to the project root (defined in both `tsconfig.json` and `vite.config.ts`).

## Releases & Versioning

- **Branching policy**: `main` always reflects the last published release and is what's deployed live — real users depend on it. All unreleased/in-progress work happens on feature branches and is only merged into `main` as part of cutting a release.
- The app version (`package.json` `version`) is injected into the footer via Vite's `define` (`__APP_VERSION__`, declared in `src/vite-env.d.ts`). Bumping the version requires no other code changes — `package-lock.json`'s top-level `version` should be kept in sync (`npm install --package-lock-only`).
- Follow [Semantic Versioning](https://semver.org/). On every user-facing change (behavior, UI, or capability — Added/Changed/Fixed/Removed in the Keep a Changelog sense), add an entry under `## [Unreleased]` in `CHANGELOG.md`. Internal-only changes (chores, tests, CI, tooling/config with no runtime effect) generally don't need an entry.
- When cutting a release: bump `version` in `package.json`/`package-lock.json`, move the `Unreleased` changelog entries under a new `## [x.y.z] - YYYY-MM-DD` heading, update the compare/release links at the bottom of `CHANGELOG.md`, then tag (`vX.Y.Z`) and create a GitHub release.
- License is MIT (`LICENSE` at repo root). Keep the `@license SPDX-License-Identifier: MIT` header in `App.tsx` consistent with this.
- Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/): `type(scope): lowercase summary`, e.g. `feat(simulator): add polarimetry tooltip`. Common types are `feat`, `fix`, `refactor`, `test`, `docs`, `chore`. Scope is optional and usually the affected component/module.

## Important Constraints

- **No backend**: all tensor math runs client-side in `tensorCalculator.ts`. Do not add server-side routes.
- **PWA**: the app registers a service worker (`vite-plugin-pwa`). Manifest assets (`favicon.svg`, `icon-192.svg`, `icon-512.svg`, `apple-touch-icon.png`, `mask-icon.svg`) live in `public/`. Do not rename or remove them.
- **TypeScript strict mode is on** (`strict: true` in `tsconfig.json`), enforced by `npm run lint` in CI.
- **Vitest is the test framework** — see `npm run test` above. Do not switch to Jest or another runner without explicit instruction.
