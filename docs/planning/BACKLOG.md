# Backlog — the idea inventory

> **Content:** Every deferred idea, residual sub-item and unscoped proposal, in one place.
> **Status:** living
> **Authority:** authoritative for the idea inventory. Not a commitment or a priority order.

Nothing here is scheduled. `STATUS.md` section 1 remains the single list of what is actually
**open and in scope**; this file is where everything else waits so that section 1 can stay short.

Entries were **extracted** (moved, not rewritten) from `STATUS.md` sections 2–4 on 2026-07-31,
which in turn had carried them from `docs/planning/TODO-next.md` and `docs/planning/ROADMAP.md`.
Each entry carries its **provenance** (where it came from) and a **status tag**:

| tag | meaning |
|---|---|
| `unscoped` | a plain idea; no design decision pending, just unbuilt |
| `quick-win` | the groundwork exists; the remaining step is small and well understood |
| `needs-design-session` | cannot start without a design or product decision first |
| `gate` | not an idea at all — a rule that binds *when* related work happens |

---

## A. Residual sub-items

*Provenance: `STATUS.md` § 2 (2026-07-31), originally `[ ]` items inside TODO-next sections marked
**Status: Done** — the section shipped "enough to merge" but not every action item was checked off.*

### Verification / fixtures (B1) — `unscoped`

- Confirm the Mechanism-2 setting set against local ITC Vol. A copy.
- Extend settings machinery (`S·G·S⁻¹`) to cover the remaining colorless and grey
  multi-setting groups (Type I/II).
- ~~Add principal-axis rotation transforms (45° about z for `−42m↔−4m2`;
  30° for hexagonal pairs).~~ **Done** — these transforms exist in `ALTERNATE_SETTINGS`
  (the `−42m` family settings ship in the app).
- ~~Transcribe golden fixtures for at least one colorless and one grey alternate-setting
  group to pin the tensor form.~~ **Done** — `goldenTensors.fixtures.ts` carries 63
  `setting: 2` entries across 25 groups, including 16 colorless (e.g. `-42m`, `2/m`,
  `mm2`) and multiple grey groups.

### k-direction presets (B7) — `unscoped`

- Orthorhombic → cubic preset cleanup: replace symmetry-equivalent `[001]/[100]/[010]`
  triples with a canonical crystallographic labeling per system.
- Label presets with standard Miller indices (e.g. `[1̄20]` for the hexagonal
  in-plane direction, `b*` for monoclinic).
- ~~Triclinic / monoclinic: document what the current conventional-axis presets mean
  in terms of the Hausühl Cartesian convention (x ∥ a, y ∥ b*, z ∥ c) — no new
  controls, just an inline label/tooltip.~~ **Done** — delivered by the crystal-cut
  label rework (buttons show [hkl]/Cartesian/crystallographic designations,
  setting-aware for monoclinic) and the axis-orientation tooltips.

### Group-identity header (B27 — lower-priority candidates)

The high-value fields shipped in v0.12.0 (Schoenflies, parent group, halving
subgroup H, SHG consequence, "Open in Explorer"). Remaining lower-priority items:

- ~~Property flags in the header~~ — **SHIPPED 2026-08-01 (B27-S).** Polar, chiral, ferromagnetic
  and magnetoelectric now render as badges under the group identity header.
- Independent-component count per multipole (ED/MD/EQ) at a glance. — `unscoped`
- Generators as compact alternative to listing all operations. — `unscoped`

*Correction, 2026-08-01:* the shipped entry above used to read "the UI surfacing remains open (no
component consumes the service yet)". That was false when written. `OperationsModal.tsx` has
consumed `propertyFlags.ts` since `cd1532a` (2026-07-08); the claim entered `STATUS.md` on
2026-07-16 via `31922ff` — a reconcile-with-shipped-state commit — and the 2026-07-31 extraction
into this file carried it over faithfully, as an extraction should. B27-S was therefore not "no
surfacing" but "surfacing on one page of four". See the B27-S entry in `LEDGER.md`.

### Note/callout styling (B25 — deferred unification) — `needs-design-session`

B25 closed by dropping the emphasis chips (v0.12.0) rather than building shared
components. Remaining design-system work:

- One `<Note>` / `<Callout>` component for all inline notes (currently: dashed
  border ALL-CAPS in Calculator, borderless sentence-case in Simulator, grey block
  in MathComponents — three styles).
- One reference-panel style for the grey `bg-ink/5` block used for lab-frame /
  monoclinic notes.
- Document the chosen note / emphasis tokens in a comment or `AGENTS.md`.

