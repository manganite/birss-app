# Birss: Conventions and Definitions Reference

**Source**: Compiled from *Birss Symmetry & Magnetism komplett.pdf*. Part I draws on scanned PDF pages 10–37 (printed pages 1–55, Ch. 1–2) and Ch. 2 §7 (printed pp. 71–73). Part II draws on Ch. 3 (printed pp. 84–124) via the transcribed `table-6.md`/`table-7.md`. Standard international crystallographic conventions are incorporated throughout.

---

# PART I — Classical Point Groups and Tensors

---

## 1. Coordinate Axes and Orientation Conventions

### Crystal Coordinate System
- The crystal axes are denoted **Ox₁, Ox₂, Ox₃** (equivalently **x, y, z**, with $x_1=x$,
  $x_2=y$, $x_3=z$).
- These axes form a **right-handed orthonormal frame fixed in the crystal** (not
  necessarily the same as the crystallographic, possibly oblique, **a, b, c** axes — see
  the trigonal/hexagonal note below).
- **Per-system axis choice** (Birss Ch. 2, §1.4, and cross-checked against Table 4a's
  "Orientation of reference axes" column and the σ(N) table in §4):
  - **Triclinic**: no symmetry constraint on the axes.
  - **Monoclinic**: **z** is the **unique** symmetry axis — the 2-fold axis itself for
    class `2`, or the normal to the mirror plane for class `m` (Table 4a: `2//z`,
    `-2//z`). This is Birss's **z-unique** setting. It differs from the **b-unique**
    monoclinic convention common in International Tables for Crystallography — when
    comparing to such sources, `z` here plays the role that `b` plays there.
  - **Tetragonal, Trigonal, Hexagonal**: **z** is the principal axis (the 4-, 3-, or
    6-fold axis, = crystallographic `c`). **y** is either a secondary 2-fold axis
    perpendicular to z, for classes with `2⊥`/`-2⊥` operations such as `32`, `422`,
    `622` (matching generator σ(2) = [2_y], Table 4a: `2//y`), or the normal to a
    mirror plane containing z, for classes such as `3m`, `4mm`, `6mm` (matching
    generator σ(4) = [-2_y], Table 4a: `-2//y`). **x** completes the right-handed
    frame, perpendicular to both y and z. For trigonal/hexagonal crystals this
    orthonormal `x,y,z` frame is related to, but not identical to, the oblique
    crystallographic axes `c, a₁, a₂` (120° apart) — see Birss Fig. 1.1b / eq. (1.4)
    for that relation.
    > **Note — two misprints in Birss Table 3 (corrected)**:
    > - **6mm**: The book reads σ(4), σ(4), σ(6) — the first σ(4) is a misprint of
    >   σ(3). The repeated σ(4) = [-2_y] cannot generate a 6-fold axis; the correct
    >   set is σ(3), σ(4), σ(6). Table 6 confirms this.
    > - **-6m2**: The book reads σ(2), σ(5), σ(6) — σ(2) is a misprint of σ(4).
    >   σ(2) = [2_y] implies y = 2-fold axis, contradicting Table 4a's `3//z, -2//y`
    >   (y = mirror normal). The correct set is σ(4), σ(5), σ(6). Table 6 confirms this.
    >
    > Both corrected in table-3.md and table-6.md.
  - **Orthorhombic**: `x`, `y`, `z` are the three mutually perpendicular 2-fold axes
    (or mirror normals) — Table 4a: `2//x, 2//y` (the third, `2//z`, is implied).
  - **Cubic**: `x`, `y`, `z` lie along the cube edges — the three equivalent 4-fold or
    2-fold axes ([100]-type, Table 4a: `4//x, 4//y` or `2//x, 2//y`). The four 3-fold
    axes lie along the cube body diagonals ([111]-type) and are **not** coordinate
    axes (σ(9) realizes one such body-diagonal 3-fold by cyclically permuting x,y,z).

### Stereographic Projection Conventions
- The **principal symmetry axis** (highest-order rotation/rotation-inversion axis) is perpendicular to the projection plane and directed outward (normal to the page).
- The projection represents an **equatorial plane** of a reference sphere centered at the crystal origin.
- **Points above the plane** (emerging toward the observer) are marked with **●** (filled circle or dot).
- **Points below the plane** (receding away from the observer) are marked with **○** (empty circle).
- **Lines in the stereogram** represent poles to symmetry planes (great circles or their intersections).

---

## 2. Point Group Nomenclature

### International (Hermann–Mauguin) Notation
Describes the **symmetry elements** of the point group using a standardized convention:

