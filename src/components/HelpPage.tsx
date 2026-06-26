import React from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import { BookOpen, Compass, Layers, Zap, Info, Activity, LucideIcon } from 'lucide-react';

const FEATURES: { icon: LucideIcon; title: string; description: string; extra?: React.ReactNode }[] = [
  {
    icon: Zap,
    title: 'Calculator',
    description: 'Calculate non-zero tensor components for various physical properties (Electric Dipole, Magnetic Dipole, Electric Quadrupole) under different point group symmetries. Supports time-reversal symmetry toggles for magnetic groups.',
  },
  {
    icon: Layers,
    title: 'Explorer',
    description: 'Browse all 122 crystallographic magnetic point groups. Filter by crystal system, group type (Ordinary, Gray, Black & White), and view their symmetry operations and properties.',
  },
  {
    icon: Activity,
    title: 'Simulator',
    description: 'Visualize expected SHG intensity polarimetry patterns. Adjust crystal orientation, tensor component amplitudes, and phases to simulate various polarization configurations.',
    extra: (
      <ul className="text-sm opacity-70 list-disc list-inside space-y-1 ml-4">
        <li><strong>Anisotropy:</strong> Parallel and Crossed configurations as a function of polarizer angle.</li>
        <li><strong>Polarizer:</strong> Fixed analyzer at 0° and 90°, as a function of polarizer angle.</li>
        <li><strong>Analyzer:</strong> Fixed polarizer at 0° and 90°, as a function of analyzer angle.</li>
      </ul>
    ),
  },
];

const TENSOR_TYPES: { title: string; description: React.ReactNode }[] = [
  {
    title: 'Polar Tensors',
    description: <>Transform like standard vectors under spatial inversion (<InlineMath math="\vec{r} \to -\vec{r}" />). Examples include electric dipole moments and polarization. Odd-rank polar tensors strictly vanish in centrosymmetric point groups.</>,
  },
  {
    title: 'Axial Tensors',
    description: <>Also known as pseudotensors. They do not change sign under spatial inversion (e.g., magnetic moments, angular momentum). Odd-rank axial tensors can survive in centrosymmetric groups.</>,
  },
  {
    title: 'Time Reversal',
    description: <>Tensors can be symmetric (i-type) or anti-symmetric (c-type) under time reversal (<InlineMath math="t \to -t" />). Magnetic properties are typically c-type, while electric properties are i-type.</>,
  },
];

const SHG_MULTIPOLES: { title: string; description: React.ReactNode }[] = [
  {
    title: 'Electric Dipole (ED)',
    description: <>The leading-order contribution. It is a polar 3rd-rank tensor (<InlineMath math="\chi^{(2)}_{ijk}" />). Because it is odd under spatial inversion, ED SHG strictly vanishes in centrosymmetric materials, making it a powerful probe for broken inversion symmetry.</>,
  },
  {
    title: 'Magnetic Dipole (MD)',
    description: <>A higher-order axial 3rd-rank tensor. Unlike ED, MD contributions do not necessarily vanish in centrosymmetric point groups, provided time-reversal symmetry is broken (e.g., in antiferromagnetic states).</>,
  },
  {
    title: 'Electric Quadrupole (EQ)',
    description: <>A higher-order polar 4th-rank tensor (<InlineMath math="\chi^{(2)}_{ijkl}" />). Because it is an even-rank tensor, EQ SHG survives inversion symmetry and can generate bulk SHG signals even in centrosymmetric crystals.</>,
  },
];