### Orientation scene — `SceneFace.depth` is misnamed (SIM-O residue) — `quick-win`

- The field holds `normal · VIEW_TO_CAMERA`, the cosine between a face's outward normal and the
  line of sight — a **facing** measure, not a depth along the view direction, and a larger value
  does not mean nearer. The doc comment was corrected in the SIM-O series (Copilot finding C2,
  ledger Revision 8); the identifier was left alone because renaming it touches
  `orientationScene.test.ts` and so is a code change, which would have cost a re-review round for a
  nit. Rename to `facing` with its test references when something else takes that file.

### Lab-frame panel (B19 — one deferred item) — `quick-win`

- Per-term tooltips / legend for `x_crys / X_LAB / …` and the `k`-relation.
  (B20 added the glossary infrastructure; this is a matter of writing the terms
  and placing a TermInfo icon on each vector label.)

---

## B. Old-roadmap leftovers

*Provenance: `STATUS.md` § 3 (2026-07-31) — items from the original `docs/planning/ROADMAP.md`
that were never fully addressed and do not appear in ROADMAP-next. Listed by old feature number.*

### Feature 2 — Symbolic source terms (partial) — `unscoped`

- **Rotation-axis selector in the Calculator** (Source Terms tab): a control to
  choose the active rotation axis was planned as part of Feature 2 but not shipped.
  (The Simulator has sliders; the Calculator currently just shows angle-free terms.)
- **Symbolic crystal-orientation display**: update the AxisOrientationInfo / lab-
  frame panel to show the convention symbolically (z ∥ c, y ∥ b*, x ∥ a) in the
  Calculator and Simulator, not just numeric matrices.

### Feature 5 — Explorer enrichment (Phase 1 and 2 mostly = B15)

The big open items from Feature 5 Phase 1/2 collapse into B15. Additional smaller
items independent of B15:

- ~~**Generators in group popup**~~ **Done** — `OperationsModal` renders a
  "Generators (n)" section via `getGeneratorSymbols`.
- ~~**Shubnikov notation**~~ **Done** — `OperationsModal` renders the Shubnikov
  symbol (via the `SHUBNIKOV` map) alongside HM.
- **Mobile group-detail popup — `quick-win`**: confirm the `OperationsModal` renders correctly as
  a full-screen sheet on mobile (progressive-disclosure expandables must not break
  at 375px).

### Feature 8 — Desktop layout (items A, B, D) — `needs-design-session`

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

### Nye diagram side by side with the symbolic form — `needs-design-session`

*Provenance: maintainer, 2026-07-31, recorded while scoping the NYE series (D-placement).*

The dot diagram ships as a **toggle** beside the symbolic representation, v1 everywhere. Showing
both simultaneously on a wide desktop was considered and deliberately kept out of v1, to avoid
entangling it with the parked Feature-8 desktop-layout work — the two would be deciding the same
question about how much horizontal room the Tables results column may claim. Revisit together
with Feature 8, not before.

### Feature 9 — [hkl] surface orientation (Phase 2 residual) — `unscoped`

- The removed diagonal presets (`k∥xy`, `k∥xz`, `k∥yz` from the Feature 1B cleanup)
  were meant to return as first-class `[hkl]` surface orientations once Phase 2
  shipped. Phase 2 added the free [hkl] input for cubic (v0.7.0), but the diagonal
  presets as canonical named orientations in `K_ORIENTATION_PRESETS` were never
  restored.

### Feature 7 — Oblique-axis convention (provenance note) — `gate`

**This is a rule, not an idea.** It binds the next person who transcribes a fixture for these
systems, whenever that happens; it is not work to be scheduled on its own.

- **Golden fixture provenance for triclinic/monoclinic**: when transcribing any
  fixture for these systems, the source's setting (Birss first / ITC b-unique) and
  whether the first↔second-setting axis permutation (Matthies & Wenk eqs. 1–4, 23)
  was applied must be recorded in the fixture note. This is a documentation gate
  that must happen before any triclinic/monoclinic golden fixture is added.

*(The same rule is stated as a standing decision in `STATUS.md` § 5, "Oblique-axis Cartesian
convention". It is repeated here because this is where someone browsing the backlog would
otherwise mistake it for an optional item.)*

---

## C. Unscoped ideas

*Provenance: `STATUS.md` § 4 (2026-07-31), carried there from `ROADMAP.md` § Ideas / Parking Lot.
No commitment or priority order.*

### Export & interoperability bundle — `needs-design-session`