- **n** = n-fold rotation axis (1, 2, 3, 4, 6)
- **–n** or **n̄** = n-fold roto-inversion axis (barred or with overline)
- **m** = mirror plane (reflection plane)
- **·** or **/** = separator indicating **perpendicular or independent** symmetry directions
  - Example: `2/m` means a 2-fold axis with a mirror plane perpendicular to it
  - Example: `m.2.m` means a mirror plane, perpendicular 2-fold axis, and another mirror plane
  - In Shubnikov notation, typically represented as a **dot** (e.g., `2.m`)

**Abbreviated vs. Full Notation:**
- Abbreviated form omits redundant generators (e.g., `mmm` instead of `m.m.m`)
- Full form explicitly lists all principal symmetry elements

### Positional Convention: Which HM Symbol Position Refers to Which Axis

Each position in a Hermann–Mauguin group name systematically maps to a specific crystal
direction. This is verified directly from Table 4a's "Orientation of reference axes"
column: every secondary direction listed there as `2//y` or `-2//y` corresponds exactly
to the second symbol in the HM name. The mapping depends on the crystal system:

**Monoclinic** (one symbol): refers to **z** (the unique axis). There is no secondary
direction, so no y specified.

**Orthorhombic** (three symbols): positions refer to **x, y, z** in that order:
- First symbol → element along x
- Second symbol → element along y (Table 4a: `2//x, **2//y**`)
- Third symbol → element along z

**Tetragonal, Trigonal, Hexagonal** (one to three symbols): positions refer to **z
(primary), y (secondary), diagonal (tertiary)**:
- First symbol → the principal n-fold axis along **z**
- **Second symbol → the secondary element along y** — either a 2-fold rotation (`2//y`,
  generator σ(2)) or a mirror with normal along y (`-2//y`, generator σ(4))
- Third symbol (where present) → element at diagonal directions in the horizontal plane
  (bisector directions between the primary crystallographic a-axes)

The second symbol in the HM name therefore **always refers to y** for tetragonal,
trigonal, and hexagonal groups.

**Cubic** (two or three symbols): **exception** — positions refer to **[100]-type
(cube-edge), [111]-type (body-diagonal), and [110]-type (face-diagonal)** directions:
- First symbol → elements along the [100]-type cube edges (x, y, z are equivalent)
- Second symbol → elements along the [111]-type body diagonals — the 3-fold or -3 axes.
  **This is NOT y** (y is a cube edge, not a body diagonal).
- Third symbol (where present) → elements along [110]-type face diagonals

In the cubic case Table 4a lists `2//x, 2//y` or `4//x, 4//y` because x and y are
equivalent cube-edge directions; the second symbol "3" (or "-6") in the HM name refers
to the body-diagonal direction, not to y specifically.

**The -3m subtlety.** For -3m (D₃d), Table 3 uses σ(2) = [2_y] as the secondary
generator, so Table 4a lists the orientation as `-3//z, 2//y` — y is the 2-fold axis.
Yet the second symbol in "-3m" is **m** (a mirror). The resolution: because -3m contains
both inversion σ(1) and the 2-fold σ(2), their product σ(1)·σ(2) = σ(4) = [-2_y] is
also in the group — a vertical mirror with normal along y. So in D₃d, y is
**simultaneously the 2-fold axis and perpendicular to a mirror**. The second symbol "m"
correctly refers to this mirror at y; Table 4a's `2//y` records which generator was used
to *define* y (the 2-fold), not the exhaustive list of operations at y.

**-6m2 vs. 6mm.** Both groups use y as the mirror-normal direction (Table 4a: `-2//y`
for both), so the second symbol in each is "m". They differ at the third position:
- **-6m2** ("-6-m-**2**"): the third symbol "2" names the horizontal 2-fold axes, which
  lie at x (perpendicular to the mirror normals at y). Generators σ(4), σ(5), σ(6):
  σ(4) = [-2_y] defines y as the mirror normal, σ(5) = [-2_z] is the horizontal mirror,
  and σ(6) = [3_z] is the 3-fold; the horizontal 2-folds at x are derived operations.
- **6mm** ("6-m-**m**"): the third symbol "m" names mirrors at the 60°-bisector
  (diagonal) directions. Generators σ(3), σ(4), σ(6): σ(4) = [-2_y] defines y as the
  mirror normal, σ(3) = [2_z] combined with σ(6) = [3_z] yields the 6-fold axis.

### Schoenflies Notation
Point group classification using symbols with subscripts:

- **C_n** = Cyclic group with n-fold axis (rotation only)
- **C_{nh}** = Cyclic group with n-fold axis **and** horizontal mirror plane (perpendicular to principal axis)
- **C_{nv}** = Cyclic group with n-fold axis **and** vertical mirror planes (containing principal axis)
- **S_n** = Improper (roto-inversion) axis of order n (no proper n-fold axis)
- **D_n** = Dihedral group with n-fold axis and n perpendicular 2-fold axes
- **D_{nh}** = Dihedral group with horizontal mirror plane
- **D_{nd}** = Dihedral group with diagonal (vertical) mirror planes
- **T, T_h, T_d** = Tetrahedral groups (cubic with 3-fold axes along [111] directions)
- **O, O_h** = Octahedral groups (cubic with highest symmetry)

### Shubnikov Notation
Notation emphasizing the presence of inversion symmetry; uses **dots**, **colons**, and
(for cubic classes) **slashes** as separators:

- **n.m** means n-fold axis with m mirror planes (containing/parallel to the axis)
- **–n** (barred) prefix indicates inversion-related elements
- Example: `2.m` = 2-fold axis with a parallel mirror plane (International class mm2)
- Example: `–6.m` = –6 roto-inversion axis with mirrors (International class –3m, Table 3)
- **`:`** separates a principal rotation axis from a **perpendicular** set of secondary
  axes or mirrors, e.g. `2:m` (class 2/m: 2-fold axis, mirror ⊥ to it), `2:2` (class 222),
  `4:m`, `6:m`. A leading `m.` combined with a `:` group, e.g. `m.2:m` (class mmm) or
  `m.6:m` (class 6/mmm), reads as "mirror, plus axis-with-perpendicular-mirror".
- **`/`** is used only for the **cubic** classes, separating the symbol for the
  body-diagonal ([111]-type) 3-fold/–6 axes from the symbol for the coordinate-axis
  ([100]-type) 2-fold/4-fold axes, e.g. `3/2` (class 23), `3/4` (class 432), `–6/4`
  (class m3m). See Table 3's "Shubnikov" column for the full set of 32 symbols.

### The 32 Crystal Classes

All 32 crystallographic point groups organized by crystal system (Fig. 2.6, scanned PDF
page 30, printed pages 40–41):

- **Triclinic**: 1, –1
- **Monoclinic**: 2, m, 2/m
- **Orthorhombic**: 222, mm2, mmm
- **Tetragonal**: 4, –4, 4/m, 422, 4mm, –42m, 4/mmm
- **Trigonal**: 3, –3, 32, 3m, –3m
- **Hexagonal**: 6, –6, 6/m, 622, 6mm, –6m2, 6/mmm
- **Cubic**: 23, m3, 432, –43m, m3m

Each class has generating matrices in **Table 3, column 8** and tensor forms for each rank
in **Tables 4b–4f**.

**Centrosymmetrical Classes** (containing inversion center –1):
–1, 2/m, mmm, 4/m, 4/mmm, –3, –3m, 6/m, 6/mmm, m3, m3m.
In these 11 classes, polar tensors of odd rank vanish and axial tensors of even rank
vanish (see §5 and §7).

---

## 3. Symmetry Operations

### Two Methods of Classification

**Method 1: Rotation and Rotation-Reflection Axes**
- **n-fold rotation axis**: Rotation by $2\pi/n$ around an axis.
- **n-fold rotation-reflection axis** (denoted $\bar{n}$ or S_n in Schoenflies):
  - Rotation by $2\pi/n$ followed by reflection in a plane perpendicular to the rotation axis.

**Method 2: Rotation and Rotation-Inversion Axes** (Generally Preferred)
- **n-fold rotation axis**: Rotation by $2\pi/n$ around an axis (determinant +1).
- **n-fold rotation-inversion axis** (denoted $\bar{n}$ or improper rotation):
  - Rotation by $2\pi/n$ followed by **inversion through a fixed center point**.
  - Also called an **improper rotation** because it combines rotation with sense reversal.
  - Determinant: –1 for all improper rotations.
  - Example: $\bar{1}$ is pure inversion; $\bar{2}$ is equivalent to a mirror plane; $\bar{3}, \bar{4}, \bar{6}$ combine rotation with inversion.

### Identity Operation
- **E** (or **1**) = identity (no operation; rotation by 0°).
- **Determinant**: +1.
- Equivalent to a 1-fold rotation axis.

### Key Properties of Generating Matrices

Each crystal class has a **minimal set of generating matrices** σ(i), which when composed
(multiplied) generate the entire point group. The full pool of named matrices is in §4.

- All are **3×3 orthogonal matrices** acting on coordinates: $\vec{x}' = \mathbf{g} \vec{x}$.
- $\mathbf{g}^T \mathbf{g} = \mathbf{I}$ (orthogonality).
- $\det(\mathbf{g}) = +1$ for proper rotations; $-1$ for improper rotations.

### Proper Rotation Axes
| Symbol | Name | Order | Rotation Angle | Determinant |
|---|---|---|---|---|
| 1 or **E** | Identity | 1 | 0° | +1 |
| 2 | 2-fold (dyad) | 2 | 180° | +1 |
| 3 | 3-fold (triad) | 3 | 120° | +1 |
| 4 | 4-fold (tetrad) | 4 | 90° | +1 |
| 6 | 6-fold (hexad) | 6 | 60° | +1 |

### Improper Rotation (Roto-Inversion) Axes
| Symbol | Name | Operation | Determinant | Note |
|---|---|---|---|---|
| **-1** | Inversion center | Inversion through point | -1 | Pure inversion; identity rotation + inversion |
| **-2** | Mirror plane | 180° rotation + inversion = reflection | -1 | Equivalent to m; perpendicular to axis |
| **-3** | 3-fold roto-inversion | 120° rotation + inversion | -1 | Distinct improper operation |
| **-4** | 4-fold roto-inversion | 90° rotation + inversion | -1 | Distinct improper operation |
| **-6** | 6-fold roto-inversion | 60° rotation + inversion | -1 | Distinct improper operation |

### Mirror Planes and Perpendicular Axes
- **m** = Mirror plane (reflection); equivalent to **-2** (see table above).
- In the **symmetry operations** column of Tables 3, 4c–4f, and 6:
  - `2_z` = 2-fold axis along z-direction.
  - `-2_z` = Mirror plane perpendicular to z (equivalent to roto-inversion).
  - `2⊥` = 2-fold axis **perpendicular** to the principal axis (replacing the book's perpendicular symbol).
  - `-2⊥` = Mirrors perpendicular to the principal axis.

### Plus/Minus Notation
- **±** is the preferred symbol for "plus or minus" pairs of symmetry operations (e.g. `±3_z`, `±4_z`,
  `±6_z`, `4(±3)`). The book's `+/-` notation should be written as `±` consistently across all tables.

### Multi-Fold Operations
- **n(m)** in symmetry operations (e.g., `3(2⊥)`) denotes **n equivalent m-fold axes**.
  - Example: `3(2⊥)` = three 2-fold axes perpendicular to the principal 3-fold axis.
  - Example: `3(-2⊥)` = three mirror planes perpendicular to the principal 3-fold axis (e.g., in class 3m).
  - Example: `6(2⊥)` = six 2-fold axes perpendicular to a principal 6-fold axis.
  - Example: `6(-2⊥)` = six mirror planes perpendicular to a principal 6-fold axis (e.g., in class 6mm).
- **n(k)** or **n(m₁), n(m₂)** groups together **n equivalent symmetry elements**.

---

## 4. The σ(0)–σ(9) Generating Matrix Pool

Birss equation (2.17) (scanned PDF page 34, printed page 48) defines a fixed pool of ten named
3×3 matrices, σ(0)–σ(9). Table 3's "Generating matrices" column and Table 6's
σ(N)/σ'(N) columns reference these by number. The axis labels in the "Operation"
column below (`2_y`, `4_z`, etc.) are the same axis labels used in Table 3's "Symmetry
operations" column — e.g. Table 3's class `2` lists operation `2_z` and generator
σ(3), and indeed σ(3) = [2_z] below.

| σ(N) | Symbol | Matrix | Operation |
|---|---|---|---|
| σ(0) | [1] | $\begin{pmatrix}1&0&0\\0&1&0\\0&0&1\end{pmatrix}$ | Identity |
| σ(1) | [-1] | $\begin{pmatrix}-1&0&0\\0&-1&0\\0&0&-1\end{pmatrix}$ | Inversion |
| σ(2) | [2_y] | $\begin{pmatrix}-1&0&0\\0&1&0\\0&0&-1\end{pmatrix}$ | 2-fold rotation about y |
| σ(3) | [2_z] | $\begin{pmatrix}-1&0&0\\0&-1&0\\0&0&1\end{pmatrix}$ | 2-fold rotation about z |
| σ(4) | [-2_y] | $\begin{pmatrix}1&0&0\\0&-1&0\\0&0&1\end{pmatrix}$ | Mirror ⊥ y (= –2_y) |
| σ(5) | [-2_z] | $\begin{pmatrix}1&0&0\\0&1&0\\0&0&-1\end{pmatrix}$ | Mirror ⊥ z (= –2_z) |
| σ(6) | [3_z] | $\begin{pmatrix}-\frac{1}{2}&\frac{1}{2}\sqrt{3}&0\\-\frac{1}{2}\sqrt{3}&-\frac{1}{2}&0\\0&0&1\end{pmatrix}$ | 3-fold rotation (120°) about z |
| σ(7) | [4_z] | $\begin{pmatrix}0&1&0\\-1&0&0\\0&0&1\end{pmatrix}$ | 4-fold rotation about z |
| σ(8) | [-4_z] | $\begin{pmatrix}0&-1&0\\1&0&0\\0&0&-1\end{pmatrix}$ | –4 roto-inversion about z |
| σ(9) | (cyclic) | $\begin{pmatrix}0&1&0\\0&0&1\\1&0&0\end{pmatrix}$ | 3-fold rotation about the [111] body diagonal (cyclic permutation x→y→z→x) |

Primed matrices σ'(N) denote the same matrix σ(N) combined with time reversal (see §11).

**Example:** For class **32** (D₃, trigonal), Table 3 lists generators **σ(2), σ(6)**:
- σ(2) = [2_y]: a 2-fold axis perpendicular to the principal axis (Table 3's `3(2⊥)` operations)
- σ(6) = [3_z]: the 3-fold principal axis (the `±3_z` operations)

Composing these two generates all 6 symmetry operations of the group (1, two `±3_z`
rotations, and three `2⊥` axes).

**Example:** For class **6/mmm** (D<sub>6h</sub>, hexagonal, highest symmetry), Table 3 lists
**four** generators — σ(1), σ(2), σ(3), σ(6) — this is the book's own worked example,
equation (2.19):
- σ(1) = [-1] (inversion)
- σ(2) = [2_y]
- σ(3) = [2_z]
- σ(6) = [3_z]

Composing these generates all 24 symmetry operations of 6/mmm. See §7 for how this
generator set is used to derive a tensor's reduced form.

**Generator corrections confirmed from book scans (hexagonal groups).** Two misprints
in Birss's Table 3 were identified and corrected in table-3.md, confirmed by
cross-referencing the book with Table 6 (the magnetic point groups table, which
independently lists generators for the same 32 classical groups):

- **6mm**: The book's Table 3 reads σ^(4), σ^(4), σ^(6) — the first σ(4) is a
  **misprint of σ(3)**. The repeated σ(4) = [-2_y] cannot generate a 6-fold axis; the
  correct first generator is σ(3) = [2_z]. The correct set σ(3), σ(4), σ(6) =
  [2_z] + [-2_y] + [3_z] generates C₆v: σ(3)·σ(6) yields a C₆ rotation, σ(4)
  provides a vertical mirror without a horizontal mirror. Table 6 confirms
  σ^(3), σ^(4), σ^(6). Corrected in table-3.md.

- **-6m2**: The Table 3 scan shows σ^(2), σ^(5), σ^(6), but Table 6 shows
  **σ^(4), σ^(5), σ^(6)**. The σ(2) in Table 3 is a misprint of σ(4): σ(2) = [2_y]
  is the secondary generator of the *alternate* -62m orientation (y = 2-fold axis),
  whereas the standard -6m2 orientation requires σ(4) = [-2_y] (y = mirror normal),
  consistent with Table 4a's `3//z, -2//y`. With σ(4) the inconsistency between Table 3
  and Table 4a disappears entirely. Corrected in table-3.md.

**Further book errors found in Table 7 (scan-verified 2026-07-04).** A full audit of all 58
black-white rows' rank-3 columns against the app's own generators (see
`src/services/table7RankThree.audit.test.ts`) found two book errors in `table-7.md`'s printed
parenthesization, both hexagonal:

- **Table 7, row `(-6'2m')`**: the i-cells `R_m`, `R_n` are printed **without** parentheses,
  although column 2 is itself parenthesized and R is frame-sensitive — the orthorhombic
  `(2'm'm)` and tetragonal `(-4'm2')` analogues DO bracket their i-cells. A bracket omission, not
  a transcription fault (transcribed faithfully as printed); no physical consequence, since the
  bracketed column 2 already forces the rotated setting. Left as printed in `table-7.md`.
- **Table 7, row `-6m'2'`**: A is printed `-6m2` and the c-cells `R_m`, `R_n` are printed
  **without** parentheses, contradicting the row's own Table 6 generator σ'(4) (which forces the
  rotated A and the yyy-family c-ED). Left as printed in `table-7.md`; the app is verified correct
  here.

**Bracket-spelling caveat** (scan-verified 2026-07-04): the letter order *inside* a bracketed
group symbol is not reliable in the book — `4'mm'` prints A = `(-4m2)` while `-42'm'` prints
A = `(-42m)` for the physically identical group (same rotated D<sub>2d</sub>, confirmed by both
rows printing `(J_n)`). The physical statement is carried by the bracket plus the tensor symbols,
not by the letter order within the brackets.

**Methodological lesson.** Generator disputes must be arbitrated by Table 7 itself — the
A-column parenthesization plus the tensor-cell parenthesization — not by σ-symbol plausibility or
cross-table pattern-matching alone. The 2026-07-02 pass-5 override of `6'/mm'm`'s Table 6
generator (σ(2) → σ(4)) over-generalized the σ(2)↔σ(4) misprint pattern documented above for
Table 3's `-6m2` row to a case where three independent book-internal signals — the printed
generator itself, Table 7's `A = (-62m)`, and Table 7's `(R_n)` — all said otherwise; the
override was reversed 2026-07-04 (see `table-6.md`'s corrected pass-5 note). The Table 3 `-6m2`
misprint correction documented above is itself unaffected, and was re-confirmed by the 2026-07-04
scan of Table 6's classical `-6m2` row (σ(4), σ(5), σ(6)).

**All five documented book errors** (two in Table 3, one in Table 6, two in Table 7 above) were
re-verified first-hand against maintainer-provided book scans on 2026-07-04: Table 3 `6mm` and
`-6m2` generator cells; Table 6 `6'/m'mm'` σ'-cell (σ'(2) misprint of σ'(3) — 2'_y collides with
the unprimed 2_y ∈ H = `-3m`, closing the printed generators wrongly yields the grey group
`-3m1'`; see `table-6.md`'s own note); Table 7 `(-6'2m')` i-cells; Table 7 `-6m'2'` A- and c-cells.

**A sixth book error, in Table 6 (found 2026-11-19).** `4/m'mm`, symmetry operators (printed
p. 94): the book prints ±4̲_z (underlined, without overbar) as the last operator, where the row's
generators σ(4), σ(7), σ'(1) give `±-4'_z`. As printed, ±4_z would occur with and without time
reversal, and the row would have no fourfold rotoinversion although it contains `-1'` and `±4_z`.
`table-6.md` has the correct value; see its pass-6 note.

**Relation to Point Group Symbols:** The generating matrices provide the actual mathematical
implementation of the symmetry operations denoted by Hermann–Mauguin and Schoenflies symbols.

---

## 5. Property Tensor Types: Polar/Axial and i-/c-Tensors

### Polar Tensors and Axial Tensors (Pseudotensors)

Source: Birss Ch. 2, §2 (scanned PDF page 32, printed page 45), eqs. (2.11)–(2.14).

Under a change of coordinate axes described by transformation matrix $l_{ij}$, the components of a
**polar tensor** of rank $m$ transform as:
$$d_{ijk\ldots n} = l_{ip}\,l_{jq}\,l_{kr}\cdots l_{ns}\;d_{pqr\ldots s} \tag{2.11/2.12}$$
An **axial tensor** (also called a **pseudotensor**) transforms with an additional factor of
$|l| = \det(l)$:
$$d_{ijk\ldots n} = |l|\;l_{ip}\,l_{jq}\,l_{kr}\cdots l_{ns}\;d_{pqr\ldots s} \tag{2.13/2.14}$$

For **proper rotations** ($\det(l) = +1$), polar and axial tensors are indistinguishable — they obey
the same transformation rule. The difference appears only under **improper operations** (inversion,
reflections; $\det(l) = -1$): an axial tensor component picks up an extra sign flip relative to the
corresponding polar component.

**Immediate consequence** (Birss, immediately after eq. 2.14): axial tensors of **even** rank and
polar tensors of **odd** rank vanish identically in every centrosymmetric crystal class (the 11
classes containing the inversion), because applying the inversion ($|l|=-1$) simultaneously forces
$d = d$ and $d = -d$. This is the centrosymmetric nullity rule used throughout §7 and §10.

**Common examples by rank:**

| Rank | Polar | Axial |
|------|-------|-------|
| 1 (vector) | Electric field **E**, polarisation **P**, position **r** | Magnetic field **H**, magnetic moment **m**, angular momentum **L** |
| 2 | Dielectric permittivity $\varepsilon_{ij}$, thermal conductivity $\kappa_{ij}$ | Optical gyration tensor $g_{ij}$ |
| 3 | Piezoelectric coefficients $d_{ijk}$ | Piezomagnetic coefficients $Q_{ijk}$ |
| 4 | Elastic stiffness $c_{ijkl}$ | Piezo-optical tensor $p_{ijkl}$ |

In the derivation procedure (§7), eq. (2.12) is applied for polar tensors and eq. (2.14) for axial
tensors when imposing the crystal symmetry constraints. Tables 4b–4f give the allowed forms for
both types, with separate columns (or separate table-4x entries for odd-rank tensors) covering
polar and axial cases.

### i-Tensors and c-Tensors (Time-Reversal Behaviour)

Source: Birss Ch. 3, §3 (scanned PDF page 61, printed page 102).

For magnetically ordered crystals described by the 122 magnetic point groups (Table 6/7), property
tensors are additionally classified by their behaviour under the **time-reversal operator** R
(= `1'`):

- An **i-tensor** ("**i**nvariant"): components are *unchanged* under R,
  $d_{ijk\ldots} \xrightarrow{R} +\,d_{ijk\ldots}$. Examples: electric permittivity, elastic
  stiffness, thermal conductivity.
- A **c-tensor** ("**c**hange of sign"): components *all flip sign* under R,
  $d_{ijk\ldots} \xrightarrow{R} -\,d_{ijk\ldots}$. Examples: piezomagnetic tensor, magnetic
  susceptibility (as a property relating magnetic field to magnetisation in a magnetically ordered
  material).

Birss uses **m** for even rank (m ∈ {0, 2, 4} → Tables 4b, 4d, 4f) and **n** for odd
rank (n ∈ {1, 3} → Tables 4c, 4e) throughout Tables 4a–4f and Table 7.

This classification combines with polar/axial to give **eight categories** (2 × 2 × 2),
each with its own Table 7 column (columns 5–12):

| Col | Category |
|-----|----------|
| 5 | i-tensor, polar, even rank *m* |
| 6 | i-tensor, axial, even rank *m* |
| 7 | i-tensor, polar, odd rank *n* |
| 8 | i-tensor, axial, odd rank *n* |
| 9 | c-tensor, polar, even rank *m* |
| 10 | c-tensor, axial, even rank *m* |
| 11 | c-tensor, polar, odd rank *n* |
| 12 | c-tensor, axial, odd rank *n* |

The i-/c-tensor distinction is only meaningful for magnetically ordered crystals. For **classical
point groups** (𝒢, type I) and **grey groups** (𝒢′, type II — time-reversal itself a symmetry),
all c-tensors vanish identically. The full treatment — how to read i-/c-tensor symbol classes from
Table 7, and the nullity rules (a)–(e) governing when specific tensor types vanish — is in §11
and §13.

---

## 6. Tensor Component Notation

### Symbol Classes A–U

Table 4a assigns each of the 32 crystal classes a **symbol class** — a letter A through
U — separately for each of the four tensor-type columns (polar/axial × even-rank-m /
odd-rank-n). There are **21 distinct symbol classes** (the first 21 letters of the
alphabet), fewer than 32 because many crystal classes share the same tensor form:

| Crystal system | Symbol letters used |
|----------------|-------------------|
| Triclinic | A |
| Monoclinic | B, C |
| Orthorhombic | D, E |
| Tetragonal | F, G, H, I, J |
| Trigonal | K, L, M |
| Hexagonal | N, O, P, Q, R |
| Cubic | S, T, U |

- The **subscript suffix** (`_m` or `_n`) identifies even vs. odd rank only. The same
  letter in different ranks always refers to the same set of crystal classes — e.g. `H_m`
  (tetragonal 422/4mm/-42m/4/mmm, polar even) at rank 2 → row H2 in Table 4d, at rank 4
  → row H4 in Table 4f.
- A **dash** (`–`) in Table 4a's entry means the tensor type vanishes entirely in that
  class (applying the constraint equations gives zero for all components).
- The symbol class for hexagonal classes 622, 6mm, -6m2, 6/mmm is **P** for polar and
  **P** for axial-odd (columns 1 and 4 in Table 4a); axial-even tensors vanish in 6/mmm
  (Table 4a entry `–`).
- The lookup chain is: **point group → Table 4a → symbol class → Table 4b–4f row →
  independent components**. See §8 for the full step-by-step lookup procedure.

### Grouped Component Notation

The tables use **subscript counts** in parentheses to denote **equivalent components under the group**:

| Notation | Meaning | Example components |
|---|---|---|
| `xx, yy, zz` | Single components (no grouping) | 1 each |
| `xy(2)` | Two equivalent unrestricted permutations | `xy, yx` |
| `xxy(3)` | Three unrestricted permutations | `xxy, xyx, yxx` |
| `xxxz(4)` | Four unrestricted permutations | `xxxz, xxzx, xzxx, zxxx` |
| `yxxx(x·3)` | Three components fixing last index, permuting first three | `yxxx, xyxx, xxyx` |
| `xxyy(x:3)` | Three components fixing first index, permuting last three | `xxyy, xyxy, xyyx` |
| `xxyz(c4)` | Four **cyclic permutations** of indices | `xxyz, yzxx, zxxy, xyzx` |
| `zzxy(xy:6)` | Six permutations **preserving x before y** | `zzxy, zxzy, zxyz, xzzy, xzyz, xyzz` |

### Minus Signs in Tables
- **Minus signs** (e.g., `-xx`, `-xy`) denote **inversion-odd** components (sign reversed relative to the positive case).
- **0** indicates that component **vanishes** in that crystal class.

---

## 7. Deriving Tensor Forms: Systematic Procedure

### Neumann's Principle

Source: Birss Ch. 2, §2 (scanned PDF page 32, printed page 44).

**Neumann's Principle** states that every physical property of a crystal must be invariant
under all symmetry operations of the crystal's point group. Mathematically, this means
that if $\mathbf{g}$ is any symmetry operation of the crystal class (one of the elements
of the point group), then the property tensor $d_{ij\ldots}$ must satisfy:

- For a **polar** tensor: $d_{ij\ldots} = O_{ip}O_{jq}\cdots d_{pq\ldots}$ (eq. 2.12)
- For an **axial** tensor: $d_{ij\ldots} = |g|\,O_{ip}O_{jq}\cdots d_{pq\ldots}$ (eq. 2.14)

for every generating matrix $O$ of the class (§4). These constraint equations are the
direct mathematical expression of Neumann's Principle. Imposing them for all generators
simultaneously — the systematic procedure of §5 of Birss Ch. 2 — eliminates or equates
components and determines the reduced tensor form. Tables 4a–4f give the pre-computed
solutions for all 32 crystal classes and all ranks 0–4.

### General Method (§5 of Birss Chapter 2)

To find the independent components of a property tensor of rank **m** in a specific crystal class:

1. **Choose the generating matrices** σ(i) for that class (from Table 3, column 8).

2. **Apply the constraint equation** for polar tensors:
   $$\mathbf{d}_{ij...k} = \sum_n O_{i p} O_{j q} \cdots O_{k r} d_{pq...r}$$
   where the $O_{ij}$ are components of each generating matrix $\sigma$.

3. **For axial tensors**, apply the same equation with an additional factor of $\det(\sigma)$:
   $$\mathbf{d}_{ij...k} = \det(\sigma) \sum_n O_{i p} O_{j q} \cdots O_{k r} d_{pq...r}$$

4. **Systematically substitute** each generating matrix into the constraint equation.

5. **Collect all independent coefficients** that satisfy all constraints simultaneously.

### Example: Fourth-Rank Tensor in Class 6/mmm

For the hexagonal class **6/mmm**, Table 3 lists four generating matrices — σ(1), σ(2), σ(3), σ(6) (Birss equation 2.19):

$$\sigma(1) = \begin{pmatrix} -1 & 0 & 0 \\ 0 & -1 & 0 \\ 0 & 0 & -1 \end{pmatrix}, \quad \sigma(2) = \begin{pmatrix} -1 & 0 & 0 \\ 0 & 1 & 0 \\ 0 & 0 & -1 \end{pmatrix}, \quad \sigma(3) = \begin{pmatrix} -1 & 0 & 0 \\ 0 & -1 & 0 \\ 0 & 0 & 1 \end{pmatrix}, \quad \sigma(6) = \begin{pmatrix} -\frac{1}{2} & \frac{1}{2}\sqrt{3} & 0 \\ -\frac{1}{2}\sqrt{3} & -\frac{1}{2} & 0 \\ 0 & 0 & 1 \end{pmatrix}$$

Since σ(1) is an inversion (determinant = –1), all **axial** fourth-rank tensors vanish identically in this class. For **polar** tensors, applying each matrix to the general rank-4 tensor produces sets of constraints (detailed in Birss equations 2.20–2.22).

The result for the **polar** rank-4 tensor in 6/mmm is given by **Table 4f, row P4**
(symbol class P_m from Table 4a: class `6/mmm` → P_m → row P4 at m=4). The full form
— Birss equation (2.23), printed p. 67 — has **10 independent components**. The
key structural features are: all components with an odd number of z-indices vanish;
`xxxx` and `yyyy` are equal (hexagonal constraint `xxxx = yyxx + xyyx + yxyx`); the
non-zero components lie in the groups `zzzz`, `xxyy/yyxx`, and `xxzz/zzxx/yyzz/zzyy`.

Lookup chain: class `6/mmm` → Table 4a → P_m → row P4 in Table 4f.

This is the crystal-symmetry result alone. Additional equalities arise from the
**physical index symmetry** of specific rank-4 tensors — see **Intrinsic Symmetry and
Particularization** below for how elastic stiffness and related rank-4 tensors in 6/mmm
reduce the count from 10 to 5, 6, or 3 depending on their physical constraints.

### Worked Example: Polar Rank-2 Tensor in Class 2/m

This example carries the procedure all the way through to a Table 4d row, for a
smaller (rank-2) case. Table 3 lists class **2/m** (C<sub>2h</sub>) with generators **σ(1), σ(3)**:

$$\sigma(1) = \begin{pmatrix} -1 & 0 & 0 \\ 0 & -1 & 0 \\ 0 & 0 & -1 \end{pmatrix}, \qquad \sigma(3) = \begin{pmatrix} -1 & 0 & 0 \\ 0 & -1 & 0 \\ 0 & 0 & 1 \end{pmatrix}$$

A general polar rank-2 tensor has 9 components $d_{ij}$ ($i,j \in \{x,y,z\}$). Apply
the constraint $d_{ij} = O_{ip}O_{jq}d_{pq}$ for each generator:

**Step 1 — σ(1) (inversion):** $O_{ip} = -\delta_{ip}$, so
$O_{ip}O_{jq}d_{pq} = (-\delta_{ip})(-\delta_{jq})d_{pq} = d_{ij}$. The constraint
$d_{ij} = d_{ij}$ is trivially true for every component — inversion imposes **no**
restriction on a polar rank-2 (even-rank) tensor, as expected from the rule above.

**Step 2 — σ(3) ($2_z$):** $O = \mathrm{diag}(-1,-1,1)$ is diagonal, so
$O_{ip}O_{jq}d_{pq} = O_{ii}O_{jj}d_{ij}$ (no sum). The sign factor $O_{ii}O_{jj}$ is
$+1$ if $i,j$ are both in $\{x,y\}$ or both equal to $z$, and $-1$ if exactly one of
$i,j$ is $z$:

| Component | $O_{ii}O_{jj}$ | Constraint | Result |
|---|---|---|---|
| $d_{xx}, d_{yy}, d_{zz}$ | $+1$ | $d_{ii}=d_{ii}$ | survives |
| $d_{xy}, d_{yx}$ | $(-1)(-1)=+1$ | $d_{xy}=d_{xy}$ | survives |
| $d_{xz}, d_{zx}, d_{yz}, d_{zy}$ | $(-1)(1)=-1$ | $d_{iz}=-d_{iz}$ | $=0$ |

**Step 3 — Reduced form:** the independent, non-vanishing components are
$d_{xx}, d_{yy}, d_{zz}, d_{xy}, d_{yx}$; all components with exactly one $z$ index
vanish.

**Step 4 — Confirm via Table 4a/4d:** Table 4a gives class `2/m` the symbol class
`B_m` for "Polar tensor of even rank m" (with reference axes `2//z`, matching σ(3)'s
axis). At $m=2$, row **B2** of Table 4d reads `xx | yy | zz | xy | yx | 0 | 0` for
columns `xx, yy, zz, xy, yx, xz(2), yz(2)` — exactly the reduced form derived above.

### Tensor Equalities Between Crystal Classes

**Key Principle**: Different crystal classes may yield identical tensor forms for the same rank.

- In class **2** (C₂): relation $\sigma = -\sigma(2)$ (for example)
- In class **m** (C_s): relation $\sigma = \sigma(1)$ (mirror plane)
- In class **2/m** (C<sub>2h</sub>): σ(1) and σ(3) are generating matrices

**Consequence**: Polar tensors of even rank are equal in class **2** and **m**; axial tensors of odd rank are equal in these classes.

For **centrosymmetrical** classes (containing inversion, σ(1)):
- Polar tensors of **odd** rank vanish entirely; polar tensors of **even** rank survive
  (the two factors of $-1$ from $O_{ip}O_{jq}$, applied an even number of times, cancel).
- Axial tensors of **even** rank vanish entirely; axial tensors of **odd** rank survive
  (the extra $\det(\sigma)=-1$ factor flips the parity relative to the polar case).

(Confirmed against Table 4a: class `2/m` has `-` for both "Axial tensor of even rank"
and "Polar tensor of odd rank", but `B_m`/`B_n` for "Polar tensor of even rank"/"Axial
tensor of odd rank".)

**Table 4a Reference**: Lists which tensor symbols ($B_n$, $B_m$, etc.) represent identical forms across different crystal classes. The same symbol appearing in multiple rows indicates equivalent tensors.

### Practical Lookup: Tables 4b–4f

Rather than deriving tensors from scratch, the independent components for each rank in each crystal class are tabulated:

- **Table 4b** (rank 0): Scalars — single component in all classes
- **Table 4c** (rank 1): Vectors — components x, y, z with zeros showing which vanish
- **Table 4d** (rank 2): Symmetric rank-2 tensors — 7 component groups
- **Table 4e** (rank 3): Rank-3 tensors — 15 component groups
- **Table 4f** (rank 4): Rank-4 tensors — up to 25 component groups

Each **row** represents a crystal class; each **column** shows the reduced form of that component in that class (0 = vanishes, variable symbol = survives and is independent).

### Intrinsic Symmetry and Particularization

Source: Birss Ch. 2, §6 (scanned PDF pages 43–44, printed pages 67–70).

**Intrinsic symmetry** refers to the index symmetry that a property tensor possesses by
virtue of the *physical nature* of the property it describes, independently of the
crystal's point-group symmetry. Examples: the elastic stiffness tensor $a_{ijkl}$ (eq.
2.25) is symmetric in each index pair because energy is a quadratic form in the symmetric
strain tensor $E_{ij} = E_{ji}$; the piezomagnetic tensor $Q_{ijk}$ is symmetric in the
last two indices because $E_{jk} = E_{kj}$.

**Particularization** is the process of applying these physical index symmetries on top
of the crystal-symmetry restrictions already encoded in Tables 4a–4f. Tables 4a–4f give
the most general form consistent with the point group alone — particularization then
imposes further equalities among the surviving components, reducing the count of
independent components below what the table gives.

**Worked example — class 6/mmm, rank-4 polar tensors** (Birss printed pp. 68–69):

Starting from the crystal-symmetry form (Table 4f, row P4, Birss eq. 2.23) with 10
independent components:

| Tensor | Physical index symmetry | Resulting independent count | Independent components |
|--------|------------------------|-----------------------------|------------------------|
| $a_{ijkl}$ (elastic energy $U = a_{ijkl}E_{ij}E_{kl}$) | $E_{ij}=E_{ji}$ → pair swap $a_{ijkl}=a_{klij}$; each pair symmetric $a_{ijkl}=a_{jikl}=a_{ijlk}$ | **5** | $a_{1111},\,a_{3333},\,a_{1122},\,a_{1133},\,a_{2323}$ |
| $c_{ijkl}$ (pair $(ij)$ symmetric, pairs NOT interchangeable: $c_{ijkl}\ne c_{klij}$) | $c_{ijkl}=c_{jikl}$, $c_{ijkl}=c_{ijlk}$ only | **6** | $c_{1111},\,c_{3333},\,c_{1133},\,c_{3311},\,c_{2323},\,c_{3223}$ |
| $b_{ijkl}$ (all four indices fully interchangeable) | $b_{ijkl}$ fully symmetric under all permutations of $i,j,k,l$ | **3** | $b_{1122},\,b_{1133},\,b_{3333}$ |

The same crystal-symmetry starting point (row P4, 10 independent) yields three different
physical results depending on the intrinsic symmetry of the specific tensor. The
$a_{ijkl}$ case reproduces the **5 independent hexagonal elastic constants** familiar
from elasticity theory (c₁₁=c₂₂, c₃₃, c₁₂, c₁₃=c₂₃, c₄₄=c₅₅, with c₆₆=(c₁₁−c₁₂)/2).

Birss notes (printed p. 70) that a systematic tabulation of particularized tensor forms
for all intrinsic symmetry types appears in Nye [1955].

---

## 8. Lookup Guide: Using Tables 3, 4a–4f

**To find tensor forms in a specific crystal class:**

1. Locate the **class in Table 3** (by international, Schoenflies, or Shubnikov symbol)
2. Extract the **generating matrices** from column 8
3. To understand what these matrices mean, use **§4** (the σ(0)–σ(9) pool)
4. Look up the class's row in **Table 4a** to find its **symbol class** for the rank you
   want: even rank m∈{0,2,4} → `A_m`...`U_m`, odd rank n∈{1,3} → `A_n`...`U_n`. See Table
   4a's "How to use this table" section for the full point-group → symbol-class lookup
   and rank mapping.
5. To see the resulting **tensor components**, go to the matching row (e.g. `H2`, `F4`)
   in the appropriate **Table 4b–4f** (rank 0–4)
6. To understand the **tensor notation** (why components are grouped, what the count notations mean), use **§6**

**To understand symmetry operations in a specific class:**

1. Look at **Table 3, column 6** for the symmetry operations list
2. Use **§3 and §4** to interpret each operation symbol (rotation vs. roto-inversion, meanings of ⊥, etc.)
3. Reference **§1** for axis conventions in that class

**Key Insight:** The entire point of providing generating matrices is that they determine which tensor components survive in each class through the systematic constraint procedure outlined in **§7**. Tables 4a–4f are the **solutions** to these constraint equations, pre-computed for reference.

---

## 9. Notation Summary Table

| Symbol/Notation | Meaning | Context | Reference |
|---|---|---|---|
| **σ(n)** | n-th generating matrix | Symmetry matrices | Table 3, column 8 |
| **E** or **1** | Identity operation | Symmetry operations | Base of all groups |
| **2_z** | 2-fold axis along z | Symmetry operations | Table 3, column 6 |
| **–2_z** | Mirror ⊥ to z (roto-inversion) | Symmetry operations | Table 3, column 6 |
| **2⊥** | 2-fold axis perpendicular to principal | Symmetry operations | Tables 3, 4c–4f |
| **–2⊥** | Mirror perpendicular to principal | Symmetry operations | Tables 3, 4c–4f |
| **3(2⊥)** | Three equivalent 2-fold axes ⊥ | Symmetry operations | Table 3 row D₃ |
| **3(–2⊥)** | Three mirrors ⊥ (in 3m class) | Symmetry operations | Table 3 row C₃ᵥ |
| **.** (dot) | Axis with parallel/containing mirror(s) | Shubnikov notation | `2.m`, `4.m`, `–6.m` |
| **:** (colon) | Axis with perpendicular mirror(s)/axes | Shubnikov notation | `2:m`, `4:2`, `m.2:m` |
| **/** (slash) | Cubic-only: [111]-type axes / [100]-type axes | Shubnikov notation | `3/2`, `–6/4` |
| **(3)** | Three unrestricted permutations | Tensor notation | Table 4e (e.g., `xxy(3)`) |
| **(x·3)** | Three permutations fixing last index | Tensor notation | Table 4f (e.g., `yxxx(x·3)`) |
| **(x:3)** | Three permutations fixing first index | Tensor notation | Table 4f (e.g., `xxyy(x:3)`) |
| **(c4)** | Four cyclic permutations | Tensor notation | Table 4f (e.g., `xxyz(c4)`) |
| **(xy:6)** | Six permutations preserving x before y | Tensor notation | Table 4f (e.g., `zzxy(xy:6)`) |
| **0** | Component vanishes in this class | Tensor tables | Tables 4b–4f |
| **–n** (barred) | Barred n-fold roto-inversion axis | Symmetry operations (Table 3) | –1, –2, –3, –4, –6 in point group symbols |
| **–** in tensors | Minus sign coefficient on component | Tensor tables (Tables 4b–4f) | Indicates negative coefficient or inversion-odd component |
| **⊥** | Perpendicular symbol | Symmetry operations | Replaces book's perpendicular mark |