const REFERENCES: { href: string; title: string; description: string }[] = [
  {
    href: 'https://doi.org/10.1107/97809553602060000114',
    title: 'International Tables for Crystallography',
    description: 'Volume A: Space-group symmetry. General crystal symmetry aspects and point group definitions.',
  },
  {
    href: 'https://ethz.ch/content/dam/ethz/special-interest/matl/multi-ferroic-materials-dam/documents/education/Nonlinear%20Optics%20on%20Ferroic%20Materials/Birss%20Symmetry%20&%20Magnetism%20komplett.pdf',
    title: 'Symmetry and Magnetism',
    description: 'Birss, R. R. (1966). Comprehensive derivation of magnetic point groups and tensor properties.',
  },
  {
    href: 'https://archive.org/details/yu.-i.-sirotin-m.-p.-shaskolskaya-fundamentals-of-crystal-physics-mir-1982',
    title: 'Fundamentals of Crystal Physics',
    description: "Sirotin, Yu. I. & Shaskol'skaya, M. P. (1982). Standard reference tables for tensor properties of crystals under point-group symmetry.",
  },
  {
    href: 'https://www.sciencedirect.com/book/9780123694706/nonlinear-optics',
    title: 'Nonlinear Optics',
    description: 'Boyd, R. W. (2008). 3rd ed. Appendix tables of nonvanishing d-tensor components by point-group symmetry.',
  },
  {
    href: 'https://doi.org/10.1103/PhysRev.130.919',
    title: 'Nonlinear Optical Properties of Solids',
    description: 'Pershan, P. S. (1963). Nonlinear optical multipole contributions.',
  },
  {
    href: 'https://doi.org/10.1007/s003400050650',
    title: 'Nonlinear spectroscopy of antiferromagnetics',
    description: 'Fröhlich, D., et al. (1999). Source term calculation.',
  },
  {
    href: 'https://doi.org/10.1070/PU1966v009n02ABEH002879',
    title: 'Macroscopic Symmetry and Properties of Crystals',
    description: 'V. A. Koptsik (1966). Shubnikov groups and their physical applications.',
  },
  {
    href: 'https://www.cryst.ehu.es/',
    title: 'Bilbao Crystallographic Server',
    description: 'Online tools for crystallography, magnetic symmetry, and group theory.',
  },
];

