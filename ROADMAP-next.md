# Roadmap — next cycle (post-v0.7.1)

Execution plan for the next development cycle: **what order, in what waves, with which
gates**. It is the companion to `TODO-next.md`, which holds the detailed per-item
findings (problem, fix, file:line anchors, acceptance, status). This document does
**not** repeat that detail — it references items by their stable IDs (`A#`, `B#`).

The previous `ROADMAP.md` (Features 1–9) is fully shipped across **v0.2.0 – v0.7.1**.
This cycle continues several of those same features at the next level of polish and
correctness; the mapping to the old feature numbers is given in the item index.

**Prerequisites (not items below).** The `services/` split, the golden-fixture suite
(`goldenTensors.fixtures.ts` / `.test.ts`, table-4e-verified + generator-derived),
the rotated-path suite (`rotatedSHG.fixtures.ts` / `.test.ts`), and the per-module
tests are assumed in place. Current version: **v0.7.1**; `CHANGELOG.md [Unreleased]`
is empty (clean start).

---

## Guiding principle (carried from `TODO-next.md`)

Orientation-(in)dependence splits the two analysis views: the **Calculator** owns the
crystal-frame, orientation-free results (tensor form, induced response, and the source
term **frozen at the cut orientation**); the **Simulator** owns the lab-frame,
orientation-dependent results (the **swept** source terms and polarimetry). Group /
tensor type / time-reversal / setting are a **shared group context**. A1, B5/B8,
B2.4, B3/B27 are corollaries of this principle.

---

## Item index

`Status` is carried from `TODO-next.md`. `Old #` maps to the shipped `ROADMAP.md`
feature this continues. `Wave` is the execution slot defined below.

| ID | Title (short) | Status | Old # | Wave |
|----|---------------|--------|-------|------|
| A2 | Tilt axes lab-fixed (rotation composition) | Derivation pending | 1B | **B** |
| B1 | Alternate settings for Type I/II groups | Derivation pending | 3 | **B** |
| A1 | Calculator source terms must be angle-free | Decided (Calc) / open (Sim) | 2 | **D** |
| A3 | Simulator mobile layout broken | Decided | 1C | C/D |
| A4 | "RANK RANK 3" duplicate word | Decided | 8 | **C** |
| B2 | Settings under-surfaced (B2.1–B2.4) | Decided (B2.4 open) | 3/6 | **E** |
| B3 | Simulator shows no group identity | Decided | 5/8 | **D** |
| B4 | Unify Calculator/Simulator visual shell | Decided (1 open) | 8 | **D** |
| B5 | One shared direction/lab-frame component | Decided | 1C/9 | **D** |
| B6 | Compact Simulator sliders | Decided | 1C | C/D |
| B7 | Blickrichtung presets; free [hkl] | Decided (partly shipped) | 9 | **C** |
| B8 | Name the direction selection (normal ∥ k) | Decided | 1C/9 | **D** |
| B9 | Tensor Notes collapse pointless | Decided | 8 | **C** |
| B10 | Slider snapping | Decided | 1C | C/D |
| B11 | Explorer popups: Schoenflies | Decided | 5 | **C** |
| B12 | Explorer popups: link to Simulator | Decided | 5 | **C** |
| B13 | Help Feature-Overview box order | Decided | 6 | **C** |
| B14 | Help reorg into tabs + expand | Decided (large) | 6 | **E** |
| B15 | Explorer as interactive Birss table | Open (scope) | 5 | **E** |
| B16 | Simplify symbolic source-term trig | Recommendation given | 2 | **E** |
| B17 | Disable sliders for single component | Decided | 1C/2 | C/D |
| B18 | Enlarge plots / trim whitespace | Decided | 1C/8 | C/D |
| B19 | Lab-frame panel title / inverse / tooltips | Decided | 7 | **D** |
| B20 | App-wide tooltip / glossary | Decided | 6 | **D** |
| B21 | Same-concept labels worded differently | Decided | 8 | **C** |
| B22 | Help-text content audit | Decided (minor verify) | 6 | **E** |
| B23 | Explorer per-type counts (global vs system) | Decided | 5 | **C** |
| B24 | Calculator empty-panel whitespace | Decided | 8 | **C** |
| B25 | Note / container / emphasis styling | Decided (1 open) | 8 | **D** |
| B26 | Spurious scroll arrows on equation rows | Decided | 8 | **C** |
| B27 | Group info header: optional fields | Open (which fields) | 5/8 | **D** |

---

## Implementation sequence (waves)

Items group into waves by **dependency and risk**. Within a wave, items are
independent and can be worked in parallel or in any order. The safety net comes first
(**P1 before P2** — strengthen fixtures before refactoring). Branch prefixes, merge
methods and SemVer bumps follow `AGENTS.md`, summarised per item.

### Wave A — Safety net (prerequisite; no user-facing change)