---

## 10. Null Property Tensors: Classical Point Groups

Source: Birss Ch. 2, §7 (printed pp. 71–73).

This section summarizes which tensor properties are identically zero ("forbidden" effects)
in the 32 classical point groups. For the extension to magnetically ordered crystals, see §13.

**Rank > 2**: For tensors of rank greater than the third, the *only* restriction
imposed by spatial symmetry is the centrosymmetric nullity rule established in §5 and §7:
in the 11 centrosymmetric classes (`-1, 2/m, mmm, 4/m, 4/mmm, -3, -3m, 6/m, 6/mmm, m3,
m3m`), polar tensors of odd rank and axial tensors of even rank vanish identically;
otherwise no general nullity is imposed by symmetry. The same rule covers general
third-rank tensors too, although for a *particular* third-rank tensor,
particularization by intrinsic (index) symmetry can additionally force it to vanish in
a non-centrosymmetric class — e.g. the piezomagnetic tensor component $H_3 = 0$ for
class `422`.

**Rank 2 (general tensor, not assuming intrinsic symmetry)**:
- A general second-rank **polar** tensor (e.g. permittivity) is never forced to zero
  by symmetry in *any* of the 32 classes.
- A general second-rank **axial** tensor (e.g. the optical gyration tensor) vanishes
  identically in the 11 centrosymmetric classes, **and additionally** in `-6, -6m2,
  -43m` — these three classes have Table 4a "Axial tensor of even rank m" symbol
  classes `O_m`, `R_m`, `U_m`, and rows `O2`, `R2`, `U2` in Table 4d are all-zero. 14
  classes in total therefore exhibit no general second-rank axial-tensor properties
  (e.g. no piezomagnetism).

