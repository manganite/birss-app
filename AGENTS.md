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

## Git Workflow & Releases

Single-maintainer project using **GitHub Flow + Semantic Versioning**. `main` is
always shippable (and CI-checked via `.github/workflows/ci.yml`), but merging to it
does **not** by itself go live — the deployed site only updates on a `vX.Y.Z` release
tag (see `.github/workflows/deploy.yml`). This decouples "merged" from "released":
`main` can accumulate tested changes, and going live is the deliberate act of cutting
a release (see "Cutting a release" below). **Never commit directly to `main`.**

### Branches
- Every change goes through a short-lived branch, merged back into `main` with
  `--no-ff` (keeps a merge commit marking the change as a unit) and deleted
  afterward. There is no `develop` branch.
- Prefixes (lowercase, words separated by hyphens):

  | Prefix     | Purpose                                   | Example                    |
  |------------|--------------------------------------------|----------------------------|
  | `feature/` | New functionality                          | `feature/domain-export`    |
  | `fix/`     | Bug fix                                     | `fix/phase-angle-rounding` |
  | `hotfix/`  | Urgent fix applied directly to a release   | `hotfix/crash-on-export`   |

```bash
git switch main && git pull
git switch -c feature/<short-name>
# ... work, commit (Conventional Commits — see below) ...
git switch main && git pull
git merge --no-ff feature/<short-name>
git branch -d feature/<short-name>
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
3. Commit, then on `main`: `git tag -a vX.Y.Z -m "..."` and `git push origin main --tags`.
4. Pushing the tag triggers two workflows: `release.yml` creates the GitHub Release automatically, using the matching `## [x.y.z]` section of `CHANGELOG.md` as the release notes; `deploy.yml` builds and publishes the tagged commit to GitHub Pages — this is the point where the live site actually updates.

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
- [ ] Tag created and pushed with `--tags` (triggers the GitHub Release via `release.yml` and the live deploy via `deploy.yml`)

## Important Constraints

- **No backend**: all tensor math runs client-side in `tensorCalculator.ts`. Do not add server-side routes.
- **PWA**: the app registers a service worker (`vite-plugin-pwa`). Manifest assets (`favicon.svg`, `icon-192.svg`, `icon-512.svg`, `apple-touch-icon.png`, `mask-icon.svg`) live in `public/`. Do not rename or remove them.
- **TypeScript strict mode is on** (`strict: true` in `tsconfig.json`), enforced by `npm run lint` in CI.
- **Vitest is the test framework** — see `npm run test` above. Do not switch to Jest or another runner without explicit instruction.