Strengthen the fixtures the upcoming correctness work (Waves B/D/E) will lean on,
**before** touching that code.

| Task | Files | Notes |
|---|---|---|
| Human sign-off of the generator-derived `GOLDEN_FIXTURES` vs the **printed Birss tables** | `goldenTensors.fixtures.ts` | currently calibrated against the 6 pre-existing fixtures + Table 4e via `birss-tables`; the generator-derived ones are still `VERIFY`-class |
| Add literature fixtures for the groups Wave B/D/E touch | `goldenTensors.fixtures.ts`, `rotatedSHG.fixtures.ts` | 6′mm′ source terms ↔ **Fröhlich (1999) eq. (3)/(6)/(9)**; one monoclinic + one triclinic form (after the oblique-axis convention is documented — `ROADMAP.md` standing decision) |
| Confirm `rotatedSHG.fixtures` cover the A2 tilt cases | `rotatedSHG.fixtures.ts` | this is the regression net A2 will be checked against |

Gate: `npm run lint && npm run test`. Merge: `chore/` or `test/` branch, local
`--no-ff`. SemVer: none (or fold into the next PATCH). No release on its own.

### Wave B — Unblock correctness (the two pending derivations)

Do not build UI on unsettled correctness. Both are **analysis loops first** (a
self-contained `.mjs` numeric check, the project's established method), fixture green,
**then** code.

| Item | Branch | Method | SemVer | Notes |
|---|---|---|---|---|
| **A2** | `fix/lab-fixed-tilt-axes` | PR (physics) | PATCH | Re-derive/confirm the φ_x, φ_y tilt-axis semantics in `R = Rz(ψ)·Ry(φ_y)·Rx(φ_x)·R_preset` at `tensorProjection.ts:290–292` **and the twin at `:571–573`**; validate against `rotatedSHG.fixtures` + a fresh `.mjs` random-angle / rank-3 / gimbal-lock check. Data-relevant → CHANGELOG data flag. |
| **B1** | `feature/type-i-ii-settings` | PR (physics) | MINOR | Populate the missing settings for **Type I/II** groups. Verified gap: `ALTERNATE_SETTINGS` (`symmetryGroups.ts:310–347`) holds only **Type III** keys (`4'mm'`, `-4'2m'`, `2'2'2`, `m'm'm`, `2'`…); `GROUPS_WITH_FUTURE_SETTINGS` is **empty**. Reconcile the mechanism taxonomy with **B22**/`ROADMAP.md` standing decision (mono = 2 b/c, ortho = 3) before coding; verify by conjugation + golden fixtures. |

Why first: A2 feeds the symbolic/rotation path shared by **A1, B16, B5/B8**; B1 gates
the settings surfacing **B2 / B2.3 / B2.4** and informs **B27** (halving subgroup,
notations).

### Wave C — Quick decided fixes (independent, low-risk; first Claude Code sessions)

Each is a small, self-contained ticket with a clear file:line anchor and an acceptance
check in `TODO-next.md`. Good for grooving the per-item workflow.

| Item | Branch | Method | SemVer |
|---|---|---|---|
| **A4** RANK RANK 3 | `fix/rank-label-duplication` | local | PATCH (output label) |
| **B13** Help box order | `docs/help-overview-order` | local | — |
| **B23** Explorer per-type counts | `fix/explorer-per-system-counts` | PR (visible numbers) | PATCH |
| **B26** scroll arrows on rows | `fix/equation-row-overflow` | local | — |
| **B9** Tensor Notes collapse | `fix/tensor-notes-collapse` | local | — |
| **B24** empty-panel whitespace | `fix/tensor-panel-height` | local | — |
| **B21** label wording consistency | `chore/label-consistency` | local | — |
| **B11 / B12** Explorer popup (Schoenflies + Simulator link) | `feature/explorer-popup-fields` | PR | MINOR |
| **B7** (remainder) preset redundancy + cubic free-input | `fix/cut-presets` | PR (geometry) | PATCH |

Note on **B7**: the 0.7.1 release already restricted free `[hkl]` to cubic and hid it
on mobile, and fixed hex/trig labels to `[120]`. **Remaining**: the cubic/tetragonal
preset redundancy (`PRESETS_BY_SYSTEM` lists symmetry-equivalent `[001]/[100]/[010]`)
and the decision whether to drop the cubic free-input entirely. Scope is smaller than
the `TODO-next.md` B7 text implies — confirm against the current code when picking it
up.

Bundle Wave C into a `v0.7.2` (PATCH-led) or `v0.8.0` release as the mix of
PATCH/MINOR dictates.

### Wave D — Shared architecture along the guiding principle

After A2 settles (shared rotation/symbolic path). Multi-file → PR; MINOR.

Suggested order (each builds on the previous):

1. **A1** — Calculator shows the source term **frozen at the cut** (no free angles).
2. **B5 / B8** — extract **one** shared lab-frame direction component; name it by
   physics ("crystal cut / surface normal ∥ k", naming owned by B8).
3. **B3 / B27** — the shared **group-identity header**, reused in the Simulator and
   enriched (notations, halving subgroup, SHG-allowedness).
4. **B4 / B25 / B20** — the shared **design tokens**: section headers (B4),
   note/container/emphasis components (B25), tooltip/glossary layer (B20).

A3, B6, B10, B17, B18 (Simulator layout/sliders/plots) can ride alongside D or close
out C, as convenient — they share the slider/plot surface.

### Wave E — Feature-sized items (each its own mini-roadmap with acceptance + fixtures)

| Item | Branch | Depends on | SemVer |
|---|---|---|---|
| **B16** symbolic source-term simplification (Feature 2 cont.) | `feature/simplify-source-terms` | A2; identity already verified (`cos²φ_y·[…cos3ψ/sin3ψ]`) | MINOR |
| **B2** settings surfacing (Feature 3 cont., B2.1–B2.4) | `feature/settings-surfacing` | **B1** | MINOR |
| **B14 + B22** Help reorg + content corrections (Feature 6 cont.) | `docs/help-tabs` (+ `fix/` for the physics corrections in B22) | B1 (settings text), A2 (rotation text) | MINOR |
| **B15** Explorer interactive Birss table (Feature 5 cont.) | `feature/birss-table-explorer` | `birss-tables` repo as golden source | MINOR |

### Release cadence

Pre-1.0; merging to `main` does not go live — only a `vX.Y.Z` tag deploys. Suggested:
- **Wave B correctness** lands as its own releases with CHANGELOG **data flags**
  (A2 → PATCH; B1 → MINOR) so old results stay interpretable.
- **Wave C** bundles into one PATCH-led release (`v0.7.2` / `v0.8.0`).
- **Wave D / E** release per major item, as the old roadmap did for Wave 4.

### Dependency graph (simplified)

```text
Wave A:  golden + rotatedSHG fixtures  ── prerequisite for ──►  B, D, E (correctness)

Wave B:  A2 (rotation)  ── feeds ──►  A1, B16, B5/B8   (shared rotation/symbolic path)
         B1 (settings)  ── gates ──►  B2 / B2.3 / B2.4 ;  informs B27

Wave C:  A4  B13  B23  B26  B9  B24  B21  B11/B12  B7(remainder)   (independent)

Wave D:  A1 ─► B5/B8 ─► B3/B27 ─► B4/B25/B20            (after A2)
         (A3, B6, B10, B17, B18 ride alongside)

Wave E:  B16 ◄ A2 / Feature-2     B2 ◄ B1
         B14+B22 ◄ B1, A2         B15 ◄ birss-tables repo
```

---

## Standing decisions

Carried from `ROADMAP.md` (still binding): pre-1.0 / no backwards-compat promise;
`birss-tables` integration via submodule/pinned hash + typed-JSON build + CI row-count
assertion; **setting counts** (geometric vs user-facing; monoclinic = 2 b/c,
orthorhombic = 3, all standard); mobile = read-and-lookup / desktop =
manipulate-and-explore, responsive breakpoints only; tab order
Explorer → Calculator → Simulator → Help; oblique-axis Cartesian convention
(Hausühl 1983 / IRE 1949: Z ∥ c, Y ∥ (c×a), X = Y×Z) — document before transcribing
triclinic/monoclinic fixtures.

New this cycle:
- **Orientation-(in)dependence split** (above) is the organising principle for the
  Calculator/Simulator boundary; the Source Terms tab is the frozen-vs-swept hand-off,
  not a contradiction.
- **B1 settings parity:** Type I/II groups get the same alternate settings as their
  Type III counterparts, consistent with the mono = 2 / ortho = 3 standing decision;
  the mechanism naming (Mechanism A/B vs the Help's labels) must be reconciled (B22)
  **before** coding B1/B2.
- **Data-output corrections** (A2, B1, A1, B16, B23, B7-geometry) take a CHANGELOG
  **data flag** (what was wrong, from which version); UI-only items do not.

## Per-item contract (applies to every wave item)

- **Branch** per `AGENTS.md` prefix (`feature/ fix/ hotfix/ refactor/ docs/ chore/`).
- **Gate:** `npm run lint && npm run test` green before merge.
- **Merge:** PR for physics/tensor/multi-file changes; local `--no-ff` for chores.
- **CHANGELOG:** add an `[Unreleased]` entry; data-relevant fixes record *what* and
  *from which version*.
- **SemVer:** PATCH = corrected output; MINOR = feature; pre-1.0.
- **Data/math items:** extend the relevant golden / rotated fixture **first** and
  require it green, **then** change the code (anti-circular: fixtures from literature,
  never from app output).
- **Status discipline:** an item tagged *Derivation/verification pending* or *Open
  decision* in `TODO-next.md` gets its decision/derivation resolved (and the tag
  updated) before its implementation branch opens.
