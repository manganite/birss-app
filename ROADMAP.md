# Roadmap

Feature ideas, design decisions, and implementation notes for birss-app. This document serves as a living design notebook — it records not just what to build and in what order, but the reasoning behind decisions, verified constraints, and brainstorming context that informs future work. Items are roughly ordered by priority.

## Priority overview

| # | Feature | Ships independently? | Notes |
|---|---------|---------------------|-------|
| 1A | Polar plot fix | Yes — ship immediately | ~3-line change |
| 1B | Rotation engine + tests | Yes — after 1A | Correctness risk lives here |
| 1C | Rotation UI + mobile | Yes — after 1B | Sliders, layout, controls |
| 2 | Symbolic source terms | Yes — spike first | Largest feature; not blocked on 1 |
| 3 | Alternate settings (Phase 1) | Yes — anytime | 8 Mechanism-B groups |
| 4 | Color tokens | Yes — anytime | Housekeeping |
| 5 | Explorer enrichment | Deferred | After 1–3 settle |
| 6 | Help & documentation | Deferred | Inline help ships with each feature |
| 7 | Oblique-axis transparency | Yes — anytime | Docs/UX only; no engine changes |

## Standing decisions

- **Backwards compatibility:** Pre-1.0; no backwards-compatibility promise. The only output-visible change is 1A (plot orientation corrected). Removing diagonal presets does not change computed output — identical results are reachable via slider equivalences; document in changelog and help.
- **birss-tables integration:** `birss-tables` is the project's own repo, not a third-party dependency. Build integration uses a Git submodule or pinned commit hash, a build step to typed JSON, and a CI assertion on expected row counts.
- **Setting counts:** The settings analysis yields the *geometric* count (all distinct orientations). The *user-facing* count may be smaller when crystallographic convention restricts the allowed choices. Monoclinic: reduced from 3 to 2 (b/c; a-unique is not standard). Orthorhombic: all 3 axis orientations are standard in the ITC and exposed as-is.
- **Oblique-axis Cartesian convention:** For triclinic and monoclinic systems the crystallographic axes are not orthogonal, but the engine works in an orthonormal Cartesian frame. The app adopts the standard crystal-physics convention (Hausühl 1983, based on IRE 1949; recommended by Matthies & Wenk 2009 for exactly these systems): **Z ⊥ c, Y ⊥ (c × a), X = Y × Z.** Combined with the app's z-unique (Birss) setting this gives: monoclinic → z ∥ c (unique axis), x ∥ a, y ∥ b*; triclinic → z ∥ c, y ∥ b* (⊥ c × a), x = projection of a onto the plane ⊥ c. The set of independent/zero components is convention-independent (verified: the symmetry group commutes with any in-plane rotation for groups 1, −1, 2, m, 2/m), but the numeric component values and simulated polarimetry orientations depend on this choice. This convention must be documented before golden fixtures for these systems are transcribed.

---

## 1. Polar Plot Fix + Numeric Rotation

### 1A. Fix Polar Plot Orientation

**Status:** Planning — ship as its own PR
**Priority:** High — ~3-line change, ship immediately

Currently 0° (x) is on the vertical axis and 90° (y) is horizontal. Swap so that 0° is on the horizontal axis (right) and angles increase anticlockwise (mathematical positive sense).

#### Implementation

The Recharts `RadarChart` currently uses defaults (no explicit `startAngle`/`endAngle`). The fix:

- [ ] Set `startAngle` and `endAngle` on the `RadarChart` component to place 0° at the right with angles increasing anticlockwise — verify exact prop values by testing (Recharts docs and actual behavior should be confirmed, not assumed)
- [ ] Update `PolarRadiusAxis angle` to match the new 0°-at-right layout (likely `{0}`, currently `{90}`) — confirm by testing
- [ ] `RADAR_TICKS` and `formatPolarAngle` remain unchanged — labels (0°=X, 90°=Y) are already correct
- [ ] No data changes needed — `useSimulatorState` already uses `Ex=cos(angle)`, `Ey=sin(angle)` which is consistent with the standard convention

#### Convention confirmation

0° = polarizer along lab X, increasing anticlockwise — standard in optics/SHG. The data generation already matches this convention; only the chart rendering is wrong.

### 1B. Rotation Engine + Tests

**Status:** Planning
**Priority:** High — this is where the correctness risk lives; ship after 1A

The existing engine (`calculateSHGExpressions`) already accepts arbitrary continuous angles — the restriction to "parallel / 45°" lives solely in the fixed `K_ORIENTATION_PRESETS` buttons, not in the engine. `simulationData`, `expandedFormulas`, and `labFrame` already react to `thetaX`/`thetaY` via `useMemo`, so all downstream computations update automatically.

This piece covers the engine extension (lab-frame user rotations), rotated-path test coverage, and preset cleanup. The UI controls (sliders, mobile layout) ship separately as 1C.

#### Design decisions

