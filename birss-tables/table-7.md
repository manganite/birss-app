# Table 7

Source: scanned PDF pages 61-64 in `Birss Symmetry & Magnetism komplett.pdf`
(printed book pages 101-108; the table is printed rotated by 90 degrees and spans these
8 printed pages across 4 scanned-PDF pages), for column 2 ("Magnetic point group,
International"), which is frozen/authoritative and was not edited.

Columns 3-12 (Associated classical groups A/B and i-/c-tensor symbols) are re-derived from
R. R. Birss, *Proc. Phys. Soc.* **79**, 946 (1962), Table 2(a) (paper pp. 953-954, PDF pages 9-10,
0-indexed pages 8-9 of `R_R_Birss_1962_Proc._Phys._Soc._79_946.pdf`), which gives the same 90-row
data as the book's Table 7 in a cleaner, text-based layout, together with the formula for A given
on paper pp. 951-952 (PDF p. 7, 0-indexed page 6).

**Note on bracketed entries**: Three magnetic point group symbols in column 2 are themselves
parenthesized — `(2'm'm)` (row 16), `(-4'm2')` (row 37), `(-6'2m')` (row 71) — and the same
parenthesization convention is used for several "Associated classical group A/B" entries (columns
3-4) and the tensor symbols derived from them: rows 16, 33, 37, 38, 65, 68, 71, 72, 75, 79. A
parenthesized symbol such as `(m2m)`, `(-4m2)`, `(-42m)`, or `(-62m)` denotes the same abstract group
(same Hermann-Mauguin symbol family, same order — e.g. `mm2`/`2mm`/`m2m` are the three settings of
C<sub>2v</sub>, and `-42m`/`-4m2` and `-6m2`/`-62m` are the two settings of D<sub>2d</sub> and
D<sub>3h</sub> respectively) as the unparenthesized group of the same name used elsewhere in this
table, but referred to the alternate (rotated) reference-axis setting. For Table 4a lookups
(i-/c-tensor columns), a parenthesized symbol is treated as equivalent to its unparenthesized
counterpart; a derived tensor symbol is itself written in parentheses whenever it is derived from a
parenthesized A, B, or column-2 group symbol.

**Meaning of the brackets** (Birss's own explanation, text following Table 6, re-verified against
the scan 2026-07-04): a parenthesized *group* symbol is referred to reference axes that are
**not** the standard axes of that symbol family — rotated by π/4 (45°) for the tetragonal
`(-4m2)`/`(-42m)` pair vs. `-42m`, by π/6 (30°) for the hexagonal `(-62m)` vs. `-6m2`, or an axis
permutation for the orthorhombic `(m2m)`, `(2mm)` vs. `mm2`. A parenthesized *tensor* symbol such
as `(R_n)` means the corresponding Table-4x form is valid **in those rotated axes**; expressed in
the row's own fixed frame, the components are the correspondingly transformed form (e.g. `(R_n)`
at rank 3 = R3's standard-frame form rotated 30° = the yyy-family for a row whose standard-frame
form would be the xxx-family, or vice versa). The class letter itself (Table 4a) is unaffected —
for Table-4a lookups a bracketed symbol is equivalent to its unbracketed counterpart.

**Propagation rule** (verified against all 58 black-white rows at rank 3; orthorhombic/tetragonal
bracket placement scan-verified 2026-07-04): a tensor cell is parenthesized iff its source group —
G = unprime(column 2) for the i-columns, A for c-Axial-even/c-Polar-odd, B for
c-Polar-even/c-Axial-odd — is parenthesized **and** the letter's form actually changes under that
source's transform. Frame-neutral letters (D under axis permutations; H, I at 45°; P, Q at 30°;
rank 3) remain unparenthesized even for bracketed sources — see rows `(2'm'm)` (D_n) and
`(-4'm2')` (H_n). The book itself violates this rule in exactly two places, both hexagonal,
documented as book errors below (rows `(-6'2m')` and `-6m'2'`).

**Spelling caveat** (scan-verified 2026-07-04): the letter order *inside* a bracketed group
symbol is not reliable in the book — `4'mm'` prints A = `(-4m2)` while `-42'm'` prints
A = `(-42m)` for the physically identical group (same rotated D<sub>2d</sub>, confirmed by both
rows printing `(J_n)`). The physical statement is carried by the bracket plus the tensor symbols,
not by the letter order within the brackets.

