# Changelog

> **Content:** Per-release record of user-facing changes, including corrections to calculated output.
> **Status:** living
> **Authority:** authoritative for release history. Correction entries state what was wrong and from which version it is fixed.

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed

- Explorer group popup: the **Shubnikov symbol of six black-and-white groups** was wrong in every
  version from v0.18.0, where the popup first showed it. In each the mark for time reversal sat on
  the wrong element, was superfluous or was missing: `4/mm'm'` is `m'.4:m` (shown `m.4:m'`),
  `4/m'mm` is `m.4:m'` (shown `m'.4:m`), `4'/m'm'm` is `m.4':m'` (shown `m'.4':m'`), `6'/m'mm'` is
  `m.6':m'` (shown `m'.6':m'`), `m'-3'm'` is `-6'/4` (shown `-6'/4'`), and `m'-3'm` is `-6'/4'`
  (shown `-6'/4`). The symbols now agree with the print (Birss, Table 6, pp. 94, 96, 98) and with
  ITC Vol. D, Table 1.5.2.3. Display only: no operator, generator or tensor form depends on a
  Shubnikov symbol, so no calculated output changes.
- Reference tables (`birss-tables/`): Table 6 carries the same corrections with a dated note, and
  in addition the Shubnikov symbol of the classical subgroup of `m'3m` (`3/-4`, was `3/4`). The
  LaTeX source and the PDF now have the book's generators σ(2), σ(5), σ(6) for `6'/mm'm`, which the
  Markdown table has had since v0.14.1, and the PDF includes the five Table 4f corrections of
  2026-07-09. A sixth misprint of the book is documented: Table 6 prints the last operator of
  `4/m'mm` as a fourfold rotation with time reversal where it is the rotoinversion `-4'_z`, which
  the table already had.

## [0.25.0] - 2026-08-03

### Added

- Simulator: a live **sample-orientation view** beside the crystal-rotation sliders (desktop, where
  crystal rotation lives). A fixed axonometric scene shows the sample as a flat plate standing face
  on to the beam at zero rotation, its thickness running off along the beam direction, turning in
  real time as the sliders move and carrying the crystal axes x, y, z from one corner of the plate;
  beside it stands a lab frame X, Y, Z that never moves, with Z marked as the beam direction and Y
  as the vertical. Lower-case axes are the crystal's, upper-case
  the lab's — the same case convention the rest of the app uses — and the crystal-axes equation box
  just above doubles as the legend: at zero rotation the picture and that box say the same thing.
  Switching the crystal cut re-maps the axes inside the plate (and can move the corner they hang
  from); rotating never does. The scene is a picture of the same rotation the Simulator computes
  with, not a separate model of it, and is described for screen readers by the current cut and the
  three angles.

## [0.24.0] - 2026-08-01

### Added

- Group identity header: the point group's **admitted properties** now appear as badges — polar,
  chiral, ferromagnetic, magnetoelectric — on the Calculator, Simulator and Tables pages. Each
  badge says what the symmetry permits, not what a material does, and its info affordance cites the
  reference the flag is checked against. Only admitted properties are shown, so the header stays
  quiet for a group that admits none. The Explorer's operations modal continues to show the fuller
  five-property matrix including the absent ones.
- Tables: a **dot-diagram view** of the reduced tensor form, toggled beside the symbolic one
  (rank 2, both rank-3 compressed layouts — `i(jk)` as the classical 3×6 scheme and `(ij)k` as
  its 6×3 transpose — and the two rank-4 Voigt classes). It uses the Nye scheme's glyph
  vocabulary — small dot for a vanishing component, heavy dot for an independent one, open
  circle for a partner of equal magnitude and opposite sign, cross for a component fixed by a
  relation between classes — with a class index on every surviving component, and the class
  chain shown on hover, tap or keyboard focus. The choice of view persists for the session.

### Fixed

- Tables: the dot diagram now behaves as a single keyboard widget. Every one of its component
  cells used to be its own tab stop, so tabbing past the diagram took one press per surviving
  component — 18 for a fourth-rank trigonal form. It now holds one tab stop, entered and left with
  a single Tab, with the arrow keys moving between components inside it as before; returning by
  Tab lands on the component you left.

### Changed

- Tables: the book-misprint footnote on the Birss Table-7 lookup chain now offers the same
  "Learn more" link into Help > Deeper Topics from the expandable diagram as it already did
  from the breadcrumb above it. The two views show the same warning, so they now offer the
  same way to read up on it.

## [0.23.1] - 2026-07-30

### Fixed

