# Roadmap

Feature ideas, design decisions, and implementation notes for birss-app. This document serves as a living design notebook — it records not just what to build and in what order, but the reasoning behind decisions, verified constraints, and brainstorming context that informs future work. Items are roughly ordered by priority.

This roadmap builds on the completed `services/` split (`tensorCalculator.ts` barrel + `symmetryGroups.ts` / `tensorProjection.ts` / `latexFormatting.ts`) and the golden-fixture test suite (517 tests). Both are prerequisites, not items below.

## Feature index

The `#` column is a **feature identifier** (used for cross-references throughout this document), not a priority rank. The actual implementation order is given in the implementation sequence below.

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 1A | Polar plot fix | **Done** (v0.2.0) | ~3-line change |
| 1B | Rotation engine + tests | **Done** (v0.3.0) | Lab-frame rotation with phiX, phiY, psi |
| 1C | Rotation UI + mobile | **In review** (PR #16, #17) | Desktop + mobile split |
| 2 | Symbolic source terms | Planning | Largest feature; not blocked on 1 |
| 3 | Alternate settings (Phase 1) | **Done** (PR #15) | 8 Mechanism-B groups |
| 4 | Color tokens | **Done** | Housekeeping |
| 5 | Explorer: tabs + enrichment | Deferred | Per-system tabs + enriched popups; after 1–3 settle |
| 6 | Help & documentation | Deferred | Inline help ships with each feature |
| 7 | Oblique-axis transparency | **Done** (v0.2.0) | Docs/UX only; no engine changes |
| 8 | Desktop layout overhaul | Deferred (8C **Done**, 8E **Done**) | Unified controls, collapsible sidebar; after 1C settles |
| 9 | [hkl] surface orientation | **Done** (PR #14) | Curated presets Phase 1; Phase 2 (free [hkl]) deferred |

## Implementation sequence

Features group into four waves based on their dependencies. Within each wave, items are independent and can be worked in parallel or in any order. Branch prefixes, merge methods, and SemVer bumps follow `AGENTS.md` — summarized per item below.

### Wave 1 — done (shipped in v0.2.0)

| Feature | PR | Status |
|---|---|---|
| **1A** — Polar plot fix | #9 | Merged |
| **7** — Oblique-axis transparency | #10 | Merged |
| **8E** — Explorer as default view | #8 | Merged |

### Wave 2 — done (shipped in v0.3.0)

| Feature | PR | Status |
|---|---|---|
| **1B.0** — Signature migration | #11 | Merged |
| **1B.1–1B.4** — Engine extension | #12 | Merged |

**Feature 2 spike** can start during Wave 3 — the spike is research (trig-polynomial representation, formatter design), not code that depends on 1B. Starting the spike early de-risks Wave 4.

### Wave 3 — parallel after 1B

| Feature | PR | Status |
|---|---|---|
| **4** — Color tokens | (local merge) | Merged |
| **8C** — Zero-result states | #13 | Merged |
| **9 Phase 1** — Curated cut presets | #14 | Merged |
| **3 Phase 1** — Alternate settings | #15 | Merged |
| **1C** — Rotation UI (desktop) | #16 | In review |
| **1C** — Rotation UI (mobile) | #17 | In review |

### Wave 4 — after Wave 3 settles

| Feature | Branch | Method | SemVer |
|---|---|---|---|
| **2** — Symbolic source terms | `feature/symbolic-source-terms` | PR (physics output) | MINOR |
| **5** — Explorer restructure + enrichment | `feature/explorer-enrichment` | PR (UI changes) | MINOR |
| **3 Phase 2** — Remaining settings | `feature/alternate-settings-p2` | PR (physics output) | MINOR |
| **8 A/B** — Desktop layout overhaul | `feature/desktop-layout` | PR (UI changes) | MINOR |
| **9 Phase 2** — Free [hkl] input | `feature/hkl-input` | PR (UI changes) | MINOR |
| **6** — Help & documentation | `docs/help-content` | Local merge (docs-only) | — (no bump) |

Feature 2 is the priority here — it's the single largest feature and unlocks the symbolic Calculator experience. Feature 5 and Feature 3 Phase 2 can proceed in parallel. Feature 8 A/B and Feature 6 are the tail.

### Release cadence

The app is pre-1.0 (`AGENTS.md`: "no backwards-compatibility promise"). Merging to `main` does not go live — the deployed site updates only on a `vX.Y.Z` release tag. Suggested cadence:

- **After Wave 1:** release `v0.2.0` (1A fix + 7 + 8E — first user-visible improvements)
- **After 1B:** release `v0.3.0` (rotation engine — the foundation)
- **Wave 3 items:** release as they land, bundling related items (e.g. 1C + 9.P1 together as `v0.4.0`; Feature 3 Phase 1 as `v0.5.0` since it's a correctness-critical change worth its own release note)
- **Wave 4:** individual releases per major feature

### Dependency graph (simplified)

```text
Wave 1:  1A ──→ 1B (Wave 2)
         7  (independent)
         8E (independent)

Wave 2:  1B.0 → 1B.1 → 1B.2 → 1B.3
              ↗ Feature 2 spike (research, parallel)

Wave 3:  1C ←── 1B
         3.P1   (independent)
         4      (independent)
         9.P1 ← 1B
         8C     (independent)

Wave 4:  2 ←── Feature 2 spike
         5      (independent, benefits from 8E)
         3.P2 ← 7
         8.AB ← 1C
         9.P2 ← 9.P1
         6      (after 1–5 settle)
```

## Standing decisions

- **Backwards compatibility:** Pre-1.0; no backwards-compatibility promise. The only output-visible change is 1A (plot orientation corrected). Removing diagonal presets does not change computed output — identical results are reachable via slider equivalences; document in changelog and help.
- **birss-tables integration:** `birss-tables` is the project's own repo, not a third-party dependency. Build integration uses a Git submodule or pinned commit hash, a build step to typed JSON, and a CI assertion on expected row counts.
- **Setting counts:** The settings analysis yields the *geometric* count (all distinct orientations). The *user-facing* count may be smaller when crystallographic convention restricts the allowed choices. Monoclinic: reduced from 3 to 2 (b/c; a-unique is not standard). Orthorhombic: all 3 axis orientations are standard in the ITC and exposed as-is.
- **Mobile/desktop differentiation:** One codebase, one engine, responsive information hierarchy. Mobile is a **read-and-lookup** surface; desktop is a **manipulate-and-explore** surface. Anything requiring precise continuous control or wide symbolic rendering is desktop-first; anything answering "what does this crystal/cut do?" is mobile-core. Implementation uses pure Tailwind responsive breakpoints (`md:`, `lg:`) — no UA sniffing or `window.innerWidth` render logic. A narrow desktop window collapsing controls is correct behavior — width is the real constraint, not device class. Identical computation, state model, and URLs across viewports.
- **Tab order and default view:** Explorer → Calculator → Simulator → Help. The Explorer is the default landing view — it shows the scope of the app (122 groups by crystal system and type) and invites browsing. The "OPEN IN CALCULATOR" button in the group popup provides the natural flow: browse → pick → analyze → simulate. Returning users who know their group use search directly (works from any tab). The current Calculator-first order with an empty "Select a point group" state is a dead landing page that communicates nothing.
- **Oblique-axis Cartesian convention:** For triclinic and monoclinic systems the crystallographic axes are not orthogonal, but the engine works in an orthonormal Cartesian frame. The app adopts the standard crystal-physics convention (Hausühl 1983, based on IRE 1949; recommended by Matthies & Wenk 2009 for exactly these systems): **Z ⊥ c, Y ⊥ (c × a), X = Y × Z.** Combined with the app's z-unique (Birss) setting this gives: monoclinic → z ∥ c (unique axis), x ∥ a, y ∥ b*; triclinic → z ∥ c, y ∥ b* (⊥ c × a), x = projection of a onto the plane ⊥ c. The set of independent/zero components is convention-independent (verified: the symmetry group commutes with any in-plane rotation for groups 1, −1, 2, m, 2/m), but the numeric component values and simulated polarimetry orientations depend on this choice. This convention must be documented before golden fixtures for these systems are transcribed.

---

## 1. Polar Plot Fix + Numeric Rotation

### 1A. Fix Polar Plot Orientation

**Status:** Done — shipped in v0.2.0 (PR #9)
**Priority:** High — ~3-line change, ship immediately

Currently 0° (x) is on the vertical axis and 90° (y) is horizontal. Swap so that 0° is on the horizontal axis (right) and angles increase anticlockwise (mathematical positive sense).

#### Implementation

The Recharts `RadarChart` currently uses defaults (no explicit `startAngle`/`endAngle`). The fix:

- [x] Set `startAngle` and `endAngle` on the `RadarChart` component to place 0° at the right with angles increasing anticlockwise — verify exact prop values by testing (Recharts docs and actual behavior should be confirmed, not assumed)
- [x] Update `PolarRadiusAxis angle` to match the new 0°-at-right layout (likely `{0}`, currently `{90}`) — confirm by testing
- [x] `RADAR_TICKS` and `formatPolarAngle` remain unchanged — labels (0°=X, 90°=Y) are already correct
- [x] No data changes needed — `useSimulatorState` already uses `Ex=cos(angle)`, `Ey=sin(angle)` which is consistent with the standard convention

#### Convention confirmation

0° = polarizer along lab X, increasing anticlockwise — standard in optics/SHG. The data generation already matches this convention; only the chart rendering is wrong.

### 1B. Rotation Engine + Tests

**Status:** Done — shipped in v0.3.0 (PR #11, #12)
**Priority:** High — this is where the correctness risk lives; ship after 1A

The existing engine (`calculateSHGExpressions`) already accepts arbitrary continuous angles — the restriction to "parallel / 45°" lives solely in the fixed `K_ORIENTATION_PRESETS` buttons, not in the engine. `simulationData`, `expandedFormulas`, and `labFrame` already react to `thetaX`/`thetaY` via `useMemo`, so all downstream computations update automatically.

This piece covers the engine extension (lab-frame user rotations), rotated-path test coverage, and preset cleanup. The UI controls (sliders, mobile layout) ship separately as 1C.

#### Design decisions

- **Reference-surface model:** the crystal has a reference surface whose normal is one crystal axis (the preset). From there the user can **tilt** the surface (rotate the normal away from the beam) and **spin** it about its normal (azimuth). Preset = which crystal axis is the surface normal; tilt = φ_x, φ_y about lab-x, lab-y; azimuth = ψ about the normal = k = lab-z.
- **Rotation frame:** user rotations are applied in the **lab frame** (left-multiplied), decoupled from the preset Euler angles. This avoids the gimbal-lock singularity that the crystal-frame composition `Ry·Rx·Rz` has at tx = 90° (the k||y preset, where φ_y and φ_z collapse onto the same axis). With lab-frame rotations, the three rotation generators are always (x̂, ŷ, ẑ) regardless of the preset — rank 3 everywhere.
- **Eligible presets:** principal axes only (k||x, k||y, k||z) for now. The diagonal presets (k||xy, k||xz, k||yz) are removed as standalone buttons but remain reachable as tilted principal presets (k||xy = k||y + φ_y = −45°; k||xz = k||z + φ_y = −45°; k||yz = k||z + φ_x = 45°) — document this equivalence for reproducibility. The [hkl] surface generalization (Feature 9) would bring diagonals back as first-class orientations; revisit the removal note when that lands.
- **Shared state:** φ_x, φ_y, ψ live in App.tsx, shared between Calculator and Simulator. Rotation state persists silently across view switches — the lab frame info already reflects the current orientation.

#### Safety net: rotated-path test coverage (prerequisite)

The 492 existing tests all run at orientation (0,0) — the rotated code path has zero coverage. Before changing the rotation composition, capture golden references for rotated outputs:

- [x] Add tests for k||x (0, −90) and k||y (90, 0) presets against known results
- [x] Ideally include at least one oblique-angle case from the literature
- [x] These tests become the regression baseline for the engine change

#### Engine extension: lab-frame user rotations

The current engine uses R = Ry(thetaY) · Rx(thetaX), which only covers two rotation axes and has a gimbal-lock singularity at tx = 90° (the k||y preset). All three rotations are physically needed: rotation around k appears redundant with the polarizer sweep for a perfectly aligned crystal, but once the crystal is tilted (any perpendicular φ ≠ 0) the azimuthal orientation around k becomes an independent parameter — it determines which crystal directions lie in the tilt plane.

Separate user rotations from the preset and apply them in the lab frame:

**R = Rz(ψ) · Ry(φ_y) · Rx(φ_x) · R_preset**

where R_preset = Ry(ty) · Rx(tx) aligns the chosen crystal axis with lab-z (k). The principal presets are k||z = (0, 0), k||x = (0, −90), k||y = (90, 0). All existing behavior is unchanged at (φ_x, φ_y, ψ) = (0, 0, 0).

Verified: rank 3 at all presets (no gimbal lock). ψ is the azimuth about lab-z (= k) uniformly for every preset; φ_x, φ_y are tilts about lab-x, lab-y.

Changes required (ordered — signature migration first, then engine extension):

- [x] **1B.0 — Signature migration (behavior-preserving).** Migrate `calculateSHGExpressions` from positional args to an options object (`{ groupName, tensorType, trType, thetaX, thetaY, labFrameDisplayMode }`) *before* adding new parameters. The current 6-positional-arg signature with `labFrameDisplayMode` as a trailing optional is already fragile; adding three more angles to it creates an 8-arg trap. This is an isolated, behavior-preserving refactor guarded by the existing 492 tests — the ideal first commit of 1B.
- [x] **Matrix primitives.** Introduce small, tested `rotX`/`rotY`/`rotZ` + `mat3mul` functions rather than extending the current hand-expanded inline matrix literal (`tensorProjection.ts:256-259`). The new composition `R = Rz(ψ) · Ry(φ_y) · Rx(φ_x) · R_preset` needs real matrix multiplication; hand-expanding a 4-matrix product would be error-prone. The primitives also make `R_preset` trivially swappable for the future `[hkl]` generalization.
- [x] `tensorProjection.ts`: build `R = Rz(ψ) · Ry(φ_y) · Rx(φ_x) · R_preset` using the new primitives
- [x] `App.tsx`: add φ_x, φ_y, ψ state (the lab-frame rotation angles; no `thetaZ` exists currently — these are new state alongside the existing `thetaX`/`thetaY` preset angles)
- [x] `useSimulatorState.ts`: pass user rotation angles through
- [x] `getLabFrameVectors`: update to the same lab-frame composition
- [x] All existing presets: (φ_x, φ_y, ψ) = (0, 0, 0) by default (no behavioral change)
- [x] Architect R_preset to accept arbitrary alignment rotations (near-zero cost — one rotation matrix), so the later [hkl] generalization is a UI/input change, not an engine rewrite

#### Available rotation axes per preset

With R = Rz(ψ) · Ry(φ_y) · Rx(φ_x) · R_preset, the mapping is **preset-independent**: φ_x and φ_y are always lab-frame tilts, ψ is always the azimuth about k (= lab-z). No per-preset axis remapping needed.

| Preset | k aligned to | φ_x | φ_y | ψ (azimuth) |
|--------|-------------|-----|-----|-------------|
| k\|\|z (0, 0) | crystal Z | tilt about lab-x | tilt about lab-y | spin about k (lab-z) |
| k\|\|x (0, −90) | crystal X | tilt about lab-x | tilt about lab-y | spin about k (lab-z) |
| k\|\|y (90, 0) | crystal Y | tilt about lab-x | tilt about lab-y | spin about k (lab-z) |

ψ is redundant with the polarizer sweep only when both tilts are zero — a physical degeneracy identical at every preset, not a parametrization defect.

#### Preset cleanup

- [x] Remove the three diagonal presets (k||xy, k||xz, k||yz) from `K_ORIENTATION_PRESETS` in `MathComponents.tsx`
- [x] Remove any references to diagonal presets throughout the app
- [x] Only k||x, k||y, k||z remain
- [x] Document equivalences (k||xy = k||y + φ_y = −45°, etc.) in help or changelog

#### Implementation

- [x] Build R = Rz(ψ) · Ry(φ_y) · Rx(φ_x) · R_preset for all presets
- [x] Verify rank 3 at each preset (regression test on generator rank)
- [x] Update crystal orientation / lab frame info to reflect rotation

#### Acceptance criteria (1B)

- Rotated-path golden reference tests pass before and after the engine change
- For (φ_x, φ_y, ψ) = (0, 0, 0), output is identical to the current preset result (regression test against the three presets)
- All three presets offer two independent tilt axes (φ_x, φ_y) plus an azimuthal rotation about k (ψ); local rank is 3 at every preset (regression test on the generator rank)
- With multiple axes active, result matches `R = Rz(ψ) · Ry(φ_y) · Rx(φ_x) · R_preset` (sample-point test)
- Diagonal presets are fully removed from the UI

### 1C. Rotation UI + Mobile

**Status:** In review — PR #16 (desktop), PR #17 (mobile)
**Priority:** High

Sliders, numeric inputs, mobile layout, the Calculator interim state, and the Simulator component-list fix. This is where the user-facing rotation experience lives — no engine changes. The component-list and slider improvements are cross-platform (they improve desktop directly) and are prerequisite for a usable mobile layout.

#### Calculator interim state (1B shipped, Feature 2 not yet)

The Calculator does not apply the rotation and shows source terms at the base preset orientation. If a rotation is active in the Simulator, the Calculator displays a small informational note ("rotation active in Simulator"). Rotated numeric coefficients without symbolic context are misleading — the Calculator's value is the exact symbolic form, which arrives with Feature 2.

#### Simulator controls

- [x] Add three sliders per preset (two tilt axes + azimuthal rotation), independently togglable. Ranges: tilts φ_x, φ_y ±90° (hemisphere of normal directions); azimuth ψ ±180° (full rotation about k — only repeats after 360°, any shorter period is group-specific)
- [x] Add coupled numeric input next to each slider for precise values (e.g. exact 45°)
- [x] Add "Reset orientation" button to return to the preset angles (phi = 0)
- [x] Polar plots update live as rotation sliders change
- [x] All three rotation axes can be active simultaneously
- [ ] Mathematical Model section shows numeric formulas for now — symbolic phi comes with Feature 2

#### Component-list layout fix (cross-platform, prerequisite for mobile)

A defect that is not mobile-specific but is worst on mobile: at low-symmetry groups with many independent components (>4–5), the Simulator's left-hand component list grows unbounded and pushes the polar plots out of the viewport. Adjusting a component low in the list (e.g. χ_zxx, χ_zxy) means the plot is no longer visible — the user changes a slider and cannot see the effect.

**Root cause:** each component block renders ~6 line-heights: title row + amplitude (label row + slider row) + phase (label row + slider row) + spacing + divider. The list height scales linearly and the plot column is top-anchored, so the list dictates scroll position and decouples from the (static-height) plot.

**Fix:**

**A — Sticky plot column.** The plot column gets `position: sticky; top: 0` so it stays in view while the component list scrolls. Structural fix for "I can't see the effect." On mobile this becomes the layout flip (plot sticky on top, list below).

- [x] Add `position: sticky; top: 0` to the plot column (desktop: right column stays visible while scrolling the left component list)
- [x] On mobile: plot on top (sticky), scrollable component list below

**B — Condensed component blocks.** Collapse each block from ~6 line-heights to ~3:

```text
χ_xxz                    0.58
[========O===========]        ← Amplitude, full width
▸ Phase                       ← collapsed by default when φ = 0
```

The space saving comes from *collapsing the phase by default*, not from putting two sliders on one line — that keeps each slider at full width and avoids the too-narrow-to-drag problem. Amplitude always occupies a full-width row.

- [x] Collapse phase section by default when φ = 0
- [x] Show phase value in collapsed header when φ ≠ 0 (e.g. `▸ Phase: 90°`) — never hide a non-zero value
- [x] When φ ≠ 0, the value stays surfaced in the header (and the block may default to expanded)

#### Slider behavior (applies to all slider types: amplitude, phase, rotation)

Consistent behavior across amplitude, phase, and the rotation sliders:

- **Soft / continuous** — no hard snapping; arbitrary values (e.g. amplitude 0.58) stay reachable
- **Coupled numeric input** next to each slider for exact values. Slider = coarse, numeric field = exact — so 90° is trivially reachable without snap mechanics. The same pattern specified for the rotation sliders above extends to amplitude and phase
- **Phase slider additionally shows tick marks at 90 / 180 / 270** (visual reference; optional soft-dock near ticks). Amplitude has no ticks (no privileged values)

#### UI placement

Place rotation controls directly below the k-vector preset buttons, in the same "Crystal Orientation" section. Toggle + slider + numeric input on one line per axis. When no rotation is active, the section looks the same as today.

#### Current mobile defects (verified at 375px)

Pre-existing layout problems observed at iPhone X width (375px), independent of the planned 1C layout work. These should be fixed as part of 1C or earlier.

**A — Calculator tab bar: invisible third tab.** The three Calculator tabs ("TENSOR COMPONENTS", "INDUCED RESPONSE", "SOURCE TERMS") exceed 375px. The tab bar has `overflow-x: auto` with `hide-scrollbar` — technically scrollable, but with **zero visual affordance** that a third tab exists. "SOURCE TERMS" is entirely off-screen; a user who doesn't think to swipe will never find it. Affects every group, not just low-symmetry. The planned mobile Calculator redesign (single scroll page, no tabs) eliminates this, but until that ships the current state is a discoverable UX defect.

- [x] Near-term fix: either add a scroll fade/gradient affordance to the tab bar, or abbreviate tab labels on mobile ("Components" / "Induced" / "Source")

**B — Simulator polarimetry tab "ANALYZER" truncates to "ANAL...".** The three polarimetry tabs ("ANISOTROPY", "POLARIZER", "ANALYZER") overflow similarly. Unlike the Calculator tabs, these polarimetry tabs are **not** removed by the planned mobile redesign — they'll still exist after 1C. The truncation is awkward at any symmetry.

- [x] Abbreviate to "Aniso" / "Pol" / "Ana" on mobile, or use icons, or add scroll affordance

**C — Formula overflow on existing numeric formulas.** The induced-response formulas for low-symmetry groups already overflow the viewport — e.g. `P_x = χ_xxx E_x² + 2χ_xxy E_x E_y +` hard-clips at the right edge with the trailing `+` dangling. This is the *current* numeric output, not the future symbolic phi-dependent formulas (Feature 2). The roadmap only flags formula width as a Feature 2 concern, but it exists today for triclinic/monoclinic groups. Acceptable if scrollable with a visible affordance; the current hard-clip with no indication is the problem.

- [x] Add `overflow-x: auto` to formula containers with a visible scroll indicator (gradient fade or scrollbar)

#### Mobile layout

On mobile, controls stack above plots, so adding sliders lengthens the scroll to the plots. The component-list fix (sticky plot + condensed blocks) resolves the structural problem; the additional mobile-specific decisions below shape the information hierarchy.

##### Mobile information hierarchy

A priority order that all mobile layout decisions derive from:

1. **Primary — SHG tensor components.** The core lookup; reachable with no clicks and minimal scroll.
2. **Secondary — induced P / M / Q terms** (induced response). Directly below the components.
3. **Desktop-primary — source terms.** Cut-dependent + wide (Feature 2). Collapsed or behind explicit tap-to-expand on mobile (see Feature 2, "prepare for wide formulas on mobile").
4. **Bonus — coordinate-system definitions, axis conventions, symmetry operations.** Valuable (especially for students), but never in the way. Collapsed, below the result.
5. **Bonus, but popular — the Simulator.** Mirrors the primary measurement. Keep accessible and uncluttered; the component-list fix above (sticky plot, condensed blocks) is all it needs.

##### Calculator on mobile

On mobile the Calculator drops the tab bar. Source terms (the cut-dependent, wide tab) is desktop-primary, leaving components and induced response — both cut-independent crystal-frame quantities — which stack on **one scroll page, components on top**. No tab-switch sits between the user and the primary lookup. (Desktop keeps the three-tab layout.)

The three Calculator tabs split cleanly along cut-dependence, and that split coincides with width: the two cut-independent tabs (components, induced response) are also the narrow ones that fit a phone; the one cut-dependent tab (source terms) is also the wide one.

##### Simulator on mobile

The component-list fix (sticky plot on top, scrollable component list below, condensed blocks, collapsed phase) is the core mobile Simulator treatment. Rotation controls on mobile: k-vector presets only (k||x, k||y, k||z), continuous sliders hidden (desktop-only).

**Compact setup summary (highest-impact mobile change).** The Simulator re-renders the full setup panel (Tensor Classification, Time Reversal, k-vector presets, Lab Frame orientation) that the Calculator already shows. The state is shared in App.tsx — only the UI is duplicated. On desktop the duplication is convenient (no tab-switching to change a preset). On mobile it means the **entire first viewport is setup controls** with zero plots or sliders visible (verified at 375px). Replace the full setup panel with a one-line summary on mobile — e.g. `3m · ED · i-type · k∥z [Change]`. Tapping "Change" either expands the full controls inline or navigates to the Calculator. This eliminates ~800px of vertical space before the first slider or plot, and stacks with the sticky-plot fix rather than competing with it.

- [x] Compact setup summary line on mobile Simulator (group · tensor type · TR symmetry · k-preset), with expand/change affordance
- [x] Collapse Lab Frame orientation info (`x_crys = X_LAB` etc.) on mobile — expert context, not needed for the "glance at a plot" use case; show on tap
- [ ] Deduplicate the polarimetry explanatory note ("The angle shown in the plots represents the polarizer angle. 0° corresponds to the Lab X-axis…") — currently repeated below every plot pair; show once at the bottom or as a ⓘ tooltip on the plot heading

##### Mobile slimming targets (ranked by impact)

- [x] **Compact Simulator setup summary** (see above) — largest single vertical saving on the Simulator page
- [x] **Setup bar — collapse at defaults.** TENSOR CLASSIFICATION (default Electric Dipole) and TIME-REVERSAL SYMMETRY (default i-Type) collapse to a compact indicator on mobile when defaults are active; expand on tap. Both defaults confirmed: Electric Dipole is the standard; i-Type is an acceptable default. Largest vertical saving on the Calculator — keeps components near the top.
- [x] **Classification sidebar — collapsed below result.** Point-group number, crystal system, symmetry type, operations, axis orientation are bonus info (#4 in hierarchy). On mobile they move *below* the components/induced result, inside a collapsed expandable.
- [x] **Tensor Notes — collapse.** The help-pointer notes box becomes a collapsed expandable on mobile.

##### Layout implementation

- [x] Flip mobile layout: plots above controls (sticky plot on top, component list below)
- [ ] Use existing `motion` library for accordion/collapse transitions (no new dependency); respect `prefers-reduced-motion`
- [x] `hidden md:block` for source-term tab on mobile; tab bar itself hidden on mobile (single scroll page)
- [x] Caveat: `hidden md:block` keeps DOM elements mounted; only if a mobile-irrelevant component is genuinely expensive (e.g. heavy KaTeX rendering) consider a breakpoint-gated lazy mount — a point optimization, not an architecture change

#### Acceptance criteria (1C)

- Simulator: phi sliders change the polar plots live without reload
- Calculator shows base-orientation source terms with informational note when rotation is active
- Sticky plot stays visible while scrolling the component list (desktop and mobile)
- Condensed component blocks: phase collapsed at φ = 0, non-zero phase value visible in collapsed header
- Mobile: components + induced response on one scroll page; source terms behind tap-to-expand
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
- [ ] Prepare for wide formulas on mobile: clear scroll affordance or "tap to expand" for long KaTeX expressions. Note: formula overflow already exists for the *current* numeric output in low-symmetry groups (see 1C "Current mobile defects", item C) — Feature 2 makes it worse but the fix should land with or before 1C

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

- [ ] Implement the similarity transform approach: `G' = S · G · S⁻¹` applied to the existing, test-covered generators (not hand-written generator sets — avoids transcription errors and leverages the 492 tests guarding the base generators). For Phase 1, S is the known geometric swap rotation: Rz(30°) for hexagonal, Rz(45°) for tetragonal — derived from the geometry, not an ITC/Litvin lookup. ITC/Litvin is used for *validating* the resulting tensor forms and for Phase 2 classical conventions.
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

### Phase 0: Explorer restructure (per-crystal-system tabs)

The current Explorer is one long scroll of all seven crystal systems stacked vertically (works, but long; the narrow-window layout already stacks Type I/II/III sections cleanly). Restructure into **one tab per crystal system**, each tab containing:

- [ ] The point-group grid for that system (Type I / II / III), as today
- [ ] A crystal-system reference panel: axis-system definition (a-, b-, c-axis labeling, angles, the Cartesian convention from the oblique-axis convention in Standing decisions), reference axes, and the characteristic symmetry. This is the natural home for the oblique-axis convention text (Feature 7) and the cut-preset table from Feature 9 — one canonical place per system rather than scattered tooltips.

Rationale: the per-system info (axis definitions, conventions) is currently homeless — it belongs to a *system*, not a *group*, so a tabbed Explorer gives it a home without cluttering the group popups. Mobile: tabs collapse to a system selector (dropdown or horizontally scrollable tab strip); the existing stacked grid renders below.

### Phase 1: Read-only reference info (enrichment of existing UI)

Uses generators and group data already in the codebase. Symmetry operations are already shown via `OperationsModal`; `AxisOrientationInfo` exists for the calculator. Phase 1 adds generators and a notation panel, reusing existing components rather than duplicating.

#### Crystal system level
- Moved to Phase 0 (per-system reference panel in the tabbed Explorer) — coordinate system info and reference axes now live there, one canonical place per system.

#### Point group level (enriched group popup)

The group popup (currently `OperationsModal`: symmetry operations + "Open in Calculator") is enriched to surface everything derivable for a group from the Birss tables. Target content, with source table per row:

- [ ] Symmetry operations (already shown)
- [ ] Generators display (from existing GENERATORS table; cross-check against `table-3` classical / `table-6` magnetic incl. primed operations)
- [ ] Notation panel: HM (binding) + Shubnikov (always) + Schoenflies (classical groups only) — `table-3` (classical), `table-6` (magnetic, Shubnikov only)
- [ ] i-tensor / c-tensor symbol class — `table-7` (grey groups: i ≡ classical parent, c ≡ 0, per the repo's grey-group note; derive rather than look up)
- [ ] Tensor forms for arbitrary rank/type (rank 0–4, polar/axial) — `table-4a` (symbol-class gateway) → `table-4b`–`4f`; distinct from the Calculator's SHG-specific contracted forms
- [ ] Alternate-setting flag where applicable — `table-7` rows 16/37/71 (parenthesized symbols); ties into Feature 3

The join key between app and tables is the HM string (verified: app's BW symbols match table-6's "International" column exactly). Normalization needed: overbar vs. leading `-`, plus the three parenthesized table-7 symbols.

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

### Point-group selection on mobile

Two existing selection patterns; the mobile question is which carries over:

1. **Search combobox** (header search field): filter tabs (ALL / ORDINARY / GRAY / BLACK & WHITE), HM notation + crystal system per row. This is the **primary mobile entry** — a combobox with filter chips works well on a phone. Caveat: typing HM notation on a phone keyboard (apostrophe for primed, overbar for 1̄) is awkward, so mobile selection should lean on **filter-chips + scroll** rather than exact text entry. The narrow-window layout already works.

2. **Explorer grid** (browse by system + type): the existing narrow-window Explorer already stacks Type I/II/III sections and wraps the group chips cleanly — it works on mobile today. However, the Explorer is being restructured into per-system tabs (Phase 0 above), so the mobile Explorer flow should be derived from that restructure, not the current grid. On mobile the per-system tabs collapse to a system selector (dropdown or horizontally scrollable tab strip) with the stacked grid below.

3. **Group detail popup** (`OperationsModal`): being enriched in Phase 1 above. On mobile this is a full-screen sheet rather than a centered modal; progressive disclosure (expandable detail sections) is the existing acceptance criterion.

**Decision:** search combobox is the primary mobile selection path; the Explorer (mobile) is deferred to follow Phase 0. No new selection mechanism needed — both existing patterns are mobile-viable, one now, one after restructure.

### Notes

- Use progressive disclosure: expandable "Details" sections to avoid clutter
- Phase 1 data sources: existing GENERATORS table in codebase + birss-tables (see join key and normalization notes in Phase 1 above)
- Phase 2 data sources: birss-tables repo (tables 3, 4a–4f, 6, 7)

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

**Status:** Done — shipped in v0.2.0 (PR #10)
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

This is recorded as a standing decision at the top of this document; it must be in place before golden fixtures for these systems are transcribed.

**Provenance caveat for fixtures.** Two monoclinic settings exist — *first/Birss* (C₂ ∥ c, Z ∥ c) and *second/ITC* (C₂ ∥ b, Y ∥ b). The app uses the first (Birss) setting, so fixtures transcribed from Birss (1966) — the primary golden source — match the app's frame directly, with no permutation. Sources written in the ITC/b-unique (second) setting (e.g. Nye 1957) require the first↔second-setting axis permutation (Matthies & Wenk eqs. 1–4, 23) before transcription. Record the source's setting in every triclinic/monoclinic fixture note, and whether a permutation was applied.

### Actions

- [x] **`AxisOrientationInfo` (App.tsx:26–65):** replace the triclinic `return null` with the convention (z ∥ c, y ∥ b*, x = projection of a ⊥ c); add the in-plane x, y anchor to the monoclinic case (x ∥ a, y ∥ b*)
- [x] **HelpPage (coordinate system section):** add the triclinic entry and complete the monoclinic entry to match
- [x] **Simulator explainer (low-symmetry groups):** a short note or tooltip stating that (a) component values and polarimetry orientation are tied to the in-plane convention; (b) different β is represented by changing component values, not by a separate control; (c) birefringence/refraction is not modeled
- [x] **Help entry "Why is there no β control?":** a 3–4 sentence explanation (see draft below)
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

## 8. Desktop Layout Overhaul

**Status:** Planning
**Priority:** Medium — structural UX improvements; defer until after 1C settles (shares layout concerns)

The desktop layout has several structural inefficiencies identified by visual inspection at 1440×900. These are design-level issues, not bugs — the app works, but the information hierarchy and space allocation are suboptimal. The 1C mobile work (sticky plots, condensed blocks, collapsible phase) overlaps here; this section captures the desktop-specific concerns.

### Findings (verified at 1440×900)

#### A — Classification sidebar permanently consumes 1/3 of the viewport

The sidebar (group name, crystal system, symmetry type, operations, axis orientation) takes `lg:col-span-1` of a 3-column grid — ~450px at 1440px width. This information is consumed once and never changes while working with a group. It permanently reduces the main content area to 2/3 width.

- [ ] Replace permanent sidebar with a compact persistent group indicator (e.g. `3m · Trigonal · Non-Centro`) and make the full classification available as an expandable panel. Give the main content the full width.

#### B — Setup controls above the fold on every view

Tensor Classification (ED/MD/EQ) + Time Reversal (i/c) render as two full-width rows of buttons at the top of both the Calculator and Simulator. Combined with k-vector presets and Lab Frame info in the Simulator, the first viewport is entirely controls — no results visible without scrolling. These controls share state via App.tsx but render independently in both views.

- [ ] Unify into a single compact control strip shared across Calculator and Simulator — e.g. `3m · ED · i-type · k∥z` in a persistent bar below the header. Tapping any segment opens inline selectors. This eliminates view-switching duplication and puts results above the fold.

This is the desktop counterpart to the mobile "compact Simulator setup summary" (1C). The difference: on mobile the Simulator inherits from the Calculator; on desktop both views share a single strip. Same principle, same state architecture, different visual treatment.

#### C — Zero-result states are uninformative

When a centrosymmetric group + ED + i-type yields zero SHG, the page shows three large lines: `S_X ∝ P_x = 0`, `S_Y ∝ P_y = 0`, `S_Z ∝ P_z = 0`. No explanation. The centrosymmetric badge is in the sidebar, but the connection to the zero result isn't drawn. Similarly, the Simulator shows "No non-zero components for this configuration" with an empty plot — no guidance on what to try instead.

This is the single most important physical insight for a centrosymmetric group — ED-SHG is forbidden by symmetry — and it's presented as blank space.

- [ ] When all source terms vanish, show a concise inline explanation: *"ED SHG is symmetry-forbidden for centrosymmetric groups"* + quick-action buttons: `Try c-type` / `Try EQ`
- [ ] When the Simulator has no non-zero components, show the same explanation and quick-switch affordance

#### D — No visual hierarchy among section labels

The app uses `text-[10px] uppercase tracking-[0.2em]` for virtually all labels: CLASSIFICATION, TENSOR CLASSIFICATION, TIME-REVERSAL SYMMETRY, CRYSTAL ORIENTATION, INDEPENDENT TENSOR COMPONENTS, SHG INTENSITY POLARIMETRY. They all look identical — same size, weight, and opacity. There's no distinction between primary structural divisions and secondary sublabels. Everything competes equally for attention.

- [ ] Two levels of label treatment: primary section headers get slightly larger or bolder styling; secondary labels stay at 10px. Improves scannability.

#### E — Tab order change: Explorer as default view

**Status:** Done — shipped in v0.2.0 (PR #8)

See Standing decisions: Explorer → Calculator → Simulator → Help. The Explorer replaces the empty "Select a point group" landing page as the default view. Implement as part of this overhaul or independently — it's a one-line change (`useState` default + tab order).

- [x] Change default view from Calculator to Explorer
- [x] Reorder navigation tabs: Explorer → Calculator → Simulator → Help

### Relationship to other features

- **1C (mobile layout):** shares the sticky-plot fix, condensed-block design, and the concept of a compact setup summary. Desktop applies the same principles with wider layout.
- **Feature 3 (settings):** the collapsible sidebar frees space for the setting selector that Feature 3 adds to the Calculator.
- **Feature 5 (Explorer enrichment):** the Explorer-as-landing-page decision makes the Phase 0 restructure (per-system tabs) higher value — the landing page becomes the tabbed Explorer.

### Sequencing

The tab-order change (E) and zero-result states (C) can ship independently at any time. The layout changes (A, B) are larger and should land after 1C to avoid conflicting layout work. Label hierarchy (D) is cosmetic and can land with the color tokens (Feature 4) or independently.

---

## 9. [hkl] Surface Orientation

**Status:** Planning
**Priority:** Medium — depends on Feature 1B (reference-surface model + R_preset architecture); can ship after 1B independently of Features 2 and 3
**Depends on:** Feature 1B (R_preset must accept arbitrary alignment rotations)

The reference-surface model (Feature 1B) generalizes cleanly: "align a crystal axis to k, then tilt/spin" becomes "align [hkl] to k, then tilt/spin." Only R_preset changes (from a principal-axis alignment to a general alignment rotation); the engine already accepts arbitrary rotations. Feature 1B explicitly architects R_preset for this: "near-zero cost — one rotation matrix, so the later [hkl] generalization is a UI/input change, not an engine rewrite."

### Phase 1: curated cut presets

Crystallographically-labeled principal-axis presets that answer the common use case "which components are excitable for my sample cut?" Derived from the app's Cartesian frame (x ∥ a, y = lab-frame perpendicular, z ∥ c):

| System | [001] | x | y | [110] | [111] |
|---|---|---|---|---|---|
| Cubic | ✓ | [100] | [010] | ✓ | ✓ |
| Tetragonal | ✓ | [100] | [010] | ✓ | — |
| Orthorhombic | ✓ | [100] | [010] | — | — |
| Hexagonal / Trigonal | ✓ | [100] | [1̄20] | — | — |
| Monoclinic | ✓ | [100] | [010] (∥ b) | — | — |
| Triclinic | ✓ | [100] | [010] (∥ b\*) | — | — |

Preset rules:
- [001] = default cut, parallel to the principal symmetry axis
- x and y = lattice directions (see consistency rule above)
- [110] = diagonal ⊥ [001], **only** cubic + tetragonal (in orthorhombic a ≠ b, so [110] is not symmetry-distinguished)
- [111] = cubic only

- [ ] Add crystallographically-labeled cut presets to `K_ORIENTATION_PRESETS` (or a new curated-preset list), replacing the abstract k∥x / k∥y / k∥z labels with [100] / [010] / [001] per system
- [ ] Add [110] preset for cubic and tetragonal systems
- [ ] Add [111] preset for cubic systems
- [ ] On mobile: curated presets are the primary orientation control (continuous sliders hidden per 1C mobile spec)

### Phase 2: free Miller-index [hkl] input

- [ ] Miller-index input field ([h k l]) alongside curated presets
- [ ] Compute R_preset from arbitrary [hkl] → lab-z alignment rotation
- [ ] Under this model, the removed diagonal presets (k∥xy etc. from 1B) return as first-class [hkl] surface orientations, not slider workarounds

### Azimuth-zero convention (confirmed)

For principal-axis presets ([001], [100], [010]): the surface normal aligns with an app axis, so the azimuth reference is trivial — no convention needed.

For non-principal surfaces ([110], [111], arbitrary [hkl]): the **projection of [001] onto the sample surface** defines azimuth = 0. This depends only on crystallographic directions, not lab geometry, so it is reproducible. This convention was originally noted in the 1B design decisions; it becomes concrete and binding here.

### Scope note

These presets affect only **source terms** and the polarimetry simulation (orientation-dependent quantities). Tensor components and induced response are cut-independent crystal-frame quantities and do not use the presets.

For the hexagonal-manganite domain (mostly c-cut / a-cut = principal axes), the Phase 1 principal-axis presets cover the standard cases. Phase 2 is for non-standard cuts or other material systems.

---

## Ideas / Parking Lot

Space for ideas that aren't yet fleshed out or prioritized. Deferred pending deliberate design decisions.

- **Python code export**: generate a Python snippet of the current source term model (e.g., a `scipy.optimize.curve_fit`-compatible function) so users can directly fit experimental data without manually transcribing tensor expressions. Shares the symbolic core with Feature 2; the remaining work is code generation plus the scipy-compatible scaffolding.
- **Data export**: allow users to export tensor components, raw simulation data (CSV), or plots (SVG/PNG) for research and publication use. SVG export is most valuable for publications.
- **Save/load simulator state**: persist and restore simulator configurations (point group, tensor type, orientation, amplitudes, phases) for complex or iterative workflows. Open design question: file download/upload vs. URL-encoded permalink (makes configurations citable). Schema versioning needed.
- **Circular polarization basis**: source terms expressed in circular basis (E_± = (E_X ± iE_Y)/√2) for experiments with circularly polarized light. Unitary transformation of the existing source term polynomials — straightforward once the symbolic engine (Feature 2) exists.
- **Transmission vs reflection geometry**: distinguish between transmission and reflection SHG geometries. Reflection introduces Fresnel coefficients and refractive indices at ω and 2ω — more complex, may be better as a separate "advanced mode" rather than the default. The current model gives the nonlinear source polarization, which is geometry-agnostic.
- **Voigt notation (d-tensor)**: optional alternative display for χ^(2) tensor components using contracted Voigt notation. The SHG tensor χ^(2)_ijk is symmetric in (j,k); Voigt contracts the pair to a single index (xx→1, yy→2, zz→3, yz→4, xz→5, xy→6), giving a 3×6 matrix d_iα. This is the standard notation in nonlinear optics textbooks (Boyd, Shen) and materials databases. Pure display change — the engine already computes the full tensor; Voigt is a trivial index mapping. Open decisions: (1) whether to include the factor ½ (d = ½χ^(2), Boyd convention) or not; (2) display as a 3×6 matrix grid or as a component list (d₃₁, d₃₃, …); (3) whether to extend to rank-4 EQ tensors (Voigt contracts the last two indices, giving 9×6). Could be a toggle on the Components tab alongside the existing full-index display.
- **Accessibility pass**: focus states for preset/toggle buttons, `aria-label`s for lucide icons, keyboard operation of sliders. Currently absent.
- **PWA enhancement**: the app is already installable via `vite-plugin-pwa` — a discreet install hint and offline support would benefit lab use without network.