**Rank 1 (polar and axial vectors — pyroelectricity and pyromagnetism)**:
- A **polar vector** (pyroelectricity) is forbidden in the 11 centrosymmetric classes
  and additionally in `222, -4, 422, -42m, 32, -6, 622, -6m2, 23, 432, -43m` — these 11
  classes have Table 4a "Polar tensor of odd rank n" symbol classes `D_n, G_n, H_n,
  J_n, L_n, O_n, P_n, R_n, S_n, T_n, U_n`, and rows `D1, G1, H1, J1, L1, O1, P1, R1, S1,
  T1, U1` in Table 4c are all `0, 0, 0`. 22 classes in total forbid pyroelectricity;
  the remaining **10** classes — `1, 2, m, mm2, 4, 4mm, 3, 3m, 6, 6mm` — permit it
  (the 10 polar point groups).
- An **axial vector** (pyromagnetism) is permitted **only** in the 13 classes `1, -1,
  2, m, 2/m, 4, -4, 4/m, 3, -3, 6, -6, 6/m` — these have Table 4a "Axial tensor of odd
  rank n" symbol classes `A_n, B_n, F_n, K_n, N_n`, whose Table 4c rows (`A1`, `B1`,
  `F1`, `K1`, `N1`) have a nonzero `z` component. In the remaining 19 classes,
  pyromagnetism is forbidden.

