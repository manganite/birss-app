# The Birss App

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

## References
The symmetry relations and calculations presented in this app follow the conventions established in the following literature:
- **[International Tables for Crystallography](https://doi.org/10.1107/97809553602060000114)**: General crystal symmetry aspects.
- **[Birss, R. R. (1966). Symmetry and Magnetism](https://ethz.ch/content/dam/ethz/special-interest/matl/multi-ferroic-materials-dam/documents/education/Nonlinear%20Optics%20on%20Ferroic%20Materials/Birss%20Symmetry%20&%20Magnetism%20komplett.pdf)**: Magnetic point groups and tensor component calculation.
- **[Pershan, P. S. (1963). Nonlinear Optical Properties of Solids](https://doi.org/10.1103/PhysRev.130.919)**: Nonlinear optical multipole contributions.
- **[Fröhlich, D., et al. (1999). Nonlinear spectroscopy of antiferromagnetics](https://doi.org/10.1007/s003400050650)**: Source term calculation.

## Tech Stack
- **Developed with [Google AI Studio Build](https://ai.studio/build)** — Built, iterated, and deployed using natural language prompting.
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
