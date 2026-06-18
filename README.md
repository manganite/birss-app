# The Birss App

[![CI](https://github.com/manganite/birss-app/actions/workflows/ci.yml/badge.svg)](https://github.com/manganite/birss-app/actions/workflows/ci.yml)
[![Deploy](https://github.com/manganite/birss-app/actions/workflows/deploy.yml/badge.svg)](https://github.com/manganite/birss-app/actions/workflows/deploy.yml)
[![Release](https://img.shields.io/github/v/release/manganite/birss-app)](https://github.com/manganite/birss-app/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Calculates non-zero susceptibility tensor components (Electric Dipole, Magnetic Dipole, Electric Quadrupole) and induced transverse Second Harmonic Generation (SHG) source terms for all 32 crystallographic and 122 magnetic point groups.

### [Live Demo](https://manganite.github.io/birss-app/)

## Features

- **Calculator**: 
  - Automatic determination of non-zero and independent components for Electric Dipole (ED, $\chi^{(2)}$), Magnetic Dipole (MD), and Electric Quadrupole (EQ) tensors.
  - Supports Time-Reversal symmetry toggles (i-type, c-type).
  - Real-time calculation of induced nonlinear response in the Lab Frame ($S_X, S_Y, S_Z$) with incoming light propagating along the Z-axis ($E_Z = 0$). 
  - Includes crystal rotation controls ($\theta_X$, $\theta_Y$) to simulate experimental setups.
- **Explorer**: 
  - Browse all 122 crystallographic magnetic point groups.
  - Filter by crystal system and group type (Ordinary, Gray, Black & White).
  - View symmetry operations and properties for each group.
- **Simulator**: 
  - Visualize expected SHG intensity polarimetry patterns.
  - Adjust crystal orientation, tensor component amplitudes, and phases to simulate parallel and crossed polarization configurations.
  - Interactive radar charts displaying SHG intensity as the analyzer angle is rotated.
  - Mathematically simplified and summarized expanded formulas using harmonic Fourier series representation (power reduction and multiple-angle formulas).
  - Smart grouping algorithm to automatically pick the most elegant representation (power vs harmonic) and minimize unnecessary minus signs.
- **Help & Documentation**: 
  - Comprehensive physics background, mathematics behind the intensity calculations, and usage instructions.

## Conventions & References

The tensor component output follows the conventions of **Birss, *Symmetry and Magnetism* (1966)**: the y-axis secondary convention for trigonal and hexagonal groups (σ(2)=[2_y], σ(4)=[-2_y]), and the z-unique monoclinic setting. The app's rank-3 polar tensor output has been verified against all 21 rows of Birss Table 4e. Point group names use Hermann–Mauguin notation with ITC-style rendering (overbars for roto-inversions, primes for time-reversed operations).

- **[Birss, R. R. (1966). Symmetry and Magnetism](https://ethz.ch/content/dam/ethz/special-interest/matl/multi-ferroic-materials-dam/documents/education/Nonlinear%20Optics%20on%20Ferroic%20Materials/Birss%20Symmetry%20&%20Magnetism%20komplett.pdf)**: Authoritative source for magnetic point groups and tensor component calculation. Reference tables typeset in [manganite/birss-tables](https://github.com/manganite/birss-tables).
- **[International Tables for Crystallography](https://doi.org/10.1107/97809553602060000114)**: General crystal symmetry aspects. See [DISCREPANCIES.md](DISCREPANCIES.md) for a detailed comparison of Birss vs ITC conventions.
- **[Pershan, P. S. (1963). Nonlinear Optical Properties of Solids](https://doi.org/10.1103/PhysRev.130.919)**: Nonlinear optical multipole contributions.
- **[Fröhlich, D., et al. (1999). Nonlinear spectroscopy of antiferromagnetics](https://doi.org/10.1007/s003400050650)**: Source term calculation.

## Validation & Testing
The tensor-calculation engine (`src/services/`) is covered by a Vitest suite of 490+ tests, organized in tiers of increasing specificity:
- **Tier 1 — group order**: for all 122 magnetic point groups, `getSymmetryOperations` returns a group of the expected order.
- **Tier 1b — true closure**: for all 122 groups, every pairwise product of elements in the closed group is itself a member, independently verifying the floating-point-hardened closure algorithm in `symmetryGroups.ts`.
- **Tier 2 — parity invariants**: for all 122 groups, structural invariants such as "ED vanishes for centrosymmetric groups", "EQ never vanishes", and "grey groups `G1'` reproduce `G` for i-type tensors".
- **Tier 3 — golden component relations**: 40+ fixtures pinning down the exact independent-component relations for specific (group, tensor type, time-reversal) combinations. Includes all 21 Birss Table 4e symbol classes (A3–U3) at rank 3, every Type-III crystal family, c-type ED (e.g. the canonical Cr₂O₃ `-3'm'` magnetoelectric tensor), axial (MD) tensors, and rank-4 EQ. See `src/services/goldenTensors.fixtures.ts` for sources and citations.

## Tech Stack
- **React 19** + **Vite**
- **Tailwind CSS** for styling
- **Lucide React** for iconography
- **KaTeX** (`react-katex`) for mathematical rendering
- **Recharts** for radar chart visualizations
- **Framer Motion** for smooth animations
- **GitHub Actions** for automated deployment to GitHub Pages

## Running Locally
1. Clone the repo: `git clone https://github.com/manganite/birss-app.git`
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`
4. Build for production: `npm run build`

## Project History
This repository was originally bootstrapped from a Google AI Studio app export; the application has since been fully rewritten and no scaffold code remains.

## Changelog
See [CHANGELOG.md](CHANGELOG.md) for release history.

## License
This project is licensed under the [MIT License](LICENSE).