- **Reference-surface model:** the crystal has a reference surface whose normal is one crystal axis (the preset). From there the user can **tilt** the surface (rotate the normal away from the beam) and **spin** it about its normal (azimuth). Preset = which crystal axis is the surface normal; tilt = φ_x, φ_y about lab-x, lab-y; azimuth = ψ about the normal = k = lab-z.
- **Rotation frame:** user rotations are applied in the **lab frame** (left-multiplied), decoupled from the preset Euler angles. This avoids the gimbal-lock singularity that the crystal-frame composition `Ry·Rx·Rz` has at tx = 90° (the k||y preset, where φ_y and φ_z collapse onto the same axis). With lab-frame rotations, the three rotation generators are always (x̂, ŷ, ẑ) regardless of the preset — rank 3 everywhere.
- **Eligible presets:** principal axes only (k||x, k||y, k||z) for now. The diagonal presets (k||xy, k||xz, k||yz) are removed as standalone buttons but remain reachable as tilted principal presets (k||xy = k||y + φ_y = −45°; k||xz = k||z + φ_y = −45°; k||yz = k||z + φ_x = 45°) — document this equivalence for reproducibility. The [hkl] surface generalization (parking lot) would bring diagonals back as first-class orientations; revisit the removal note when that lands.
- **Shared state:** φ_x, φ_y, ψ live in App.tsx, shared between Calculator and Simulator. Rotation state persists silently across view switches — the lab frame info already reflects the current orientation.

#### Safety net: rotated-path test coverage (prerequisite)

The 490+ existing tests all run at orientation (0,0) — the rotated code path has zero coverage. Before changing the rotation composition, capture golden references for rotated outputs:

- [ ] Add tests for k||x (0, −90) and k||y (90, 0) presets against known results
- [ ] Ideally include at least one oblique-angle case from the literature
- [ ] These tests become the regression baseline for the engine change

#### Engine extension: lab-frame user rotations

The current engine uses R = Ry(thetaY) · Rx(thetaX), which only covers two rotation axes and has a gimbal-lock singularity at tx = 90° (the k||y preset). All three rotations are physically needed: rotation around k appears redundant with the polarizer sweep for a perfectly aligned crystal, but once the crystal is tilted (any perpendicular φ ≠ 0) the azimuthal orientation around k becomes an independent parameter — it determines which crystal directions lie in the tilt plane.

Separate user rotations from the preset and apply them in the lab frame:

**R = Rz(ψ) · Ry(φ_y) · Rx(φ_x) · R_preset**

where R_preset = Ry(ty) · Rx(tx) aligns the chosen crystal axis with lab-z (k). The principal presets are k||z = (0, 0), k||x = (0, −90), k||y = (90, 0). All existing behavior is unchanged at (φ_x, φ_y, ψ) = (0, 0, 0).

Verified: rank 3 at all presets (no gimbal lock). ψ is the azimuth about lab-z (= k) uniformly for every preset; φ_x, φ_y are tilts about lab-x, lab-y.

Changes required:

- [ ] `tensorProjection.ts`: build `R = Rz(ψ) · Ry(φ_y) · Rx(φ_x) · R_preset` (lab-frame outer rotations, not crystal-frame offset angles)
- [ ] `calculateSHGExpressions`: add φ_x, φ_y, ψ parameters — consider switching to an options object (`{ groupName, tensorType, trType, thetaX, thetaY, phiX, phiY, psi, labFrameDisplayMode }`) to avoid positional-argument breakage (current signature has `labFrameDisplayMode` as the 6th positional arg after `thetaY`)
- [ ] `App.tsx`: add φ_x, φ_y, ψ state (replace thetaZ)
- [ ] `useSimulatorState.ts`: pass user rotation angles through
- [ ] `getLabFrameVectors`: update to the same lab-frame composition
- [ ] All existing presets: (φ_x, φ_y, ψ) = (0, 0, 0) by default (no behavioral change)
- [ ] Architect R_preset to accept arbitrary alignment rotations (near-zero cost — one rotation matrix), so the later [hkl] generalization is a UI/input change, not an engine rewrite

#### Available rotation axes per preset

With R = Rz(ψ) · Ry(φ_y) · Rx(φ_x) · R_preset, the mapping is **preset-independent**: φ_x and φ_y are always lab-frame tilts, ψ is always the azimuth about k (= lab-z). No per-preset axis remapping needed.

| Preset | k aligned to | φ_x | φ_y | ψ (azimuth) |
|--------|-------------|-----|-----|-------------|
| k\|\|z (0, 0) | crystal Z | tilt about lab-x | tilt about lab-y | spin about k (lab-z) |
| k\|\|x (0, −90) | crystal X | tilt about lab-x | tilt about lab-y | spin about k (lab-z) |
| k\|\|y (90, 0) | crystal Y | tilt about lab-x | tilt about lab-y | spin about k (lab-z) |

ψ is redundant with the polarizer sweep only when both tilts are zero — a physical degeneracy identical at every preset, not a parametrization defect.

#### Preset cleanup