**Application tables** (Table 9 magnetoelectric, Table 10 piezomagnetic, …): these are derived
views of Table 7 with the same bracket semantics relocated onto the group symbols — there being
no per-group tensor cell in those tables, a group is parenthesized whenever the Table-7 cell
governing that effect was parenthesized (or the group is itself column-2-parenthesized). Where
bracketed and unbracketed groups share one printed matrix, the matrix is the standard class form
and applies to the bracketed groups only in their rotated axes (ground-truth verified against the
app's own generators: `4'22'` ME = printed diag(Q₁₁, −Q₁₁, 0) as-is; `4'mm'`/`-42'm'` ME = its
45°-rotation; `2'm'm` ME = its A-permutation). Where a form class contains only bracketed groups,
Birss prints the already-rotated components (Table 10's piezomagnetic row for the five
c-Axial-odd-(R_n) groups uses the yyy-family with parameter Q₁₄) and keeps the brackets as a
provenance flag. Groups whose governing cell is a null form are simply absent from these tables
(R₃ ≡ 0 explains the missing hexagonal (R_m) groups in Table 9; verified by projection).

| System | Magnetic point group (International) | Associated classical group A (International) | Associated classical group B (International) | i-tensor: Polar even rank m | i-tensor: Axial even rank m | i-tensor: Polar odd rank n | i-tensor: Axial odd rank n | c-tensor: Polar even rank m | c-tensor: Axial even rank m | c-tensor: Polar odd rank n | c-tensor: Axial odd rank n |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Triclinic | 1 | - | - | A_m | A_m | A_n | A_n | A_m | A_m | A_n | A_n |
| Triclinic | -1 | - | - | A_m | - | - | A_n | A_m | - | - | A_n |
| Triclinic | -1' | 1 | -1 | A_m | - | - | A_n | - | A_m | A_n | - |
| Monoclinic | 2 | - | - | B_m | B_m | B_n | B_n | B_m | B_m | B_n | B_n |
| Monoclinic | 2' | m | m | B_m | B_m | B_n | B_n | C_m | C_m | C_n | C_n |
| Monoclinic | m | - | - | B_m | C_m | C_n | B_n | B_m | C_m | C_n | B_n |
| Monoclinic | m' | 2 | m | B_m | C_m | C_n | B_n | C_m | B_m | B_n | C_n |
| Monoclinic | 2/m | - | - | B_m | - | - | B_n | B_m | - | - | B_n |
| Monoclinic | 2'/m' | 2/m | m | B_m | - | - | B_n | C_m | - | - | C_n |
| Monoclinic | 2/m' | 2 | 2/m | B_m | - | - | B_n | - | B_m | B_n | - |
| Monoclinic | 2'/m | m | 2/m | B_m | - | - | B_n | - | C_m | C_n | - |
| Orthorhombic | 222 | - | - | D_m | D_m | D_n | D_n | D_m | D_m | D_n | D_n |
| Orthorhombic | 2'2'2 | mm2 | mm2 | D_m | D_m | D_n | D_n | E_m | E_m | E_n | E_n |
| Orthorhombic | mm2 | - | - | D_m | E_m | E_n | D_n | D_m | E_m | E_n | D_n |
| Orthorhombic | m'm'2 | 222 | mm2 | D_m | E_m | E_n | D_n | E_m | D_m | D_n | E_n |
| Orthorhombic | (2'm'm) | (m2m) | mm2 | D_m | (E_m) | (E_n) | D_n | E_m | (E_m) | (E_n) | E_n |
| Orthorhombic | mmm | - | - | D_m | - | - | D_n | D_m | - | - | D_n |
| Orthorhombic | m'm'm | mmm | mm2 | D_m | - | - | D_n | E_m | - | - | E_n |
| Orthorhombic | m'm'm' | 222 | mmm | D_m | - | - | D_n | - | D_m | D_n | - |
| Orthorhombic | mmm' | mm2 | mmm | D_m | - | - | D_n | - | E_m | E_n | - |
| Tetragonal | 4 | - | - | F_m | F_m | F_n | F_n | F_m | F_m | F_n | F_n |
| Tetragonal | 4' | -4 | -4 | F_m | F_m | F_n | F_n | G_m | G_m | G_n | G_n |
| Tetragonal | -4 | - | - | F_m | G_m | G_n | F_n | F_m | G_m | G_n | F_n |
| Tetragonal | -4' | 4 | -4 | F_m | G_m | G_n | F_n | G_m | F_m | F_n | G_n |
| Tetragonal | 4/m | - | - | F_m | - | - | F_n | F_m | - | - | F_n |
| Tetragonal | 4'/m | 4/m | -4 | F_m | - | - | F_n | G_m | - | - | G_n |
| Tetragonal | 4/m' | 4 | 4/m | F_m | - | - | F_n | - | F_m | F_n | - |
| Tetragonal | 4'/m' | -4 | 4/m | F_m | - | - | F_n | - | G_m | G_n | - |
| Tetragonal | 422 | - | - | H_m | H_m | H_n | H_n | H_m | H_m | H_n | H_n |
| Tetragonal | 4'22' | -42m | -42m | H_m | H_m | H_n | H_n | J_m | J_m | J_n | J_n |
| Tetragonal | 42'2' | 4mm | 4mm | H_m | H_m | H_n | H_n | I_m | I_m | I_n | I_n |
| Tetragonal | 4mm | - | - | H_m | I_m | I_n | H_n | H_m | I_m | I_n | H_n |
| Tetragonal | 4'mm' | (-4m2) | -42m | H_m | I_m | I_n | H_n | J_m | (J_m) | (J_n) | J_n |
| Tetragonal | 4m'm' | 422 | 4mm | H_m | I_m | I_n | H_n | I_m | H_m | H_n | I_n |
| Tetragonal | -42m | - | - | H_m | J_m | J_n | H_n | H_m | J_m | J_n | H_n |
| Tetragonal | -4'2m' | 422 | -42m | H_m | J_m | J_n | H_n | J_m | H_m | H_n | J_n |
| Tetragonal | (-4'm2') | 4mm | -42m | H_m | (J_m) | (J_n) | H_n | J_m | I_m | I_n | J_n |
| Tetragonal | -42'm' | (-42m) | 4mm | H_m | J_m | J_n | H_n | I_m | (J_m) | (J_n) | I_n |
| Tetragonal | 4/mmm | - | - | H_m | - | - | H_n | H_m | - | - | H_n |
| Tetragonal | 4'/mmm' | 4/mmm | -42m | H_m | - | - | H_n | J_m | - | - | J_n |
| Tetragonal | 4/mm'm' | 4/mmm | 4mm | H_m | - | - | H_n | I_m | - | - | I_n |
| Tetragonal | 4/m'm'm' | 422 | 4/mmm | H_m | - | - | H_n | - | H_m | H_n | - |
| Tetragonal | 4/m'mm | 4mm | 4/mmm | H_m | - | - | H_n | - | I_m | I_n | - |
| Tetragonal | 4'/m'm'm | -42m | 4/mmm | H_m | - | - | H_n | - | J_m | J_n | - |
| Trigonal | 3 | - | - | K_m | K_m | K_n | K_n | K_m | K_m | K_n | K_n |
| Trigonal | -3 | - | - | K_m | - | - | K_n | K_m | - | - | K_n |
| Trigonal | -3' | 3 | -3 | K_m | - | - | K_n | - | K_m | K_n | - |
| Trigonal | 32 | - | - | L_m | L_m | L_n | L_n | L_m | L_m | L_n | L_n |
| Trigonal | 32' | 3m | 3m | L_m | L_m | L_n | L_n | M_m | M_m | M_n | M_n |
| Trigonal | 3m | - | - | L_m | M_m | M_n | L_n | L_m | M_m | M_n | L_n |
| Trigonal | 3m' | 32 | 3m | L_m | M_m | M_n | L_n | M_m | L_m | L_n | M_n |
| Trigonal | -3m | - | - | L_m | - | - | L_n | L_m | - | - | L_n |
| Trigonal | -3m' | -3m | 3m | L_m | - | - | L_n | M_m | - | - | M_n |
| Trigonal | -3'm' | 32 | -3m | L_m | - | - | L_n | - | L_m | L_n | - |
| Trigonal | -3'm | 3m | -3m | L_m | - | - | L_n | - | M_m | M_n | - |
| Hexagonal | 6 | - | - | N_m | N_m | N_n | N_n | N_m | N_m | N_n | N_n |
| Hexagonal | 6' | -6 | -6 | N_m | N_m | N_n | N_n | O_m | O_m | O_n | O_n |
| Hexagonal | -6 | - | - | N_m | O_m | O_n | N_n | N_m | O_m | O_n | N_n |
| Hexagonal | -6' | 6 | -6 | N_m | O_m | O_n | N_n | O_m | N_m | N_n | O_n |
| Hexagonal | 6/m | - | - | N_m | - | - | N_n | N_m | - | - | N_n |
| Hexagonal | 6'/m' | 6/m | -6 | N_m | - | - | N_n | O_m | - | - | O_n |
| Hexagonal | 6/m' | 6 | 6/m | N_m | - | - | N_n | - | N_m | N_n | - |
| Hexagonal | 6'/m | -6 | 6/m | N_m | - | - | N_n | - | O_m | O_n | - |
| Hexagonal | 622 | - | - | P_m | P_m | P_n | P_n | P_m | P_m | P_n | P_n |
| Hexagonal | 6'22' | (-62m) | (-62m) | P_m | P_m | P_n | P_n | (R_m) | (R_m) | (R_n) | (R_n) |
| Hexagonal | 62'2' | 6mm | 6mm | P_m | P_m | P_n | P_n | Q_m | Q_m | Q_n | Q_n |
| Hexagonal | 6mm | - | - | P_m | Q_m | Q_n | P_n | P_m | Q_m | Q_n | P_n |
| Hexagonal | 6'mm' | -6m2 | (-62m) | P_m | Q_m | Q_n | P_n | (R_m) | R_m | R_n | (R_n) |
| Hexagonal | 6m'm' | 622 | 6mm | P_m | Q_m | Q_n | P_n | Q_m | P_m | P_n | Q_n |
| Hexagonal | -6m2 | - | - | P_m | R_m | R_n | P_n | P_m | R_m | R_n | P_n |
| Hexagonal | (-6'2m') | 622 | (-62m) | P_m | R_m | R_n | P_n | (R_m) | P_m | P_n | (R_n) |
| Hexagonal | -6'm2' | 6mm | (-62m) | P_m | R_m | R_n | P_n | (R_m) | Q_m | Q_n | (R_n) |
| Hexagonal | -6m'2' | -6m2 | 6mm | P_m | R_m | R_n | P_n | Q_m | R_m | R_n | Q_n |
| Hexagonal | 6/mmm | - | - | P_m | - | - | P_n | P_m | - | - | P_n |
| Hexagonal | 6'/m'mm' | 6/mmm | (-62m) | P_m | - | - | P_n | (R_m) | - | - | (R_n) |
| Hexagonal | 6/mm'm' | 6/mmm | 6mm | P_m | - | - | P_n | Q_m | - | - | Q_n |
| Hexagonal | 6/m'm'm' | 622 | 6/mmm | P_m | - | - | P_n | - | P_m | P_n | - |
| Hexagonal | 6/m'mm | 6mm | 6/mmm | P_m | - | - | P_n | - | Q_m | Q_n | - |
| Hexagonal | 6'/mm'm | (-62m) | 6/mmm | P_m | - | - | P_n | - | (R_m) | (R_n) | - |
| Cubic | 23 | - | - | S_m | S_m | S_n | S_n | S_m | S_m | S_n | S_n |
| Cubic | m3 | - | - | S_m | - | - | S_n | S_m | - | - | S_n |
| Cubic | m'3 | 23 | m3 | S_m | - | - | S_n | - | S_m | S_n | - |
| Cubic | 432 | - | - | T_m | T_m | T_n | T_n | T_m | T_m | T_n | T_n |
| Cubic | 4'32' | -43m | -43m | T_m | T_m | T_n | T_n | U_m | U_m | U_n | U_n |
| Cubic | -43m | - | - | T_m | U_m | U_n | T_n | T_m | U_m | U_n | T_n |
| Cubic | -4'3m' | 432 | -43m | T_m | U_m | U_n | T_n | U_m | T_m | T_n | U_n |
| Cubic | m3m | - | - | T_m | - | - | T_n | T_m | - | - | T_n |
| Cubic | m3m' | m3m | -43m | T_m | - | - | T_n | U_m | - | - | U_n |
| Cubic | m'3m' | 432 | m3m | T_m | - | - | T_n | - | T_m | T_n | - |
| Cubic | m'3m | -43m | m3m | T_m | - | - | T_n | - | U_m | U_n | - |

