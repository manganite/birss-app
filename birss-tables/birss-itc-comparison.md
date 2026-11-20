# Birss vs International Tables: Comparison of Point Group Conventions

Comparison of point group names, axis conventions, and magnetic group symbols
between R. R. Birss, *Symmetry and Magnetism* (1966) — as transcribed in this
repository — and the *International Tables for Crystallography* (ITC):
- ITC Vol. A, Chapter 3.2 (ch3o2.pdf): the 32 crystallographic point groups
- ITC Vol. D, Section 1.5 (ch1o5.pdf): the 122 magnetic point groups

---

## 1. The 32 Classical Point Groups

### 1.1 Hermann–Mauguin symbols

All 32 short HM symbols match between Birss Table 3 and ITC, with one setting
choice for D<sub>3h</sub>:

| System | Groups |
|---|---|
| Triclinic | 1, -1 |
| Monoclinic | 2, m, 2/m |
| Orthorhombic | 222, mm2, mmm |
| Tetragonal | 4, -4, 4/m, 422, 4mm, -42m, 4/mmm |
| Trigonal | 3, -3, 32, 3m, -3m |
| Hexagonal | 6, -6, 6/m, 622, 6mm, **-6m2**, 6/mmm |
| Cubic | 23, m3, 432, -43m, m3m |

**Cubic bar notation**: Birss abbreviates the bar on the 3-fold roto-inversion in
cubic groups, writing **m3** where ITC writes **m-3** (= m3̄). This affects 6 of
the 11 cubic symbols: m3/m-3, m3m/m-3m, and their 4 magnetic derivatives
(m'3/m'-3', m3m'/m-3m', m'3m'/m'-3'm', m'3m/m'-3'm). Both notations refer to
the same groups — Birss's convention is more compact; ITC's is more explicit.

**D<sub>3h</sub> setting**: ITC Vol. A Table 3.2.1.4 uses **-62m** as its primary
listing for D<sub>3h</sub>, with -6m2 described as an alternate setting. ITC
Vol. D Table 1.5.2.3 (magnetic groups) uses **-6m2**. Birss uses **-6m2**
throughout (Tables 3, 6, 7), agreeing with Vol. D. Both -6m2 and -62m describe
the same abstract group (see §3.2 for the geometric meaning of the two settings).

The trigonal and hexagonal symbols also carry a **different physical meaning** in
Birss vs. ITC — see §3 for the full explanation.

### 1.2 Monoclinic setting

Birss uses a **z-unique** monoclinic setting: the 2-fold axis (or mirror normal)
is along z, with generating matrix σ(3) = [2_z] for class 2. The ITC standard
is **b-unique** (2-fold along b = y). When comparing monoclinic tensor forms,
Birss's z plays the role of ITC's b.

---

## 2. The 90 Magnetic Point Groups (Types II and III)

### 2.1 Hermann–Mauguin symbols

All 90 short HM symbols match between Birss Table 6 and ITC Table 1.5.2.3,
**except one**:

| Magnetic group | ITC (Table 1.5.2.3) | Birss (Table 6) |
|---|---|---|
| D<sub>6h</sub>(D<sub>3h</sub>) | 6'/mmm' | 6'/mm'm |

This discrepancy arises from the axis-convention difference explained in §3.

### 2.2 The 6/mmm family in detail

The 6/mmm family has 5 BW (type III) members. Four match; the fifth differs:

| Schoenflies P(H) | ITC short | Birss short | Subgroup H | Match? |
|---|---|---|---|---|
| D<sub>6h</sub>(D<sub>3d</sub>) | 6'/m'mm' | 6'/m'mm' | -3m | ✓ |
| D<sub>6h</sub>(C<sub>6h</sub>) | 6/mm'm' | 6/mm'm' | 6/m | ✓ |
| D<sub>6h</sub>(D<sub>6</sub>) | 6/m'm'm' | 6/m'm'm' | 622 | ✓ |
| D<sub>6h</sub>(C<sub>6v</sub>) | 6/m'mm | 6/m'mm | 6mm | ✓ |
| D<sub>6h</sub>(D<sub>3h</sub>) | **6'/mmm'** | **6'/mm'm** | -6m2 | ✗ |

The discrepancy is in which of the two non-equivalent lateral mirror sets carries
the prime — see §3.2.5.

### 2.3 Parenthesized entries in Birss Table 7

Birss uses parentheses around certain magnetic and classical group symbols to flag
alternate axis settings. These groups are physically the same abstract group as
their unparenthesized counterparts, but oriented to a rotated reference frame:

| Parenthesized symbol | Unparenthesized standard | Relationship |
|---|---|---|
| (2'm'm) | mm2 family | C<sub>2v</sub> in rotated orthorhombic setting (m2m) |
| (-4'm2') | -42m family | D<sub>2d</sub> in alternate tetragonal setting (-4m2) |
| (-6'2m') | -6m2 family | D<sub>3h</sub> in rotated hexagonal setting (-62m) |
| (-62m) | -6m2 | D<sub>3h</sub> with swapped HM position labels |
| (-4m2) | -42m | D<sub>2d</sub> with swapped HM position labels |
| (m2m) | mm2 | C<sub>2v</sub> with permuted orthorhombic axes |

ITC Table 1.5.2.3 writes the same short HM symbols without parentheses.

---

## 3. The Axis-Convention Difference (Main Finding)

The single most important difference between Birss and ITC is how HM symbol
positions map to physical directions in the **trigonal and hexagonal** crystal
systems.

### 3.1 The rule

Birss's rule is stated explicitly in his Table 4a ("Orientation of reference axes"
column) and in `conventions-reference.md` §5: *"The second symbol in the HM name
therefore always refers to y."* The generating matrices σ(2) = [2_y] (2-fold
about y) and σ(4) = [-2_y] (mirror ⊥ y) encode this — whichever of these
appears as a generator, it defines y, and y is always position 2.

