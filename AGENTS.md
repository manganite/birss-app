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

`npm run lint` and `npm run test` are the automated quality gates (run in CI via `.github/workflows/ci.yml`). Tests for `tensorCalculator.ts` live in `src/services/tensorCalculator.test.ts` and cover: group-order sanity for all 122 point groups, parity invariants (e.g. ED vanishes for centrosymmetric groups, EQ never vanishes, grey groups `G1'` reproduce `G` for i-type), `formatCoeff`/`isCentrosymmetric` unit tests, and a small but growing set of literature-verified "golden" component relations (see Sirotin & Shaskol'skaya / Boyd references in `HelpPage.tsx`).

## Architecture

```
src/
  data/pointGroups.ts          # Static registry of all 122 magnetic point groups
  services/tensorCalculator.ts # All physics logic: tensor algebra, SHG source terms, Fourier simplification
  components/
    MathComponents.tsx         # Shared KaTeX render helpers (TensorTerm, FormatPointGroup, SymmetryOperation)
    PointGroupExplorer.tsx     # Explorer page — browse & filter the 122 groups
    OperationsModal.tsx        # Modal showing symmetry operations for a selected group
    SimulatorPage.tsx          # Simulator page — radar chart polarimetry, Fourier series formulas
    HelpPage.tsx               # Physics background & usage docs
  App.tsx                      # Root: global state, tab routing, Calculator page UI
```

All cross-page state (selected group, tensor type, time-reversal, rotation angles, amplitudes, phases) lives in `App.tsx` and is passed down as props. There is no state management library.

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

- The app version (`package.json` `version`) is injected into the footer via Vite's `define` (`__APP_VERSION__`, declared in `src/vite-env.d.ts`). Bumping the version requires no other code changes — `package-lock.json`'s top-level `version` should be kept in sync (`npm install --package-lock-only`).
- Follow [Semantic Versioning](https://semver.org/). On every notable change, add an entry under `## [Unreleased]` in `CHANGELOG.md`.
- When cutting a release: bump `version` in `package.json`/`package-lock.json`, move the `Unreleased` changelog entries under a new `## [x.y.z] - YYYY-MM-DD` heading, update the compare/release links at the bottom of `CHANGELOG.md`, then tag (`vX.Y.Z`) and create a GitHub release.
- License is MIT (`LICENSE` at repo root). Keep the `@license SPDX-License-Identifier: MIT` header in `App.tsx` consistent with this.

## Important Constraints

- **No backend**: all tensor math runs client-side in `tensorCalculator.ts`. Do not add server-side routes.
- **PWA**: the app registers a service worker (`vite-plugin-pwa`). Manifest assets (`favicon.svg`, `icon-192.svg`, `icon-512.svg`, `apple-touch-icon.png`, `mask-icon.svg`) live in `public/`. Do not rename or remove them.
- **TypeScript strict mode is off** — no `strict: true` in `tsconfig.json`. Do not add it without testing.
- **Vitest is the test framework** — see `npm run test` above. Do not switch to Jest or another runner without explicit instruction.