*Bundled 2026-07-31 (maintainer decision): these four were separate parking-lot rows, but they
share one design question — what the app's export surface is, in which formats, and where the
controls live. Scoping any one of them alone would pre-decide the others.*

- **Python export** — Generate a `scipy.optimize.curve_fit`-compatible snippet from the current
  source-term model. Shares the symbolic core with Feature 2; remaining work is code generation +
  scaffold.
- **Data export** — CSV of tensor components / simulation data; SVG/PNG of polar plots. SVG most
  valuable for publication use.
- **LaTeX copy of tensor forms** — Tables Phase-4 item, deprioritized 2026-07-15: copy a displayed
  tensor form as a LaTeX snippet.
- **Save / load simulator state** — Persist and restore (group, tensor type, orientation,
  amplitudes, phases). Open design question: file download/upload vs. URL-encoded permalink
  (citable). Schema versioning needed.

### Classical lookup-chain affordance enrichment — `unscoped`

*Provenance: promoted 2026-07-31 from the T7-BC parking-lot note in `docs/planning/TODO-next.md`
(§ "Tables lookup chain -- T7-BC"). Copied, not moved: that file is frozen, so the original stays
where it is and this is the live copy.*

Bring the classical lookup chain up to the magnetic one's affordance level (group chip / family
class, tensor tag, Table-4a strip, terminal). This is design enrichment rather than a defect — the
classical chain is self-explanatory in a way the Table-7 route is not, which is plausibly why it
grew fewer affordances — and it needs Help-content decisions (there is no Help material behind
several of the candidate targets). Deliberately out of scope for T7-BC; raise with Thomas before
scoping.

*Context from the T7-BC survey: the asymmetry runs the other way from what was assumed. The
Table-7 variant carries `tbl-rotated`, `tbl-crossover` and `tbl-ref-axes`; the classical variant
carries `tbl-ref-axes` alone. So this entry is about raising the classical chain, not the
magnetic one.*

### Circular polarization basis — `unscoped`

Express source terms in E± = (E_X ± iE_Y)/√2. Unitary transformation of existing symbolic
polynomials — straightforward once Feature 2 is complete.

### Transmission vs. reflection geometry — `unscoped`

Adds Fresnel coefficients and refractive indices at ω and 2ω. More complex; possible "advanced
mode." Current model gives the source polarization, which is geometry-agnostic.

### Voigt notation (d-tensor) — `needs-design-session`

Display χ⁽²⁾_ijk in contracted 3×6 d_iα notation. Pure display change — engine already computes
the full tensor. Open decisions: include the factor ½ (Boyd convention)? 3×6 matrix grid or
component list? Extend to rank-4 EQ?

### PWA enhancement — `unscoped`

App is already installable via `vite-plugin-pwa`. A discreet install prompt and explicit offline
support would benefit lab use without network.

### B29 — context-sensitive coefficient formatter — `needs-design-session`

Moved from open items 2026-07-15; needs a relevance/approach decision first. Generalise
`formatCoeff`/`formatSubstitutedPolySum` per-context (e.g. `2cos²θ − 1` vs `cos(2θ)`); B28 covered
the 1/√6 case. Open: grouping unit, call sites, tie-breaking, interaction with B16's harmonic
default.

### Major dependency upgrades — `unscoped`

Run `npm outdated` for the current picture; `npm audit --omit=dev` clean (last checked
2026-07-15). Majors are deliberately deferred: batch and test major-version bumps separately
from routine patch bumps. The repo declares its Node floor in `engines.node` (binding
constraint: jsdom, since T5a).

**Named sub-item — the eslint 9 → 10 migration.** Promoted here from the
`chore(deps)` commit body of 2026-07-31 (`73914b8`), quoted verbatim so the analysis is not lost
in a commit log:

> Remaining: 11 high advisories, all rooted in brace-expansion reachable only through
> minimatch@3 (eslint internals) and filelist (via vite-plugin-pwa -> workbox-build -> ejs
> -> jake). No patched 1.x or 2.x line exists -- GHSA-mh99-v99m-4gvg is fixed only in
> 5.0.8+ -- so clearing them needs an eslint 9 -> 10 migration, which is a toolchain
> project with its own blast radius (eslint 10 unbundles @eslint/js, which eslint.config.js
> imports) and not a dependency bump. Left for a scoped work order. All of it is build-time
> only: dist contains no trace of any flagged package.

*Currency addendum (2026-07-31, not part of the extracted text):* the `--omit=dev` line above
still holds — it was re-checked on 2026-07-31 and is clean. These 11 advisories are
**development-scope only**, GitHub reports **0 open Dependabot alerts**, and they appear only in a
full `npm audit`, which does not filter by scope.