| | HM position 2 | HM position 3 |
|---|---|---|
| **Birss** | y-axis (mirror normal or 2-fold direction) | "diagonal" directions |
| **ITC** | [100] symmetry direction (a-axis family) | [110] symmetry direction (between a-axes) |

For **tetragonal** groups, both conventions agree: Birss's y is along [010],
which is [100]-type in ITC, and both assign position 2 to this direction.

For **trigonal and hexagonal** groups, the conventions diverge. The difference is
not about where the symmetry elements sit in space — both conventions describe the
same physical group in the same orientation — but about **which representative
operation** from the set of three equivalent ones is named by position 2 vs.
position 3.

### 3.2 Worked example: -6m2 (D<sub>3h</sub>) on a trigonal prism

#### 3.2.1 The group

Point group -6m2 (D<sub>3h</sub>) is the symmetry of a trigonal prism — or
equivalently, of an equilateral triangle with an additional horizontal mirror.
It has order 12 and contains:

- 1 three-fold axis along z (the prism axis)
- 3 vertical mirror planes (each containing z and one basal-plane direction)
- 3 two-fold axes in the basal plane
- 1 horizontal mirror (⊥ z)
- 2 roto-inversions (-6 = S<sub>3</sub>)

A crucial property of the triangle is that **each mirror plane contains the
same basal-plane direction as one of the two-fold axes**. A mirror plane passes
through a vertex and the midpoint of the opposite edge; the two-fold axis runs
along that same line. There are three such lines, spaced 60° apart, and each
carries *both* a mirror plane and a two-fold axis.

This is different from a regular hexagon, where mirrors through vertices and
mirrors through edge midpoints form two distinct sets rotated 30° relative to
each other. For the triangle, these two descriptions collapse into one: a line
through a vertex necessarily passes through the opposite edge midpoint.

#### 3.2.2 The geometry

In the hexagonal lattice, the three mirror/two-fold directions of D<sub>3h</sub>
are at 0°, 60°, and 120°. These happen to include directions from *both*
crystallographic families — [100]-type (a-axes, at 0° and 120°) and [110]-type
(between a-axes, at 60°) — because the 3-fold rotation mixes the two families:

```
                a₂ [010]                  Plan view of basal plane,
               ╱                          looking down the z-axis.
              ╱  120°
             V₂                           Triangle vertices V₁, V₂, V₃
            ╱  ╲                          on a-axes (0°, 120°, 240°).
           ╱    ╲
          ╱      ╲                        Three solid lines through
    ─────V₃──────V₁───── a₁ [100]        the origin are the mirror
     240°  ╲    ╱   0°                    planes (= 2-fold axes).
            ╲  ╱                          Each passes through a vertex
             ╲╱                           AND the opposite edge midpoint.
              ╲
               ╲   [110] at 60°           The three lines are at 0°, 60°,
                                          120° from the a₁ axis.
```

