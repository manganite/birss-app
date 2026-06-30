# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Simulator now has a "Crystal Setting" selector with full parity to the Calculator's
  (same control, same labels); the selected setting persists across Calculator ↔
  Simulator navigation, resetting to the default only on group change (B2.4).
- Explorer group popup shows the number of available settings and the alternate
  setting's symbol/convention name (e.g. "2 settings — also expressible as 6'm'm");
  the Monoclinic tab explains the First/Second (c-unique Birss / b-unique ITC)
  convention (B2.2).
- Help page's "Alternate Settings" section opens with a plain-language explanation
  of what a setting is and why a group can have more than one, before the formal
  mechanism breakdown; clarifies the setting selector now appears in both the
  Calculator and the Simulator (B2.1).

### Changed
- Calculator/Simulator setting buttons for non-monoclinic dual-setting magnetic
  groups now show the distinct magnetic HM symbol (e.g. `6'm'm`, `4'm'm`, `-4'm'2`)
  instead of internal mechanism labels (e.g. "σ_d primed", "C₂' along ⟨100⟩").
  13 entries relabeled; trigonal `-3'm`/`-3'm'`/`-3m'` and hexagonal `-6'2m'`/
  `-6'm2'`/`-6m'2'` are not yet relabeled (tracked separately, the former blocked
  on the `-3'm'` generator fix in #37). Monoclinic alternate-setting buttons now
  read "Second (b-unique, ITC)" instead of "b-unique (ITC)" for consistency with
  the Help/Explorer wording (B2.3, partial).

## [0.12.0] - 2026-06-29

### Added
- Shared group-identity header in Calculator and Simulator showing: HM symbol
  with Schoenflies, crystal system, type, centrosymmetric badge, current setting,
  parent crystallographic group and halving subgroup H (Type III), one-line SHG
  consequence, and "Open in Explorer" link (B3/B27).

### Changed
- Calculator setup area uses two-column layout (Tensor Classification | Time
  Reversal side by side on md+), matching the Simulator (B4).
- Button styling unified across Calculator and Simulator: text-xs font-medium
  with icon-labeled section headers (B4).
- Grey emphasis chips dropped from section labels (B25).

## [0.11.0] - 2026-06-29

### Added
- Alternate settings for 11 Type I (colourless) and 11 Type II (grey) point
  groups: orthorhombic axis orientation (222, mm2, mmm — 3 settings each),
  monoclinic axis choice (2, m, 2/m — b-unique ITC), and classical Mechanism A
  (-42m, 32, 3m, -3m, -6m2 — alternate orientations), plus their grey 1'
  counterparts. The setting selector now covers all groups that have multiple
  settings. Default-setting output is unchanged.

## [0.10.1] - 2026-06-29

### Added
- Lab-frame orientation panel: inverse-relation toggle (↔) switches between
  "crystal axes in the lab frame" and "lab axes in the crystal frame" views.
  Info (ⓘ) button shows a legend explaining the axis symbols and their
  physical meaning.

### Changed
- Lab-frame panel title sharpened from "Crystal Orientation in Lab Frame" to
  "Crystal axes in the lab frame" (switches with the inverse toggle).

## [0.10.0] - 2026-06-29

### Fixed
- Simulator tilt axes (φ_x, φ_y) are now lab-fixed: spinning the crystal
  (ψ) no longer drags the tilt axes. The rotation composition changes from
  R = Rz(ψ)·Ry(φ_y)·Rx(φ_x)·R_preset to R = Ry(φ_y)·Rx(φ_x)·Rz(ψ)·R_preset.
  Previously, tilts were crystal-fixed, producing wrong geometry when ψ and
  tilts were combined (since v0.3.0). At zero tilt (the default), results
  are unchanged.

### Changed
- Calculator source terms now show the angle-independent form at the selected
  cut direction, without φ_x/φ_y/ψ dependence. The Simulator retains the
  full angle-dependent symbolic form.
- Crystal cut direction selector and lab-frame panel unified into a single
  shared component with consistent naming ("Crystal Cut, surface normal ∥ k")
  across Calculator and Simulator.

## [0.9.0] - 2026-06-29

### Added
- Magnetic snapping on phase (15° increments) and magnitude (0.05 increments)
  sliders; Shift+Arrow for larger steps; clickable scale ticks for
  jump-to-value (B10).

### Changed
- Simulator tensor-component sliders use compact inline rows with
  always-visible phase instead of a tall vertical stack with collapsible
  phase (B6).
- Simulator polar plots enlarged (max 450px, outerRadius 80%); excess
  vertical whitespace trimmed (B18).
- Single-component groups show disabled sliders with explanatory note
  instead of interactive controls (B17).

### Fixed
- Simulator mobile layout: single-plot view with parallel/crossed toggle,
  component selector for one-at-a-time slider control; no longer overlaps
  or requires scrolling past the full setup panel (A3).

## [0.8.1] - 2026-06-28

### Fixed
- `formatCoeff` recognises `1/√6` and renders it as `1/√6` instead of the
  decimal `0.408`. The existing `√6/3` entry now displays as `2/√6` so the
  `[111]` cubic lab-frame X-coefficients read homogeneously (display only;
  numeric values unchanged).

## [0.8.0] - 2026-06-28

### Added
- Explorer group popup displays the Schoenflies symbol alongside the
  Hermann-Mauguin notation for Type-I and Type-II (grey) groups.
- Explorer group popup adds an "Open in Simulator" button alongside the
  existing "Open in Calculator" link.

### Fixed
- Tensor rank badge no longer shows "RANK RANK 3" / "RANK RANK 4"; displays
  "RANK 3" / "RANK 4" as intended (since v0.4.0).
- Explorer type-column subtitles now show the count for the selected crystal
  system (e.g. "7 groups" for Hexagonal Type I) instead of the global totals
  "32 / 32 / 58" (since v0.7.0).
- Help page Feature Overview box order now matches the navigation order
  (Explorer → Calculator → Simulator).
- Tensor Notes section on mobile no longer requires a tap to expand
  (content is always visible).
- Spurious vertical scroll arrows on Calculator equation rows removed.
- Label wording standardized across Calculator and Simulator ("Tensor
  Classification", "Source Terms (Lab Frame)", "ED SHG", Unicode ∥/⊥,
  "Centrosymmetric"/"Non-Centrosymmetric").
- Tensor components panel no longer reserves excessive whitespace for
  high-symmetry groups with few components.

### Changed
- Crystal cut presets reduced to one representative per symmetry direction
  family (Blickrichtungen): Cubic shows [100], [111], [110]; Tetragonal shows
  [001], [100], [110]. Previously, symmetry-equivalent directions (e.g.
  [001]/[100]/[010] in cubic) were listed individually.

### Removed
- Free [hkl] Miller-index input for cubic groups removed. Use the curated
  presets instead (restricted to cubic only since v0.7.1).

## [0.7.1] - 2026-06-27

### Fixed
- Azimuth-zero convention for non-principal crystal cuts: preset rotation
  now includes a beam-axis offset (psi0) that anchors azimuth 0 to the
  projection of the crystal c-axis [001] onto the sample surface. This
  makes polarimetry at psi=0 reproducible and lab-independent for cuts
  like [110], [111], and arbitrary [hkl]. Principal cuts are unchanged.
  Previously, azimuth 0 was an arbitrary byproduct of the Euler
  decomposition order (wrong by up to 120° for some cuts since v0.7.0).
- Preset labels for hexagonal/trigonal systems corrected from [010] to
  [120], matching the actual crystallographic direction of the Cartesian
  y-axis. Monoclinic/triclinic labels now show [010] ∥ b* to clarify the
  reciprocal-space nature of that direction.
- Free [hkl] Miller-index input restricted to cubic point groups. For
  non-cubic systems the orthonormal-metric interpretation silently
  produced wrong geometry (since v0.7.0). Non-cubic systems use curated
  presets only.
- Free [hkl] input hidden on mobile, consistent with the presets-only
  mobile design.
- Preset highlight comparison now includes psi0 (from the azimuth-zero
  fix), preventing false highlights when angles match but psi0 differs.

### Added
- Always-visible mobile preset strip for crystal cut selection, placed
  above the results panel. Previously, cut selection on mobile required
  expanding the collapsed Source Terms section.
- Validation feedback on the [hkl] input field: red border and hint text
  on malformed input (previously silent no-op).

### Changed
- Calculator view extracted from App.tsx into CalculatorPage.tsx
  (App.tsx reduced from 910 to 322 lines).
- SimulatorPage props grouped from 24 flat props into 5 structured
  objects (TensorConfig, OrientationState, SimulationState).
- Spin-slow animation moved from inline `<style>` block to index.css.

## [0.7.0] - 2026-06-26

### Added
- Explorer: per-crystal-system tab strip replaces the vertical scroll of all
  7 systems. Each tab shows the group grid for one system with an axis-orientation
  reference panel below. Group popup now displays generators above the full
  symmetry operations list. (PR #23)
- Free [hkl] Miller-index input alongside curated cut presets in the Calculator.
  Type any Miller indices (e.g. "1 2 3") to orient the crystal with that surface
  normal along the beam direction — no engine changes, computed via Euler angle
  decomposition of the existing R_preset architecture. (PR #24)
- Help page: new "Deeper Topics" section covering i-type vs c-type tensors,
  lab-frame rotation angles (phiX, phiY, psi), and alternate settings concepts.

### Changed
- Calculator: classification sidebar replaced with a compact one-line group
  indicator that expands on click. Main content area now uses full viewport
  width on all screen sizes. (PR #25)
- Two-level label hierarchy: primary section headers (tensor components, induced
  response, source terms) promoted to larger/bolder styling; secondary labels
  (controls, settings) stay compact. (PR #25)

## [0.6.0] - 2026-06-26

### Added
- Alternate settings for all 21 remaining multi-setting magnetic point groups
  (Phase 2): 11 Mechanism A groups (tetragonal/trigonal/hexagonal via Rz(45°/30°)),
  5 orthorhombic groups with 3 axis-orientation settings (c/a/b-unique), and
  5 monoclinic groups with z-unique (Birss) / b-unique (ITC) settings. The setting
  selector UI now covers all 29 multi-setting groups (8 from Phase 1 + 21 new).
- 64 new tests: S·Sᵀ=I verification for every transformation matrix and golden
  tensor-relation fixtures for all new settings, cross-checked against Birss
  Table 7 for the three validation-anchor groups (2'm'm), (-4'm2'), (-6'2m').

## [0.5.0] - 2026-06-26

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

[Unreleased]: https://github.com/manganite/birss-app/compare/v0.12.0...HEAD
[0.12.0]: https://github.com/manganite/birss-app/compare/v0.11.0...v0.12.0
[0.11.0]: https://github.com/manganite/birss-app/compare/v0.10.1...v0.11.0
[0.10.1]: https://github.com/manganite/birss-app/compare/v0.10.0...v0.10.1
[0.10.0]: https://github.com/manganite/birss-app/compare/v0.9.0...v0.10.0
[0.9.0]: https://github.com/manganite/birss-app/compare/v0.8.1...v0.9.0
[0.8.1]: https://github.com/manganite/birss-app/compare/v0.8.0...v0.8.1
[0.8.0]: https://github.com/manganite/birss-app/compare/v0.7.1...v0.8.0
[0.7.1]: https://github.com/manganite/birss-app/compare/v0.7.0...v0.7.1
[0.7.0]: https://github.com/manganite/birss-app/compare/v0.6.0...v0.7.0
[0.6.0]: https://github.com/manganite/birss-app/compare/v0.5.0...v0.6.0
[0.5.0]: https://github.com/manganite/birss-app/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/manganite/birss-app/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/manganite/birss-app/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/manganite/birss-app/compare/v0.1.1...v0.2.0
[0.1.1]: https://github.com/manganite/birss-app/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/manganite/birss-app/releases/tag/v0.1.0
