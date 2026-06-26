# Discrepancy Report: birss-app vs. birss-tables

Tracks differences found between the app's data/logic and the authoritative transcriptions
in [manganite/birss-tables](https://github.com/manganite/birss-tables).

Each section covers one comparison pass. Items are classified as:
- **Bug** — the app is wrong and should be fixed
- **Notation variant** — equivalent representation, deliberate or benign divergence
- **Open question** — needs further investigation before classifying

---

## Pass 1 — 32 Classical Point Groups (names, crystal systems, symmetry operations)

**Source:** `birss-tables/table-3.md` vs. `src/data/pointGroups.ts` + `src/services/symmetryGroups.ts`

### Crystal systems

All 32 groups assigned to the correct crystal system. ✅

### Point group names

| # | System | Book (`table-3.md`) | App | Classification |
|---|---|---|---|---|
| 1 | Hexagonal | `-6m2` | `-62m` | **Bug** |
| 2 | Cubic | `m3` | `m-3` | Notation variant |
| 3 | Cubic | `m3m` | `m-3m` | Notation variant |

**Finding 1 — `-6m2` labeled as `-62m`**
The app consistently uses `-62m` for the D₃h group ([pointGroups.ts:34](src/data/pointGroups.ts#L34), [symmetryGroups.ts:136](src/services/symmetryGroups.ts#L136)). The standard International Tables symbol is `-6m2`; the order of `m` and `2` within the symbol is significant. `-62m` is not a recognized standard symbol.

**Finding 2 — `m3` / `m3m` written as `m-3` / `m-3m`**
The Birss book's abbreviated column omits the explicit bar on the 3-fold roto-inversion axis. The app writes it as `-3` (consistent with its overall convention where `-N` = roto-inversion of order N). Both refer to the same groups (T_h and O_h). Not a physics error.

### Symmetry operations

The app computes operations dynamically via generator closure (`getSymmetryOperations()` in [symmetryGroups.ts:301](src/services/symmetryGroups.ts#L301)). Group content and element counts are correct (verified by the Tier 1 test suite). Notation differs systematically from the book:

| Aspect | Book | App | Classification |
|---|---|---|---|
| Mirror planes | `-2_axis` | `m_axis` | Notation variant |
| Diagonal in-plane axes | `xy` / `-xy` labels | degree angles (`45°`, `135°`) | Notation variant |
| Rotation pairs | `±n_z` prefix | `n_z⁺` / `n_z⁻` superscript | Notation variant |

All three are equivalent descriptions of the same operations.

---

## Pass 2 — 32 Classical Point Groups (coordinate system conventions and generator definitions)

**Source:** `birss-tables/conventions-reference.md` §1 and §4, `birss-tables/table-4a.md` (axis orientation column)
vs. `src/services/symmetryGroups.ts` (GENERATORS table, lines 109–142)

---

### Coordinate system conventions

**Principal axis (z):** correctly assigned to the highest-order axis for all crystal systems. ✅

**Secondary axis convention — systematic x vs. y discrepancy:**

The book defines a fixed convention (conventions-reference.md §1, Table 4a "Orientation of reference axes" column): for groups with a perpendicular secondary operation, that operation lies along **y**:
- σ(2) = [2_y] — perpendicular 2-fold axis along y
- σ(4) = [-2_y] — vertical mirror whose normal is y (= mirror containing the xz-plane)

The app uses **x** throughout for this secondary axis:
- `getRotationX(180)` = [2_x] — wherever the book uses σ(2) = [2_y]
- `{ m: [[-1,0,0],[0,1,0],[0,0,1]] }` = [-2_x] — wherever the book uses σ(4) = [-2_y]

**Impact by crystal system:**

| System | Groups affected | Impact |
|---|---|---|
| Orthorhombic | 222, mm2, mmm | None — the full closed group contains 2_x, 2_y, and 2_z regardless of which two are generators. Tensor forms are identical. |
| Tetragonal | 422, 4mm, -42m, 4/mmm | None — the 4-fold symmetry ensures the full group contains all perpendicular axes/mirrors at 0°, 90°, 45°, 135°. |
| Hexagonal | 622, 6mm, -6m2(-62m), 6/mmm | None — 6-fold symmetry fills in all six perpendicular axes/mirrors. |
| **Trigonal** | **32, 3m, -3m** | **Significant** — D₃ has only 3-fold symmetry, so x and y are NOT equivalent under the group. Using 2_x vs. 2_y as the secondary axis embeds the group at a different orientation within the coordinate frame. |

**Detail on the trigonal discrepancy:**

For class **32** (D₃):
- Book generators {σ(6), σ(2)} = {3_z⁻, 2_y}: three 2-fold axes land at 30°, 90°, 150° from x.
- App generators {getRotationZ(120), getRotationX(180)} = {3_z⁺, 2_x}: three 2-fold axes land at 0°, 60°, 120° from x.

These are the same abstract group (D₃) embedded **30° apart in the xy-plane**. Since D₃ has only 3-fold (not 6-fold) symmetry, this is a **different physical orientation** of the coordinate frame relative to the crystal.

For class **3m** (C₃v) the situation is analogous: the three vertical mirror planes are rotated 30° about z between the book convention and the app.

**Consequence for tensor forms:** For the polar rank-3 tensor (the SHG χ⁽²⁾ tensor — the primary output of this app), applying Neumann's principle to these two differently-oriented groups produces the same independent-component count but assigns those components to different index combinations. A user comparing the app's χ⁽²⁾ output for groups **32**, **3m**, or **-3m** against the Birss tables or ITA would see components in different tensor positions.

| # | Group | Classification |
|---|---|---|
| 4 | 32 | **Bug** — secondary 2-fold should be 2//y (σ(2)); app uses 2//x |
| 5 | 3m | **Bug** — secondary mirror should be -2//y (σ(4)); app uses -2//x |
| 6 | -3m | **Bug** — inherits from 32: secondary 2-fold should be 2//y; app uses 2//x |

---

### Generator matrix definitions

The book defines a fixed pool of 10 named matrices σ(0)–σ(9) (conventions-reference.md §4). The table below shows how the app's generators map to these.

| Book matrix | Book value | App equivalent | Relationship |
|---|---|---|---|
| σ(0) [identity] | diag(1,1,1) | `identity` | ✅ exact match |
| σ(1) [inversion] | diag(-1,-1,-1) | `inversion` | ✅ exact match |
| σ(2) [2_y] | diag(-1,+1,-1) | `getRotationX(180)` = [2_x] | ❌ different axis (see above) |
| σ(3) [2_z] | diag(-1,-1,+1) | `getRotationZ(180)` | ✅ exact match |
| σ(4) [-2_y] | diag(+1,-1,+1) | `{m:[[-1,0,0],[0,1,0],[0,0,1]]}` = [-2_x] | ❌ different axis for 3m/-3m; for -6m2, book's corrected σ(4) and app's [2_x] both orient vertex at x via different element types |
| σ(5) [-2_z] | diag(+1,+1,-1) | `{m:[[1,0,0],[0,1,0],[0,0,-1]]}` | ✅ exact match (used for group `m`) |
| σ(6) [3_z, −120°] | R_z(−120°) | `getRotationZ(120)` = R_z(+120°) | Inverse — generates same cyclic group ✅ |
| σ(7) [4_z, −90°] | R_z(−90°) | `getRotationZ(90)` = R_z(+90°) | Inverse — generates same cyclic group ✅ |
| σ(8) [-4_z] | [[0,-1,0],[1,0,0],[0,0,-1]] | `multiply(getRotationZ(90), inversion)` = [[0,1,0],[-1,0,0],[0,0,-1]] | Different phase; same abstract -4 group ✅ |
| σ(9) [x→y→z→x] | [[0,1,0],[0,0,1],[1,0,0]] | `{m:[[0,0,1],[1,0,0],[0,1,0]]}` | Inverse permutation (x→z→y→x); same cubic group ✅ |

**Confirmed by computation:** `getRotationZ(90) × σ(7) = I`, `getRotationZ(120) × σ(6) = I`, `cyclic_app × σ(9) = I` — the three "different" cases are mutual inverses, which generate the same groups.

**Summary of generator findings:**

| # | Finding | Classification |
|---|---|---|
| 7 | σ(6): app uses 3_z⁺ (+120°), book uses 3_z⁻ (−120°) | Notation variant — inverse generators, same group |
| 8 | σ(7): app uses 4_z⁺ (+90°), book uses 4_z⁻ (−90°) | Notation variant — inverse generators, same group |
| 9 | σ(8): app's -4_z matrix differs in phase from book's | Notation variant — both -4_z, same group |
| 10 | σ(9): app uses inverse cyclic permutation (x→z→y) | Notation variant — inverse generators, same cubic group |
| 4–6 | σ(2)/σ(4): app uses x-axis, book uses y-axis | **Bug** (trigonal groups only — see above) |
| 13 | 6mm: book originally listed σ(4),σ(4),σ(6) — two identical generators; corrected to σ(3),σ(4),σ(6). App uses `getRotationZ(60)` (= +60°, a C₆ element) + [-2_x] mirror, which correctly generates C₆v regardless of the misprint | Notation variant — app unaffected; book corrected |
| 12 | -6m2: book corrected from σ(2),σ(5),σ(6) to σ(4),σ(5),σ(6). App uses [-6_z] + [2_x] (vertex at x). Corrected book uses σ(4)=[-2_y] (mirror, vertex at x). Same orientation, different generating elements | Notation variant (after correction) |

---

## Background: Coordinate System Conventions in Trigonal and Hexagonal Systems

*This section preserves the geometric reasoning behind Pass 2's trigonal findings and the
specific analysis of -6m2, for future reference when working on tensor calculations.*

---

### What determines x and y in the basal plane

For all trigonal and hexagonal groups:

- **z** is always fixed: it is the highest-order rotation axis (3-fold or 6-fold), coinciding
  with the crystallographic **c**-axis.
- **x and y** lie in the **basal plane** (the equatorial plane perpendicular to z). There is
  no intrinsic "x" and "y" written into the crystal — the basal plane has only 3-fold (or
  6-fold) symmetry. A convention must choose one direction and call it the reference.

The convention is fixed by the **secondary symmetry elements** that appear in the group:

| Situation | Secondary element | Birss convention | App convention |
|---|---|---|---|
| Group has perpendicular C₂ axes (e.g. 32, 622) | C₂ ⊥ z | one C₂ axis along **y** (σ(2) = [2_y]) | one C₂ axis along **x** |
| Group has vertical mirrors (e.g. 3m, 6mm) | mirror ⊥ containing z | mirror **normal** along **y** (σ(4) = [-2_y]) | mirror **normal** along **x** |

In both cases the Birss book nominates **y** as the reference secondary direction; the app
consistently uses **x**.

**The -3m generator subtlety** (from conventions-reference.md §2):

Class **-3m** (D₃d) uses σ(2)=[2_y] as its secondary generator — the same as class **32**. The
second symbol in "-3m" is **m** (a mirror), yet the generator is a C₂ rotation. This is not a
contradiction: -3m contains inversion σ(1), so σ(1)·σ(2) = σ(4) = [-2_y] is also in the group —
a vertical mirror with normal along y. So y is simultaneously the 2-fold axis *and* the mirror
normal in D₃d. The "m" in the name refers to this mirror; Table 4a's `2//y` records which
generator was used to *define* y. The finding remains (app uses 2_x, book defines y via 2_y),
but the reason the mirror symbol appears in the name while the σ(N) generator is a rotation is
now fully explained.

**Why it matters only for trigonal, not hexagonal:**

For hexagonal groups (6-fold symmetry), the 6-fold rotation maps x to y and back — both
directions are symmetry-equivalent within the group. Using 2//x or 2//y as a generator
produces the **same full closed group** and therefore the **same tensor forms**.

For trigonal groups (3-fold symmetry only), x and y are **not** equivalent under the group.
The three secondary axes/mirrors are spaced 120° apart; if you place one along y (90° from x),
the set sits at 90°, 210°, 330° from x. If you place one along x (0°), the set sits at
0°, 120°, 240° from x. These two embeddings are **30° apart** and represent genuinely
different physical orientations of the crystal in the coordinate frame.

**Consequence:** tensor components for classes **32**, **3m**, and **-3m** in the app are
expressed in a coordinate frame rotated 30° about z from the Birss (and ITA) convention.

---

### Geometry of -6m2 (D₃h) — the trigonal prism

D₃h is the symmetry group of a regular **triangular prism**:

```
          Vertex
         / | \
        /  z  \           z = 3-fold axis (⊥ to triangular faces)
       /   |   \
      /____|____\
    Vertex     Vertex
```

The secondary symmetry elements in the basal plane are:

- **3 C₂ axes**: each runs from a **vertex** through the midpoint of the **opposite edge**
  (the altitude/median of the equilateral triangle). They lie in the basal plane.
- **3 vertical mirrors** (σᵥ): each **contains one C₂ axis** (passes through a vertex and
  the midpoint of the opposite edge, plus the z-axis). C₂ lies *inside* the mirror.
- **1 horizontal mirror** (σh): the basal plane itself (= −2_z, perpendicular to z).
- **−6** improper rotation about z.

The key geometric fact: **C₂ direction = vertex direction = vertical mirror orientation** — all
three point the same way. Choosing where x and y lie in the basal plane determines which
vertex is "the reference vertex."

---

### Internal inconsistency in birss-tables for -6m2 (RESOLVED)

The original (printed) `table-3.md` listed generators σ(2), σ(5), σ(6) for -6m2, which was
**inconsistent** with `table-4a.md`:

| Source | Entry | Implied vertex direction |
|---|---|---|
| `table-3.md` generators (original, misprint) | σ(2), σ(5), σ(6) — using σ(2) = [2_y] (C₂ along y) | Vertex at **y** (90° from x) |
| `table-4a.md` orientation | `3//z, -2//y` — mirror normal along y → mirror plane = xz | Vertex at **x** (0° from x) |

Because C₂ lies inside the vertical mirror, these two statements cannot both be true for the
same physical crystal: "C₂ along y" places the vertex at y, while "mirror normal along y"
places the mirror plane in xz and the vertex at x. They are **30° apart**.

**This was a misprint in Birss's printed Table 3.** The `table-3.md` transcription has been
corrected to σ(4), σ(5), σ(6) — replacing σ(2)=[2_y] (C₂ along y) with σ(4)=[-2_y] (mirror
with normal along y). The correction is confirmed by Table 6 (which independently lists
generators for the same 32 classical groups). With the correction, both tables agree:
y is the mirror-normal direction and the vertex lies at **x**.

The conventions-reference.md §2 explains the corrected generators:
> σ(4) = [-2_y] defines y as the mirror normal, σ(5) = [-2_z] is the horizontal mirror, and
> σ(6) = [3_z] is the 3-fold; the horizontal C₂ axes at x are derived operations.

---

### Relationship between -6m2 and the ITA standard

The International Tables for Crystallography (ITA) puts **x along the crystallographic a₁
axis**. In D₃h (−6m2), the C₂ axes coincide with the a-axes (a₁, a₂, a₃). This places the
**vertex at x** (0°, 120°, 240° from x), with vertical mirrors in the xz-plane (normal y).

| Convention | -6m2 vertex direction | Generator element | Source |
|---|---|---|---|
| ITA standard | **x** | C₂ along x (a₁ ∥ x by definition) | |
| Birss `table-4a.md` | **x** | σ(4) = [-2_y] → mirror plane = xz → vertex at x | |
| Birss `table-3.md` (corrected) | **x** | σ(4) = [-2_y] → mirror normal y → vertex at x | σ(2) was a misprint |
| App (labeled `-62m`) | **x** | [2_x] → C₂ along x → vertex at x | |

All four conventions now agree: the vertex is at **x**. The app uses C₂ along x ([2_x]) as its
generator, while the corrected book uses the vertical mirror with normal along y (σ(4)=[-2_y]).
Both are elements of D₃h that orient the crystal identically — they are different generator
choices for the same group at the same orientation. This is a notation variant.

The app still carries the wrong **name** (`-62m` instead of `-6m2`) — see Finding 1 from Pass 1.

| # | Finding | Classification |
|---|---|---|
| 11 | `table-3.md` generator σ(2)=[2_y] for -6m2 was inconsistent with `table-4a.md` `-2//y` — misprint now corrected to σ(4)=[-2_y] | **RESOLVED** — birss-tables corrected |
| 12 | App generator [2_x] for `-62m` (vertex at x) now matches corrected `table-3.md`, `table-4a.md`, and ITA; differs only in choice of generating element (C₂ vs mirror) | Notation variant |
| 13 | `table-3.md` originally listed σ(4),σ(4),σ(6) for 6mm — two identical generators cannot generate C₆v; corrected to σ(3),σ(4),σ(6) | **Resolved** — birss-tables corrected; app was unaffected (used correct generators) |

---

## Pass 3 — Magnetic Point Group Names (Type II grey + Type III black-and-white)

**Source:** `birss-tables/table-6.md` vs. `src/data/pointGroups.ts`

---

### Type II grey groups (32)

Grey groups are formed as Type I + `1'`. All 32 names are present and correctly typed. Three
inherit the Type I name discrepancies from Pass 1:

| # | Book | App | Inherited from |
|---|---|---|---|
| 14a | `-6m21'` | `-62m1'` | Finding 1 |
| 14b | `m31'` | `m-31'` | Finding 2 |
| 14c | `m3m1'` | `m-3m1'` | Finding 3 |

Classification: same as the parent findings (Bug / Notation variant / Notation variant).

### Type III black-and-white groups (58)

57 of 58 names match exactly. One new discrepancy:

| # | System | Book (`table-6.md`) | App | Classification |
|---|---|---|---|---|
| 15 | Tetragonal | `-4'm2'` | `-4'2'm` | **Bug** (name only — operations match, see Pass 5) |

**Finding 15 — `-4'm2'` written as `-4'2'm`**

The book writes `-4'm2'` (the `-4m2` setting of D₂d: mirror in 2nd HM position, 2-fold in
3rd). The app writes `-4'2'm` (the `-42m` setting: 2-fold in 2nd position, mirror in 3rd).
Unpriming gives `-4m2` (book) vs. `-42m` (app) — these are two different standard settings of
D₂d with C₂ axes and mirror planes exchanged between the (x,y) and (xy,−xy) directions.

The operation comparison in Pass 5 confirmed that the underlying group is actually the same
(same unprimed subgroup mm2 with diagonal mirrors, same primed elements). The discrepancy is
the **name only** — the app generates the correct group for what the book calls `-4'm2'` but
labels it `-4'2'm`. This parallels Finding 1 (`-6m2` vs. `-62m`) for the tetragonal system.

### Internal naming inconsistency (cubic bar notation)

| # | Finding | Classification |
|---|---|---|
| 16 | Type I/II cubic groups use bar notation (`m-3`, `m-3m`, `m-31'`, `m-3m1'`) but Type III derivatives drop it (`m'3`, `m'3m'`, `m'3m`, `m3m'` — not `m'-3`, etc.). The Type III names match the book; the Type I/II names are the outliers. | Notation inconsistency (internal to app) |

---

## Pass 4 — Magnetic Point Group Generators (Type II grey + Type III black-and-white)

**Source:** `birss-tables/table-6.md` (columns "Generating matrices of subgroup" and "Additional
generating matrix") vs. `src/services/symmetryGroups.ts` (GENERATORS table, lines 144–237)

---

### Generator encoding convention

The book splits each black-and-white group's generators into **subgroup generators** (unprimed
σ(N), generating the classical subgroup H) and one **additional primed generator** (σ'(N),
extending H to the full magnetic group M). The app uses flat generator lists where each entry
is optionally combined with `timeReversal` via `multiply()`. Both approaches are valid — group
closure via `getFullGroup()` produces the same result regardless of how generators are
partitioned.

### Type II grey groups (32)

Grey group generators are the Type I spatial generators plus `timeReversal`. They inherit all
Type I discrepancies from Pass 2:

- σ(2)/σ(4) x-axis vs. y-axis — the trigonal 30° bug (Findings 4–6)
- σ(6)/(7)/(8)/(9) inverse/phase differences — notation variants (Findings 7–10)

No new findings.

| # | Finding | Classification |
|---|---|---|
| 18 | All 32 Type II grey groups inherit Type I generator discrepancies unchanged | Same as Findings 4–10 |

### Type III black-and-white groups — trigonal 30° offset propagation

The x/y axis bug (Findings 4–6) propagates into Type III magnetic groups wherever σ(2)=[2_y]
or σ(4)=[-2_y] appears and the effective rotational symmetry is only 3-fold. The app
substitutes [2_x] for σ(2) and [-2_x] for σ(4), rotating the secondary elements 30° in the
basal plane.

**5 of 6 trigonal BW groups are affected** (only -3' is unaffected — it uses only σ(6) and
σ'(1), neither of which involves the secondary axis):

| Group | Book generators | Affected σ(N) | Subgroup H |
|---|---|---|---|
| 32' | σ(6), σ'(2) | σ'(2)=[2_y]' → app uses [2_x]' | 3 |
| 3m' | σ(6), σ'(4) | σ'(4)=[-2_y]' → app uses [-2_x]' | 3 |
| -3m' | σ(1), σ(6), σ'(2) | σ'(2) | -3 |
| -3'm' | σ(2), σ(6), σ'(1) | σ(2) | 32 |
| -3'm | σ(4), σ(6), σ'(1) | σ(4) | 3m |

**6 hexagonal BW groups are also affected** — their classical subgroup H is a trigonal group
(32, 3m, -3m, or -6m2), so the subgroup generators inherit the 30° offset:

| Group | Subgroup H | Affected σ(N) in H |
|---|---|---|
| 6'22' | 32 | σ(2) |
| 6'mm' | 3m | σ(4) |
| -6'2m' | 32 | σ(2) |
| -6'm2' | 3m | σ(4) |
| 6'/m'mm' | -3m | σ(2), σ'(2) |
| 6'/mm'm | -6m2 | σ(4) |

**Total groups affected by the trigonal 30° offset across all types:**

| Type | Affected | Groups |
|---|---|---|
| I (classical) | 3 | 32, 3m, -3m |
| II (grey) | 3 | 321', 3m1', -3m1' |
| III (trigonal BW) | 5 | 32', 3m', -3m', -3'm', -3'm |
| III (hexagonal BW with trigonal H) | 6 | 6'22', 6'mm', -6'2m', -6'm2', 6'/m'mm', 6'/mm'm |
| **Total** | **17** | |

| # | Finding | Classification |
|---|---|---|
| 17 | The trigonal 30° axis offset (Findings 4–6) propagates to 11 additional Type III groups (5 trigonal + 6 hexagonal) via their subgroup H, plus 3 Type II groups — 17 groups total | **Bug** — extends Findings 4–6 |

### Type III — `-4'm2'` generators confirm Finding 15

The book's `-4'm2'` has subgroup H = mm2, generated by σ(3)=[2_z] and σ(4)=[-2_y], with
additional generator σ'(8)=[-4'_z]. The app's `-4'2'm` uses generators `[-4'_z, 2'_x]` — both
primed. The unprimed subgroup H from the app's generators:

- `[-4'_z]²` = `[2_z]` (unprimed, since anti-unitary × anti-unitary = unitary)
- `[-4'_z]·[2'_x]` = `[2_{-xy}]` (unprimed)

So the app's H = {1, 2_z, 2_xy, 2_{-xy}} — a variant of 222 with axes along z and the face
diagonals. The book's H = {1, 2_z, -2_x, -2_y} = mm2 with mirrors along x and y. These are
**different classical subgroups**, confirming that `-4'm2'` and `-4'2'm` are genuinely different
magnetic point groups with different time-reversal structure and c-tensor forms.

| # | Finding | Classification |
|---|---|---|
| 15 | `-4'm2'` (book) vs. `-4'2'm` (app): name only — Pass 5 confirmed the operations match (same H = mm2 with diagonal mirrors, same primed elements). The HM symbol order is wrong but the underlying group is correct. | **Bug** (name only) |

### Type III — σ'(7)/σ'(8)/σ'(9) inverse/phase variants

11 BW groups use primed versions of σ(7), σ(8), or σ(9). The app's spatial matrices are the
same inverse/phase variants identified in Pass 2 (Findings 7–10), now with time reversal
attached. Since the inverse generators produce the same cyclic subgroups, the closed magnetic
groups are identical.

| # | Finding | Classification |
|---|---|---|
| 19 | σ'(7)/σ'(8)/σ'(9) in 11 Type III groups use the same inverse/phase variants as Type I | Notation variant |

---

## Pass 5 — Magnetic Point Group Symmetry Operations (Type II + Type III)

**Source:** `birss-tables/table-6.md` (column "Symmetry operators") vs. `src/services/symmetryGroups.ts`
(`getSymmetryOperations()` output for all 90 magnetic groups)

---

### Operation counts (group orders)

All 90 magnetic groups (32 Type II + 58 Type III) produce the correct number of operations.
Type II grey groups have exactly 2× their parent Type I order. Type III BW groups have
|M| = |G| where G = unprime(M). ✅

### Notation differences (same as Pass 1)

The same four systematic notation differences from Pass 1 apply uniformly to all magnetic
group operations, with the addition of prime placement:

| Aspect | Book | App | Classification |
|---|---|---|---|
| Mirror planes | `-2_axis` / `-2'_axis` | `m_axis` / `m_axis'` | Notation variant |
| Diagonal in-plane axes | `xy` / `-xy` | `45°` / `135°` | Notation variant |
| Rotation pairs | `±n_z` / `±n'_z` | `n_z⁺` / `n_z⁻` (and primed) | Notation variant |
| Grouped operations | `3(2⊥)`, `6(-2'⊥)` | listed individually | Notation variant |
| Prime placement | after rotation digit: `2'_z` | at end of label: `2_z'` | Notation variant |

### Name swap in 6/mmm family

| # | Finding | Classification |
|---|---|---|
| 20 | App's `6'/mmm'` and `6'/m'mm'` have their names swapped relative to the book; additionally `6'/mm'm` is missing as a name. (Note: a typo in birss-tables Table 7 that wrote `6'/mmm'` instead of `6'/m'mm'` for the H=-3m group has been corrected — see Pass 6, Finding 21.) | **Bug** |

**Finding 20 — `6'/mmm'` / `6'/m'mm'` / `6'/mm'm` name swap**

The app generates two groups in the 6/mmm BW family with swapped names:

| App name | App's H (from operations) | Book name | Book's H |
|---|---|---|---|
| `6'/mmm'` | D₃d = -3m (12 ops: 1, -1, 3_z±, -3_z±, 2_x, 2_60°, 2_120°, m_x, m_60°, m_120°) | `6'/m'mm'` | -3m |
| `6'/m'mm'` | D₃h = -6m2 (12 ops: 1, -6_z±, 3_z±, -2_z, 2_y, 2_30°, 2_150°, m_x, m_60°, m_120°) | `6'/mm'm` | -6m2 |

The underlying groups and their operations appear to be correctly generated from the
generators — only the labels are wrong. The book's name `6'/mm'm` does not appear in the
app at all; instead, the group that should carry that name is labeled `6'/m'mm'`.

In the HM symbol `6'/XYZ`, the prime positions encode which symmetry elements carry time
reversal. Swapping the names means the wrong operations are flagged as time-reversed in the
symbol, which would mislead any downstream lookup into Table 7 for i-/c-tensor symbol classes.

### Trigonal axis offset visible in operation labels

The 30° trigonal offset (Findings 4–6, extended in Finding 17) is directly visible in the
operation labels. For example, in group `32'`:

| Convention | Secondary C₂ axes | Vertical mirrors |
|---|---|---|
| Book (2_y) | 30°, 90°(=y), 150° | — |
| App (2_x) | 0°(=x), 60°, 120° | — |

The app's operations are correct for the x-axis convention but differ from the book's y-axis
convention by 30°. This affects the same 17 groups identified in Finding 17.

### `-4'2'm` vs `-4'm2'` operation content

The operation comparison confirms Finding 15. The app's `-4'2'm` generates:

- H (unprimed): {1, 2_z, m_45°, m_135°} = mm2 with mirrors along xy diagonals
- Primed: {2_x', 2_y', ±-4_z'} = C₂ axes along x,y and S₄ primed

The book's `-4'm2'` lists:

- H (unprimed): {1, 2_z, -2_xy, -2_{-xy}} = mm2 with mirrors along xy diagonals
- Primed: {2'_x, 2'_y, ±-4'_z}

The unprimed subgroups are in fact the **same** mm2 variant (mirrors at xy diagonals), and the
primed elements are also the same (C₂ at x,y and S₄). The operation CONTENT matches — the
discrepancy is purely in the group NAME (`-4'2'm` vs `-4'm2'`). The app generates the correct
group for what the book calls `-4'm2'`, but labels it with the wrong HM symbol.

This downgrades Finding 15 from "genuinely different magnetic group" to **naming bug only** —
the generators and operations are correct, only the name is wrong.

| # | Finding (revised) | Classification |
|---|---|---|
| 15 | `-4'm2'` (book) labeled as `-4'2'm` (app) — operations match, name is wrong. The HM symbol order (m-before-2 vs 2-before-m) is significant but the underlying group is the same. | **Bug** (name only, not generators/operations) |

---

## Pass 6 — Cross-reference: ITA Table 1.5.2.3 vs Book Tables 6 and 7 (all 90 magnetic point groups)

**Source:** International Tables for Crystallography Vol. D, Chapter 1.5, Table 1.5.2.3
(Borovik-Romanov, Grimmer & Kenzelmann, 2013) vs. `birss-tables/table-6.md` and
`birss-tables/table-7.md`

---

### Scope

All 90 non-grey magnetic point groups (32 Type I classical + 58 Type III black-and-white)
were compared across three sources: the ITA (authoritative modern reference), the book's
Table 6, and the book's Table 7. The comparison covered HM symbols and symmetry operators.

### Result: 87 of 90 groups match across all three sources

The only differences are:
- 6 cubic groups (`m3`, `m3m` and their BW derivatives) use `m3` in the book vs `m-3` in the
  ITA — a notation convention, not a physics difference.
- 3 groups in Table 7 are parenthesized — `(2'm'm)`, `(-4'm2')`, `(-6'2m')` — to flag
  non-standard axis orientations. The names themselves match.

### The only 2 genuine discrepancies — both in the 6/mmm family

| # | Schoenflies | H | ITA | Table 6 | Table 7 | Status |
|---|---|---|---|---|---|---|
| 75 | D₆ₕ(D₃d) | -3m | `6'/m'mm'` | `6'/m'mm'` | `6'/m'mm'` | **RESOLVED** — Table 7 previously had `6'/mmm'` (missing prime on horizontal mirror), now corrected to `6'/m'mm'` matching ITA and Table 6 |
| 79 | D₆ₕ(D₃ₕ) | -6m2 | `6'/mmm'` | `6'/mm'm` | `6'/mm'm` | Convention difference (see below) |

### Finding 21 — `6'/mmm'` (ITA) vs `6'/mm'm` (book) for D₆ₕ(D₃ₕ)

The ITA and the Birss book assign different HM positions to the two inequivalent sets of
vertical mirrors in D₆ₕ(D₃ₕ). Both sources agree on the physics: the horizontal mirror (σ_h)
is unprimed (it's in H = D₃h), the 6-fold is primed, one set of 3 vertical mirrors is primed
and the other is unprimed. The disagreement is purely about **which HM position** (2nd vs 3rd)
corresponds to which set of mirrors.

**Root cause — the y-axis vs x-axis secondary convention:**

In the hexagonal system, there are two sets of basal-plane symmetry directions:
- Set 1: 0°, 60°, 120° from x (containing the crystallographic a-axes)
- Set 2: 30°, 90°, 150° from x (containing the y direction)

| Convention | Secondary (2nd HM position) | Tertiary (3rd HM position) |
|---|---|---|
| ITA (x-secondary) | Set 1 (a-axis type, [2-1-10]) | Set 2 ([10-10]) |
| Birss (y-secondary) | Set 2 (y direction) | Set 1 |

For H = D₃ₕ = -6m2: the unprimed mirrors have normals in Set 2 (the y-type directions in
Birss convention). The primed mirrors have normals in Set 1.

- **Birss**: 2nd position = Set 2 = unprimed → `m`; 3rd position = Set 1 = primed → `m'` → `6'/mm'm`
- **ITA**: 2nd position = Set 1 = primed → `m'`?

Actually, both notations place the prime on the tertiary position: the ITA writes `6'/mmm'`
(prime on 3rd m) and Birss writes `6'/mm'm` (prime on 2nd m). The apparent discrepancy
arises because what Birss calls "2nd position" the ITA calls "3rd position" and vice versa,
due to the different secondary axis assignments. Both describe the same physical group with
the same primed/unprimed operation split.

| # | Finding | Classification |
|---|---|---|
| 21 | `6'/mmm'` (ITA) vs `6'/mm'm` (book) for D₆ₕ(D₃ₕ): same group, different axis convention determines which HM position receives the prime. Neither is wrong. | Convention difference |

### Why the axis convention produces only one naming discrepancy

The y-secondary (Birss) vs x-secondary (ITA) axis convention swaps which set of basal-plane
directions maps to the 2nd vs 3rd HM position. One might expect this to produce discrepancies
for many hexagonal groups. In fact, it only affects two groups in the 6/mmm family (75 and 79)
because of the interplay of three conditions:

**Condition 1 — identical letters in both positions.** In the parent symbol `-6m2`, the 2nd
position is `m` (mirror) and the 3rd is `2` (C₂ axis) — different letters. Swapping which set
of directions maps to which position changes the symbol visibly: `-6m2` becomes `-62m`. This
is precisely why Birss uses parenthesized symbols like `(-62m)` — to flag the alternate
setting. The name inside the parentheses is unambiguous regardless of convention. The same
applies to `(-4m2)` / `-42m` and `(m2m)` / `mm2`. All three parenthesized groups in column 2
of Table 7 — `(-6'2m')`, `(-4'm2')`, `(2'm'm)` — have **different letters** in the two HM
positions, so the swapped convention is visible in the symbol and handled by the parenthesis
flag. No naming discrepancy arises.

In contrast, `6/mmm` has `m` in both the 2nd and 3rd positions — the same letter. Swapping
which set of directions maps to which position produces **the same parent symbol** `6/mmm`.
The swap becomes visible only through the **prime placement** on BW derivatives.

**Condition 2 — the two sets of mirrors must be inequivalent.** In D₆ₕ = 6/mmm, the 6-fold
rotation maps Set 1 onto Set 2, making them equivalent. But in the BW derivatives, time
reversal breaks this equivalence: one set is primed and the other is not. Whether the prime
lands on the 2nd or 3rd `m` depends on which set is assigned to which position — i.e., on the
axis convention. This is why the discrepancy only appears in BW derivatives, not in the
unprimed parent `6/mmm`.

**Condition 3 — the subgroup H must have only 3-fold symmetry.** Three of the five 6/mmm BW
groups have H with 6-fold symmetry (H = C₆ₕ, D₆, C₆ᵥ for groups 76, 77, 78). The 6-fold
symmetry of H makes both sets of vertical mirrors either all primed or all unprimed — the
swap has no effect because both positions get the same prime status. Only when H has 3-fold
symmetry (H = D₃d for group 75, H = D₃ₕ for group 79) does H contain mirrors from one set
but not the other, creating an asymmetric prime pattern that depends on the axis convention.

**Summary:** The axis convention discrepancy requires ALL THREE conditions simultaneously:
(1) identical letters in both HM positions, (2) a BW derivative that breaks the equivalence
of the two positions via priming, and (3) a subgroup H with only 3-fold (not 6-fold) symmetry.
Only groups 75 and 79 of the 6/mmm family satisfy all three. For group 75, the ITA and Birss
book agree on `6'/m'mm'` (because the horizontal mirror prime makes the symbol
distinguishable without relying on the vertical mirror positions). For group 79, the different
axis conventions lead to `6'/mmm'` (ITA) vs `6'/mm'm` (book).

### Note on the 1962 paper

The 1962 Birss paper (*Proc. Phys. Soc.* **79**, 946) predates the systematic prime-placement
conventions of the 1966 book. It uses `6'/mmm'` for the H = -6m2 group (matching the ITA
convention) but also uses the same symbol for the H = -3m group (where it should have an
additional prime on the horizontal mirror). The book's Table 7 inherited the H = -3m symbol
from the paper without correction — this was the typo fixed above (group 75).

The paper's Table 2(a) also lacks the systematic parenthesization of alternate-axis settings
(`(-62m)`, `(-42m)`, etc.) that the book introduced in Table 7 to flag non-standard
orientations of associated classical groups A and B.

---

## Final Evaluation: Birss, ITC and birss-app — Conventions, Discrepancies and Common Ground

*Cross-referencing: Birss, *Symmetry and Magnetism* (1964); ITC Vol. A, Chapter 3.2
(point groups and crystal classes); ITC Vol. D, Section 1.5 (magnetic properties);
birss-tables/birss-itc-comparison.md; and the birss-app codebase.*

---

### Common ground: what all three sources agree on

**The 32 classical point groups.** All three sources (Birss, ITC, app) use the same 32 short
HM symbols, crystal system assignments, and symmetry operations — with the exception of
the notation variants documented in Passes 1–2 (mirror notation `-2` vs `m`, rotation pair
notation `±n` vs `n⁺/n⁻`, diagonal axis labels `xy` vs degree angles, and the cubic bar
convention `m3` vs `m-3`).

**The 90 magnetic point groups.** 87 of 90 HM names match across ITC Table 1.5.2.3, Birss
Table 6, and Birss Table 7 (after the Table 7 typo correction). The 3 non-matching entries
are all in the 6/mmm family and are fully explained by the axis convention difference
(Finding 21) and the now-corrected Table 7 typo. The Schoenflies symbols, Shubnikov
symbols, and symmetry operator content are consistent across all sources.

**Tensor symbol classes.** The 21-letter A–U tensor classification scheme (Tables 4a–4f / Table 7)
is internally consistent between the book's tables and the 1962 paper's Table 2(a), after
the corrections applied during the birss-tables transcription passes.

---

### Convention differences between Birss and ITC

These are documented in detail in `birss-tables/birss-itc-comparison.md`. The key differences:

| Convention | Birss | ITC | Impact on app |
|---|---|---|---|
| **Monoclinic unique axis** | z | b (= y) | App uses z (matches Birss) |
| **Hexagonal secondary axis** | y (σ(2)=[2_y], σ(4)=[-2_y]) | x (along a₁, [100]-type) | App uses x (matches ITC, not Birss) |
| **Mirror notation** | -2_axis (roto-inversion) | m_axis | App uses m_axis (matches ITC) |
| **Cubic bar notation** | m3 (abbreviated) | m-3 (explicit bar) | App uses m-3 for Type I/II but m'3 (no bar) for Type III — internally inconsistent (Finding 16) |
| **D₃h setting** | -6m2 (Tables 3, 6, 7) | -62m (Vol. A primary) / -6m2 (Vol. D) | App uses -62m (Finding 1) |
| **6/mmm BW prime placement** | 6'/mm'm (y-secondary) | 6'/mmm' (x-secondary) | Same physical group, different HM position assignment (Finding 21) |

**The app's axis convention is a hybrid.** It uses the ITC's x-secondary convention for the
basal-plane axis (getRotationX for σ(2)-type generators) but follows Birss's -6m2 symbol
(not ITC Vol. A's -62m). This hybrid creates the trigonal 30° offset (Findings 4–6, 17): the
app generates correct groups at the correct orientation for the ITC convention, but the
resulting tensor components are rotated 30° relative to the Birss tables.

---

### Discrepancies between the app and both authoritative sources

**Naming bugs (app vs both Birss and ITC):**

| # | App name | Correct name | Type | Impact |
|---|---|---|---|---|
| 1 | `-62m` | `-6m2` | Wrong HM symbol order | Users matching against either Birss or ITC Vol. D will not find this group |
| 15 | `-4'2'm` | `-4'm2'` | Wrong HM symbol order | Same issue for BW derivative of -42m |
| 20 | `6'/mmm'` ↔ `6'/m'mm'` swapped | See below | Name swap | Downstream Table 7 lookups would yield wrong tensor classes |

For Finding 20: the app's `6'/mmm'` generates H = -3m (should be called `6'/m'mm'` per both
Birss and ITC), and the app's `6'/m'mm'` generates H = -6m2 (should be called `6'/mm'm` per
Birss, or `6'/mmm'` per ITC). The operations are correct; only the labels are wrong.

**Trigonal axis orientation (app vs Birss; app matches ITC):**

| # | Finding | Groups affected | Impact |
|---|---|---|---|
| 4–6, 17 | App uses 2_x / -2_x where Birss uses 2_y / -2_y | 17 groups (3 Type I + 3 Type II + 5 trigonal III + 6 hexagonal III) | Tensor components for 32, 3m, -3m and their magnetic derivatives are in a coordinate frame rotated 30° about z from Birss's tables |

This is the most physically significant discrepancy. The app's convention matches the ITC
standard (x along a₁), so users comparing against ITC data will see agreement. But users
comparing against the Birss tensor tables (4b–4f) will see components in different index
positions for these 17 groups.

**Generator variants (app vs Birss; no physics impact):**

| # | Finding | Classification |
|---|---|---|
| 7–10, 19 | σ(6)/(7)/(8)/(9) inverse/phase variants | Notation variant — same closed groups |
| 12–13 | -6m2 and 6mm generator element type differs | Notation variant — same group orientation |
| 18 | Type II grey groups inherit all Type I variants | Same as above |

---

### Summary

The Birss book, the ITC, and the birss-app all describe the same 122 magnetic point groups
with the same physics. The differences between them fall into three categories:

1. **Pure notation variants** (mirror symbols, rotation pair notation, cubic bar convention,
   inverse generators) — no impact on tensor forms or physical predictions. These are the
   majority of findings.

2. **Axis convention differences** (Birss y-secondary vs ITC/app x-secondary for
   trigonal/hexagonal) — affects the mapping from HM symbol positions to physical
   directions, producing one naming discrepancy (Finding 21) and the 30° tensor component
   offset for trigonal groups (Findings 4–6, 17). Neither convention is wrong; they are
   different choices for the same physics.

3. **App bugs** (Findings 1, 15, 16, 20) — genuine errors in the app's HM symbols that need
   fixing regardless of which convention is followed. These are naming-only bugs; the
   underlying group generators and symmetry operations are correct.

---

## Resolution Status

### RESOLVED — naming bugs fixed in `fix/magnetic-group-names`

| # | Finding | Fix applied |
|---|---|---|
| 1 | `-62m` → `-6m2` | Renamed in pointGroups.ts, symmetryGroups.ts, tests |
| 14a | `-62m1'` → `-6m21'` | Grey group name updated |
| 15 | `-4'2'm` → `-4'm2'` | Renamed in pointGroups.ts, symmetryGroups.ts |
| 16 | Cubic bar inconsistency | Normalized to `m'-3'`, `m'-3'm'`, `m'-3'm`, `m-3m'` |
| 20 | `6'/mmm'` ↔ `6'/m'mm'` swap | Corrected to `6'/m'mm'` (H=-3m) and `6'/mm'm` (H=-6m2) |

### Remaining issues — convention differences and their resolution status

| # | Finding | Status | Reason |
|---|---|---|---|
| 2–3 | `m3`/`m3m` (Birss) vs `m-3`/`m-3m` (app/ITC) | **Won't fix** | Notation variant; app follows ITC convention |
| 4–6 | Trigonal secondary axis: 2_y (Birss) vs 2_x (app/ITC) | **RESOLVED** | Generators switched to y-secondary (Birss convention) — see PR #6 |
| 7–10, 19 | σ(6)/(7)/(8)/(9) inverse/phase generator variants | **Won't fix** | Notation variant; same closed groups generated |
| 11–13 | birss-tables internal issues (now resolved in book repo) | **Resolved in birss-tables** | Table 3 misprints corrected |
| 17 | 30° trigonal offset propagated to 14 additional magnetic groups | **RESOLVED** | All 17 groups now use y-secondary generators — see PR #6 |
| 18 | Type II grey groups inherit all Type I variants | **RESOLVED** | Grey groups updated alongside Type I — see PR #6 |
| 21 | `6'/mmm'` (ITC) vs `6'/mm'm` (Birss/app) for D₆h(D₃h) | **By design** | Convention difference between ITC x-secondary and Birss y-secondary axis assignments; app follows Birss convention for this group |

### Tensor verification status

**Birss Table 4e (rank-3 polar tensor): FULLY VERIFIED** — All 21 symbol classes
(A3–U3) tested via golden fixtures in `goldenTensors.fixtures.ts` (PR #7). Each
fixture verifies the exact component relations for one representative classical
group per symbol class against the printed Birss table. 492 tests pass.

During this verification, one additional generator bug was found and fixed: the
`-6m2` generator was σ(2)=[2_y] (C₂ rotation) instead of the correct σ(4)=[-2_y]
(mirror). This caused -6m2 to produce the L3 pattern instead of R3. Fixed in PR #7.

**Remaining verification scope** (not yet done):
- Tables 4b (rank 0), 4c (rank 1), 4d (rank 2), 4f (rank 4) — not yet tested
  via golden fixtures, though the Tier 1 test suite covers group orders and
  parity invariants for all 122 groups at all ranks
- Magnetic group tensor verification via Table 7 — the existing golden fixtures
  cover representative magnetic groups, but systematic Table 7 coverage is not
  yet complete

---

## Closing Summary (v0.1.1)

This document tracked a systematic comparison of the birss-app against the Birss
book (*Symmetry and Magnetism*, 1966) and the International Tables for
Crystallography (ITC Vol. A and Vol. D). The comparison covered all 122 magnetic
point group names, generators, symmetry operations, and tensor component output.

**All identified bugs have been resolved:**

| PR | Scope | Findings resolved |
|---|---|---|
| (merged to main) | 10 HM symbol corrections | 1, 14a–c, 15, 16, 20 |
| PR #6 | Trigonal/hexagonal y-axis convention | 4–6, 17, 18 |
| PR #7 | -6m2 generator fix + Table 4e verification | (generator bug found during verification) |

**Accepted convention choices (not bugs):**

| Finding | Decision | Rationale |
|---|---|---|
| 2–3 | `m-3`/`m-3m` (app) vs `m3`/`m3m` (Birss) | Notation variant; app uses ITC-style explicit bar |
| 7–10, 19 | Inverse rotation generators (σ(6)/(7)/(8)/(9)) | Same groups generated; no tensor impact |
| 21 | `6'/mm'm` (Birss) vs `6'/mmm'` (ITC) for D₆h(D₃h) | y-vs-x secondary axis convention; app follows Birss |

**The app now reproduces Birss Table 4e (rank-3 polar tensor) exactly for all 21
symbol classes**, verified by 21 golden fixtures. The generators match Birss
Tables 3 and 6 for σ(2) and σ(4) (y-axis convention). The inverse rotation
variants σ(6)/(7)/(8)/(9) differ in rotation direction but generate identical
groups and tensor output.

Reference tables: [manganite/birss-tables](https://github.com/manganite/birss-tables) (public)