At each of the three directions (0°, 60°, 120°), there is **both** a mirror
plane (containing that direction and the z-axis) and a C₂' axis (running along
that direction in the basal plane). The mirror *normals* — perpendicular to the
planes in the Cartesian sense — point at 90°, 150°, and 30° respectively.

#### 3.2.3 Birss's labeling

Birss defines an orthonormal Cartesian frame with **x** along a<sub>1</sub> (at
0°) and **y** perpendicular to a<sub>1</sub> (at 90°), and names HM positions by
these Cartesian axes. For -6m2, the generator σ(4) = [-2_y] = diag(1, -1, 1) is
a mirror with normal along y:

- σ(4) defines a mirror whose normal is along y (90°), so the mirror *plane*
  contains the 0° direction (x = a<sub>1</sub>).
- The product σ(4)·σ(5) (vertical mirror × horizontal mirror) yields a 2-fold
  about x, i.e. along 0° (a<sub>1</sub>).
- By the 3-fold σ(6): two more mirrors (normals at 210°, 330°) and two more
  2-folds (at 120°, 60°).

Birss names the mirror by its *normal direction* y → **position 2 = "m"**.
He names one of the 2-folds (the one along x = a<sub>1</sub>) as the
representative → **position 3 = "2"**. Symbol: **-6m2**.

```
               y   ← mirror normal (σ(4) = [-2_y])
               ↑
          ╲    |    ╱ 
           ╲   |   ╱  
            V₃─┼──V₁───→ x = a₁     ← 2-fold axis, and
           ╱   |   ╲                    mirror plane contains
          ╱    |    ╲                   this direction too
               V₂

    Birss: "m" = mirror with normal at y (pos.2)
           "2" = 2-fold along x = a₁  (pos.3)
```

#### 3.2.4 ITC's labeling

ITC names HM positions by crystallographic direction families:
position 2 = [100] (a-axis family), position 3 = [110] (between a-axes).

Looking at the *same* three mirror/two-fold directions {0°, 60°, 120°}, ITC
picks representatives differently:

- The direction at 0° (= [100] = a<sub>1</sub>) is in the [100] family →
  ITC assigns the *mirror* at this direction to position 2 → **"m" at [100]**.
- The direction at 60° (= [110] = a<sub>1</sub>+a<sub>2</sub>) is in the [110]
  family → ITC assigns the *2-fold* at this direction to position 3 →
  **"2" at [110]**.

Symbol: **-6m2** — the same symbol as Birss.

```
               y
               ↑
          ╲    |    ╱ 
           ╲   |   ╱  
            V₃─┼──V₁───→ x = a₁ = [100]  ← "m at [100]": mirror
           ╱   |  ╱╲                         plane containing a₁
          ╱    | ╱   ╲
               V₂
                 [110] at 60°              ← "2 at [110]": 2-fold
                                              along a₁+a₂

    ITC:  "m" = mirror containing [100] (pos.2)
          "2" = 2-fold along [110]        (pos.3)
```

#### 3.2.5 Comparison: same group, different labeling

Both Birss and ITC describe the **same physical group in the same orientation**
— the three mirror planes and three 2-fold axes are at the same angular
positions {0°, 60°, 120°}. The symbol is "-6m2" in both.

The difference is purely in which *representative* direction each convention
assigns to position 2:

| | Position 2 representative | Position 3 representative |
|---|---|---|
| **Birss** | mirror *normal* at y = 90° (→ plane at 0°) | 2-fold along x = 0° |
| **ITC** | mirror *containing* [100] = 0° | 2-fold along [110] = 60° |

Both pick the mirror at 0° for "m" (Birss via its normal at y, ITC via its
containing direction at [100]). But they pick **different** 2-folds for "2":
Birss names the one at 0° (same direction as the mirror), ITC names the one at
60° (a different member of the orbit of three).

For the pure point group -6m2, this is just a bookkeeping difference — it doesn't
change the symmetry or the tensor forms. But it becomes consequential in the
supergroup 6/mmm:

#### 3.2.6 Why it matters: 6'/mm'm vs 6'/mmm'

In 6/mmm (D<sub>6h</sub>), the 6-fold axis forces the six basal-plane directions
to separate into two **non-equivalent** sets of three:

- **Set A** = {0°, 120°, 240°} = [100]-type (a-axes)
- **Set B** = {60°, 180°, 300°} = [110]-type (between a-axes)

Each set carries 3 two-fold axes and 3 mirror planes (12 lateral operations
total). When we form the magnetic subgroup D<sub>6h</sub>(D<sub>3h</sub>), the
D<sub>3h</sub> subgroup occupies **one** of these sets. The other set's
operations get primed.

