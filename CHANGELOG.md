# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Symbolic source-term expressions: Calculator and Simulator now display SHG source
  terms as trigonometric polynomials in the three rotation angles (φ_x, φ_y, ψ)
  instead of numeric coefficients at a fixed orientation. Substituting numeric angle
  values into the symbolic expressions reproduces the previous numeric output exactly.
- New `trigPoly` algebra module for trigonometric polynomial arithmetic (addition,
  multiplication, evaluation, Pythagorean simplification) over three independent
  angles — the symbolic engine underlying the rotation-dependent source terms.
- Symbolic projection pipeline (`symbolicProjection.ts`) that runs in parallel with
  the existing numeric path: crystal-frame basis computation stays numeric, while
  lab-frame source-term contractions use symbolic rotation matrix entries.
- LaTeX formatter for TrigPoly expressions (`trigPolyFormat.ts`) using power form
  (cos²φ_x) with automatic coefficient formatting via the existing formatCoeff table.
- 158 new tests: TrigPoly algebra (31), symbolic projection cross-checks against
  numeric path (107), and LaTeX formatter (20).

### Changed
- Calculator source terms now always show symbolic φ-dependent formulas (replaces
  the previous "rotation active in Simulator" informational note).
- Simulator Mathematical Model section adds a symbolic subsection showing
  φ-dependent source terms alongside the existing E_X/E_Y and θ_pol formulas.
- `transformTensor` and `averageTensor` in tensorProjection.ts are now exported
  (previously internal) — used by the symbolic pipeline to avoid duplication.

## [0.4.0] - 2026-06-26

### Added
- Simulator: rotation sliders for φ_x (±90°), φ_y (±90°), and ψ (±180°) with
  coupled numeric inputs, in a collapsible Crystal Rotation section below k-vector
  presets. Polar plots update live as sliders change.
- Simulator: sticky plot column — plots stay visible while scrolling the component
  list for low-symmetry groups with many independent components.
- Simulator: condensed component blocks — phase collapsed by default when φ=0
  (non-zero value shown in collapsed header), amplitude and phase sliders have
  coupled numeric inputs for exact value entry, phase slider shows tick marks
  at 0/90/180/270/360°.
- Crystal-system-aware cut presets: k-vector buttons now show crystallographic
  labels ([001], [100], [010]) instead of abstract k∥z / k∥x / k∥y. Cubic groups
  get [110] and [111] presets; tetragonal gets [110].
- Alternate settings for 8 Mechanism-B magnetic point groups (4 tetragonal + 4
  hexagonal) where time-reversal breaks the mirror-plane equivalence. A setting
  selector appears when multiple settings exist; groups with future settings
  show a passive indicator.
- Contextual explanations for zero-result SHG states: when all source terms
  vanish (centrosymmetric + ED + i-type, or grey + c-type), an inline explanation
  with quick-action buttons (Try c-type / Try EQ / Try MD) replaces the blank
  result. Applies to both Calculator and Simulator.

### Changed
- Calculator source terms now always display at base orientation (φ_x = φ_y = ψ = 0).
  When rotation is active in the Simulator, an info note explains this and points
  to the future symbolic φ-dependent expressions.
- Mobile: Calculator drops tab bar, stacks Components + Induced Response on one
  scroll page. Source Terms is behind tap-to-expand.
- Mobile: Simulator replaces full setup panel with compact one-line summary
  (group · tensor type · TR symmetry · k-preset) that expands on tap.
- Mobile: Polarimetry tabs abbreviated ("Aniso" / "Pol" / "Ana") to prevent
  truncation.
- Mobile: Plots render above the component list with sticky positioning.
  Classification sidebar and Tensor Notes collapse on mobile.
- Mobile: Tensor Type / Time Reversal selectors collapse to a summary when at
  defaults (ED + i-type).