---

## Notes and Status

**How to use the i-/c-tensor columns**: columns 5-12 give i-tensor and c-tensor symbol
classes (`A_m`...`U_m`, `A_n`...`U_n`) using Table 4a's 21-letter scheme. To get the
actual tensor components for a magnetic point group's i- or c-tensor of a given rank,
take the symbol class from the relevant column here (e.g. `F_m`) and apply Table 4a's
rank mapping: even rank m (0/2/4) -> Tables 4b/4d/4f, odd rank n (1/3) -> Tables 4c/4e
(e.g. `F_m` at rank m=4 -> row `F4` in Table 4f). See Table 4a's "How to use this table"
section for the full lookup procedure.

**Column semantics**: Column 2 ("Magnetic point group, International") is the authoritative,
frozen identifier for each of the 90 rows and was never edited in this pass.

- For the **32 classical (type I, unprimed) rows**, "Associated classical group A/B" (columns 3-4)
  is not a meaningful concept — there is no parent/subgroup split for these groups — so both
  columns are set to `-`. For these rows the i-tensor columns (5-8) equal Table 4a's entry for the
  group itself, and the c-tensor columns (9-12) equal the i-tensor columns (i-tensors and c-tensors
  coincide for classical groups).
- For the **58 black-and-white (BW, primed) rows**:
  - **i-tensor columns (5-8)** = Table 4a's entry for `G = unprime(column 2)`, the parent classical
    (grey) group. This is unchanged from the prior pass — i-tensor depends only on G, which is
    determined purely by column 2.
  - **"Associated classical group A" (column 3)** is the group `A = H ∪ (−c₁)H`, where `H` is the
    subgroup of spatial operations *not* paired with time reversal in M (i.e. Table 6's "Classical
    subgroup"), and `c₁` is the spatial part of an operation of M that *is* paired with time
    reversal (Birss, paper p. 951-952). A is read directly from column 3 of the paper's Table 2(a).
  - **"Associated classical group B" (column 4)** is read directly from column 4 of the paper's
    Table 2(a). No closed-form group-theoretic formula for B was found (the paper itself only says
    B "may be identified with a classical point group, listed in column 4 of Table 2(a)") — B is
    *not* simply `G`, `H`, or a simple function of A and H in general.
  - **c-tensor columns (9-12)** are computed from A and B via the cross-formula (validated against
    both the book's scanned Table 7 and the paper's Table 2(a) for several rows):
    - c-tensor Polar even (col 9)  = Table 4a(B), Axial-even column
    - c-tensor Axial even (col 10) = Table 4a(A), Axial-even column
    - c-tensor Polar odd  (col 11) = Table 4a(A), Polar-odd column
    - c-tensor Axial odd  (col 12) = Table 4a(B), Polar-odd column
- **Bracketed alternate-axis entries**: see the header note above. For Table 4a lookups, a
  parenthesized symbol such as `(m2m)`, `(-4m2)`, `(-42m)`, or `(-62m)` is treated as equivalent to
  the unparenthesized group of the same name; a derived tensor symbol is parenthesized in turn
  whenever it comes from a parenthesized A, B, or column-2 group.

**2026-06 pass (paper-based rederivation, then book-verified)**: Re-derived columns 3-12 for all 90
rows using R. R. Birss, *Proc. Phys. Soc.* **79**, 946 (1962), Table 2(a) as the primary source for
columns 3-4 (A, B), combined with Table 4a (frozen/authoritative) for the i-/c-tensor lookups, and
then performed a final pass checking every row directly against the book's own printed Table 7
(printed pp. 101-108) and adjusting cells (including which entries are parenthesized, and the exact
alternate-setting spelling `(m2m)`/`(-4m2)`/`(-42m)`/`(-62m)` used) to match the book exactly.

- This supersedes the prior ("Phase 2") pass, which derived A as `unprime(column 2)` and B as
  Table 6's "Classical subgroup" uniformly for all 58 BW rows. That uniform rule does not match
  Birss's actual A/B values for the great majority of rows (A is generally *not* `unprime(column
  2)`, and B is generally *not* Table 6's classical subgroup).
- **i-tensor columns (5-8) are unchanged from the original Phase 2 values for the vast majority of
  rows** — these depend only on `Table4a(unprime(column 2))`, which was already correct; the
  exceptions are the rows with a parenthesized column-2 symbol (16, 37, 71), where the i-tensor
  symbols derived from the alternate-setting group are themselves written in parentheses (see the
  header note).
- **A and/or B (and consequently the c-tensor columns 9-12) changed for all 58 BW rows** relative to
  the Phase 2 values. The values now match the book's printed Table 7 for all 90 rows, including the
  bracketed alternate-axis entries in rows 16, 33, 37, 38, 65, 68, 71, 72, 75, 79.

All 90 rows now satisfy: i-tensor = Table 4a(G) with `G = unprime(column 2)` (or `G` = the group
itself for classical rows), and for the 58 BW rows, c-tensor = cross-formula(Table4a(A),
Table4a(B)) as defined above, with bracketing propagated per the header note.

**2026-06-30 independent verification (trigonal block, no changes)**: An independent audit of the
11 trigonal rows (`3, -3, -3', 32, 32', 3m, 3m', -3m, -3m', -3'm', -3'm`) re-computed the c-tensor
columns (9-12) from columns 3-4 (A, B) via the cross-formula above, and additionally cross-checked
columns 3-4 against scans of the original source, R. R. Birss, *Proc. Phys. Soc.* **79**, 946
(1962), Table 2(a) — including the delicate ordering `-3m -> -3m' -> -3'm' -> -3'm` with
`(A,B) = (-,-) -> (-3m,3m) -> (32,-3m) -> (3m,-3m)`. No errors found — all 11 rows match both the
cross-formula and the original source. This confirms, independently of the "2026-06 pass" above
(which covers the same rows), that the trigonal block needs no correction.