The D<sub>3h</sub> subgroup takes its 3 mirrors and 3 two-folds from a single
set (say Set A). The operations in Set B then get primed. Which HM position
carries the prime depends on which set is labeled position 2:

- **ITC**: position 2 = [100] = Set A. D<sub>3h</sub>'s mirrors are in Set A →
  the "m" at position 2 stays **unprimed**. The mirror at position 3 (Set B) is
  primed → "m'". Result: **6'/mmm'**.

- **Birss**: position 2 = y-axis. Birss's position 2 labels the mirror at Set A
  by its *normal direction* (y), but Birss's position 3 labels a 2-fold that is
  also in Set A (the one at x = 0°). The 2-fold at [110] = 60° (Set B) is *not*
  the named representative. This different bookkeeping assignment results in the
  prime landing on position 2 instead of position 3. Result: **6'/mm'm**.

Both symbols describe the same abstract magnetic group. The difference is purely
one of the HM position labeling convention.

### 3.3 Summary of affected groups

The position-labeling difference between Birss (pos.2 = y) and ITC
(pos.2 = [100]) affects all trigonal and hexagonal groups with lateral operations.

For the **unprimed classical groups**, both conventions produce the **same short
symbol** — e.g. both write "32", "3m", "-6m2" — because the short form does not
encode which representative direction is assigned to which position. (The ITC
full forms 321/312, 3m1/31m, -6m2/-62m *do* encode this, but Birss uses short
forms throughout.)

For **magnetic groups**, the convention difference produces **one visible symbol
discrepancy**: 6'/mm'm (Birss) vs 6'/mmm' (ITC).

### 3.4 Why only one discrepancy: three necessary conditions

Given that the axis convention affects all trigonal and hexagonal groups, it may
seem surprising that only a single naming discrepancy results. The reason is that
three conditions must hold **simultaneously** for the convention difference to
produce a visible change in the HM symbol:

**Condition 1 — Identical letters in both HM positions.** When the 2nd and 3rd
positions contain *different* letters (e.g. `m` and `2` in `-6m2`), swapping which
set of directions maps to which position changes the symbol visibly: `-6m2`
becomes `-62m`. This is precisely what the parenthesized entries in Table 7
handle — `(-62m)`, `(-4m2)`, `(m2m)` flag the alternate setting. The three
parenthesized magnetic groups in Table 7 column 2 — `(-6'2m')`, `(-4'm2')`,
`(2'm'm)` — all have different letters in the two positions, so the swapped
convention is encoded in the symbol itself and does not produce a naming
discrepancy (just a parenthesization flag).

In `6/mmm`, both positions contain `m` — the same letter. Swapping which set of
directions maps to which position produces the **same parent symbol** `6/mmm`.
The swap becomes visible only through **prime placement** on BW derivatives.

**Condition 2 — A BW derivative that breaks the equivalence.** In the unprimed
parent `6/mmm`, both positions are `m` with no primes, so the swap is invisible.
The time-reversal primes of a BW derivative can break the symmetry between the
two positions — one `m` becomes `m'` while the other stays `m`. But this only
happens if the two sets of mirrors have different priming.

**Condition 3 — A subgroup H with only 3-fold symmetry.** Whether the two sets
of mirrors get different priming depends on the subgroup H. If H has 6-fold
symmetry (H = C₆ₕ, D₆, or C₆ᵥ), the 6-fold rotation maps Set A onto Set B,
making them equivalent — both sets are either entirely primed or entirely
unprimed, so the prime pattern is symmetric and the swap has no effect. Only
when H has 3-fold symmetry (H = D₃d or D₃ₕ) does H contain mirrors from one set
but not the other, producing an asymmetric prime pattern whose representation
depends on the axis convention.

**Result:** Of the 5 BW members of the 6/mmm family, only groups 75 (H = D₃d)
and 79 (H = D₃ₕ) satisfy all three conditions. For group 75, the additional
prime on the horizontal mirror (`m'` after `/`) makes the two symbols
distinguishable regardless of which vertical mirror carries the prime — both
conventions agree on `6'/m'mm'`. For group 79, the horizontal mirror is unprimed,
leaving the vertical mirror prime as the only distinguishing mark — and here the
conventions disagree: `6'/mmm'` (ITC) vs `6'/mm'm` (Birss).

### 3.5 Tetragonal: no discrepancy