---

# PART II — Magnetic Point Groups

---

## 11. Magnetic Point Groups: Classification, Tables 6–7, and Time-Reversal Notation

### The 122 Magnetic Point Groups: 𝒢, 𝒢′, and 𝓜

Birss Ch. 3, §2 (printed pp. 84–85) divides the 122 magnetic point groups into three
sets, according to how the time-reversal operator `R` (= `1'`) enters the group:

- **𝒢** (32, "classical groups", printed in **bold** in the book): `R` is not a
  symmetry operator at all — these are the ordinary 32 point groups of Table 3.
- **𝒢′** (32, "non-magnetic groups"): `R` is itself a symmetry operator, so
  `𝒢′ = 𝒢 ∪ R𝒢`. Birss writes these with the **same Hermann–Mauguin symbol as 𝒢**,
  distinguished only by typeface (non-bold) — these are the groups usually called the
  **"grey" groups** elsewhere in the literature.
- **𝓜** (58, "additional magnetic groups", black-and-white/primed): `R` occurs only
  combined with some of `𝒢`'s operators, via `M = H ∪ (G\H)'` (§12).

`32 + 32 + 58 = 122`.

**Tables 6 and 7 list only 90 rows — the 32 `𝒢` plus the 58 `𝓜`.** The 32 grey groups
`𝒢′` are not given separate rows, because for every `𝒢′`, `R` is itself a symmetry
operator, so:
- its i-tensor symbol class is identical to `𝒢`'s (the same-named, already-present
  type-I row of Table 7), and
- **every c-tensor is identically null** (a c-tensor changes sign under `R`, but
  `R ∈ 𝒢′` forces `d = -d`, i.e. `d = 0`) — this is rule **(a)** of §13.

A separate `𝒢′` row would therefore just repeat `𝒢`'s i-tensor columns with all
c-tensor columns blank, so Birss omits it.

### Tables 6 and 7: Structure and Lookup

**Table 6** lists the 90 magnetic point groups `𝒢` (32, type I, unprimed) and `𝓜` (58,
black-and-white) described above, using the same `σ(N)`/`σ'(N)` generating-matrix
notation (see the time-reversal/priming notation subsections below for how primed
operations work in Table 6). The remaining 32 magnetic point groups — the grey groups
`𝒢′` — are not listed (see above).

