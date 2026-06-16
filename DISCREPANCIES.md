# Discrepancy Report: birss-app vs. birss-book

Tracks differences found between the app's data/logic and the authoritative transcriptions
in [manganite/birss-book](https://github.com/manganite/birss-book).

Each section covers one comparison pass. Items are classified as:
- **Bug** — the app is wrong and should be fixed
- **Notation variant** — equivalent representation, deliberate or benign divergence
- **Open question** — needs further investigation before classifying

---

## Pass 1 — 32 Classical Point Groups (names, crystal systems, symmetry operations)

**Source:** `birss-book/table-3.md` vs. `src/data/pointGroups.ts` + `src/services/symmetryGroups.ts`

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

**Source:** `birss-book/conventions-reference.md` §1 and §4, `birss-book/table-4a.md` (axis orientation column)
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
| σ(4) [-2_y] | diag(+1,-1,+1) | `{m:[[-1,0,0],[0,1,0],[0,0,1]]}` = [-2_x] | ❌ different axis (see above) |
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

### Internal inconsistency in birss-book for -6m2

The two book tables give **contradictory axis conventions** for -6m2:

| Source | Entry | Implied vertex direction |
|---|---|---|
| `table-3.md` generators | σ(2), σ(5), σ(6) — using σ(2) = [2_y] (C₂ along y) | Vertex at **y** (90° from x) |
| `table-4a.md` orientation | `3//z, -2//y` — mirror normal along y → mirror plane = xz | Vertex at **x** (0° from x) |

Because C₂ lies inside the vertical mirror, these two statements cannot both be true for
the same physical crystal: "C₂ along y" places the vertex at y, while "mirror normal along y"
places the mirror plane in xz and the vertex at x. They are **30° apart**.

**Root cause:** `table-3.md` chose σ(2) = [2_y] as generator (making it consistent with how
class 32 is oriented — both 32 and -6m2 use σ(2), so both have vertex at y). `table-4a.md`
instead describes the orientation in terms of the mirror element ("-2//y"), which is consistent
with how class 3m is oriented (3m uses σ(4) = [-2_y], vertex at x).

This reflects the crystallographic fact that **32 and 3m are different subgroups of D₃h,
oriented 30° apart from each other** — the C₂ axes of 32 and the vertical mirrors of 3m
interleave. Birss keeps each group's "y" pointing at its own secondary element, so -6m2
cannot satisfy both conventions at once.

---

### Relationship between -6m2 and the ITA standard

The International Tables for Crystallography (ITA) puts **x along the crystallographic a₁
axis**. In D₃h (−6m2), the C₂ axes coincide with the a-axes (a₁, a₂, a₃). This places the
**vertex at x** (0°, 120°, 240° from x), with vertical mirrors in the xz-plane (normal y).

| Convention | -6m2 vertex direction | Source |
|---|---|---|
| ITA standard | **x** | a₁ ∥ x by definition |
| Birss `table-4a.md` | **x** | `-2//y` → mirror plane = xz → vertex at x |
| App (labeled `-62m`) | **x** | generator [2_x] → C₂ along x → vertex at x |
| Birss `table-3.md` | **y** | generator σ(2) = [2_y] → C₂ along y |

The app's generator choice for this group (C₂ along x) is **consistent with ITA and with
Birss's own table-4a**, and inconsistent with Birss's table-3. The app still carries the
wrong **name** (`-62m` instead of `-6m2`) — see Finding 1 from Pass 1.

| # | Finding | Classification |
|---|---|---|
| 11 | `table-3.md` generator σ(2)=[2_y] for -6m2 is inconsistent with `table-4a.md` orientation `-2//y` — these place the reference vertex at y and x respectively | **Bug in birss-book** |
| 12 | App generator [2_x] for `-62m` places vertex at x, matching ITA and `table-4a.md`, but contradicting `table-3.md` | Notation variant relative to table-4a; bug relative to table-3 |

<!-- Add future comparison passes below this line -->