For tetragonal groups, Birss's y is along [010], which belongs to the [100]-type
family. Both conventions assign pos.2 to this direction. The groups -42m, 4mm,
422, 4/mmm, and all their BW derivatives have identical symbols in Birss and ITC.

---

## 4. Other Convention Differences

### 4.1 Monoclinic unique axis

| | Unique axis | Generator for class 2 |
|---|---|---|
| Birss | z | σ(3) = [2_z] |
| ITC (standard) | b (= y) | 2-fold along b |

Birss's monoclinic tensor forms have z as the unique axis, while ITC uses b.
When comparing, relabel z ↔ b.

### 4.2 Mirror notation

ITC writes mirrors as **m** with a subscript indicating the normal direction:
m<sub>x</sub>, m<sub>y</sub>, m<sub>z</sub>, m<sub>xy</sub>.

Birss writes the same mirrors as improper 2-fold rotations:
-2<sub>x</sub>, -2<sub>y</sub>, -2<sub>z</sub>, -2<sub>xy</sub>.

These are the same operations — a mirror ⊥ n is identical to a 2-fold
roto-inversion about n. Birss's notation is algebraically convenient (all
symmetry operations are expressed as rotations or roto-inversions), while ITC's
is more intuitive for identifying mirror planes.

### 4.3 Crystal system classification

ITC places the five trigonal point groups (3, -3, 32, 3m, -3m) within the
**hexagonal system** (as a "trigonal" subsystem sharing the hexagonal lattice).
Birss lists them as a separate **trigonal system**. This is a classification
convention with no effect on the group symbols or tensor forms.

### 4.4 ITC full HM symbols for trigonal groups

ITC Table 1.5.2.3 (Vol. D) lists both short and full HM symbols. The full forms
for trigonal groups carry a trailing "1" to specify the setting:

| Short (both sources) | ITC full | Meaning of "1" |
|---|---|---|
| 32 | 321 | 2-fold labeling at [100], nothing at [110] |
| 3m | 3m1 | mirror labeling at [100], nothing at [110] |
| -3m | -3 2/m 1 | same |

Birss uses short forms exclusively, which do not encode the setting.

### 4.5 Shubnikov symbols

Both Birss and ITC list Shubnikov symbols for the magnetic groups (Birss Table 6
column 3, ITC Table 1.5.2.3 column 3). The conventions are compatible: Birss's
`m.6:m`, `m.6':m'`, etc. follow the standard Shubnikov dot/colon system.
The Shubnikov symbols of all 90 groups agree between the two tables (compared
2026-11-19, with ITC Table 1.5.2.3 read from page images, since the text layer
of the ITC PDF loses the primes; see the pass-6 note in `table-6.md`).

### 4.6 ITC internal inconsistency: -62m vs -6m2

ITC itself uses different settings for D<sub>3h</sub> in different volumes:

| Source | D<sub>3h</sub> symbol | Setting |
|---|---|---|
| ITC Vol. A, Table 3.2.1.4 (primary listing) | **-62m** | 2 in pos.2, m in pos.3 |
| ITC Vol. A, Table 3.2.3.2 (detailed descriptions) | both -6m2 and -62m | both settings described |
| ITC Vol. D, Table 1.5.2.3 (magnetic groups) | **-6m2** | m in pos.2, 2 in pos.3 |
| Birss, Tables 3/6/7 | **-6m2** | m in pos.2, 2 in pos.3 |

Birss agrees with ITC Vol. D. The ITC Vol. A primary listing prefers the other
setting. Both are valid representations of the same abstract group.

---

## 5. Practical Guidance

When using Birss's tensor forms (Tables 4b–4f) with ITC crystallographic data:

1. **Monoclinic**: Birss z = ITC b. Relabel tensor components accordingly.

2. **Trigonal/Hexagonal tensor components**: Birss's Cartesian frame has x along
   a<sub>1</sub> and y perpendicular to a<sub>1</sub> in the basal plane. Tensor
   components x, y in Birss refer to these directions. The symmetry operations
   and tensor forms are the same in both conventions; only the mapping from HM
   position labels to Cartesian directions differs.

3. **Magnetic group 6'/mm'm**: This is the same group as ITC's 6'/mmm'. The
   prime is on the second m in Birss and the third m in ITC, reflecting the
   different position labeling conventions.

4. **Mirror notation**: Translate ITC m<sub>x</sub> ↔ Birss -2<sub>x</sub>, etc.

5. **Tetragonal and cubic**: No convention differences. Symbols and tensor
   forms are directly compatible.