- **Scientific correction (EQ):** the electric-quadrupole channel now enforces the
  quadrupole's own index symmetry `Q_ij = Q_ji` (Pershan 1963; Hoshi 1995) in addition
  to the SHG field-pair symmetry `E_k E_l = E_l E_k`. All versions up to and including
  **v0.23.0 overcounted EQ tensor components** -- 54 instead of 36 for triclinic groups,
  28 instead of 20 for `2/m`, 15 instead of 12 for `mm2`, 8 instead of 7 for `4mm`, 7
  instead of 6 for `6/mmm`, 10 instead of 8 for `3m` and `-3m`, and 6 instead of 3 for
  the `4/mm'm'` c-type tensor (cubic groups such as `m-3m` are unaffected: their axis
  permutations already imply the relations). The spurious components were antisymmetric
  in `(ij)` -- physically magnetic-dipole-type admixture, which the app's separate MD
  channel already represents. EQ component lists (Calculator), induced-quadrupole panels
  and EQ source terms (Simulator) computed with an earlier version include those
  spurious terms and should be recomputed. Tracelessness (`Q_ii = 0`) is deliberately
  **not** enforced -- the app keeps the 36-component SHG baseline (maintainer decision,
  2026-07-29). ED and MD output is unchanged, bit for bit.
- Simulator: the induced-quadrupole panel labels render both indices as subscripts
  (`Q_{xy}` rather than a subscripted first index only).
- **Scientific correction (rank-4 forms of the trigonal and hexagonal groups).** For
  point groups with a 3- or 6-fold axis, the in-plane block of a fourth-rank tensor
  couples several independent components through one relation that Birss prints as a
  sum (Table 4f row L4: `xxxx = yyxx + xyyx + yxyx`). The projector returned a
  redundant family list for exactly these cells, and two things downstream were wrong
  in all versions up to and including **v0.23.0**:
  - **Simulator, EQ source terms and polarimetry (quantitatively wrong):** each tensor
    component was attributed to a single independent parameter times a fixed ratio,
    which is only valid when components are locked in proportion. In the coupled
    in-plane blocks it is not, and the tensor the sliders actually built was **not
    invariant** under the group's own 3-/6-fold rotation (it violated
    `χ_xxxx = χ_xxyy + χ_xyxy + χ_xyyx`). EQ polarimetry computed for a trigonal or
    hexagonal group with an earlier version should be recomputed. Components now show
    as genuine sums over the parameters they depend on, e.g.
    `Q_xx = (χ_xxxx + ½χ_xxyy)E_x² + …`, and there is one slider per independent
    parameter.
  - **Calculator and Tables component relations (misleading display):** the affected
    forms listed overlapping relation chains that contradicted one another as
    simultaneous equations — for `3m` at rank 4 they implied `χ_xxxx = 0` while the
    same panel counted that component as non-vanishing. The relation list is now a
    consistent constraint set: one chain per group of proportional components, plus
    any residual composite relation in Birss's printed form on its own line.
  Independent-component **counts were always correct** and are unchanged, as are all
  ED and MD outputs (bit for bit) and every non-trigonal/hexagonal rank-4 form. The
  elasticity and photoelasticity forms in the Tables page are affected in the same way
  and equally corrected. Details:
  `docs/findings/FINDING-2026-07-29-rank4-trigonal-hexagonal-overcount.md`.

## [0.23.0] - 2026-07-17

### Changed

- Accessibility: the ARIA tab widgets (Help sections, Simulator polarimetry
  configuration) now implement the full keyboard pattern -- roving tabindex plus
  ArrowLeft/ArrowRight (wrapping) and Home/End moving and activating tabs; the five
  numeric text inputs next to the sliders regain a visible focus outline (the
  `focus:outline-none` suppression is removed); the sliders' existing keyboard
  contract (native fine steps, Shift+Arrow coarse steps) is now pinned by
  interaction tests.
- Accessibility (A2 walkthrough): the crystal-cut legend toggle gets a robust
  accessible name and toggle state (`aria-label` + `aria-pressed`; previously
  title-only), the mobile slider layout gains the same Shift+Arrow coarse-step
  handlers as the desktop layout, and the view switcher becomes a `<nav
  aria-label="Main">` landmark.

### Fixed

- Simulator sliders: repeated Shift+Arrow coarse steps no longer accumulate
  floating-point noise -- the keyboard path now snaps its result through the same
  detent logic (`snapValue`) as dragging, so every coarse step lands exactly on the
  0.05 / 15-degree grid.

## [0.22.0] - 2026-07-16

### Changed

- Performance: the Tables page no longer freezes when selecting a rank-4 tensor or opening the
  "Groups sharing this form" list. The symmetry-form projector was rewritten with an allocation-free
  flat-array hot path (identical results), cutting a cold rank-4 form from ~256 ms to ~14 ms and the
  122-group signature sweep from ~19.5 s to ~0.7 s; and the "sharing this form" partition is now
  precomputed at build time (`npm run sharingdata`) so opening the list is an O(1) lookup instead of
  a main-thread sweep. No change to any computed tensor form. Overall test-suite runtime is down as
  well (~66 s to ~60 s).
