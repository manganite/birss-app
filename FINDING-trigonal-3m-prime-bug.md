# Finding: `-3'm'` generator bug (and a likely-wrong canonical Cr₂O₃ fixture)

**Status:** Fixed and committed (`fix/trigonal-3m-prime-pattern`, commit `d17671c`).
Cross-checked against four independent sources (Birss table-6/7, the printed ITC
trigonal listing, an independent group-theoretic re-derivation against the original
Birss 1962 source — see `verification-trigonal-magnetic-groups.md` — and, after the
fix landed, the actual Fiebig et al. 2005 paper the canonical fixture cites as its
source, which gives the corrected form verbatim — see §8). It surfaced as a side
effect of deriving B2.3's alternate-setting button labels (`feature/settings-surfacing`,
paused).

---

## 1. How this was found

While deriving correct alternate-setting display labels for the Type III (magnetic)
trigonal groups (`WORKORDER-close-open-items.md` Batch 1, item B2.3), I dumped the
full computed symmetry-operation list for every Mechanism-A/B alternate-setting group
via the app's own `getSymmetryOperations(groupName, setting)` (`symmetryGroups.ts`).
For two of the eleven "Mechanism A" trigonal/hexagonal entries, `-3'm` and `-3'm'`,
the dumped operation lists were **byte-identical** at both setting 1 and setting 2:

```
=== -3'm ===
setting1: 1, -1', 2_150°', 2_30°', 2_y', 3_z⁺, 3_z⁻, -3_z⁺', -3_z⁻', m_150°, m_30°, m_y
setting2: 1, -1', 2_120°', 2_60°', 2_x', 3_z⁺, 3_z⁻, -3_z⁺', -3_z⁻', m_120°, m_60°, m_x

=== -3'm' ===
setting1: 1, -1', 2_150°', 2_30°', 2_y', 3_z⁺, 3_z⁻, -3_z⁺', -3_z⁻', m_150°, m_30°, m_y
setting2: 1, -1', 2_120°', 2_60°', 2_x', 3_z⁺, 3_z⁻, -3_z⁺', -3_z⁻', m_120°, m_60°, m_x
```

Two differently-named magnetic point groups should never compute to the literal same
set of (rotation, time-reversal) pairs. That ruled out "just give them different
button labels" and pointed to a data bug in the generators.

---

## 2. Why they collide: the generator algebra

`src/services/symmetryGroups.ts:211-212`:

```ts
"-3'm'": [getRotationZ(120), multiply(getRotationY(180), timeReversal), multiply(inversion, timeReversal)],
"-3'm":  [getRotationZ(120), { m: [[1, 0, 0], [0, -1, 0], [0, 0, 1]] },  multiply(inversion, timeReversal)],
```

- `"-3'm"` generator 2 is the plain matrix `diag(1,-1,1)` — a mirror `m_y`, **unprimed**
  (ε = +1, no `timeReversal` factor).
- `"-3'm'"` generator 2 is `Ry(180)·timeReversal` — a 2-fold `C2_y`, **primed**
  (ε = −1).

The spatial matrices are related by a fixed identity: `m_y = inversion · C2_y` (since
`diag(1,-1,1) = diag(-1,-1,-1) · diag(-1,1,-1)`). Time-reversal flags multiply like
signs under group closure. Both groups also carry generator 3 = `inversion · TR`
(ε = −1):

- Closing `"-3'm"`'s generators: `m_y(ε=+1) · inversion(ε=−1) → C2_y` with
  ε = (+1)(−1) = **−1** — i.e. the closure of `"-3'm"` necessarily contains
  `C2_y` primed, exactly `"-3'm'"`'s own stated generator.
- Closing `"-3'm'"`'s generators: `C2_y(ε=−1) · inversion(ε=−1) → m_y` with
  ε = (−1)(−1) = **+1** — i.e. the closure of `"-3'm'"` necessarily contains
  `m_y` unprimed, exactly `"-3'm"`'s own stated generator.