- [ ] Remove the three diagonal presets (k||xy, k||xz, k||yz) from `K_ORIENTATION_PRESETS` in `MathComponents.tsx`
- [ ] Remove any references to diagonal presets throughout the app
- [ ] Only k||x, k||y, k||z remain
- [ ] Document equivalences (k||xy = k||y + φ_y = −45°, etc.) in help or changelog

#### Implementation

- [ ] Build R = Rz(ψ) · Ry(φ_y) · Rx(φ_x) · R_preset for all presets
- [ ] Verify rank 3 at each preset (regression test on generator rank)
- [ ] Update crystal orientation / lab frame info to reflect rotation

#### Acceptance criteria (1B)

- Rotated-path golden reference tests pass before and after the engine change
- For (φ_x, φ_y, ψ) = (0, 0, 0), output is identical to the current preset result (regression test against the three presets)
- All three presets offer two independent tilt axes (φ_x, φ_y) plus an azimuthal rotation about k (ψ); local rank is 3 at every preset (regression test on the generator rank)
- With multiple axes active, result matches `R = Rz(ψ) · Ry(φ_y) · Rx(φ_x) · R_preset` (sample-point test)
- Diagonal presets are fully removed from the UI

### 1C. Rotation UI + Mobile

**Status:** Planning — ship after 1B engine is green
**Priority:** High

Sliders, numeric inputs, mobile layout, and the Calculator interim state. This is where the user-facing rotation experience lives — no engine changes.

#### Calculator interim state (1B shipped, Feature 2 not yet)

The Calculator does not apply the rotation and shows source terms at the base preset orientation. If a rotation is active in the Simulator, the Calculator displays a small informational note ("rotation active in Simulator"). Rotated numeric coefficients without symbolic context are misleading — the Calculator's value is the exact symbolic form, which arrives with Feature 2.

#### Simulator controls

- [ ] Add three sliders per preset (two tilt axes + azimuthal rotation), independently togglable. Ranges: tilts φ_x, φ_y ±90° (hemisphere of normal directions); azimuth ψ ±180° (full rotation about k — only repeats after 360°, any shorter period is group-specific)
- [ ] Add coupled numeric input next to each slider for precise values (e.g. exact 45°)
- [ ] Add "Reset orientation" button to return to the preset angles (phi = 0)
- [ ] Polar plots update live as rotation sliders change
- [ ] All three rotation axes can be active simultaneously
- [ ] Mathematical Model section shows numeric formulas for now — symbolic phi comes with Feature 2

#### Mobile layout

On mobile, controls stack above plots, so adding sliders lengthens the scroll to the plots:

- [ ] Flip mobile layout: plots above controls, or use a sticky/collapsible controls panel, so the plot remains visible while dragging sliders
- [ ] Use existing `motion` library for accordion/collapse transitions (no new dependency); respect `prefers-reduced-motion`

#### UI placement

Place rotation controls directly below the k-vector preset buttons, in the same "Crystal Orientation" section. Toggle + slider + numeric input on one line per axis. When no rotation is active, the section looks the same as today.

#### Acceptance criteria (1C)

- Simulator: phi sliders change the polar plots live without reload
- Calculator shows base-orientation source terms with informational note when rotation is active
- Mobile layout keeps plots visible while adjusting sliders

---

## 2. Symbolic Source Term Expressions (phi dependence)

**Status:** Planning — spike/prototype before committing to full scope
**Priority:** High — not blocked on Feature 1; likely the single largest feature

Display source terms as symbolic expressions in phi rather than numeric coefficients. This resolves the gap from Feature 1C: the Calculator and Simulator Mathematical Model section will show proper phi-dependent formulas. This is a **new computation path** (trigonometric polynomial representation + arithmetic + simplification + LaTeX formatter), not an extension of the existing numeric pipeline. The scope warrants its own estimate and a spike before full commitment.

### Why this is a separate effort

Today's pipeline is float-throughout: `cx, sx, cy, sy` become numbers early, `multiplyLinear`/`addPoly`/the R contraction compute numerically, and `formatCoeff` is a lookup matcher against a fixed table of fractions and roots. That matcher cannot represent coefficients like `cos(phi_x)·sin(phi_y)`. Symbolic phi-dependence requires:

1. A representation for trigonometric polynomials in three angles (sums of `c · cos^a(φ_x) sin^b(φ_x) · cos^d(φ_y) sin^e(φ_y) · cos^f(ψ) sin^g(ψ)`)
2. Multiplication/addition over that representation in `multiplyLinear`/`addPoly`/the R contraction
3. Simplification (power reduction / multiple-angle) — conceptually transferable from existing theta_pol logic in `latexFormatting.ts`
4. A new LaTeX formatter (existing `formatCoeff` is insufficient)

The third angle (ψ) enlarges the trig-polynomial algebra and the formatter. When both tilts are zero, ψ produces only a trivial rigid-frame-rotation dependence — the formatter can detect and suppress/simplify that case to avoid clutter. Fold the three-angle scope into the Feature 2 spike rather than treating it as free.

### Goals