export function HelpPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-24">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-4xl font-serif italic">Help & Documentation</h1>
        <p className="text-sm opacity-60 leading-relaxed max-w-2xl">
          An overview of the features, conventions, and physical background used in the Tensor Calculator.
        </p>
      </div>

      {/* Feature Overview */}
      <section className="space-y-6">
        <h2 className="text-2xl font-serif italic border-b border-ink pb-2">Feature Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="p-6 border border-ink border-opacity-10 space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest">
                <feature.icon className="w-4 h-4" />
                {feature.title}
              </div>
              <p className="text-sm opacity-70 leading-relaxed">
                {feature.description}
              </p>
              {feature.extra}
            </div>
          ))}
        </div>
      </section>

      {/* Conventions & Notations */}
      <section className="space-y-6">
        <h2 className="text-2xl font-serif italic border-b border-ink pb-2">Notations & Conventions</h2>
        
        <div className="space-y-8">
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
              <Compass className="w-4 h-4" />
              Coordinate Systems
            </h3>
            <p className="text-sm opacity-70 leading-relaxed">
              The calculator uses the standard Cartesian coordinate system (x, y, z) for tensor components. The orientation of these axes relative to the crystallographic axes (a, b, c) depends on the crystal system:
            </p>
            <ul className="text-sm opacity-70 list-disc list-inside space-y-2 ml-4">
              <li>
                <strong>Triclinic:</strong> <InlineMath math="z \parallel c" />, <InlineMath math="y \parallel (c \times a)" /> (∥ <InlineMath math="b^*" />), <InlineMath math="x = y \times z" /> (projection of <InlineMath math="a" /> onto the plane ⊥ <InlineMath math="c" />).
              </li>
              <li>
                <strong>Monoclinic:</strong> <InlineMath math="z \parallel c" /> (unique axis: ∥ 2-fold or ⊥ mirror), <InlineMath math="x \parallel a" />, <InlineMath math="y \parallel b^*" />.
              </li>
              <li><strong>Orthorhombic, Tetragonal, Cubic:</strong> <InlineMath math="x \parallel [100]" />, <InlineMath math="y \parallel [010]" />, <InlineMath math="z \parallel [001]" />.</li>
              <li>
                <strong>Trigonal & Hexagonal:</strong> The Cartesian axes are orthogonal, while the crystallographic axes (<InlineMath math="a_1, a_2" />) are separated by 120°.
                <ul className="list-[circle] list-inside ml-6 mt-2 space-y-1">
                  <li><InlineMath math="z \parallel [001]" /> / <InlineMath math="[0001]" /> (c-axis)</li>
                  <li><InlineMath math="x \parallel [100]" /> / <InlineMath math="[2\bar{1}\bar{1}0]" /> (a-axis)</li>
                  <li><InlineMath math="y \parallel [120]" /> / <InlineMath math="[01\bar{1}0]" /> (orthogonal to x)</li>
                </ul>
              </li>
            </ul>
            <p className="text-sm opacity-70 leading-relaxed mt-4">
              The triclinic and monoclinic conventions follow the standard crystal-physics prescription (Hausühl 1983, based on IRE 1949): <InlineMath math="Z \parallel c" />, <InlineMath math="Y \parallel (c \times a)" />, <InlineMath math="X = Y \times Z" />. The set of independent and zero tensor components does <strong>not</strong> depend on this choice, but the numeric component values — and therefore the orientation of simulated polarimetry patterns — <strong>do</strong>.
            </p>
            <p className="text-sm opacity-70 leading-relaxed mt-2">
              <strong>Why there is no monoclinic-angle control:</strong> The angle <InlineMath math="\beta" /> does not enter the symmetry calculation directly. A crystal with a different <InlineMath math="\beta" /> is a different material with different tensor values, so it is represented by adjusting the relevant in-plane component values — not by a separate geometric control. Linear-optical effects such as birefringence, which do depend on <InlineMath math="\beta" />, are outside the scope of this symmetry calculator.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
              <Info className="w-4 h-4" />
              Symmetry Operations
            </h3>
            <p className="text-sm opacity-70 leading-relaxed">
              Symmetry operations are denoted using standard Hermann-Mauguin notation. An overbar (e.g., <InlineMath math="\bar{1}, \bar{4}" />) indicates a roto-inversion axis. A prime (e.g., <InlineMath math="2', m'" />) indicates an operation combined with time-reversal (anti-symmetry).
            </p>
          </div>
        </div>
      </section>

      {/* Physics Background */}
      <section className="space-y-6">
        <h2 className="text-2xl font-serif italic border-b border-ink pb-2">Physics & Group Theory</h2>
        
        <div className="space-y-6">
          <div className="p-6 bg-ink/5 border border-ink border-opacity-10 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest">Neumann's Principle</h3>
            <p className="text-sm opacity-70 leading-relaxed">
              The fundamental principle underlying this calculator is Neumann's Principle, which states that the symmetry elements of any physical property of a crystal must include the symmetry elements of the point group of the crystal.
            </p>
            <p className="text-sm opacity-70 leading-relaxed">
              Mathematically, if a crystal has a symmetry operation represented by a transformation matrix <InlineMath math="R" />, a property tensor <InlineMath math="T" /> must be invariant under this transformation:
            </p>
            <div className="text-center overflow-x-auto py-2">
              <BlockMath math="T_{ijk\dots} = R_{ia} R_{jb} R_{kc} \dots T_{abc\dots}" />
            </div>
            <p className="text-sm opacity-70 leading-relaxed">
              By applying this equation for all symmetry operations in a point group, we obtain a system of linear equations that constrains the tensor components, forcing some to be zero and others to be equal or related by signs.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest">Tensor Types</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {TENSOR_TYPES.map((tensorType) => (
                <div key={tensorType.title} className="p-4 border border-ink border-opacity-10 space-y-2">
                  <h4 className="font-medium">{tensorType.title}</h4>
                  <p className="text-xs opacity-70 leading-relaxed">
                    {tensorType.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-ink border-opacity-10">
            <h3 className="text-sm font-bold uppercase tracking-widest">Nonlinear Optics & SHG</h3>
            <p className="text-sm opacity-70 leading-relaxed">
              <strong>Second Harmonic Generation (SHG)</strong> is a nonlinear optical process where two photons of frequency <InlineMath math="\omega" /> interact within a material to generate a single photon at twice the frequency (<InlineMath math="2\omega" />). The calculator focuses on three multipole contributions to this process:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {SHG_MULTIPOLES.map((multipole) => (
                <div key={multipole.title} className="p-4 border border-ink border-opacity-10 space-y-2">
                  <h4 className="font-medium">{multipole.title}</h4>
                  <p className="text-xs opacity-70 leading-relaxed">
                    {multipole.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 bg-ink/5 border border-ink border-opacity-10 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest">Source Terms & Transverse Fields</h3>
            <p className="text-sm opacity-70 leading-relaxed">
              The incident light field induces multipole moments in the material. These induced moments act as the <strong>source terms</strong> (<InlineMath math="S_i" />) that radiate the SHG signal. The effective nonlinear source term (or effective polarization) is a combination of these different multipole contributions:
            </p>
            <div className="space-y-3 pl-4 border-l-2 border-ink border-opacity-20 my-4">
              <p className="text-sm opacity-70 leading-relaxed">
                <strong>Electric Dipole:</strong> Contributes directly (linearly) to the source term.<br/>
                <span className="inline-block mt-1"><InlineMath math="S_i^{\text{ED}} \propto P_i" /></span>
              </p>
              <p className="text-sm opacity-70 leading-relaxed">
                <strong>Magnetic Dipole:</strong> Contributes via the curl (rotation) of the induced magnetization.<br/>
                <span className="inline-block mt-1"><InlineMath math="S_i^{\text{MD}} \propto (\nabla \times \vec{M})_i" /></span>
              </p>
              <p className="text-sm opacity-70 leading-relaxed">
                <strong>Electric Quadrupole:</strong> Contributes via the divergence (spatial gradient) of the quadrupole tensor.<br/>
                <span className="inline-block mt-1"><InlineMath math="S_i^{\text{EQ}} \propto -\nabla_j Q_{ij}" /></span>
              </p>
            </div>
            <p className="text-sm opacity-70 leading-relaxed">
              The calculator displays how the incoming electric field components (<InlineMath math="E_j, E_k" />) couple through the non-zero tensor components to generate these induced source terms.
            </p>
            <p className="text-sm opacity-70 leading-relaxed">
              <strong>Longitudinal vs. Transverse:</strong> For light propagating along the Z-axis in the laboratory frame, the incoming electric field is purely <strong>transverse</strong> (<InlineMath math="E_X, E_Y \neq 0" />, <InlineMath math="E_Z = 0" />). The material may generate an induced polarization with a <strong>longitudinal</strong> component (<InlineMath math="S_Z \neq 0" />). However, an oscillating dipole does not radiate along its axis of oscillation. Therefore, only the transverse source components (<InlineMath math="S_X, S_Y" />) will emit SHG light in the forward (Z) direction.
            </p>
          </div>
        </div>
      </section>

      {/* Simulation Feature */}
      <section className="space-y-6">
        <h2 className="text-2xl font-serif italic border-b border-ink pb-2">Simulation Feature</h2>
        
        <div className="space-y-6">
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
              <Zap className="w-4 h-4" />
              How to use it?
            </h3>
            <ol className="text-sm opacity-70 list-decimal list-inside space-y-2 ml-4">
              <li>Select the point group, tensor type, and time-reversal symmetry from the main controls.</li>
              <li>Adjust the crystal orientation angles (<InlineMath math="\theta_X, \theta_Y" />) to set the incidence angle of the light.</li>
              <li>The simulator automatically isolates the independent tensor components (<InlineMath math="\chi_{ijk\dots}" />) that contribute to the transverse source terms (<InlineMath math="S_X, S_Y" />).</li>
              <li>Adjust the relative amplitude and phase of each independent tensor component using the sliders.</li>
              <li>Switch between the <strong>Anisotropy</strong>, <strong>Polarizer</strong>, and <strong>Analyzer</strong> tabs to observe the resulting SHG intensity polarimetry patterns in the radar charts.</li>
            </ol>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
              <Compass className="w-4 h-4" />
              Physics behind it
            </h3>
            <p className="text-sm opacity-70 leading-relaxed">
              In a typical SHG polarimetry experiment, linearly polarized light is incident on the crystal. The polarization of the incident light (polarizer) and the detected SHG light (analyzer) are rotated to probe the symmetry of the nonlinear susceptibility tensor. The simulator provides three distinct views:
            </p>
            <ul className="text-sm opacity-70 list-disc list-inside space-y-2 ml-4">
              <li><strong>Anisotropy:</strong> The radar charts display the SHG intensity as the <strong>polarizer angle</strong> is rotated from <InlineMath math="0^\circ" /> to <InlineMath math="360^\circ" />.
                <ul className="list-[circle] list-inside ml-6 mt-1 space-y-1">
                  <li><strong>Parallel Configuration:</strong> The polarizer and analyzer are aligned and rotate together.</li>
                  <li><strong>Crossed Configuration:</strong> The polarizer and analyzer are orthogonal (the analyzer is at <InlineMath math="+90^\circ" /> relative to the polarizer).</li>
                </ul>
              </li>
              <li><strong>Polarizer:</strong> The analyzer is fixed at <InlineMath math="0^\circ" /> or <InlineMath math="90^\circ" />, and the intensity is plotted as a function of the <strong>polarizer angle</strong>.</li>
              <li><strong>Analyzer:</strong> The polarizer is fixed at <InlineMath math="0^\circ" /> or <InlineMath math="90^\circ" />, and the intensity is plotted as a function of the <strong>analyzer angle</strong>.</li>
            </ul>
          </div>

          <div className="p-6 bg-ink/5 border border-ink border-opacity-10 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest">A bit of mathematics: Calculating intensity</h3>
            <p className="text-sm opacity-70 leading-relaxed">
              Let <InlineMath math="\theta" /> be the polarizer angle. The incident electric field <InlineMath math="\vec{E}^\omega" /> induces nonlinear source terms <InlineMath math="S_X" /> and <InlineMath math="S_Y" /> in the material. The measured intensity is proportional to the square of the projected source term along the analyzer direction.
            </p>
            
            <div className="space-y-4 mt-4">
              <div>
                <h4 className="font-medium text-sm">Parallel Configuration</h4>
                <p className="text-sm opacity-70 leading-relaxed mt-1">
                  The analyzer is at the same angle <InlineMath math="\theta" />. The incident field components are:
                </p>
                <div className="text-center overflow-x-auto py-2">
                  <BlockMath math="E_X = E_0 \cos(\theta), \quad E_Y = E_0 \sin(\theta)" />
                </div>
                <p className="text-sm opacity-70 leading-relaxed">
                  The detected SHG electric field is the projection of the source terms onto the analyzer:
                </p>
                <div className="text-center overflow-x-auto py-2">
                  <BlockMath math="E_{\parallel}^{2\omega} = S_X \cos(\theta) + S_Y \sin(\theta)" />
                </div>
                <p className="text-sm opacity-70 leading-relaxed">
                  The measured intensity is <InlineMath math="I_{\parallel} \propto |E_{\parallel}^{2\omega}|^2" />.
                </p>
              </div>

              <div className="pt-4 border-t border-ink border-opacity-10">
                <h4 className="font-medium text-sm">Crossed Configuration</h4>
                <p className="text-sm opacity-70 leading-relaxed mt-1">
                  The analyzer is at <InlineMath math="\theta + 90^\circ" />. The incident field components are:
                </p>
                <div className="text-center overflow-x-auto py-2">
                  <BlockMath math="E_X = E_0 \cos(\theta), \quad E_Y = E_0 \sin(\theta)" />
                </div>
                <p className="text-sm opacity-70 leading-relaxed">
                  The analyzer is at <InlineMath math="\theta + 90^\circ" />, so the detected SHG electric field is:
                </p>
                <div className="text-center overflow-x-auto py-2">
                  <BlockMath math="E_{\perp}^{2\omega} = S_X \cos(\theta + 90^\circ) + S_Y \sin(\theta + 90^\circ) = -S_X \sin(\theta) + S_Y \cos(\theta)" />
                </div>
                <p className="text-sm opacity-70 leading-relaxed">
                  The measured intensity is <InlineMath math="I_{\perp} \propto |E_{\perp}^{2\omega}|^2" />.
                </p>
              </div>
              <div className="pt-4 border-t border-ink border-opacity-10">
                <h4 className="font-medium text-sm">Formula Simplification</h4>
                <p className="text-sm opacity-70 leading-relaxed mt-1">
                  The expanded intensity formulas displayed in the simulator are mathematically simplified using power reduction and multiple-angle trigonometric identities (e.g., <InlineMath math="\sin^2\theta = \frac{1}{2}(1 - \cos 2\theta)" /> and <InlineMath math="\cos^3\theta = \frac{1}{4}(3\cos\theta + \cos 3\theta)" />).
                </p>
                <p className="text-sm opacity-70 leading-relaxed mt-2">
                  This converts the trigonometric polynomials into a harmonic Fourier series representation, making the rotational symmetries of the crystal lattice (like 2-fold, 3-fold, or 4-fold symmetry) immediately obvious. A smart grouping algorithm automatically selects the most elegant representation (power vs. harmonic) to minimize the number of terms, and unnecessary minus signs are factored out of the absolute value expressions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Deeper Topics */}
      <section className="space-y-6">
        <h2 className="text-2xl font-serif italic border-b border-ink pb-2">Deeper Topics</h2>

        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest">i-type vs. c-type Tensors</h3>
            <p className="text-sm opacity-70 leading-relaxed">
              Every magnetic point group <InlineMath math="G" /> can be written as <InlineMath math="G = H + \theta(G - H)" />, where <InlineMath math="H" /> is the halving subgroup of elements that do not include time reversal, and <InlineMath math="\theta" /> is the time-reversal operator.
            </p>
            <p className="text-sm opacity-70 leading-relaxed">
              <strong>i-type (time-even):</strong> The tensor is invariant under <em>all</em> operations of <InlineMath math="G" />, including the time-reversed ones. Physically, i-type tensors describe properties that do not depend on the magnetic order — they survive even when the material is demagnetized. Example: the crystal structure contribution to SHG.
            </p>
            <p className="text-sm opacity-70 leading-relaxed">
              <strong>c-type (time-odd):</strong> The tensor is invariant under <InlineMath math="H" /> but changes sign under the time-reversed operations. Physically, c-type tensors describe properties that reverse with the magnetic order. Example: the magnetization-induced SHG contribution that flips sign when the sample is demagnetized or the magnetic domains are reversed. For grey groups (<InlineMath math="G = H \times \{'{'}1, 1'{'\}'}" />), the c-type tensor is identically zero.
            </p>
          </div>

          <div className="space-y-4 pt-4 border-t border-ink border-opacity-10">
            <h3 className="text-sm font-bold uppercase tracking-widest">Crystal Rotation (Lab Frame)</h3>
            <p className="text-sm opacity-70 leading-relaxed">
              The crystal orientation in the lab frame is controlled by a preset plus three continuous rotation angles:
            </p>
            <div className="space-y-3 pl-4 border-l-2 border-ink border-opacity-20 my-4">
              <p className="text-sm opacity-70 leading-relaxed">
                <strong>Preset (<InlineMath math="k \parallel [hkl]" />):</strong> Selects which crystal direction is aligned with the beam axis (lab Z). Defines <InlineMath math="R_{\text{preset}}" />.
              </p>
              <p className="text-sm opacity-70 leading-relaxed">
                <strong><InlineMath math="\varphi_x, \varphi_y" /> (tilt):</strong> Tilt the crystal surface away from normal incidence, rotating about the lab X and Y axes. Range: ±90°.
              </p>
              <p className="text-sm opacity-70 leading-relaxed">
                <strong><InlineMath math="\psi" /> (azimuth):</strong> Rotate the crystal about the beam axis (lab Z). This is the in-plane rotation that sweeps the crystallographic directions through the polarizer plane. Range: ±180°.
              </p>
            </div>
            <p className="text-sm opacity-70 leading-relaxed">
              The full rotation matrix is <InlineMath math="R = R_z(\psi) \cdot R_y(\varphi_y) \cdot R_x(\varphi_x) \cdot R_{\text{preset}}" />. At <InlineMath math="\varphi_x = \varphi_y = \psi = 0" />, the result is purely the preset alignment. The Source Terms tab shows symbolic formulas as trigonometric polynomials in these angles.
            </p>
          </div>

          <div className="space-y-4 pt-4 border-t border-ink border-opacity-10">
            <h3 className="text-sm font-bold uppercase tracking-widest">Alternate Settings</h3>
            <p className="text-sm opacity-70 leading-relaxed">
              Some magnetic point groups have multiple <strong>settings</strong> — distinct orientations of the symmetry elements relative to the crystal axes that produce different tensor forms. For example, <InlineMath math="6'mm'" /> and <InlineMath math="6'm'm" /> are two settings of the same abstract group, related by a 30° rotation that swaps which mirror family is primed.
            </p>
            <p className="text-sm opacity-70 leading-relaxed">
              The app implements all settings via the similarity transform <InlineMath math="G' = S \cdot G \cdot S^{-1}" /> applied to the base generators. A setting selector appears in the Calculator when a group has multiple settings. The three mechanisms are:
            </p>
            <div className="space-y-3 pl-4 border-l-2 border-ink border-opacity-20 my-4">
              <p className="text-sm opacity-70 leading-relaxed">
                <strong>Mechanism A:</strong> Classical setting ambiguity inherited from the spatial group (e.g., tetragonal <InlineMath math="\bar{4}2m" /> vs. <InlineMath math="\bar{4}m2" />).
              </p>
              <p className="text-sm opacity-70 leading-relaxed">
                <strong>Mechanism B:</strong> Time-reversal-broken equivalence — the two mirror/rotation families carry identical spatial operations but different primings.
              </p>
              <p className="text-sm opacity-70 leading-relaxed">
                <strong>Axis orientation:</strong> Orthorhombic groups allow c/a/b-unique axis choices; monoclinic groups allow z-unique (Birss) or b-unique (ITC) conventions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* References */}
      <section className="space-y-6">
        <h2 className="text-2xl font-serif italic border-b border-ink pb-2 flex items-center gap-3">
          <BookOpen className="w-6 h-6" />
          References
        </h2>
        <ul className="text-sm opacity-70 space-y-4 list-none">
          {REFERENCES.map((reference) => (
            <li key={reference.href} className="p-4 border border-ink border-opacity-10 hover:bg-ink/5 transition-colors">
              <a href={reference.href} target="_blank" rel="noreferrer" className="block space-y-1">
                <span className="font-medium underline">{reference.title}</span>
                <span className="block opacity-80 text-xs">{reference.description}</span>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