Both presentations close to the same 12-element set: `{m_y unprimed, C2_y primed,
inversion primed, 3-fold unprimed, ...}`. This is confirmed independently by the
project's own golden fixtures (`goldenTensors.fixtures.ts:596-605`), which assert
**byte-identical** `expected` arrays and `source` notes for `"-3'm"` and `"-3'm'"` at
`setting: 2` — apparently without anyone noticing the duplication was suspicious.

---

## 3. Cross-check #1 — Birss `table-6.md` (manganite/birss-tables)

Source: [`manganite/birss-tables/table-6.md`](https://github.com/manganite/birss-tables/blob/master/table-6.md),
lines 82-83 (Trigonal section):

```
| Trigonal | -3'm' | -6'.m' | 32 | 3:2 | 1, 3(2⊥), ±3_z, -1', 3(-2'⊥), ±-3'_z | σ(2), σ(6) | σ'(1) |
| Trigonal | -3'm  | -6'.m  | 3m | 3.m | 1, ±3_z, 3(-2⊥), -1', 3(2'⊥), ±-3'_z | σ(4), σ(6) | σ'(1) |
```

Reading the "Symmetry operators of group M" column (5th):

- **`-3'm'`**: unprimed = `{1, 3(2⊥), ±3_z}` = the **2-folds are unprimed**;
  primed = `{-1', 3(-2'⊥), ±-3'_z}` = the **mirrors are primed**. Halving
  subgroup (column "Shubnikov-classical-subgroup", 4th column) = **`32`**.
- **`-3'm`**: unprimed = `{1, ±3_z, 3(-2⊥)}` = the **mirrors are unprimed**;
  primed = `{-1', 3(2'⊥), ±-3'_z}` = the **2-folds are primed**. Halving
  subgroup = **`3m`**.

This matches the app's `"-3'm"` exactly (mirror unprimed, 2-fold primed → halving
subgroup `3m`) — **no bug there**. It contradicts the app's `"-3'm'"`, which currently
has the 2-fold **primed** and the mirror **unprimed** — the reverse of row 82, and
identical to row 83's pattern instead.

`table-6.md`'s own changelog (lines 142-145) flags this exact family as historically
error-prone: *"Trigonal (65-75): corrected classical-subgroup Shubnikov symbols and
operator primes for the `-3'`, `-3m'`, `-3'm'`, `-3'm` rows."* — i.e. birss-tables
itself had to fix transcription errors in this same family during its own authoring,
consistent with an analogous slip surviving into this app's hand-typed `GENERATORS`.

Also cross-checked Birss `table-7.md` lines 81-83 ("Associated classical group A"
column, Trigonal section):

```
| Trigonal | -3m'  | -3m | 3m  | ... |
| Trigonal | -3'm' | 32  | -3m | ... |
| Trigonal | -3'm  | 3m  | -3m | ... |
```

Consistent with the table-6 reading: `-3'm'` → `32`, `-3'm` → `3m`.

---

## 4. Cross-check #2 — printed ITC table (user-supplied screenshot)

Thomas supplied a screenshot of the printed International Tables for Crystallography
trigonal magnetic point-group listing (Shubnikov/Schoenflies notation). The relevant
two rows:

```
D₃d(D₃)   | 6̄_·m  | -3'm' | -3'(2/m')1   | 1, 3(2⊥), ±3z, 1̄', 3(m'⊥), ±3̄z'
D₃d(C₃v)  | 6̄_·m  | -3'm  | -3'(2'/m)1   | 1, 3(m⊥), ±3z, 1̄', 3(2'⊥), ±3̄z'
```