#### Calculator (Source Terms tab)
- [ ] Add rotation axis selector below k-vector presets — this control lives here (not in Feature 1B) because it only becomes meaningful with symbolic output
- [ ] Extend source term calculation to produce symbolic expressions in phi
- [ ] Display source terms as LaTeX with phi dependence
- [ ] Compact display for cross-terms (sin·cos products) — handle three-way cross-terms (φ_x, φ_y, ψ) when multiple rotation axes are active
- [ ] Update crystal orientation / lab frame info symbolically
- [ ] Prepare for wide formulas on mobile: clear scroll affordance or "tap to expand" for long KaTeX expressions

#### Simulator (Mathematical Model section)
- [ ] Simplified symbolic source terms with phi dependence in Mathematical Model section

### Verification

- Cross-check numeric ↔ symbolic: substituting phi values into symbolic expressions must reproduce the numeric output from Feature 1B
- Golden references from literature (e.g., Fröhlich et al. 1999, Fiebig et al. JOSA B 2005) for phi-dependent source-term / intensity expressions — not generated by the app

### Synergy with Python export

The symbolic engine shares a core with the Python `curve_fit` export (parking lot); the remaining work is code generation plus the scipy-compatible scaffolding.

---

## 3. Alternate Point Group Settings

**Status:** Planning
**Priority:** High — correctness issue; phased approach (spike first, then general system). Phase 1 is independent of Features 1B, 1C, and 2 — can land at any time, like the color-token feature.

The app's `GENERATORS` hardcode one orientation per group. A user whose crystal matches a different setting cannot currently obtain the correct tensor — this is a correctness gap.

### Motivation

`6'mm'` and `6'm'm` are two settings of the *same* magnetic point group, related by a 30° rotation about z (swapping σ_v ↔ σ_d). That rotation is not in the group (only 60° multiples are), so it is a genuine reorientation. P6_3'mc' reduces to 6'mm'; P6_3'm'c reduces to 6'm'm. The inequivalence of the two mirror-plane sets (σ_v vs σ_d, one primed, one unprimed) means the tensor components differ between settings.

### Two mechanisms that produce alternate settings

- **Mechanism A — classical setting ambiguity.** The secondary and tertiary direction sets carry *different* element types (e.g. 2-folds vs. mirrors in −42m / −4m2). The setting swap maps the spatial group to a different matrix set; the tensor changes. Inherited unchanged by magnetic derivatives.
- **Mechanism B — time-reversal-broken equivalence.** The two direction sets carry the *same* element type, so the classical parent has a single setting; priming one set but not the other (e.g. 6'mm' vs 6'm'm) breaks the equivalence. The swap preserves the spatial group but flips the coloring.

Mechanisms A and B are mutually exclusive (A requires different element types, B requires identical). The maximum number of settings is **3** (never 4) — the third source is orthorhombic axis orientation (which of x/y/z carries the unique element), independent of both A and B.

**Geometric vs. convention-reduced setting count:** see Standing decisions at the top — the principle is stated once there.

### Settings analysis results (29 of 58 BW groups affected)

| Group | System | #Settings | Mechanism |
|---|---|---|---|
| `2'2'2`, `2'm'm`, `m'm'2`, `m'm'm`, `mmm'` | Orthorhombic | 3 | Axis orientation |
| `4'mm'`, `4'22'`, `4'/m'm'm`, `4'/mmm'` | Tetragonal | 2 | **B (time-reversal)** |
| `−4'2m'`, `−4'm2'`, `−42'm'` | Tetragonal | 2 | A (classical) |
| `32'`, `3m'`, `−3'm`, `−3'm'`, `−3m'` | Trigonal | 2 | A (classical) |
| `6'mm'`, `6'22'`, `6'/m'mm'`, `6'/mm'm` | Hexagonal | 2 | **B (time-reversal)** |
| `−6'2m'`, `−6'm2'`, `−6m'2'` | Hexagonal | 2 | A (classical) |
| `2'`, `m'`, `2'/m`, `2'/m'`, `2/m'` | Monoclinic | 2 | Axis choice (b/c) |

The remaining 29 BW groups are single-setting. The 32 classical and 32 grey groups inherit the classical setting count (the grey coloring is symmetric, so it never breaks equivalences).

**Implementation priority:** the **8 time-reversal-driven (Mechanism B) groups** — these are the cases where the crystal itself has no classical setting ambiguity but the magnetic order creates one. The user has no way to discover from classical references that a choice is needed.

### Phased approach

#### Phase 1 (spike): 8 time-reversal-driven groups

- [ ] Implement the similarity transform approach: `G' = S · G · S⁻¹` applied to the existing, test-covered generators (not hand-written generator sets — avoids transcription errors and leverages the 490+ tests guarding the base generators). For Phase 1, S is the known geometric swap rotation: Rz(30°) for hexagonal, Rz(45°) for tetragonal — derived from the geometry, not an ITC/Litvin lookup. ITC/Litvin is used for *validating* the resulting tensor forms and for Phase 2 classical conventions.
- [ ] Cover the 8 Mechanism B groups (4 tetragonal + 4 hexagonal)
- [ ] UI: setting selector in the Calculator — a **labeled toggle** (e.g. "σ_v primed" / "σ_d primed") shown only when the selected group has multiple settings. Phase 1 scope: the label identifies *which* mirror set is primed; defer full visual symmetry explanations to the Explorer notation panel (Feature 5)
- [ ] For multi-setting groups not yet implemented in Phase 1 (~21 groups): show a **passive indicator** ("N settings — selection coming") so users learn the concept exists without encountering a dead control
- [ ] Tensor components, source terms, and simulation all update to reflect the selected setting
- [ ] Validate per-setting tensor forms against literature (ITC / Litvin / birss-tables `table-7`), not generated by the app

