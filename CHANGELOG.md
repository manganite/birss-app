# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

[Unreleased]: https://github.com/manganite/birss-app/compare/v0.3.0...HEAD
[0.3.0]: https://github.com/manganite/birss-app/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/manganite/birss-app/compare/v0.1.1...v0.2.0
[0.1.1]: https://github.com/manganite/birss-app/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/manganite/birss-app/releases/tag/v0.1.0
