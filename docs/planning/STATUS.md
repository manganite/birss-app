# Roadmap Status

_Last updated: 2026-06-30. Synthesises open points from `ROADMAP-next.md`,
`TODO-next.md`, and the original `ROADMAP.md`. See those files for derivation
details, file:line anchors, and acceptance criteria._

---

## Current release: v0.13.0 (2026-06-30)

Ships: B2 (settings fully surfaced), B14 (Help tabs), B16 + A1-Sim (source-term
simplification), B20 (glossary tooltip layer, 16 terms), B22 (Help audit), B30
(−3′m′ generator data fix). All ROADMAP-next waves through E are complete except
B15 and B29.

---

## 1. Open items — ROADMAP-next

### B15 — Explorer as interactive Birss table
**Status:** Open (scope). The largest remaining Wave E item.

**What it is.** Beyond SHG, make the Explorer a full property-tensor reference: look
up any property tensor up to rank 4 for any magnetic point group, using the Birss
symbol-class systematics (Tables 4a–4f / Table 7). The elegance of the Birss approach
is that 122 groups factor into ~21 classes (A–U), so forms are tabulated once per
class rather than per group.

**Entry points (proposal — two UIs, one engine).**
- Explorer per-group: a "Tensor forms" tab — pick rank + type → symbol class + form.
- New "Tables" section: mirrors the book (A–U classes, Tables 4b–4f) for class-by-
  class navigation, cross-linked to the Explorer.

**Open decisions before coding.**
- Full rank 0–4 × polar/axial × i/c, or curated subset first?
- Expose the symbol class A–U to users?
- Intrinsic index symmetry (Jahn symbol) — selectable, or fixed for now?
- New top-level nav tab vs. Explorer sub-tab vs. both?

**Dependencies.**
- `manganite/birss-tables` repo: the transcribed tables serve as golden fixtures
  (anti-circular: engine-generated output validated against tables, not the reverse).
- The engine already projects onto the symmetry-invariant subspace; verify how
  rank-parametrized the current generator is vs. hardcoded to rank-3 SHG.

**Action items (once scope is decided).**
- Generalize form generator to arbitrary rank ≤4 and type (polar/axial, i/c).
- Reproduce Birss notation (symbol classes A–U, permutation shorthand).
- Wire `birss-tables` transcriptions as golden-fixture validation.
- Cross-link group ↔ symbol class ↔ form.

---

