# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed
- Corrected Hermann–Mauguin symbols for 10 magnetic point groups (since v0.1.0):
  `-62m` → `-6m2` (Type I, and grey `-62m1'` → `-6m21'`);
  `-4'2'm` → `-4'm2'`;
  `6'/mmm'` ↔ `6'/m'mm'` name swap resolved (now `6'/m'mm'` and `6'/mm'm`);
  cubic Type III groups normalized to use consistent bar notation
  (`m'3` → `m'-3'`, `m'3m'` → `m'-3'm'`, `m'3m` → `m'-3'm`, `m3m'` → `m-3m'`).
  Generators and symmetry operations were already correct — only the display labels changed.

## [0.1.0] - 2026-06-12
### Added
- Calculator: automatic determination of non-zero and independent ED, MD, and EQ tensor components, time-reversal symmetry toggles, real-time SHG response in the lab frame, and crystal rotation controls.
- Explorer: browse and filter all 122 magnetic point groups by crystal system and group type.
- Simulator: interactive radar-chart SHG polarimetry visualization with Fourier series simplification of intensity formulas.
- Help & Documentation page covering physics background, math derivations, and usage instructions.
- MIT license, repository description, topics, and homepage link.

[Unreleased]: https://github.com/manganite/birss-app/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/manganite/birss-app/releases/tag/v0.1.0