- Accessibility: the tab widgets (Help sections, Simulator polarimetry configuration) now expose
  `role="tablist"/"tab"/"tabpanel"` with `aria-selected` and
  `aria-controls`/`aria-labelledby`; the main navigation marks the active view with
  `aria-current="page"`; and the Simulator's amplitude/phase/angle sliders and number inputs carry
  `aria-label`s. Declarative only (no keyboard-navigation change); purely additive ARIA attributes,
  rendered output otherwise unchanged (E24).

## [0.21.0] - 2026-07-11

### Added

- Tables page: the index-symmetry selector now offers the first-pair symmetry `(ij)k` at rank 3 and a
  pairs-only `(ij)(kl)` symmetry at rank 4 (the photoelastic / electrostriction case) alongside full
  `(ij)(kl) sym` Voigt symmetry. Forms with a compressible index pair render as a Voigt-compressed
  matrix -- 6x3 for rank-3 `(ij)k`, 6x6 for the rank-4 pair symmetries (header order XX YY ZZ YZ ZX
  XY) -- with genuine sums shown correctly (e.g. the hexagonal c66 = (c11 - c12)/2).
- Tables page: the "Groups sharing this form" list is grouped by point-group type -- colourless
  (Type I), grey (Type II), black-white (Type III).
- Explorer group popup: a "Polar directions" block -- the polar (symmetry) axes and nonpolar
  direction sets for the group (ITC Vol. D Table 3.2.2.2), each nonpolar set labelled by its ITC
  2.1.3.1 symmetry-direction class. Centrosymmetric groups show "no polar directions"; magnetic
  groups reuse their unprimed spatial skeleton's directions (with a note that primes act spatially).
  The three 30 deg-divergent trigonal classes (32, 3m, -6m2) and their derivatives carry a Birss
  -frame note, and the 622 print omission in Table 3.2.2.2 is corrected (the [uv0] set restored, with
  a footnote). The row choice is machine-verified against the app's own operators.
- Explorer group popup: the lattice info now shows the crystal system's cell-parameter restrictions,
  free ("to be determined") parameters, and Bravais lattice symbols (ITC Vol. A Table 2.1.1.1), with
  monoclinic c-unique and trigonal family-vs-system notes.
- Vendored ITC reference tables 2.1.1.1 and 2.1.3.1 under `docs/references/` (alongside 3.2.2.1 /
  3.2.2.2 from the previous change), with drift + operator-consistency guards on the derived data.

- Help: a new "Tables" tab documents the Tables page end to end -- the two lookup modes and the four
  result blocks, how to choose a tensor (rank, spatial/time parity and index symmetry, via the parity
  product rule) with the effect catalogue, the classical two-step Table-4a chain (with a worked
  quartz example), and the magnetic c-tensor Table-7 route (recipe, cross-formula, three worked
  examples). Two new Deeper Topics entries -- "Voigt symmetry and Voigt notation" and "Table 7:
  reading the letter columns directly".
- Tables page: a collapsible lookup-chain diagram under the breadcrumb -- a monochrome picture of the
  route (the A/B fork, the Table-4a row read with the parity crossover marked, the rotated-setting
  badge, and the final rank-table row); it also illustrates the three worked examples in the Help
  Tables tab. Tooltips on every selector, effect chip, result block and lookup-chain segment.
- Tables page: the lookup-chain breadcrumb now renders the full Birss Table-7 chain for c-tensors of
  magnetic (Type III) groups instead of a "chain display planned" placeholder. It shows the c-column,
  the associated classical group A/B (with a rotated-setting badge when the source uses alternate
  axes), that source's reference axes, which Table-4a column is read (making the parity crossover
  explicit), the class letter, and the final rank-table row -- plus a footnote on the two documented
  Birss Table-7 misprints. Grey (Type II) c-tensors show that time reversal alone forbids the tensor.
- Testing: vendored four transcribed ITC reference tables (Vol. D 3.2.2.1 property counts and 3.2.2.2
  polar axes; Vol. A 2.1.3.1 symmetry directions and 2.1.1.1 crystal systems) under `docs/references/`,
  and an anti-circular guard holding `computeTensorForm` to ITC Table 3.2.2.1 -- the independent
  -component counts and property occurrence for the 21 noncentrosymmetric classical classes (rank-1
  pyroelectric, rank-3 piezoelectric/SHG, axial rank-2 optical activity), the 11 centrosymmetric Laue
  groups vanishing, the printed structural totals, the setting-mapped rank-1 polar-axis directions,
  and the enantiomorphism column. The vendored 3.2.2.2 records the print-confirmed 622 omission.

### Changed

- Tables page: the result section is titled "Tensor form"; the lookup-chain diagram's connectors
  follow the layout flow (right between side-by-side chips on desktop, down when stacked).