**Table 7** extends Table 4a's 21-letter tensor-symbol-class scheme (`A_m`...`U_m`,
`A_n`...`U_n`) to the 90 magnetic point groups, giving each one an i-tensor and a
c-tensor symbol class. To go from a Table 7 symbol class to the actual tensor
components, apply Table 4a's rank mapping into Tables 4b–4f (m=0/2/4 → Tables 4b/4d/4f,
n=1/3 → Tables 4c/4e) — see §8 for the full lookup procedure.

**i-tensors vs. c-tensors**: for a magnetic point group with International symbol
`column 2`, let `G` = `unprime(column 2)` (the parent classical point group obtained by
dropping all primes, as in §12). A property tensor that is **invariant under time
reversal** ("i" for *invariant*) has the same form as it would in the classical group
`G` — its symbol class is simply **Table 4a's entry for `G`**. A property tensor that
**changes sign under time reversal** ("c" for *change of sign*, e.g. tensors relating
to magnetic moments) instead has its symbol class derived from Table 4a's entries for
the magnetic point group's two "Associated classical group" columns (A and B, Table 7
columns 3–4) via the cross-formula documented in table-7.md's "Notes and Status"
section. Table 7's columns 5–8 tabulate the i-tensor symbol classes and columns 9–12
the c-tensor symbol classes, for polar/axial tensors of even and odd rank.