### Move onto the shared core — `needs-design-session`

*Provenance: maintainer decision 2026-11-07, recorded in `STATUS.md` § 5 and in
[manganite/crystallography-common#99](https://github.com/manganite/crystallography-common/issues/99).*

Extract the calculations in `src/services/` (group generation, settings, property flags, tensor
forms and their reference tests) into the shared TypeScript core, then make this app import them
from there. Gated on the core repository existing. First step, before any extraction: an automated
comparison of the 32 crystallographic point groups between this app and
[manganite/stereography](https://github.com/manganite/stereography) (operations, settings, axis
conventions, symbols), so that a convention break shows up before the core is designed. Open
design questions live in the linked issue, not here.

---

## D. External-audit consequences

*Provenance: Codex audit, 2026-07-31. Findings verified on the live tree before the DOCS-TRUTH
work order; the documentation share landed there, and these are the parts that need scoping or a
decision. The `AUDIT 2026-07-31 (Codex)` block in `LEDGER.md` records the verification and the
dispositions.*

### TablesPage presentation-derivation extraction — `unscoped` (R-candidate)

*Provenance: Codex audit 2026-07-31.*

`TablesPage.buildLabels` re-implements concepts that already live in `linalg` and
`tensorProjection`: it runs its own `rref`, picks its own lead component per basis vector, and
composes labels with its own accumulation loop and epsilon (`EPS = 1e-9`, not the shared
`tolerances` value). It works, and it is guarded by the page's tests — but pivot naming and
tolerance handling now have two homes, and if either evolves the view can drift from the engine
without anything going red.

This is the Q0 lesson applied to views: the diagram and the relation list were kept honest by
making them read one shared partition (`reducedPartition`) rather than two derivations. The
matrix-label path is the same shape of risk, one layer up. Extraction into a presentation service
over the existing partition is the obvious move; the sizing question is whether the effect and
rank-1/2 label paths come with it.

### Typed navigation — `quick-win` (R-candidate)

*Provenance: Codex audit 2026-07-31.*

`onNavigate: (view: string, tab?: string) => void` is declared as a plain string across every page
component, and `App.handleNavigate` casts it back into the view union
(`src/App.tsx:82`). The cast is the only thing standing between a typo in a call site and a
silent no-op navigation. Export the view union and type the signature with it; the cast then
disappears rather than being replaced.

### Browser-layer decision — `needs-decision`

*Provenance: Codex audit 2026-07-31, consolidating T-obs (CI lane-splitting) and the jsdom limits
recorded in `App.interaction.test.tsx` and `nyeDiagram.interaction.test.tsx`.*

Two things the current test regime cannot reach, both documented rather than solved:

- **Accessible-name queries are unusable under jsdom** wherever KaTeX MathML is in the tree —
  jsdom does not implement `style` on `MathMLElement`, so `getComputedStyle` throws inside
  accessible-name computation. Every interaction suite works around it by locating controls via
  text or attribute selectors, which means the app's actual accessible names are never asserted.
- **Three unattributed full-suite contention flakes** (2026-07-30/31, recorded in `LEDGER.md`),
  none reproducible in isolation.

T5a declined Playwright, and T-obs parked CI lane-splitting partly because the strongest argument
for it — a test class needing browser binaries — had lapsed with that decision. The concrete
option now on the table: a small Playwright smoke lane over the Tables/Nye surface (toggle,
visible focus ring, horizontal scroll of the wide grids, KaTeX actually rendering), which would
cover exactly the assertions jsdom cannot make and would re-supply the lapsed argument.

**To be decided at the next scoping, not observed again.** The observation is complete; what is
missing is a yes or no.

### Coverage signal — `needs-decision`

*Provenance: Codex audit 2026-07-31.*

Coverage tooling was removed deliberately, not lost: `3e7002d`
(`chore(coverage): remove the broken test:coverage script and @vitest/coverage-v8`) took out a
script that had been broken since the T3/T4 runtime changes, on the reasoning that a broken
command is worse than none. The consequence is that assurance is currently qualitative — the
taxonomy, the reference gates and the audit suites say a great deal about *what* is covered and
nothing about what is *not*.

Decide: reinstate a provider (and accept the runtime cost and the configuration that broke last
time), or state explicitly that this project relies on targeted, provenance-classed assurance and
treats a coverage percentage as the wrong instrument. Either is defensible; the current state is
an unrecorded default rather than a choice.