- Effect citations: the classical effects (pyroelectricity, permittivity, piezoelectricity,
  elasticity) now cite ITC Vol. D (with DOI) instead of Birss ch. 4 (the magnetic-properties
  chapter); the magnetic effects keep Birss ch. 4 and gain the ITC DOI.
- Tables page: the lookup mode toggle shows "By tensor type" (the core function) before "By effect".
- Testing: added a class-indexed Table-7 guard putting `computeTensorForm` under Birss's i-/c-tensor
  cross-formula at ranks 0/1/2/4 (Tables 4b/4c/4d/4f) for all 58 black-white groups, backed by a
  generated `table7Data.ts` (codegen from `table-7.md`, `npm run table7data`). This subsumes the
  planned "magnetic EQ rank-4 golden fixtures" backlog item at the symbol-class level (Table-4f
  even-rank c-tensors are now anchored for every class that appears in the black-white rows).
- Tooling (tech-debt Wave 1): added ESLint (flat config, `typescript-eslint` + `eslint-plugin-react-hooks`,
  hooks-deps / unused-vars as errors and the recommended sets as warnings) and Prettier, wired as
  `lint:eslint` + `format:check` CI steps; a one-time repo-wide Prettier reformat (no logic changes);
  switched CI/deploy to `npm ci` and exact-pinned the toolchain deps (`vite`, `vitest`, `vite-plugin-pwa`,
  `@types/react*`) to their lockfile versions; and added non-blocking V8 coverage
  (`@vitest/coverage-v8`, `npm run test:coverage`) with a recorded baseline (lines 86.72%, branches 74.45%).
- Docs: corrected the `SectionHeader` entry in `AGENTS.md` (actual home `notation.tsx`, classes
  `text-xs … text-ink/70`); renamed the misnamed `itcData.reference.test.ts` to
  `polarDirections.reference.test.ts`. The 2026-07-11 tech-debt audit's actionable items are now
  tracked as an `E#` series in `docs/planning/TODO-next.md`.

### Removed

- Dead `getFutureSettingCount` stub (backed by an always-empty `GROUPS_WITH_FUTURE_SETTINGS`, so it
  could only ever return `null`) and its two no-op render branches in the operations and group-identity
  headers. No user-visible change.

### Fixed

- Symbolic SHG source-term formulas for electric-quadrupole (EQ) tensors on the point groups with a
  3- or 6-fold axis (`3m`, `6mm`, `-6m2`, `-3'm`) were wrong at off-normal incidence (generic tilt /
  azimuth) — a few-percent error that vanished at normal incidence. The cause was a stale-snapshot bug
  in the `cos²+sin²=1` simplifier of the symbolic trig-polynomial algebra; the live numeric Simulator
  path and the displayed formulas at normal incidence were unaffected. Anyone who copied a symbolic EQ
  formula for one of these groups at a nonzero tilt/azimuth should regenerate it. Guarded by golden
  fixtures (independently confirmed from first principles) and an extended symbolic↔numeric agreement
  sweep at generic angles (backlog item E1).

## [0.20.0] - 2026-07-10

### Added

- Tables page "By effect" mode: pick a named physical effect (pyroelectricity, spontaneous
  magnetization, permittivity, the linear magnetoelectric effect, piezoelectricity, piezomagnetism,
  elasticity) to see its symmetry-reduced form with the effect's own symbol and defining equation.
  Allowed property chips in the Explorer popup now deep-link into the matching effect, and a
  collapsible "Groups sharing this form" list shows every group with the same frame-canonical form.

### Fixed