### Parenthesized Group Symbols and Rotated Axis Settings

Parenthesized group symbols appear in three places in Table 7:

1. **Column 2** (the magnetic point group itself): three rows — `(2'm'm)`, `(-4'm2')`,
   `(-6'2m')`.
2. **Columns 3–4** (associated classical groups A and B): four distinct classical group
   symbols — `(m2m)`, `(-4m2)`, `(-42m)`, `(-62m)`.
3. **Columns 5–12** (tensor symbols): any symbol derived from a parenthesized group in
   columns 2–4 is itself written in parentheses, e.g. `(J_m)`, `(R_n)`.

In every case, a parenthesized symbol denotes the **same abstract group** as the
unparenthesized version of the same name, but **in a non-standard axis orientation**
within the crystal coordinate frame.

**Why it arises in columns 3–4 (A and B).** For each black-and-white magnetic group M,
the associated group A is built algebraically as `A = H ∪ (−c₁)H`, where H is the
subgroup of M's unprimed spatial operations and c₁ is the spatial part of one of M's
time-reversed elements. This construction inherits M's crystal coordinate frame — it
does not re-orient the result to match A's standard Hermann–Mauguin axis convention. The
group A produced may therefore have its symmetry axes pointing in non-standard directions.
For example, for M = `2'm'm`, the A constructed from M's elements is abstractly identical
to mm2 (C<sub>2v</sub>), but its 2-fold axis ends up along **y** rather than **z** (as the standard
`mm2` symbol assumes). Birss writes this as `(m2m)`.

**Why it arises in column 2.** The three parenthesized magnetic groups in column 2 are
genuine magnetic point groups, but expressed in a non-standard axis orientation within
their crystal system — the same phenomenon, now affecting the magnetic group symbol
itself rather than a derived classical group.

**Propagation to tensor symbols (columns 5–12).** Whenever a symbol-class letter in
columns 5–12 is derived from a parenthesized group symbol in columns 2–4, it inherits
the parentheses. This is purely a bookkeeping flag; the letter itself (J, R, etc.) is
unchanged.

**Practical effect.** Tensor components are tied to the fixed crystal axes, so a group
in a non-standard orientation genuinely suppresses *different* specific components than
the standard-orientation group — e.g. `mm2` (2-fold along z) and `(m2m)` (2-fold along
y) zero out different index combinations. However, the **symbol class letter** is the
same for both, so for the purpose of Table 4a lookups — the main use of Table 7 — a
parenthesized symbol is treated as fully equivalent to its unparenthesized counterpart.
Only a component-level analysis (going beyond the symbol class to read specific entries
in Tables 4b–4f) would require accounting for the axis permutation.

**Reference: parenthesized classical groups in A/B columns:**

| Symbol | Abstract group | Non-standard feature |
|--------|---------------|----------------------|
| `(m2m)` | mm2 (C<sub>2v</sub>) | 2-fold along y instead of z |
| `(-4m2)` | -42m (D<sub>2d</sub>) | one of the two standard settings of D<sub>2d</sub> |
| `(-42m)` | -42m (D<sub>2d</sub>) | the other standard setting of D<sub>2d</sub>, in non-standard crystal-frame orientation |
| `(-62m)` | -6m2 (D<sub>3h</sub>) | alternate setting of D<sub>3h</sub> (-6m2 vs. -62m) |

**Reference: parenthesized magnetic groups in column 2:**

| Symbol | Abstract group | Rows |
|--------|---------------|------|
| `(2'm'm)` | 2'm'm (C<sub>2v</sub> with time reversal) | 16 |
| `(-4'm2')` | -4'm2' (D<sub>2d</sub> with time reversal) | 37 |
| `(-6'2m')` | -6'2m' (D<sub>3h</sub> with time reversal) | 71 |

### The Time-Reversal Operator and Primed Operations
- **1'** = the time-reversal (antisymmetry) operator (Birss Ch. 3, §2; eq. 3.15a–3.16b).
- A **primed operation** `g'` = the spatial symmetry operation `g` combined with time reversal.
- Magnetic point group symbols (Table 6, column 2) and their "Symmetry operators" lists (column 6)
  mark primed elements with a trailing `'`, e.g. `-1'`, `2'_z`, `m'`, `4'`, `±4'_z`, `±-3'_z`.

### Prime Placement on Ungrouped Operations
The prime is written immediately after the operation's rotation-order digit `N` — **after** any
leading roto-inversion marker (`-`, `±-`) but **before** any trailing axis subscript (`_z`, `_x`,
`_xy`, `_-xy`, ...) or `⊥`:

- `2'_z`, `-2'_z`, `-2'_xy`, `±4'_z`, `±-4'_z`, `±3'_z`, `±-3'_z`, `±6'_z`, `±-6'_z`
- `-1` (inversion) primes as `-1'`.