#### Phase 2: remaining groups

- [ ] Classical-inherited (Mechanism A): 11 groups (tetragonal, trigonal, hexagonal)
- [ ] Orthorhombic axis orientation: 5 groups (3 settings each)
- [ ] Monoclinic axis choice (b/c): 5 groups — the app uses z-unique (Birss convention); expose the b vs c choice (2 options, not 3 — the a-unique setting is not used in practice). The in-plane Cartesian convention (Feature 7) must be documented first, and the first↔second-setting axis permutation (Matthies & Wenk eqs. 1–4, 23) applied when switching to b-unique
- [ ] Classical groups: inherit the same mechanism

### Interaction with rotation (Features 1B–1C/2)

A setting changes the symmetrized tensor in the *crystal frame*; rotation (Features 1B/2) maps it to the *lab frame*. The order is: **setting → crystal-frame tensor → R → lab frame**. In the UI, keep "crystal setting" (which symmetry elements on which axes) clearly distinct from "lab orientation" (k-vector + φ tilt) so the two orientation concepts are not conflated.

### UI note: three orientation controls in the Calculator

Feature 2 adds a rotation-axis selector; Feature 3 adds a setting selector — both alongside the existing k-vector presets (Feature 1C adds the rotation sliders to the Simulator only). Visually group and disambiguate these in the "Crystal Orientation" area: crystal setting (which axes carry which operations) is a separate concept from lab orientation (k-direction + tilt angle).

### Notes

- The selector must support up to 3 settings, never 4
- Trigonal groups: all results use hexagonal axes. Rhombohedral-axis support is deliberately excluded for now — if added later, it multiplies the trigonal setting count and should be scoped as its own item
- `birss-tables` `table-7` already flags three groups in their alternate setting: `(2'm'm)` (row 16), `(−4'm2')` (row 37), `(−6'2m')` (row 71) — use as validation anchors
- The setting-swap operations per crystal system: tetragonal Rz(45°), hexagonal/trigonal Rz(30°), orthorhombic 3-fold about [111], monoclinic unique-axis change
- The group list originates from the settings computation on the app's own generators, validated against classical reference counts and the three `table-7` markers. For a correctness-critical feature, recommend an independent cross-check against a published settings reference before shipping Phase 2 (the per-setting tensor forms are already flagged for literature validation)

### Data sources

- **Classical groups:** ITC (International Tables for Crystallography) for alternate settings
- **Magnetic space groups:** D.B. Litvin, "Tables of crystallographic properties of magnetic space groups," *Acta Cryst. A* **64**, 419–424 (2008). Supplementary tables at https://journals.iucr.org/a/issues/2008/03/00/pz5052/pz5052sup1.pdf

---

## Housekeeping

### 4. Color Tokens (independent, can land at any time)

**Status:** Planning
**Priority:** Medium — independent, low-risk, can land at any time

The two hardcoded colors (`#E4E3E0`, `#141414`) appear at ~194 occurrences (160× ink, 34× paper) across ~118 lines as Tailwind arbitrary values (e.g. `border-[#141414]`, `bg-[#141414]/5`), spread across all components including the ~23 KB HelpPage.

#### Scope

- [ ] Define semantic `@theme` tokens in `index.css` (Tailwind v4 idiomatic approach): `ink = #141414`, `paper = #E4E3E0` — generates real utility classes (`bg-paper`, `text-ink`, `border-ink`)
- [ ] Replace all ~194 arbitrary color occurrences with the semantic token utilities
- [ ] Commit as its own PR with screenshot / visual diff as safety net (~194 replacements, no styling tests)

#### Rationale

- Makes future dark mode almost a token swap
- No new dependencies needed
- Only two colors exist in the codebase; no `accent` value to extract (add one later if a design need arises)
- Not in scope: dark mode itself, component library migration, full rewrite

---

## 5. Explorer Enrichment

**Status:** Planning
**Priority:** Medium — defer until after features 1 and 2 settle

Extend the Explorer to surface more information from the Birss tables beyond what is currently shown. **Hermann–Mauguin remains the binding representation in the app.** Extra notations are convenience, not a replacement.

### Phase 1: Read-only reference info (enrichment of existing UI)

Uses generators and group data already in the codebase. Symmetry operations are already shown via `OperationsModal`; `AxisOrientationInfo` exists for the calculator. Phase 1 adds generators and a notation panel, reusing existing components rather than duplicating.

#### Crystal system level
- [ ] Coordinate system information (a-axis, c-axis labeling)
- [ ] Reference axes