**2026-07-04 book-error findings (rows `(-6'2m')` and `-6m'2'`)**: a full audit of all 58 BW rows'
rank-3 columns against the app's own generators (see `src/services/table7RankThree.audit.test.ts`)
found two further book errors, both hexagonal, both scan-verified against the maintainer's copy of
the printed book:

- Row `(-6'2m')` (row 71): the book prints the i-cells `R_m`, `R_n` **without** parentheses,
  although column 2 is itself parenthesized and R is frame-sensitive under the π/6 rotation — the
  orthorhombic `(2'm'm)` and tetragonal `(-4'm2')` analogues DO bracket their i-cells. This is a
  bracket omission, not a transcription fault: the cells are transcribed faithfully as printed. No
  physical consequence — the group's own bracketed column 2 already forces the rotated setting, and
  the app's i-ED (yyy-family) is correct. Left as printed; tracked as a documented exception in the
  guard test's print-pattern check.
- Row `-6m'2'`: the book prints A = `-6m2` and the c-cells `R_m`, `R_n` **without** parentheses.
  This contradicts the row's own Table 6 generator σ'(4) = m'⊥y (scan-verified): with the primed
  mirror on the y-family, A = H ∪ (coset representative)·H forces the rotated D<sub>3h</sub>
  setting (the 2-folds on the y-family), and the c-type ED condition under m'⊥y kills the xxx
  component and keeps yyy — the rotated R3 form, not the printed standard R_n. Both facts were
  confirmed numerically. The structurally mirrored neighbour row `-6'm2'` is printed correctly
  (`(-62m)`, `(R_m)`, `(R_n)`). Left as printed (faithful transcription of a book error); the app
  is verified correct (default ED-c = yyy-family; existing setting-2 fixtures are coherent with
  this). Tracked as a documented exception in the guard test, which overrides the expected
  transform to the rotated form this row's own generator forces.