### B29 — Context-sensitive coefficient formatter
**Status:** Idea. Revisit now that B16 (harmonic policy, PR #41) has landed.

**What it is.** Generalise `formatCoeff`/`formatSubstitutedPolySum` to choose
the most readable form per coefficient context: e.g. prefer `2cos²θ − 1` over
`cos(2θ)` in one setting but not another, handle cross-terms, suppress trivial
`1·` prefixes. B28 (recognise 1/√6) covers one concrete case; B29 generalises it.

**Open questions before scoping.** Grouping unit, call sites, tie-breaking rule,
interaction with B16's harmonic-preferred default.

---

## 2. Residual sub-items — from "Done" sections in TODO-next.md

These are `[ ]` items within sections marked **Status: Done**. The section shipped
"enough to merge" but not every action item was checked off. Items below are
genuinely deferred, not done-but-unchecked (marked accordingly where uncertain).

### Verification / fixtures (B1)
- Confirm the Mechanism-2 setting set against local ITC Vol. A copy.
- Extend settings machinery (`S·G·S⁻¹`) to cover the remaining colorless and grey
  multi-setting groups (Type I/II).
- Add principal-axis rotation transforms (45° about z for `−42m↔−4m2`;
  30° for hexagonal pairs).
- Transcribe golden fixtures for at least one colorless and one grey alternate-setting
  group to pin the tensor form.

### k-direction presets (B7)
- Orthorhombic → cubic preset cleanup: replace symmetry-equivalent `[001]/[100]/[010]`
  triples with a canonical crystallographic labeling per system.
- Label presets with standard Miller indices (e.g. `[1̄20]` for the hexagonal
  in-plane direction, `b*` for monoclinic).
- Triclinic / monoclinic: document what the current conventional-axis presets mean
  in terms of the Hausühl Cartesian convention (x ∥ a, y ∥ b*, z ∥ c) — no new
  controls, just an inline label/tooltip.

### Group-identity header (B27 — lower-priority candidates)
The high-value fields shipped in v0.12.0 (Schoenflies, parent group, halving
subgroup H, SHG consequence, "Open in Explorer"). Remaining lower-priority items:
- Property flags (polar / chiral / centrosymmetric) — requires computing correctly
  for magnetic (i/c) groups, not just the classical parent; add only once verified.
- Independent-component count per multipole (ED/MD/EQ) at a glance.
- Generators as compact alternative to listing all operations.

### Note/callout styling (B25 — deferred unification)
B25 closed by dropping the emphasis chips (v0.12.0) rather than building shared
components. Remaining design-system work:
- One `<Note>` / `<Callout>` component for all inline notes (currently: dashed
  border ALL-CAPS in Calculator, borderless sentence-case in Simulator, grey block
  in MathComponents — three styles).
- One reference-panel style for the grey `bg-ink/5` block used for lab-frame /
  monoclinic notes.
- Document the chosen note / emphasis tokens in a comment or `AGENTS.md`.

### Lab-frame panel (B19 — one deferred item)
- Per-term tooltips / legend for `x_crys / X_LAB / …` and the `k`-relation.
  (B20 added the glossary infrastructure; this is a matter of writing the terms
  and placing a TermInfo icon on each vector label.)

---

## 3. Old roadmap (ROADMAP.md) — open sub-items by feature

Items from the original roadmap (`ROADMAP.md`) that were never fully addressed and
do not appear in ROADMAP-next. Listed by old feature number.

### Feature 2 — Symbolic source terms (partial)
- **Rotation-axis selector in the Calculator** (Source Terms tab): a control to
  choose the active rotation axis was planned as part of Feature 2 but not shipped.
  (The Simulator has sliders; the Calculator currently just shows angle-free terms.)
- **Symbolic crystal-orientation display**: update the AxisOrientationInfo / lab-
  frame panel to show the convention symbolically (z ∥ c, y ∥ b*, x ∥ a) in the
  Calculator and Simulator, not just numeric matrices.

### Feature 5 — Explorer enrichment (Phase 1 and 2 mostly = B15)
The big open items from Feature 5 Phase 1/2 collapse into B15. Additional smaller
items independent of B15:
- **Generators in group popup**: display a compact generator set (from the existing
  `GENERATORS` table) alongside the full operations list in the Explorer popup
  (`OperationsModal`). Cross-check against Birss Table 3 / Table 6.
- **Shubnikov notation**: add the two-colour Shubnikov symbol alongside HM in the
  Explorer group popup (Table 6 for magnetic groups; Table 3 for classical).
- **Mobile group-detail popup**: confirm the `OperationsModal` renders correctly as
  a full-screen sheet on mobile (progressive-disclosure expandables must not break
  at 375px).

### Feature 8 — Desktop layout (items A, B, D)
Three structural desktop layout issues identified at 1440 × 900 that were explicitly
deferred and never shipped:
- **A — Classification sidebar**: still consumes a permanent third of the viewport.
  Proposed: compact persistent group indicator + expandable panel giving full width
  to the main content.
- **B — Setup controls above the fold**: Tensor Classification + Time Reversal render
  as two full-width rows at the top of both Calculator and Simulator before any
  results. Proposed: a single compact control strip shared between the two views.
- **D — Label hierarchy**: almost all labels use the same 10px uppercase style with
  no visual distinction between primary section headers and secondary sublabels.
  Proposed: two levels of label treatment for scannability.

### Feature 9 — [hkl] surface orientation (Phase 2 residual)
- The removed diagonal presets (`k∥xy`, `k∥xz`, `k∥yz` from the Feature 1B cleanup)
  were meant to return as first-class `[hkl]` surface orientations once Phase 2
  shipped. Phase 2 added the free [hkl] input for cubic (v0.7.0), but the diagonal
  presets as canonical named orientations in `K_ORIENTATION_PRESETS` were never
  restored.

### Feature 7 — Oblique-axis convention (provenance note)
- **Golden fixture provenance for triclinic/monoclinic**: when transcribing any
  fixture for these systems, the source's setting (Birss first / ITC b-unique) and
  whether the first↔second-setting axis permutation (Matthies & Wenk eqs. 1–4, 23)
  was applied must be recorded in the fixture note. This is a documentation gate
  that must happen before any triclinic/monoclinic golden fixture is added.

---

## 4. Parking lot — ideas not yet scoped

Carried from `ROADMAP.md § Ideas / Parking Lot`. No commitment or priority order.

| Idea | Notes |
|------|-------|
| **Python export** | Generate a `scipy.optimize.curve_fit`-compatible snippet from the current source-term model. Shares the symbolic core with Feature 2; remaining work is code generation + scaffold. |
| **Data export** | CSV of tensor components / simulation data; SVG/PNG of polar plots. SVG most valuable for publication use. |
| **Save / load simulator state** | Persist and restore (group, tensor type, orientation, amplitudes, phases). Open design question: file download/upload vs. URL-encoded permalink (citable). Schema versioning needed. |
| **Circular polarization basis** | Express source terms in E± = (E_X ± iE_Y)/√2. Unitary transformation of existing symbolic polynomials — straightforward once Feature 2 is complete. |
| **Transmission vs. reflection geometry** | Adds Fresnel coefficients and refractive indices at ω and 2ω. More complex; possible "advanced mode." Current model gives the source polarization, which is geometry-agnostic. |
| **Voigt notation (d-tensor)** | Display χ⁽²⁾_ijk in contracted 3×6 d_iα notation. Pure display change — engine already computes the full tensor. Open decisions: include the factor ½ (Boyd convention)? 3×6 matrix grid or component list? Extend to rank-4 EQ? |
| **Accessibility pass** | Focus states for preset/toggle buttons; `aria-label`s for lucide icons; keyboard operation of sliders. Currently absent. |
| **PWA enhancement** | App is already installable via `vite-plugin-pwa`. A discreet install prompt and explicit offline support would benefit lab use without network. |

---

## 5. Standing decisions (still binding)

Carried from `ROADMAP.md` and `ROADMAP-next.md`. These constrain future work.

- **Pre-1.0 / no backwards-compatibility promise.** SemVer: MINOR for features +
  data corrections; PATCH for display-only fixes. Data-affecting changes take a
  CHANGELOG data flag.
- **`birss-tables` integration:** submodule or pinned commit hash; build step to
  typed JSON; CI row-count assertion. B15 depends on this.
- **Setting counts:** geometric vs. user-facing; monoclinic = 2 (b/c; a-unique not
  standard); orthorhombic = 3. Max 3, never 4.
- **Mobile / desktop split:** mobile = read-and-lookup; desktop = manipulate-and-
  explore. Pure Tailwind responsive breakpoints; no UA sniffing.
- **Tab order:** Explorer → Calculator → Simulator → Help.
- **Oblique-axis Cartesian convention:** Z ∥ c, Y ∥ (c×a), X = Y×Z (Hausühl 1983 /
  IRE 1949). App uses Birss setting (monoclinic z-unique). Must be documented in
  every triclinic/monoclinic fixture note before the fixture is transcribed.
- **Orientation-(in)dependence split:** Calculator owns crystal-frame, angle-free
  results; Simulator owns lab-frame, orientation-dependent results. Source Terms tab
  is the frozen-vs-swept handoff.
- **Anti-circular fixtures:** golden fixtures come from literature; never from app
  output. For any data/math item, extend the relevant fixture first and require it
  green, then change the code.
