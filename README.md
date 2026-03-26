# The Birss App

Analysis of crystallographic point groups and susceptibility tensors based on the principles of symmetry and magnetism established by R.R. Birss.

### [Live Demo](https://thomaslottermoser.github.io/birss-app/)

## Features
- **Point Group Analysis**: Detailed symmetry classification for all 32 crystallographic point groups.
- **Tensor Calculation**: Automatic determination of non-zero and independent components for Electric Dipole (ED), Magnetic Dipole (MD), and Electric Quadrupole (EQ) tensors.
- **SHG Source Terms**: Real-time calculation of induced nonlinear response for different propagation directions ($k \parallel x, y, z$).
- **Symmetry-Aware Rendering**: Correct mathematical notation with subscripts and superscripts for all physical symbols.
- **Responsive Design**: Optimized for both desktop and mobile viewing.

## Tech Stack
- **Developed with [Google AI Studio](https://ai.studio/build)** — Built, iterated, and deployed using natural language prompting.
- **React 19** + **Vite**
- **Tailwind CSS** for styling
- **Lucide React** for iconography
- **GitHub Actions** for automated deployment to GitHub Pages

## Running Locally
1. Clone the repo: `git clone https://github.com/thomaslottermoser/birss-app.git`
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`
4. Build for production: `npm run build`