Methodological note: generator disputes must be arbitrated by Table 7 itself — the A-column
parenthesization plus the tensor-cell parenthesization — not by σ-symbol plausibility or
cross-table pattern-matching alone. The 2026-07-02 pass-5 override of `6'/mm'm`'s generator (see
`table-6.md`) over-generalized the σ(2)↔σ(4) misprint pattern documented for Table 3's `-6m2` row
to a case where three independent book-internal signals (the printed generator, Table 7's
`A = (-62m)`, and Table 7's `(R_n)`) said otherwise; see `table-6.md`'s corrected pass-5 note.

## Changelog

- **2026-06-16** (`83e2abb`): Initial transcription, including the paper-based rederivation and
  book-verification pass documented inline above ("2026-06 pass").
- **2026-06-17** (`3eccc94`): Fixed a typo, `6'/mmm'` → `6'/m'mm'`, cross-checked against Table 6's
  correct spelling of the same group.
- **2026-07-02** (`bbe2355`): Folded a standalone independent verification of the 11 trigonal rows
  (no errors found) into this section as an inline pass note; removed the redundant standalone file.
- **2026-07-04** (birss-app `b500e63`): Added precise bracket-semantics + propagation-rule section
  (verified against all 58 BW rows at rank 3). Documented two book-misprint findings from that
  audit as notes (rows `(-6'2m')` and `-6m'2'`); cells left as printed (faithful transcription of
  the book's own errors, not app or transcription faults).