- Hardcoded color values (#141414, #E4E3E0) replaced with semantic `ink`/`paper`
  theme tokens throughout the codebase (~194 occurrences). No visual change.

## [0.3.0] - 2026-06-26

### Added
- Lab-frame rotation engine with three user-defined angles (φ_x, φ_y, ψ) for
  arbitrary crystal orientation beyond principal-axis presets. User rotations are
  applied in the lab frame, decoupled from the k-vector preset: `R = Rz(ψ) ·
  Ry(φ_y) · Rx(φ_x) · R_preset`. No UI controls yet — angles default to 0 and
  will ship with Feature 1C (rotation sliders).
- Golden reference tests for rotated SHG outputs at 8 non-zero rotation
  configurations (k∥x, k∥y, oblique) and 3 lab-frame vector presets, ensuring
  the engine refactor preserves rotated-path correctness.

### Changed
- Rotation matrix now composed from tested primitives (`rotX`, `rotY`, `rotZ`,
  `mat3mul`) instead of a hand-expanded inline formula. Identical numerical
  output at all orientations.
- `calculateSHGExpressions` and `getLabFrameVectors` accept options objects
  (`SHGOptions`, `LabFrameOptions`) instead of positional arguments (internal
  API, no user-visible change).

### Removed
- Diagonal orientation presets (k∥xy, k∥xz, k∥yz). Equivalent orientations are
  reachable via user rotation from the principal presets: k∥xy = k∥y + φ_y = −45°,
  k∥xz = k∥z + φ_y = −45°, k∥yz = k∥z + φ_x = 45°.

## [0.2.0] - 2026-06-26

### Added
- Document the oblique-axis Cartesian convention (Hausühl/IRE) for triclinic and
  monoclinic systems: `AxisOrientationInfo` now shows axis assignments for both
  systems (triclinic previously showed nothing), Help page includes triclinic/monoclinic
  entries and a "Why no β control?" explanation, Simulator shows an info note for
  low-symmetry groups about convention dependence and scope.
- Explorer is now the default landing view (tab order: Explorer → Calculator →
  Simulator → Help), replacing the empty Calculator state.

### Fixed

- Polar plot orientation: 0° (X) is now at the right with angles increasing
  anticlockwise (standard optics/SHG convention). Previously 0° was at the top
  with clockwise progression (since v0.1.0).

## [0.1.1] - 2026-06-18

### Added
- Systematic tensor verification: 21 golden fixtures covering all Birss Table 4e
  symbol classes (A3–U3) at rank 3, confirming the app reproduces every row of
  the Birss polar rank-3 tensor table exactly.

### Changed
- Switched all trigonal and hexagonal generators from x-secondary (ITC convention)
  to y-secondary (Birss convention): σ(2)=[2_y] and σ(4)=[-2_y]. This changes
  tensor component output for 17 groups (32, 3m, -3m and their 14 magnetic
  derivatives) to match the Birss tables exactly. Hexagonal 6-fold groups are
  also updated for generator fidelity (no tensor output change).

### Fixed
- Corrected Hermann–Mauguin symbols for 10 magnetic point groups (since v0.1.0):
  `-62m` → `-6m2` (Type I, and grey `-62m1'` → `-6m21'`);
  `-4'2'm` → `-4'm2'`;
  `6'/mmm'` ↔ `6'/m'mm'` name swap resolved (now `6'/m'mm'` and `6'/mm'm`);
  cubic Type III groups normalized to use consistent bar notation
  (`m'3` → `m'-3'`, `m'3m'` → `m'-3'm'`, `m'3m` → `m'-3'm`, `m3m'` → `m-3m'`).
  Generators and symmetry operations were already correct — only the display
  labels changed.
- Corrected -6m2 and -6m21' generators: changed from σ(2)=[2_y] (C₂ rotation)
  to σ(4)=[-2_y] (mirror with normal y), matching Birss Table 3. The previous
  generator produced the wrong tensor component family (L3-type instead of
  R3-type) for this group (since v0.1.0).

## [0.1.0] - 2026-06-12
### Added
- Calculator: automatic determination of non-zero and independent ED, MD, and EQ tensor components, time-reversal symmetry toggles, real-time SHG response in the lab frame, and crystal rotation controls.
- Explorer: browse and filter all 122 magnetic point groups by crystal system and group type.
- Simulator: interactive radar-chart SHG polarimetry visualization with Fourier series simplification of intensity formulas.
- Help & Documentation page covering physics background, math derivations, and usage instructions.
- MIT license, repository description, topics, and homepage link.

[Unreleased]: https://github.com/manganite/birss-app/compare/v0.4.0...HEAD
[0.4.0]: https://github.com/manganite/birss-app/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/manganite/birss-app/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/manganite/birss-app/compare/v0.1.1...v0.2.0
[0.1.1]: https://github.com/manganite/birss-app/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/manganite/birss-app/releases/tag/v0.1.0