Independently confirms the identical split: `-3'm'` (`D₃d(D₃)`, i.e. derived from
unitary subgroup `D₃` = `32`) has unprimed `3(2⊥)` and primed `3(m'⊥)`; `-3'm`
(`D₃d(C₃v)`, unitary subgroup `C₃v` = `3m`) has unprimed `3(m⊥)` and primed `3(2'⊥)`.
Two independent literature sources (Birss's own table and the printed ITC table) agree
exactly. No remaining doubt about the diagnosis itself.

---

## 5. Cross-check #3 — axis convention (ruling out a Birss/ITC mismatch explanation)

Thomas raised the possibility that the apparent bug is actually a Birss-vs-ITC axis
labelling artifact (Birss fixes the secondary HM-symbol position to the **y** axis;
ITC settings can differ on this). Checked
[`conventions-reference.md`](https://github.com/manganite/birss-tables/blob/master/conventions-reference.md),
lines 94-99:

> "Tetragonal, Trigonal, Hexagonal (one to three symbols): positions refer to z
> (primary), y (secondary), diagonal (tertiary)... The second symbol in the HM name
> therefore always refers to y for tetragonal, trigonal, and hexagonal groups."

The app's existing (and correct) `"-3'm"` generator already uses a **y**-axis mirror
(`diag(1,-1,1)`), matching this convention. My proposed fix for `"-3'm'"` likewise
uses a **y**-axis 2-fold (`getRotationY(180)`) — same axis, same convention, no x/y
relabelling involved. The bug is a prime-pattern swap (which operation TYPE carries
time-reversal), not an axis-labelling artifact — the y-axis convention note doesn't
change the diagnosis.

---

## 6. Diagnosis and proposed fix

**Bug location:** `src/services/symmetryGroups.ts:211`.

**Current (wrong):**
```ts
"-3'm'": [getRotationZ(120), multiply(getRotationY(180), timeReversal), multiply(inversion, timeReversal)],
```

**Proposed fix** (2-fold unprimed, inversion stays primed, mirror comes out primed
under closure — matching Table 6 row 82 / ITC `D₃d(D₃)`):
```ts
"-3'm'": [getRotationZ(120), getRotationY(180), multiply(inversion, timeReversal)],
```

This changes `"-3'm'"`'s halving (unitary) subgroup from the current (wrong) `3m` to
the correct `32`, making it genuinely distinct from `"-3'm"` (halving subgroup `3m`,
unaffected, no change needed there). Verified no collision with the third sibling,
`"-3m'"` (`:213`), which already matches Table 6 row 81 (`-6.m'`, halving subgroup
`-3`) — that entry is correct as-is.

---

## 7. Downstream implication: the canonical Cr₂O₃ fixture is built on the same wrong premise

This is the part that needs sign-off before touching any code.

`goldenTensors.fixtures.ts:38-56` — the **base-setting** (`setting: 1`, i.e. no
alternate-setting transform) `"-3'm'"` fixture — is explicitly commented as
*"The canonical magnetic-SHG group: Cr2O3 below T_N is -3'm' and this c-type ED
tensor is the textbook magnetoelectric SHG source term (Fiebig et al., JOSA B 22, 96
(2005))."* Its derivation comment states:

> "Cross-check: -3'm' = H ∪ theta\*i\*H with unitary subgroup **H = 3m**, and for
> c-type ED this decomposition predicts -3'm'(ED,c) = 3m(ED,i) — the relation above
> is exactly the 3m i-type ED form."

That derivation explicitly assumes **H = 3m** — the same wrong halving subgroup
diagnosed in §2-§4. With the corrected **H = 32** (§3-§4), the standard magnetic-group
identity `T_c(G) = T_i(H)` (a c-type tensor of G is constrained exactly like an
i-type tensor of G's unitary subgroup H, since c-type tensors must be invariant under
H by definition and flip sign under the primed coset) instead predicts:

```
-3'm'(ED,c) = 32(ED,i)
```

**Birss Table 4a** (`table-4a.md`, Trigonal section):
```
| Trigonal | 32 | 3//z, 2//y | L_m | L_m | L_n | L_n |
| Trigonal | 3m | 3//z, -2//y | L_m | M_m | M_n | L_n |
```
`32`'s i-tensor polar-odd-rank (n=3, i.e. ED) class is **`L_n`**; `3m`'s is **`M_n`** —
structurally different symbol classes.

**Birss Table 4e** (`table-4e.md`), rows L3 and M3:
```
| L3 | 0   | yyy | 0   | -yyy | 0    | 0   | 0   | 0   | 0   | xyz | xzy | zxy | -xyz | -xzy | -zxy |
| M3 | xxx | 0   | zzz | 0    | -xxx | xxz | xxz | 0   | 0   | 0   | 0   | 0   | 0    | 0    | 0    |
```

- **L₃ (correct, H=32):** independent parameters `χ_yyy` (with
  `χ_xxy = χ_xyx = χ_yxx = -χ_yyy`) and the `χ_xyz` family
  (`χ_xyz = χ_xzy = χ_zxy`, `χ_yxz = χ_yzx = χ_zyx = -(those)`). **`χ_zzz` is
  identically zero.**
- **M₃ (current, wrong):** independent parameters `χ_xxx` family, `χ_zzz`
  (nonzero), `χ_xxz` family. **No `χ_xyz`-family component at all.**

These are structurally different tensors — not a relabeling, a different physical
prediction (e.g. M₃ predicts a nonzero `χ_zzz` magnetoelectric SHG component for
Cr₂O₃; L₃ predicts `χ_zzz = 0`).

This also happens to match my own (unverified-by-citation, but reasonably confident)
recollection of the actual Cr₂O₃ magnetoelectric SHG literature form (Fiebig/
Fröhlich/Pisarev-type results), usually quoted as a 2-parameter `xxx`-type +
`xyz`-type form with no `zzz` term — consistent with L₃, not M₃. I have **not**
independently re-derived this from a primary Cr₂O₃-specific paper; this note is
informed recollection, not a citation I've re-verified word-for-word in this session.

**Existing corroboration already in the same file:** the adjacent `"-3'm'"` MD,i
fixture (`goldenTensors.fixtures.ts:57-72`) already uses the *correct* H=32 relation
on the axial branch — its own comment says *"axial i-tensors of -3m equal polar
i-tensors of its proper rotation subgroup 32"* and gives the expected form as
`χ_xxy=χ_xyx=χ_yxx=-χ_yyy` / `χ_xyz=χ_xzy=-χ_yxz=-χ_yzx` — i.e. the **L₃ form**,
written out in the file already, just attached to the wrong (MD/axial) tensor branch
rather than also being applied to the ED/c-type branch at lines 38-56. This is the
strongest internal evidence: the correct form is already present in this file, the
bug is that it isn't also used where the H=3m assumption was applied instead.

---

## 8. Resolution

1. **Generator fix** (§6) — implemented exactly as proposed
   (`symmetryGroups.ts:211`, commit `d17671c`).
2. **Canonical Cr₂O₃ fixture correction** (§7) — implemented. The precise component
   relations were independently re-derived from scratch (a standalone group-average
   projector script, built from the literal Table 6 operator list, mirroring the
   app's own jk-presymmetrized tensor convention read out of `tensorProjection.ts`
   — not assumed from Table 4e's columns alone), resolving the `χ_zxy`/`χ_zyx`
   ambiguity flagged below: those come out identically **zero** under the app's
   actual convention, leaving exactly the 2-parameter form. **Independently
   confirmed against the primary source**: Thomas supplied the actual Fiebig et al.
   (2005) JOSA B paper (the same paper the fixture's `note` field already cited).
   Section 4.A.3 (p. 100) states the result verbatim, citing Birss as its source:
   *"This leads to two independent components each for MD SHG and ED SHG which are
   given by χ^m(i) ≡ χ_yyy = −χ_yxx = −χ_xyx = −χ_xxy, χ_xyz = χ_xzy = −χ_yxz =
   −χ_yzx and χ^e(c) ≡ χ_yyy = −χ_yxx = −χ_xyx = −χ_xxy, χ_xyz = χ_xzy = −χ_yxz =
   −χ_yzx, respectively."* — an exact match, sign for sign, to the corrected
   fixture, and a direct contradiction of the old (wrong) M₃ form. This closes the
   loop the work order had flagged as a separate, non-blocking follow-up.
   The `rotatedSHG.fixtures.ts` R6 fixture (k‖x, downstream of the same crystal
   tensor) also needed updating — caught by the full `vitest run` gate, not
   anticipated by the original work order; corrected the same way (hand-derived
   the lab-frame substitution, then matched against the computed output rather
   than copying it blind).
3. **Scope check** (still open, not blocking): are there other groups in the same
   "Mechanism A, trigonal/hexagonal" family that should be re-verified the same way,
   given this family was independently flagged as error-prone in birss-tables' own
   changelog? (`-3m'`, `-6'2m'`, `-6'm2'`, `-6m'2'` were spot-checked against their
   own Table 6 rows during this session and appear consistent — only `-3'm'` showed
   a mismatch.) Left for a separate session per the work order's §6.

## References

- `manganite/birss-tables` — [`table-6.md`](https://github.com/manganite/birss-tables/blob/master/table-6.md)
  (magnetic point groups, generators, Shubnikov symbols), lines 75-90, 142-148.
- `manganite/birss-tables` — [`table-7.md`](https://github.com/manganite/birss-tables/blob/master/table-7.md)
  (associated classical groups A/B, i-/c-tensor symbol classes), lines 73-83.
- `manganite/birss-tables` — [`table-4a.md`](https://github.com/manganite/birss-tables/blob/master/table-4a.md)
  (point group → tensor symbol class mapping), trigonal section.
- `manganite/birss-tables` — [`table-4e.md`](https://github.com/manganite/birss-tables/blob/master/table-4e.md)
  (rank-3 tensor symbol class → independent component list), rows L3, M3.
- `manganite/birss-tables` — [`conventions-reference.md`](https://github.com/manganite/birss-tables/blob/master/conventions-reference.md),
  lines 94-99 (HM-symbol-position-to-axis convention).
- International Tables for Crystallography, trigonal magnetic point-group listing
  (printed table, supplied by Thomas as a screenshot in-session; not re-fetched from
  a URL).
- Fiebig, M., Pavlov, V. V., Pisarev, R. V., *Second-harmonic generation as a tool
  for studying electronic and magnetic structures of crystals: review*, J. Opt. Soc.
  Am. B **22**, 96 (2005) — supplied by Thomas as a PDF (`2005JOSA-96.pdf`) and
  independently re-read in this session; Section 4.A.3 (p. 100) gives the c-type ED
  SHG tensor of Cr2O3's magnetic point group `3̄m` (= `-3'm'`) verbatim, citing
  Birss (their ref. 50) as the source, confirming the corrected (L3) fixture form
  exactly. (Note: the FINDING's original citation conflated this review with the
  1994 PRL it cites as ref. 46, Fiebig/Fröhlich/Krichevtsov/Pisarev, *Second harmonic
  generation and magnetic-dipole-electric-dipole interference in antiferromagnetic
  Cr2O3*, Phys. Rev. Lett. 73, 2127 — a different, earlier paper by an overlapping
  author list; the JOSA B 22, 96 review is the one actually cited by this app's
  fixture and the one Thomas supplied.)
- This repo: `src/services/symmetryGroups.ts:211` (generator fix),
  `src/services/goldenTensors.fixtures.ts:38-56, 607-611` (corrected fixtures),
  `src/services/rotatedSHG.fixtures.ts` R6 (corrected rotated-frame fixture),
  commit `d17671c`.