- Tables page: the lookup-chain breadcrumb no longer shows the classical Table-4a tail for magnetic
  c-tensors (where Birss's lookup runs via Table 7) -- it previously could contradict the displayed
  form.

## [0.19.0] - 2026-07-10

### Added

- New "Tables" page: interactive Birss-table lookup -- choose any tensor by rank (0-4), spatial
  parity and time parity (plus intrinsic index symmetry) and see its symmetry-reduced form for
  the selected group, with the Birss lookup chain (family class, reference axes, table row) and
  an "Open in Tables" button in the Explorer popup. Print-anchored via the Phase-1 engine.
  Help and README document the Tables page.

## [0.18.0] - 2026-07-09

### Added

- Explorer group popup: Shubnikov symbol (classical and black-and-white groups, from the
  print-verified Birss tables with anti-drift guard tests), group order, parent group with
  halving subgroup, per-setting labels with Birss/ITC standards, and the Birss reference-axis
  orientation of the group's classical family.
- Explorer group popup: full Hermann-Mauguin symbol for all groups and Shubnikov symbols for the
  grey groups, both sourced from the canonical `table-nomenclature.md` with entry-for-entry
  anti-drift guard tests.
- Explorer group popup: a Properties block (Laue class, chirality, and allowed/forbidden flags
  for polar/pyro-ferroelectric, piezoelectric, ferromagnetic, piezomagnetic and linear
  magnetoelectric behaviour), each flag anchored against printed references (ITC Tables 1.5.2.4,
  1.5.7.1, 1.5.8.1; classical property classes; Schmid 1994 counts).

### Fixed

- The symmetry-type box claimed "ED SHG allowed" for every non-centrosymmetric group; for the
  432 family the ED SHG tensor vanishes identically. The consequence is now derived from the
  computed tensor form (wrong text shipped in v0.16.0-v0.17.x).

- Explorer popup: info tooltips no longer get clipped (rendered through a portal -- applies
  app-wide to all info tooltips); wider layout with a two-column info grid; Full HM shown for
  every group; redundant pyro/ferroelectric footnote removed.

- Simulator: the "As functions of θ_pol" label no longer uppercases the math symbol.

### Changed

- Explorer popup: the settings row now lists the active convention's standard frame first and
  annotates frames as "standard frame in Birss/ITC" (clarifying that the annotation names the
  frame choice, not the symbol's notation); when both conventions share the standard frame the two
  annotations merge into "standard frame in Birss and ITC".

- Simulator's Mathematical Model box and the Help intensity derivation now use one notation
  (incident E^ω; intensities written directly as squared source-term projections, no detected
  E^2ω quantity) and link to each other; the Help derivation leads with the general intensity
  formula and drops redundant repetition.

- Help page reworked after a content review: settings and symbol-convention documentation moved
  to Notations & Conventions and crystal rotation to Simulation (Deeper Topics now holds only
  deep dives, with cross-references); added symmetry-operation notation (subscript/superscript),
  a components-and-phases box, the Haussuehl reference, and overview mentions of the convention
  toggle and system info panel; fixed a broken formula, stale rotation-angle symbols, the psi
  description, and the one-sided monoclinic frame description; unified Gray/grey and
  crystal-vs-lab axis casing.

## [0.17.0] - 2026-07-08

### Added

- Explorer: a per-crystal-system info panel (lattice conditions, defining symmetry, HM symbol
  positions, settings, Birss-vs-ITC notes, holohedry, example material), with the axis-orientation
  box integrated into it.

### Fixed

- Polarimetry tab tooltip title is no longer invisible when its tab is selected.
- Help: two glossary "Learn more" links now point at the tab that actually contains the topic;
  added missing Crystal Cut and Group Types sections; updated the Alternate Settings and Symbol
  Conventions sections to the current UI (global convention toggle, no badges, new setting-button
  labels). README rotation-control symbols corrected (phi_X/phi_Y/psi) and the global convention
  toggle documented.

- Corrected the triclinic/monoclinic component note (it said "monoclinic" even when a triclinic
  group was selected) and moved it below the component sliders instead of above. Polarimetry tab
  tooltips (Anisotropy/Polarizer/Analyzer) no longer render clipped behind the plot. The selected
  polarimetry tab now highlights its info icon together with the tab instead of leaving it light
  against the dark tab. Display-only.

- Crystal-rotation sliders/tooltip now label the lab-axis tilts as `φ_X` / `φ_Y` (previously
  `φ_x` / `φ_y`, which read as crystal axes even though the tilt is about the lab frame).
- Crystal-cut buttons now show every correct designation per direction (`[hkl]` and/or Cartesian
  x/y/z and/or crystallographic a/b/c), corrected for triclinic and monoclinic (setting-aware:
  c-unique vs b-unique) where the old `[hkl]` labels were wrong for a Cartesian axis that has no
  simple Miller-index expression. Labels and the `getPresetsForSystem` API only — no computed
  value (tensor, source term, cut direction) changes for a given input.
- Axis-box legend text now points to the AXIS ORIENTATION box (per crystal system and setting)
  instead of a single hard-coded convention.

## [0.16.0] - 2026-07-05

### Changed

- Route-level code splitting: the Help, Simulator, and Calculator pages are now lazy-loaded
  (`React.lazy`/`Suspense`), and vendor libraries (`react`/`react-dom`, `katex`/`react-katex`,
  `motion`) build into their own chunks. The single ~1,089 kB production bundle is now several
  chunks, each under Vite's 500 kB warning threshold, and vendor code can cache independently
  of app code across deploys.
- All group symbols, Schoenflies symbols, setting-button labels, and symmetry-operation lists now
  render through the LaTeX formatter (previously plain text in several places).
- Raised the minimum UI font size and the minimum secondary-text contrast app-wide (decorative
  elements unchanged).
- The Birss/ITC symbol convention is now a global mode (header toggle) instead of a per-group
  control. It relabels group names app-wide (Explorer, search, Calculator, Simulator) for the two
  groups whose standard symbol differs between conventions (`m'm'm`/`mm'm'`, `6'/mm'm`/`6'/mmm'`),
  opens groups on the active convention's standard frame, and persists across reloads. This
  supersedes the v0.15.0 "`m'm'm` badge-only, no relabel" decision.
- Setting buttons now show the frame's Hermann-Mauguin symbol (with an axis qualifier for
  monoclinic/orthorhombic); the previous "Default"/"standard" badges were removed — the selected
  setting is the standard. Orthorhombic frame symbols are now shown (verified, stored).
- The axis-convention explanations (trigonal/hexagonal HM position-2 rule; monoclinic c-/b-unique
  settings) moved from mode-only inline notes into an info tooltip on the AXIS ORIENTATION header,
  available for every crystal system in both conventions.
- Group info header reworked: the title now shows the group name (constant across settings, only
  convention-dependent) and the redundant cross-convention synonym was removed; the Crystal
  System / Symmetry Type / Axis Orientation boxes share a uniform title-on-top layout (Symmetry
  Type gains an icon and the ED-SHG consequence); the Crystal Setting selector moved into the
  info box for both Calculator and Simulator; minor alignment fixes; the info header is now shown
  on mobile in the Simulator too, so the setting selector is reachable there.
- Explorer: crystal-system tabs now span the full width; the group preview popup header matches the
  Calculator/Simulator info header (group name shown correctly per convention, synonym dropped,
  symmetry type and convention added).

### Fixed

- Grey (Type II) trigonal/hexagonal/tetragonal groups showed their alternate crystal-setting
  symbol without the `1'` grey suffix (e.g. `-31m` instead of `-31m1'` for `-3m1'`). Corrected for
  `-42m1'`, `321'`, `3m1'`, `-3m1'`, `-6m21'`. Display-only; no tensor output changes.
- PWA build config (`vite-plugin-pwa`'s `includeAssets`) referenced `favicon.ico`,
  `apple-touch-icon.png`, and `mask-icon.svg`, none of which exist in `public/`. Now lists
  the SVG icons that actually ship (`favicon.svg`, `icon-192.svg`, `icon-512.svg`), matching
  the manifest's own icon list.
- Section-header info tooltips (Symbol Convention, Crystal Setting) were rendered uppercase,
  over-tracked, and at 50% opacity because they were nested inside a dimmed section header; they
  are now legible, matching the other tooltips.
- The monoclinic AXIS ORIENTATION display now follows the active setting: it showed a fixed
  c-unique frame (z∥c) even in the ITC / b-unique setting, where the unique axis is b (y∥b,
  x∥a*). Corrected for both the Calculator/Simulator (selected setting) and the Explorer
  (convention's standard setting).

## [0.15.0] - 2026-07-04

### Added

- Added a Birss/ITC symbol-convention toggle: setting labels, standard badges, group-string
  synonyms (`6'/mm'm`/`6'/mmm'`), convention-aware axis display, and in-app explanations of the
  Birss↔ITC divergences. Display-only — no computed output changes.
- Added ITC Table 1.5.7.1 as an independent (non-Birss) verification anchor for the MD-c
  (piezomagnetic) tensor class: a transcribed reference table
  (`docs/references/ITC-table-1.5.7.1-piezomagnetic.md`), a cross-validation test over 71
  group/setting entries, and 15 literature-anchored golden fixtures. Shrinks the un-anchored
  `NO_ANCHOR` set to the two grey groups (`2/m1'`, `-3m1'`, which have no MD-c tensor).
  Verification only -- no computed output changes.

## [0.14.1] - 2026-07-04

### Fixed

- Corrected the generators of `6'/mm'm`: the default-setting frame was rotated 30° from Birss
  (generator σ(4) instead of the book's σ(2)); ED-c default now yyy-family per Birss Table 7
  (A = (-62m), c-polar-odd = (R_n)); setting 2 correspondingly now xxx-family. Anchored by a new
  VERIFIED golden fixture. All other tensors of this group re-checked (i-tensors and zero cells
  unaffected by the flip).

## [0.14.0] - 2026-07-02

### Added

- The complete transcribed Birss (1966) reference tables now ship in this repo under
  `birss-tables/` (merged from `manganite/birss-tables` with full history, PR #48), including the
  convention guide, the Birss–ITC comparison, the typeset PDF, and the 122-group nomenclature
  table.
- `birss-tables/tools/generate_nomenclature.py` + a CI step that regenerates
  `table-nomenclature.md` and fails on drift (PR #49).
- Audit guardrail tests: nomenclature & operator-set reference tests, grey-c≡0,
  particularization, and three hand-Birss end-to-end tests; coverage matrix in
  `docs/findings/AUDIT-convention-references.md`.

### Fixed

- Corrected the generators of six magnetic point groups, verified against Birss,
  *Symmetry and Magnetism* (1966) Table 6 (book-scan-verified operator column) via
  explicit matrix closure:
  - `6'/m'` and `6'/m` had each other's inversion time-reversal flag (unitary vs.
    primed `-1` swapped): selecting `6'/m'` incorrectly gave a non-zero ED `c`-tensor
    (should be `≡ 0`, since `6'/m'` contains the *unitary* inversion) and `6'/m`
    incorrectly gave `ED c = 0` (should be Birss Table 4e row O3, 2 independent
    components).
  - `m'-3'm'` and `m'-3'm` had each other's 4-fold generator (proper `4_z` vs.
    roto-inversion `-4_z` swapped): selecting `m'-3'm'` incorrectly gave a non-zero
    ED `c`-tensor (should be `≡ 0`, halving subgroup H = 432 forbids it) and
    `m'-3'm` incorrectly gave `ED c = 0` (should be the Td-type single-component
    form, Birss Table 4e row U3).
  - `4'/m'm'm`'s Default orientation was built in the σ/4-rotated frame
    (misoriented relative to its own `-42m` halving subgroup); the ED `c`-tensor's
    component labels were attached to the wrong axes in the Default setting.
  - `-4'm2'`'s Default orientation was likewise built in the σ/4-rotated frame:
    the ED `i`-tensor form previously (and wrongly) pinned to Setting 2 belongs to
    Default, and Setting 2 now carries the `-42m`-diagonal-mirror form instead
    (Default and Setting 2 swap).
  - All six wrong since v0.1.1. Anchored to `birss-tables` pass-5 book-scan
    corrections; `birss-tables/table-nomenclature.md` Table B regenerated
    accordingly.

## [0.13.1] - 2026-07-01

### Fixed

- Corrected two orthorhombic Type-III (black-and-white) magnetic point-group data
  errors, verified against Birss, *Symmetry and Magnetism* (1966) and cross-checked
  against ITC Vol. D Table 1.5.2.3:
  - `mmm'` and `m'm'm` had each other's generator/operator sets (unprimed vs.
    primed inversion swapped): selecting `mmm'` incorrectly gave `ED c = 0`
    (should be 7 independent components) and `m'm'm` incorrectly allowed ED-`c`
    SHG (should be forbidden). Wrong since v0.1.1.
  - `2'm'm`'s Default orientation was rotated 90° from its own HM symbol
    (`{1, m_y, 2'_z, m'_x}` instead of the Birss Table-6 form
    `{1, m_z, 2'_x, m'_y}`), affecting which axis its ED `i`- and `c`-tensor
    components are attached to in the Default setting and the corresponding
    a-/b-unique settings. Wrong since v0.1.1.
- Removed the spurious 3-setting (a-/b-unique) selector shown for `222`, `mmm`,
  `2221'`, and `mmm1'` — all three crystal axes are symmetry-equivalent for these
  groups, so the "alternate" settings were identical to the Default and offered no
  real choice. Wrong since v0.10.0.
- Generalized the orthorhombic "Axis orientation" help text to explain the
  time-reversal-driven distinguishing cases (e.g. the un-primed 2-fold in
  `2'2'2`, the primed mirror in `mmm'`), not just the classical polar/2-fold case.

## [0.13.0] - 2026-06-30

### Added

- Glossary tooltip layer (B20): click-to-reveal ⓘ info icons on the Tensor
  Classification (ED/MD/EQ), Time-Reversal (i-type/c-type), Crystal Setting,
  Crystal Cut, Crystal Rotation, Independent Tensor Components, SHG Intensity
  Polarimetry, and the per-tab Anisotropy/Polarizer/Analyzer controls; the
  expanded GroupIdentityHeader panel shows a type-definition tooltip (Type
  I/II/III). Each tooltip shows a 1–2 line definition and a "Learn more →" link
  that deep-links to the relevant Help tab. Source of truth lives in
  `src/data/glossary.ts` (16 terms); the reusable `<TermInfo>` component follows
  the established B19 click-toggle pattern (no hover, mobile-safe).
- Help page reorganized into 5 tabs (Feature Overview, Notations & Conventions,
  Physics & Group Theory, Simulation, Deeper Topics), matching the Calculator's
  tab-strip pattern on desktop and a horizontally-scrollable strip on mobile.
  References now live inside Deeper Topics. The "Symmetry Operations" block was
  brought in line with the rest of the page's key-terms-grid style (B14).
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
- Calculator/Simulator setting buttons for all 19 non-monoclinic dual-setting
  magnetic groups now show the distinct magnetic HM symbol (e.g. `6'm'm`, `4'm'm`,
  `-4'm'2`, `-3'1m'`, `-6'm'2`) instead of internal mechanism labels (e.g. "σ_d
  primed", "C₂' along ⟨100⟩"). The trigonal and hexagonal entries were derived
  from each group's own computed symmetry operations, using the slot convention
  confirmed against the existing `-3m`→`-31m` and `-6m2`→`-62m` pairs. Monoclinic
  alternate-setting buttons now read "First (c-unique, Birss)" / "Second
  (b-unique, ITC)" instead of "Default" / "b-unique (ITC)" for consistency with
  the Help/Explorer wording (B2.3, complete).
- Simulator's "Source Terms (Lab Frame)" panel no longer shows the redundant
  "Symbolic (φ_x, φ_y, ψ dependence)" block — it duplicated "As functions of
  E_X, E_Y" and made the panel unnecessarily long. "As functions of E_X, E_Y" and
  "As functions of θ_pol" are unchanged (A1-Sim).
- The θ_pol-swept formulas in the Simulator's "As functions of θ_pol" block and
  the expanded "Detected Intensity Formulas" now prefer the harmonic
  (Fourier-series) form over the power form by default, using the power form only
  when it is strictly shorter for that component; previously it was the other way
  around. Purely a display-form re-expression — every power↔harmonic mapping is
  mathematically exact (verified independently before the change), so no computed
  value changes. For the common case (a single tensor component contributing to
  one polarizer-angle term) the rendered output is unchanged, since the power form
  is always the shorter of the two there (B16).

### Fixed
- **Data:** the `-3'm'` magnetic point group's generator encoded the wrong unitary
  (halving) subgroup — `3m` instead of the literature-correct `32` (Birss
  *Symmetry and Magnetism* Table 6/7 row 82; independently confirmed against the
  printed International Tables for Crystallography trigonal listing). This made
  `-3'm'` collapse to a duplicate of the unrelated `-3'm` group (identical computed
  symmetry operations and tensor forms at both crystal settings). Corrected the
  generator in `symmetryGroups.ts`. **Affects previously-computed output**: the
  canonical Cr₂O₃ magnetoelectric SHG c-type ED tensor (`-3'm'`, the most-cited
  fixture in the golden-tensor suite) changes from the `M₃`-class form (nonzero
  `χ_zzz`, no `χ_xyz` term) to the literature-correct `L₃`-class form (`χ_zzz = 0`,
  `χ_xyz`-family present) — versions before this fix reported the wrong nonvanishing
  components for this group at both the default and alternate crystal setting, and
  in any rotated/lab-frame source-term display referencing it. `-3'm` and `-3m'`
  (the other two members of the trigonal `-3m` magnetic family) were verified
  unaffected. See `docs/findings/FINDING-trigonal-3m-prime-bug.md` and
  `docs/findings/verification-trigonal-magnetic-groups.md` for the full derivation.
- Help page content audit (B22): Neumann's-principle equation now shows the
  `det(R)` (axial) and time-reversal-sign (c-type) factors it was previously
  missing; dropped the misleading "provided time-reversal symmetry is broken"
  qualifier on the magnetic-dipole description (axial-tensor survival in
  centrosymmetric groups is a parity effect, independent of time reversal);
  fixed "Hausühl" → "Haussühl"; corrected the lab-frame rotation-matrix formula,
  which had drifted out of sync with the shipped order
  (`Rz(ψ)·Ry(φy)·Rx(φx)` → the actual `Ry(φy)·Rx(φx)·Rz(ψ)`); marked the
  already-open-access references and added Fiebig, Pavlov & Pisarev, JOSA B 22,
  96 (2005) to the references list. UI/docs-only — no computed values change.

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

[Unreleased]: https://github.com/manganite/birss-app/compare/v0.25.0...HEAD
[0.25.0]: https://github.com/manganite/birss-app/compare/v0.24.0...v0.25.0
[0.24.0]: https://github.com/manganite/birss-app/compare/v0.23.1...v0.24.0
[0.23.1]: https://github.com/manganite/birss-app/compare/v0.23.0...v0.23.1
[0.23.0]: https://github.com/manganite/birss-app/compare/v0.22.0...v0.23.0
[0.22.0]: https://github.com/manganite/birss-app/compare/v0.21.0...v0.22.0
[0.21.0]: https://github.com/manganite/birss-app/compare/v0.20.0...v0.21.0
[0.20.0]: https://github.com/manganite/birss-app/compare/v0.19.0...v0.20.0
[0.19.0]: https://github.com/manganite/birss-app/compare/v0.18.0...v0.19.0
[0.18.0]: https://github.com/manganite/birss-app/compare/v0.17.0...v0.18.0
[0.17.0]: https://github.com/manganite/birss-app/compare/v0.16.0...v0.17.0
[0.16.0]: https://github.com/manganite/birss-app/compare/v0.15.0...v0.16.0
[0.15.0]: https://github.com/manganite/birss-app/compare/v0.14.1...v0.15.0
[0.14.1]: https://github.com/manganite/birss-app/compare/v0.14.0...v0.14.1
[0.14.0]: https://github.com/manganite/birss-app/compare/v0.13.1...v0.14.0
[0.13.1]: https://github.com/manganite/birss-app/compare/v0.13.0...v0.13.1
[0.13.0]: https://github.com/manganite/birss-app/compare/v0.12.0...v0.13.0
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