#### Point group level
- [ ] Generators display (from existing GENERATORS table)
- [ ] Notation panel: HM (binding) + Schubnikov (always) + Schoenflies (classical groups only)

#### Notation coverage (from birss-tables)

- **32 classical groups:** Schoenflies + Schubnikov available (table-3) — full side-by-side display
- **58 BW groups:** Schubnikov only (table-6 has no Schoenflies column) — omit Schoenflies rather than deriving it
- **32 grey groups:** not in the tables; trivially derivable from classical parent (HM without `1'`; c-tensor ≡ 0)

#### Mobile acceptance criterion
- [ ] Test that expandable details sections and notation panels work on small screens (progressive disclosure must not break on mobile)

### Phase 2: Extended reference data (needs birss-tables repo)

- [ ] Characteristic symmetry per crystal system
- [ ] Raw tensor forms for arbitrary rank and type (distinct from Calculator, which shows SHG-specific contracted forms)
- [ ] Axis settings via ITC (Birss conventions)

### Notes

- Use progressive disclosure: expandable "Details" sections to avoid clutter
- Phase 1 data sources: existing GENERATORS table in codebase
- Phase 2 data sources: birss-tables repo (tables 3, 4a–4f, 6, 7)
- Join key between app and tables: HM string (verified: app's BW symbols match the "International" column of table-6 exactly)
- Normalization needed: overbar rendering vs. leading `-`, plus three parenthesized symbols in table-7 (rows 16/37/71, alternate axis setting)

---

## 6. Help and Documentation

**Status:** Planning
**Priority:** Low — selectively extend the existing help page (already ~23 KB), not greenfield

### Goals

- [ ] Expandable or linked detail sections for deeper topics
- [ ] Explain how tensor components are calculated
- [ ] Information about different tensor types (i-, c-, polar, axial, etc.)
- [ ] Overview of the Birss framework and conventions used

### Priority topics (common user confusion)

- i-type vs c-type tensors (time-reversal behavior)
- Difference between ED, MD, and EQ contributions
- Lab-frame conventions
- Low-symmetry coordinate conventions and the absent β control (see Feature 7)

### Approach

- **Inline help first**: add tooltips and ? icons for new UI elements as they are built (during features 1–5), rather than deferring all docs
- **Full help page later**: write detailed deep-dives after features 1–5 settle to avoid rewriting
- Use a "dig deeper" pattern — don't front-load complexity

---

## 7. Oblique-Axis Transparency (Triclinic & Monoclinic)

**Status:** Planning
**Priority:** Medium — documentation/UX only, no engine changes; can ship independently at any time
**Prerequisite for:** golden fixtures for triclinic/monoclinic groups; Feature 3 Phase 2 monoclinic axis choice

### What was established (code-verified)

#### The engine is correct and obliquity-blind — by design

The entire pipeline lives in an orthonormal Cartesian frame. There is no lattice vector, no metric tensor, no cell angle, and no β anywhere in the codebase. The `GENERATORS` are exclusively orthonormal matrices, and the lab-frame rotation R(θ_X, θ_Y) is a proper rotation for every angle pair (verified: max ‖R·Rᵀ − I‖ = 4.4e-16, max |det R − 1| = 4.4e-16). Because the symmetry operators never reference a, b, c, the lattice obliquity cannot and does not enter the calculation. This is the standard, correct way to do tensor physics: components are defined in an orthonormal frame where the metric is trivial.

#### The symbolic relations are convention-independent

For triclinic and monoclinic groups the symmetry group commutes with any in-plane rotation R_z(θ) (verified by conjugation for 1, −1, 2, m, 2/m over arbitrary angles). Consequently which components are independent/zero is azimuth-invariant — a true symmetry fact, not a convention choice. The generated forms reproduce the literature exactly: class 2 → 8 components (the 2 ∥ z form: d₁₅, d₁₆, d₂₁, d₂₂, d₂₃, d₂₄, d₃₅, d₃₆), class m → 10 components (the m ⊥ z form). These match Birss directly (first setting). The textbook IEEE/Nye tables list the 2 ∥ Y (second-setting) form and agree only after the first↔second permutation — see provenance caveat below.

#### What is convention-dependent — and currently undocumented

The azimuthal anchoring of the in-plane Cartesian axis (where x points inside the oblique plane) is a free gauge that the engine deliberately leaves open. It does not affect the relations, but it does affect:

- the **numeric values** of individual components (verified: rotating x in-plane reshuffles χ_zxx ↔ χ_zyy, changes χ_zxy, χ_xyz, … while the zero/non-zero pattern is preserved)
- therefore the **simulated polarimetry orientation**
- the physical meaning of the **lab orientation presets** (k ∥ x, k ∥ y, …), which are defined relative to the Cartesian frame, not relative to a, b, c

#### In monoclinic/triclinic the anisotropy orientation is a material parameter

There is no symmetry element in the oblique plane, so nothing pins the azimuth of the polarimetry lobes — it is set purely by the ratios of the (free) in-plane components. Verified:

| Group (config) | Parallel-anisotropy maxima |
|---|---|
| Monoclinic 2, crystal A (k ∥ x) | 0°, 180° |
| Monoclinic 2, crystal B (k ∥ x) | 32°, 148°, 212°, 328° |
| Trigonal 3m, any random components (k ∥ z) | **locked** at 0/60/120/180/240/300° |

In high-symmetry systems the in-plane symmetry locks the lobes to crystallographic directions; in monoclinic/triclinic it does not.

#### Role of β

β has no independent existence in a pure point-group/tensor framework. Its physically observable content (for SHG symmetry) is fully absorbed into the free component values: a crystal with a different β is a different physical crystal with different χ values. There is no universal χ(β) law the app could compute — the dependence is material-specific.

Consequences:

- A dedicated β slider is neither needed nor well-defined. Different β is represented by setting the in-plane component values accordingly.
- The app is a forward model: feed it the measured component values and it reproduces the rotated anisotropies correctly.
- Out of scope (must be stated): linear optics — birefringence in the a–c plane, whose principal-axis orientation itself depends on β and wavelength, refraction, walk-off — is not modeled.

### The gap

The only place x, y, z are mapped to a, b, c is the display-only component `AxisOrientationInfo` (App.tsx), and it is incomplete exactly where it matters:

| System | `AxisOrientationInfo` (App.tsx) | HelpPage | Status |
|---|---|---|---|
| Triclinic | `return null` — no axis info shown | not listed | ❌ missing |
| Monoclinic | "z is the unique axis" — no in-plane anchor | same | ⚠️ partial |
| Ortho / Tetra / Cubic | x ∥ [100], y ∥ [010], z ∥ [001] | same | ✅ |
| Trigonal / Hexagonal | full, incl. 120° note | same | ✅ |

For triclinic/monoclinic, the orientation presets (`k ∥ x`, `k ∥ y`) and entered component values refer to an in-plane direction whose crystallographic meaning is undocumented. The result is internally consistent but not interpretable or reproducible without the convention.

### Convention decision (prerequisite)

Adopt the established crystal-physics convention — Hausühl (1983), based on von Fedorow (1893), Goldschmidt (1897) and the IRE *Standards on Piezoelectric Crystals* (1949), and restated/recommended by Matthies & Wenk (2009, *J. Appl. Cryst.* **42**, 564–571) for exactly triclinic/monoclinic/trigonal systems. The general recipe:

> **Z ⊥ c,  Y ⊥ (c × a),  X = Y × Z.**

Specialized to the app's actual convention. The app uses the Birss (first) setting — the monoclinic unique axis is parallel to c, so z ∥ c (ROADMAP §3, "the app uses z-unique (Birss convention)"; the b-unique/ITC choice is future scope, not the current state). In this setting α = β = 90° so a ⊥ c, and the Hausühl recipe is simultaneously Z ⊥ c and z-unique. Verified numerically (γ = 70°):

- **Monoclinic** (Birss/first setting, z ∥ c) — applying the recipe in its definitional order Z → Y → X, so each axis is derived from the previous, not assumed:
  - z ∥ c  (= Z; the unique 2-fold axis)
  - y ⊥ (c × a)  (= Y; ∥ b\*, reciprocal b)
  - x = y × z  (= X); because a ⊥ c in this setting, this evaluates to **x ∥ a** exactly
  - So x ∥ a is a *consequence* of the recipe, not an extra assumption. The frame is the Hausühl/IEEE frame *and* z-unique at once — no relabelling, no a/c ambiguity. (Verified: Y = c × a = +b\*, X = Y × Z = +a, det[X Y Z] = +1.)
- **Triclinic** (no unique axis; z ∥ c is the recipe directly — unifies with the monoclinic case):
  - z ∥ c
  - y ⊥ c × a  (the b\* direction, normal to the a–c plane)
  - x = y × z  (the projection of a onto the plane ⊥ c — i.e. *neither* a *nor* a\*, but a flattened into the plane; equals a exactly only in the monoclinic case where a ⊥ c)

This decision must be made before golden fixtures for these systems are transcribed.

**Provenance caveat for fixtures.** Two monoclinic settings exist — *first/Birss* (C₂ ∥ c, Z ∥ c) and *second/ITC* (C₂ ∥ b, Y ∥ b). The app uses the first (Birss) setting, so fixtures transcribed from Birss (1966) — the primary golden source — match the app's frame directly, with no permutation. Sources written in the ITC/b-unique (second) setting (e.g. Nye 1957) require the first↔second-setting axis permutation (Matthies & Wenk eqs. 1–4, 23) before transcription. Record the source's setting in every triclinic/monoclinic fixture note, and whether a permutation was applied.

### Actions

- [ ] **`AxisOrientationInfo` (App.tsx:26–65):** replace the triclinic `return null` with the convention (z ∥ c, y ∥ b*, x = projection of a ⊥ c); add the in-plane x, y anchor to the monoclinic case (x ∥ a, y ∥ b*)
- [ ] **HelpPage (coordinate system section):** add the triclinic entry and complete the monoclinic entry to match
- [ ] **Simulator explainer (low-symmetry groups):** a short note or tooltip stating that (a) component values and polarimetry orientation are tied to the in-plane convention; (b) different β is represented by changing component values, not by a separate control; (c) birefringence/refraction is not modeled
- [ ] **Help entry "Why is there no β control?":** a 3–4 sentence explanation (see draft below)
- [ ] **Golden fixture provenance:** record the in-plane convention in the provenance note for any triclinic/monoclinic polarimetry fixture (guards reproducibility)

### Draft help text

> **Coordinate convention for low-symmetry crystals.**
> For monoclinic and triclinic groups the crystallographic axes are not mutually perpendicular,
> but the calculator works in an orthonormal (x, y, z) frame, following the standard
> crystal-physics convention (Z ⊥ c, Y ⊥ c × a, X = Y × Z; Hausühl 1983 / IRE 1949). The app
> uses the Birss setting (monoclinic unique axis ∥ c): for **monoclinic** this gives z ∥ c
> (unique axis), x ∥ a, and y ∥ b* completing the right-handed frame; for **triclinic**, z ∥ c,
> y ∥ b* (⊥ c × a), and x is a projected into the plane perpendicular to c.
> The set of independent (and zero) components does **not** depend on this choice, but the
> numeric values — and therefore the orientation of simulated polarimetry patterns — **do**.
>
> **Why there is no "monoclinic angle" control.** The angle β does not enter the symmetry
> calculation directly. A crystal with a different β is a different material with different tensor
> values, so you represent it by adjusting the relevant in-plane component values — not by a
> separate geometric control. (Linear-optical effects such as birefringence, which do depend on
> β, are outside the scope of this symmetry calculator.)

### Explicit non-goals

- No β slider
- No engine/numeric changes — the math is verified correct
- No birefringence/optics modeling

### References

- Hausühl, S. (1983). *Kristallphysik.* Weinheim: Physik-Verlag — source of the Cartesian-frame prescription
- *Standards on Piezoelectric Crystals* (1949). Proc. IRE **49**, 1378–1395 — original axis convention
- Matthies, S. & Wenk, H.-R. (2009). *Transformations for monoclinic crystal symmetry in texture analysis.* J. Appl. Cryst. **42**, 564–571 — the prescription for triclinic/monoclinic and the first↔second-setting transformations
- Birss, R. R. (1966). *Symmetry and Magnetism.* — the app's z-unique tensor forms (cross-checked: class 2 → 8 components, class m → 10)
- Nye, J. F. (1957). *Physical Properties of Crystals.* Oxford — property tensors given in the monoclinic second setting (b-unique); requires axis permutation before comparison with the app's first setting

---

## Ideas / Parking Lot

Space for ideas that aren't yet fleshed out or prioritized. Deferred pending deliberate design decisions.

- **Python code export**: generate a Python snippet of the current source term model (e.g., a `scipy.optimize.curve_fit`-compatible function) so users can directly fit experimental data without manually transcribing tensor expressions. Shares the symbolic core with Feature 2; the remaining work is code generation plus the scipy-compatible scaffolding.
- **Data export**: allow users to export tensor components, raw simulation data (CSV), or plots (SVG/PNG) for research and publication use. SVG export is most valuable for publications.
- **Save/load simulator state**: persist and restore simulator configurations (point group, tensor type, orientation, amplitudes, phases) for complex or iterative workflows. Open design question: file download/upload vs. URL-encoded permalink (makes configurations citable). Schema versioning needed.
- **Circular polarization basis**: source terms expressed in circular basis (E_± = (E_X ± iE_Y)/√2) for experiments with circularly polarized light. Unitary transformation of the existing source term polynomials — straightforward once the symbolic engine (Feature 2) exists.
- **Transmission vs reflection geometry**: distinguish between transmission and reflection SHG geometries. Reflection introduces Fresnel coefficients and refractive indices at ω and 2ω — more complex, may be better as a separate "advanced mode" rather than the default. The current model gives the nonlinear source polarization, which is geometry-agnostic.
- **[hkl] surface generalization**: the reference-surface model (Feature 1B) generalizes cleanly — "align a crystal axis to k, then tilt/spin" becomes "align [hkl] to k, then tilt/spin." Only R_preset changes (from a principal-axis alignment to a general alignment rotation); the engine already accepts arbitrary rotations. Two new requirements: (1) a Miller-index [hkl] input alongside curated presets, and (2) an azimuth zero convention for non-principal surfaces (which in-plane crystal direction is "up" at ψ = 0). Under this model, the removed diagonal presets (k||xy etc.) return as first-class surface orientations, not slider workarounds. For the hexagonal-manganite domain (mostly c-cut / a-cut = principal axes), the principal-axis presets cover the standard cases.
- **Accessibility pass**: focus states for preset/toggle buttons, `aria-label`s for lucide icons, keyboard operation of sliders. Currently absent.
- **PWA enhancement**: the app is already installable via `vite-plugin-pwa` — a discreet install hint and offline support would benefit lab use without network.