### Prime Placement on Grouped Operations `n(m...)`
In a grouped term `n(m...)` (see §3 for the `n(m)` / `n(m⊥)` grouping notation), `n` is a
**multiplicity count**, not an operation, and can never itself carry a prime. The prime belongs on
the operation symbol `m` inside the parentheses, in the **same position** as for ungrouped
operations (immediately after `m`'s rotation-order digit, before any trailing `⊥` or sign suffix):

| Correct | Incorrect |
|---|---|
| `6(2'⊥)` | `6'(2⊥)` |
| `3(-2'⊥)` | `3'(-2⊥)` |
| `3(±4')` | `3'(±4)` |
| `4(±-3')` | `4'(±-3)` |
| `9(-2')` | `9'(-2)` |
| `6(2')` | `6'(2)` |

This rule applies uniformly to the trigonal/hexagonal `n(m⊥)`/`n(-m⊥)` families and the cubic
`n(m)`/`n(-m)`/`n(±m)`/`n(±-m)` families (§3).

### Magnetic Shubnikov Notation
Primes appear analogously in Shubnikov symbols, marking the primed generator/coset, e.g. `4':2`,
`m'.6:m'`, `-6'/4'`.

---

## 12. Deriving Black-and-White Magnetic Point Group Operation Lists: M = H ∪ (G\H)'

For the primed rows of Table 6 (those whose "Classical subgroup (International)" entry, column 4,
is not `-`), the "Symmetry operators" column (column 6) can be derived — and cross-checked —
purely from Table 3, independent of the row's symbol primes or its generating-matrix columns:

- **G** = `unprime(column 2)` — drop all primes from the magnetic point group's International
  symbol to get its parent classical (unprimed) point group. G's operation list is Table 3's
  "Symmetry operations" entry for G.
- **H** = column 4, "Classical subgroup (International)" — an index-2 subgroup of G. H's operation
  list is likewise Table 3's entry for H.
- **M** (column 6) = `H ∪ (G\H)'`, i.e. all of H's operations unprimed, plus every operation in G
  but not in H, each combined with time reversal (primed per §11 above).

### Sanity Check
`unprime(M)` (drop every prime from M) must reproduce G's full Table 3 operation multiset exactly,
and `|M| = |G| = 2|H|`. This catches both element-set errors and prime-placement errors.

### Computing G\H via Atomic Operation Families
Table 3 groups several equivalent operations into single terms (e.g. `3(2⊥)`, `9(2)`, `4(±3)`).
Because H's grouped term may represent only *part* of G's, G\H must generally be computed by
decomposing each system's grouped terms into "atomic operation families" and subtracting counts,
not by literal term subtraction:

- **Triclinic/Monoclinic/Orthorhombic/Tetragonal**: every Table 3 term is already a singleton or an
  atomic pair (`±4_z`/`±-4_z` and `±-4_z`/`±4_z` always travel together as a pair). G\H is a plain
  set difference of terms.
- **Trigonal/Hexagonal**: the relevant families are `2⊥` and `-2⊥`, each occurring with a count of
  0, 3, or 6 depending on the group. `6(X⊥) − 3(X⊥) = 3(X⊥)` (same family label, reduced count) —
  valid because H's 3 axes of type `X⊥` are a literal subset of G's 6.
- **Cubic**: the relevant families are:
  - `2_coord`/`-2_coord` (≤3): 2-fold rotations/mirrors about the 3 coordinate axes — the same axes
    that, when 4-fold symmetry is present, also host the `±4`/`±-4` operations.
  - `2_facediag`/`-2_facediag` (≤6): 2-fold rotations/mirrors about the 6 face-diagonal axes.
  - `±3`/`±-3` (≤4): 3-fold rotations/roto-inversions about the 4 body-diagonal axes — Table 3's
    `4(±3)`/`4(±-3)` terms.
  - `±4`/`±-4` (≤3): 4-fold rotations/roto-inversions about the 3 coordinate axes — Table 3's
    `3(±4)`/`3(±-4)` terms.
  - Table 3's combined `9(2)`/`9(-2)` terms decompose as `2_coord`(3) + `2_facediag`(6).

### Worked Example
For magnetic point group `4'32'` (Table 6, H = `23`):
- G = `432` = `1, 9(2), 4(±3), 3(±4)` (24 operations).
- H = `23` = `1, 3(2), 4(±3)` (12 operations), where H's `3(2)` is the `2_coord`(3) part of G's
  `9(2)`.
- G\H = `9(2) − 3(2) = 6(2)` (the `2_facediag`(6) remainder), plus `3(±4)` (absent from H entirely).
- `(G\H)' = 6(2'), 3(±4')`.
- M = H ∪ (G\H)' = `1, 3(2), 4(±3), 6(2'), 3(±4')` — matching Table 6's entry for `4'32'`.

---

## 13. Null Property Tensors: Magnetic Point Groups

Source: Birss Ch. 3, §5 (printed pp. 122–124).

**Historical motivation.** Curie [1908] and Voigt [1928] unsuccessfully tried to
demonstrate pyromagnetism experimentally; Zocher and Török [1953] then argued that
pyromagnetism is universally "forbidden" by symmetry. Their argument rests on dividing
property tensors by their behavior under time-inversion into **i-tensors** (invariant
under time reversal) and **c-tensors** (change sign under time reversal — see §5). Since
magnetic moment is time-antisymmetric, pyro- and piezomagnetism are characterized by
c-tensors, and Zocher and Török assumed *all* crystals are time-symmetric, so that *all*
c-tensors must vanish. Birss's rebuttal is that this assumption holds only for
diamagnetic/paramagnetic materials (no magnetic order, time-reversal an exact symmetry);
ferro-, ferri-, and antiferromagnetic crystals are *not* time-symmetric, so their
c-tensors need not vanish, and the results of §10 (derived purely from spatial symmetry)
remain the operative "forbidden" conditions for those materials. The magnetic-point-group
framework of §11–§12 makes a systematic treatment of c-tensors possible.

For a magnetic point group, every property tensor is classified (§5) as an
**i-tensor** (Table 7 columns 5–8, depending only on the parent classical group `G`)
or a **c-tensor** (Table 7 columns 9–12, derived from the "Associated classical
groups" A and B). For *static* properties, Birss gives five nullity rules:

- **(a)** For materials with **no magnetic order** (described by the 32 classical
  point groups `𝒢′`, for which time-reversal `1'` is an exact symmetry operation),
  **all c-tensors vanish identically** — it is the *magnetically ordered* crystal's
  magnetic point group, not `𝒢′`, that determines via rules (b)–(e) below whether a
  c-tensor is null.
- **(b)** For the 11 centrosymmetric classical groups (set `n₁`, eq. 3.47 — the same
  11 classes listed in §10: `-1, 2/m, mmm, 4/m, 4/mmm, -3, -3m, 6/m, 6/mmm, m3, m3m`),
  **polar i-tensors of odd rank and axial i-tensors of even rank vanish identically**
  — the same centrosymmetric rule, now applied to the i-tensor of any magnetic point
  group whose parent `G` is in `n₁`.

Within the 90 magnetic point groups (Table 7), two further 21-member subsets `m₂` and
`m₃` are defined (eqs. 3.48–3.49):
- `m₂` = the rows of Table 7 whose c-tensor "Axial tensor of even rank m" (column 10)
  and "Polar tensor of odd rank n" (column 11) entries are *both* blank:
  `-1, 2/m, 2'/m', mmm, m'm'm, 4/m, 4'/m, 4/mmm, 4'/mmm', 4/mm'm', -3, -3m, -3m', 6/m,
  6'/m', 6/mmm, 6'/m'mm', 6/mm'm', m3, m3m, m3m'`
- `m₃` = the rows of Table 7 whose c-tensor "Polar tensor of even rank m" (column 9)
  and "Axial tensor of odd rank n" (column 12) entries are *both* blank:
  `-1', 2/m', 2'/m, m'm'm', mmm', 4/m', 4'/m', 4/m'm'm', 4/m'mm, 4'/m'm'm, -3', -3'm',
  -3'm, 6/m', 6'/m, 6/m'm'm', 6/m'mm, 6'/mm'm, m'3, m'3m', m'3m`

`m₁ = m₂ + m₃` (42 classes) comprises exactly the magnetic point groups that are, or
are derived from, the centrosymmetric classical classes `n₁`. The remaining rules are:

- **(c)** Axial c-tensors of even rank and polar c-tensors of odd rank are null in the
  21 magnetic crystal classes of `m₂`.
- **(d)** Polar c-tensors of even rank and axial c-tensors of odd rank are null in the
  21 magnetic crystal classes of `m₃`.
- **(e)** Axial i-tensors of even rank and polar i-tensors of odd rank are null in the
  42 magnetic crystal classes of `m₁ = m₂ + m₃`.

The detailed application of (a)–(e) to specific effects — analogous to the
pyroelectricity/pyromagnetism discussion in §10, but for magnetically ordered crystals
— is carried out in Birss Chapters 4 and 5 (ferro-/ferrimagnetic and antiferromagnetic
materials).

## Changelog

- **2026-07-04** (birss-app `b500e63`): Extended the documented-misprint inventory with two further book
  errors found by a full 58-row Table 7 rank-3 audit (rows `(-6'2m')` and `-6m'2'`), the
  bracket-spelling caveat (`(-4m2)` vs `(-42m)` for the identical group), and the methodological
  lesson that generator disputes must be arbitrated by Table 7's own parenthesization. All five
  documented book errors re-verified against maintainer book scans.
- **2026-11-20** (PR #4): Added the sixth documented book error, the operator
  ±4̲_z printed for `4/m'mm` in Table 6 (correct: `±-4'_z`).
