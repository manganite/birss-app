# Magnetic Point-Group Nomenclature & Generator Reference (`birss-app`)

A self-contained reference for all **122** magnetic point groups: the app's group key, the ITC **Schoenflies** and **full Hermann–Mauguin** notation (the two variants absent from `birss-tables`), the Birss **Shubnikov** symbol, and the Birss **symmetry operators** and **generating matrices** (from Table 6 for the 90 non-grey groups; derived by the ⊗{1,1′} rule for the 32 grey). Table A is the nomenclature; Table B lists operators/generators separately so neither table wraps badly.

This table is one of the **two central convention references** for `birss-app`; its companion is **[`BIRSS-APP-CONVENTIONS-REFERENCE.md`](./BIRSS-APP-CONVENTIONS-REFERENCE.md)** (the convention contract & verification ladder). The operator/generator notation and the σ(N) pool are explained there and in the Reading guide below.

## Reading guide

**Operator notation (Birss).** `1` identity · `-1` inversion (1̄) · `N_a` = N-fold rotation about axis *a* (`2_z`, `4_z`) · `-N_a` = rotoinversion N̄ about *a*; note `-2_a` is the **mirror** ⊥ *a* (so `-2_z` = m_z) · `±N` = both senses (N and N⁻¹) · trailing `'` = **time reversal** (antiunitary/primed operation).

**Multiplicity for high-symmetry axes.** `k(op)` = *k* symmetry-equivalent operations of that type. `⊥` = perpendicular to the principal axis. Examples: `3(2⊥)` = three 2-folds ⊥ c; `3(m⊥)` = three vertical mirrors; `4(±3)` = the four body-diagonal 3-fold axes (both senses); `9(2)` = nine 2-fold axes; `3(±4)` = three 4-fold axes (both senses).

**Generators `σ(N)` / `σ'(N)`.** Indices into the catalogue of generating matrices in **Birss Table 3** (`birss-tables`): `σ` unitary, `σ'` antiunitary (time-reversing). Closing the listed generators reproduces the full operator set. `—` in the σ' column = no antiunitary generator (colourless group).

**Shubnikov.** Given in the **Birss** dot/colon form with `'` for time reversal (app convention). ITC uses **underlining** for the antisymmetric element instead (e.g. ITC `4:2̲` = Birss `4:2'`); see the comparison below.

## Type / colour scheme

| Colour (Bradley–Cracknell) | BC type | ITC type | Construction | Count |
|---|---|---|---|---|
| colourless | I | **MP2** | 32 classical, no time reversal | 32 |
| grey | II | **MP1** | G ⊗ {1, 1'} (adds pure 1') | 32 |
| black-white | III | **MP3** | 1' only in combination (H + R·(G−H)) | 58 |

Colour names are primary; the BC and ITC **numbers are swapped** for I/II (BC-I = ITC-MP2, BC-II = ITC-MP1), which is why numbers alone are avoided.

## Notation at a glance — where App, Birss and ITC differ

Join is always by the **abstract group (Schoenflies `G(H)`)**, never the HM string. The categories below cover every kind of printed-symbol divergence; each spans a **family** of groups (the monoclinic, cubic-bar and grey rows are representatives of their whole families). Everywhere else the three notations agree.

| Abstract group | App key (Birss setting) | Birss Table 6 | ITC 1.5.2.3 | What differs |
|---|---|---|---|---|
| D<sub>2h</sub>(C<sub>2h</sub>) | `m'm'm` (2_z) | `m'm'm` | `mm'm'` (2_x) | **HM symbol**: which axis is the unprimed 2-fold (setting choice) |
| C<sub>2</sub> (all monoclinic) | full `112` (z∥c) | z∥c (first setting) | full `121` (b-unique) | **full-HM position**: unique axis c vs b |
| O<sub>h</sub>(O) — cubic bar family (6 groups) | `m'-3'm'` | `m'3m'` (barless) | `m'3̄'m'` | **short-form style**: app keeps the 3-bar (and its prime); Birss Table 6 drops both. Family: `m-3`, `m'-3'`, `m-3m`, `m-3m'`, `m'-3'm'`, `m'-3'm` |
| C<sub>2v</sub>(C<sub>s</sub>) = `(2'm'm)` | 2-fold ∥ a | 2-fold ∥ a (rotated) | standard | **axis setting** (same symbol, rotated frame) |
| D<sub>4R</sub> (grey, e.g. of D<sub>4</sub>) | `4221'` | `4221'` | Schoenflies `D`<sub>`4R`</sub>, HM `4221'` | grey **Schoenflies** = subscript R; HM = `…1'` |

*(The last row reproduces ITC Table 1.5.2.1: `D`<sub>`4R`</sub> = `4221'`, `D`<sub>`4`</sub> = `422`, `D`<sub>`4`</sub>`(C`<sub>`4`</sub>`)` = `42'2'`, `D`<sub>`4`</sub>`(D`<sub>`2`</sub>`)` = `4'22'`.)*

## App notation conventions

- **Time reversal = prime `'`** (not the Birss/ITC Shubnikov underline).
- **Inversion = leading `-`** (`-1`, `-4`, `-3`).
- **Cubic:** keep the inversion bar on the 3 (`-3`) and its prime where present (`-3'`) — e.g. `m-3`, `m'-3'm'`, `m'-3'm` — standard HM usage, unlike Birss Table 6's bare `m3` / `m'3m'`.
- **Full HM** is given in the **app (Birss) setting** (monoclinic z∥c; D<sub>2h</sub>(C<sub>2h</sub>) = `2'/m' 2'/m' 2/m`); the ITC form is noted per row.
- **Grey (Type II):** Schoenflies uses the ITC subscript **R** (D<sub>4R</sub>); HM uses `…1'`.

## Table A — Nomenclature (90 groups of ITC Table 1.5.2.3)

| System | Schoenflies | App key | HM full | Shubnikov | Type | Note |
|---|---|---|---|---|---|---|
| Triclinic | C<sub>1</sub> | `1` | 1 | `1` | colourless (I / MP2) |  |
| Triclinic | C<sub>i</sub> | `-1` | -1 | `-2` | colourless (I / MP2) |  |
| Triclinic | C<sub>i</sub>(C<sub>1</sub>) | `-1'` | -1' | `-2'` | black-white (III / MP3) |  |
| Monoclinic | C<sub>2</sub> | `2` | 112 | `2` | colourless (I / MP2) | ITC full (b-unique) = 121 |
| Monoclinic | C<sub>2</sub>(C<sub>1</sub>) | `2'` | 112' | `2'` | black-white (III / MP3) | ITC full (b-unique) = 12'1 |
| Monoclinic | C<sub>s</sub> | `m` | 11m | `m` | colourless (I / MP2) | ITC full (b-unique) = 1m1 |
| Monoclinic | C<sub>s</sub>(C<sub>1</sub>) | `m'` | 11m' | `m'` | black-white (III / MP3) | ITC full (b-unique) = 1m'1 |
| Monoclinic | C<sub>2h</sub> | `2/m` | 11 2/m | `2:m` | colourless (I / MP2) | ITC full (b-unique) = 1 2/m 1 |
| Monoclinic | C<sub>2h</sub>(C<sub>i</sub>) | `2'/m'` | 11 2'/m' | `2':m'` | black-white (III / MP3) | ITC full (b-unique) = 1 2'/m' 1 |
| Monoclinic | C<sub>2h</sub>(C<sub>2</sub>) | `2/m'` | 11 2/m' | `2:m'` | black-white (III / MP3) | ITC full (b-unique) = 1 2/m' 1 |
| Monoclinic | C<sub>2h</sub>(C<sub>s</sub>) | `2'/m` | 11 2'/m | `2':m` | black-white (III / MP3) | ITC full (b-unique) = 1 2'/m 1 |
| Orthorhombic | D<sub>2</sub> | `222` | 222 | `2:2` | colourless (I / MP2) |  |
| Orthorhombic | D<sub>2</sub>(C<sub>2</sub>) | `2'2'2` | 2'2'2 | `2:2'` | black-white (III / MP3) |  |
| Orthorhombic | C<sub>2v</sub> | `mm2` | mm2 | `2.m` | colourless (I / MP2) |  |
| Orthorhombic | C<sub>2v</sub>(C<sub>2</sub>) | `m'm'2` | m'm'2 | `2.m'` | black-white (III / MP3) |  |
| Orthorhombic | C<sub>2v</sub>(C<sub>s</sub>) | `2'm'm` | 2'm'm | `2'.m` | black-white (III / MP3) | bracketed: rotated setting (2-fold∥a); Table 6 operators are authority |
| Orthorhombic | D<sub>2h</sub> | `mmm` | 2/m 2/m 2/m | `m.2:m` | colourless (I / MP2) |  |
| Orthorhombic | D<sub>2h</sub>(C<sub>2h</sub>) | `m'm'm` | 2'/m' 2'/m' 2/m | `m'.2:m` | black-white (III / MP3) | **HM DIVERGENCE**: ITC = mm'm' (2_x), full 2/m 2'/m' 2'/m'; app/Birss = m'm'm (2_z) |
| Orthorhombic | D<sub>2h</sub>(D<sub>2</sub>) | `m'm'm'` | 2/m' 2/m' 2/m' | `m'.2:m'` | black-white (III / MP3) |  |
| Orthorhombic | D<sub>2h</sub>(C<sub>2v</sub>) | `mmm'` | 2'/m 2'/m 2/m' | `m.2:m'` | black-white (III / MP3) |  |
| Tetragonal | C<sub>4</sub> | `4` | 4 | `4` | colourless (I / MP2) |  |
| Tetragonal | C<sub>4</sub>(C<sub>2</sub>) | `4'` | 4' | `4'` | black-white (III / MP3) |  |
| Tetragonal | S<sub>4</sub> | `-4` | -4 | `-4` | colourless (I / MP2) |  |
| Tetragonal | S<sub>4</sub>(C<sub>2</sub>) | `-4'` | -4' | `-4'` | black-white (III / MP3) |  |
| Tetragonal | C<sub>4h</sub> | `4/m` | 4/m | `4:m` | colourless (I / MP2) |  |
| Tetragonal | C<sub>4h</sub>(C<sub>2h</sub>) | `4'/m` | 4'/m | `4':m` | black-white (III / MP3) |  |
| Tetragonal | C<sub>4h</sub>(C<sub>4</sub>) | `4/m'` | 4/m' | `4:m'` | black-white (III / MP3) |  |
| Tetragonal | C<sub>4h</sub>(S<sub>4</sub>) | `4'/m'` | 4'/m' | `4':m'` | black-white (III / MP3) |  |
| Tetragonal | D<sub>4</sub> | `422` | 422 | `4:2` | colourless (I / MP2) |  |
| Tetragonal | D<sub>4</sub>(D<sub>2</sub>) | `4'22'` | 4'22' | `4':2` | black-white (III / MP3) |  |
| Tetragonal | D<sub>4</sub>(C<sub>4</sub>) | `42'2'` | 42'2' | `4:2'` | black-white (III / MP3) |  |
| Tetragonal | C<sub>4v</sub> | `4mm` | 4mm | `4.m` | colourless (I / MP2) |  |
| Tetragonal | C<sub>4v</sub>(C<sub>2v</sub>) | `4'mm'` | 4'mm' | `4'.m` | black-white (III / MP3) |  |
| Tetragonal | C<sub>4v</sub>(C<sub>4</sub>) | `4m'm'` | 4m'm' | `4.m'` | black-white (III / MP3) |  |
| Tetragonal | D<sub>2d</sub> | `-42m` | -42m | `-4.m` | colourless (I / MP2) |  |
| Tetragonal | D<sub>2d</sub>(D<sub>2</sub>) | `-4'2m'` | -4'2m' | `-4'.m'` | black-white (III / MP3) |  |
| Tetragonal | D<sub>2d</sub>(C<sub>2v</sub>) | `-4'm2'` | -4'm2' | `-4'.m` | black-white (III / MP3) | bracketed: rotated setting of D2d (Table 7) |
| Tetragonal | D<sub>2d</sub>(S<sub>4</sub>) | `-42'm'` | -42'm' | `-4.m'` | black-white (III / MP3) |  |
| Tetragonal | D<sub>4h</sub> | `4/mmm` | 4/m 2/m 2/m | `m.4:m` | colourless (I / MP2) |  |
| Tetragonal | D<sub>4h</sub>(D<sub>2h</sub>) | `4'/mmm'` | 4'/m 2/m 2'/m' | `m.4':m` | black-white (III / MP3) |  |
| Tetragonal | D<sub>4h</sub>(C<sub>4h</sub>) | `4/mm'm'` | 4/m 2'/m' 2'/m' | `m.4:m'` | black-white (III / MP3) |  |
| Tetragonal | D<sub>4h</sub>(D<sub>4</sub>) | `4/m'm'm'` | 4/m' 2/m' 2/m' | `m'.4:m'` | black-white (III / MP3) |  |
| Tetragonal | D<sub>4h</sub>(C<sub>4v</sub>) | `4/m'mm` | 4/m' 2'/m 2'/m | `m'.4:m` | black-white (III / MP3) |  |
| Tetragonal | D<sub>4h</sub>(D<sub>2d</sub>) | `4'/m'm'm` | 4'/m' 2/m' 2'/m | `m'.4':m'` | black-white (III / MP3) |  |
| Trigonal | C<sub>3</sub> | `3` | 3 | `3` | colourless (I / MP2) |  |
| Trigonal | S<sub>6</sub> | `-3` | -3 | `-6` | colourless (I / MP2) |  |
| Trigonal | S<sub>6</sub>(C<sub>3</sub>) | `-3'` | -3' | `-6'` | black-white (III / MP3) |  |
| Trigonal | D<sub>3</sub> | `32` | 321 | `3:2` | colourless (I / MP2) |  |
| Trigonal | D<sub>3</sub>(C<sub>3</sub>) | `32'` | 32'1 | `3:2'` | black-white (III / MP3) |  |
| Trigonal | C<sub>3v</sub> | `3m` | 3m1 | `3.m` | colourless (I / MP2) |  |
| Trigonal | C<sub>3v</sub>(C<sub>3</sub>) | `3m'` | 3m'1 | `3.m'` | black-white (III / MP3) |  |
| Trigonal | D<sub>3d</sub> | `-3m` | -3 2/m 1 | `-6.m` | colourless (I / MP2) |  |
| Trigonal | D<sub>3d</sub>(S<sub>6</sub>) | `-3m'` | -3 2'/m' 1 | `-6.m'` | black-white (III / MP3) |  |
| Trigonal | D<sub>3d</sub>(D<sub>3</sub>) | `-3'm'` | -3' 2/m' 1 | `-6'.m'` | black-white (III / MP3) |  |
| Trigonal | D<sub>3d</sub>(C<sub>3v</sub>) | `-3'm` | -3' 2'/m 1 | `-6'.m` | black-white (III / MP3) |  |
| Hexagonal | C<sub>6</sub> | `6` | 6 | `6` | colourless (I / MP2) |  |
| Hexagonal | C<sub>6</sub>(C<sub>3</sub>) | `6'` | 6' | `6'` | black-white (III / MP3) |  |
| Hexagonal | C<sub>3h</sub> | `-6` | -6 | `3:m` | colourless (I / MP2) |  |
| Hexagonal | C<sub>3h</sub>(C<sub>3</sub>) | `-6'` | -6' | `3:m'` | black-white (III / MP3) |  |
| Hexagonal | C<sub>6h</sub> | `6/m` | 6/m | `6:m` | colourless (I / MP2) |  |
| Hexagonal | C<sub>6h</sub>(S<sub>6</sub>) | `6'/m'` | 6'/m' | `6':m'` | black-white (III / MP3) |  |
| Hexagonal | C<sub>6h</sub>(C<sub>6</sub>) | `6/m'` | 6/m' | `6:m'` | black-white (III / MP3) |  |
| Hexagonal | C<sub>6h</sub>(C<sub>3h</sub>) | `6'/m` | 6'/m | `6':m` | black-white (III / MP3) |  |
| Hexagonal | D<sub>6</sub> | `622` | 622 | `6:2` | colourless (I / MP2) |  |
| Hexagonal | D<sub>6</sub>(D<sub>3</sub>) | `6'22'` | 6'22' | `6':2` | black-white (III / MP3) |  |
| Hexagonal | D<sub>6</sub>(C<sub>6</sub>) | `62'2'` | 62'2' | `6:2'` | black-white (III / MP3) |  |
| Hexagonal | C<sub>6v</sub> | `6mm` | 6mm | `6.m` | colourless (I / MP2) |  |
| Hexagonal | C<sub>6v</sub>(C<sub>3v</sub>) | `6'mm'` | 6'mm' | `6'.m` | black-white (III / MP3) |  |
| Hexagonal | C<sub>6v</sub>(C<sub>6</sub>) | `6m'm'` | 6m'm' | `6.m'` | black-white (III / MP3) |  |
| Hexagonal | D<sub>3h</sub> | `-6m2` | -6m2 | `m.3:m` | colourless (I / MP2) |  |
| Hexagonal | D<sub>3h</sub>(D<sub>3</sub>) | `-6'2m'` | -6'2m' | `m'.3:m'` | black-white (III / MP3) | bracketed: rotated setting of D3h (Table 7) |
| Hexagonal | D<sub>3h</sub>(C<sub>3v</sub>) | `-6'm2'` | -6'm2' | `m.3:m'` | black-white (III / MP3) |  |
| Hexagonal | D<sub>3h</sub>(C<sub>3h</sub>) | `-6m'2'` | -6m'2' | `m'.3:m` | black-white (III / MP3) |  |
| Hexagonal | D<sub>6h</sub> | `6/mmm` | 6/m 2/m 2/m | `m.6:m` | colourless (I / MP2) |  |
| Hexagonal | D<sub>6h</sub>(D<sub>3d</sub>) | `6'/m'mm'` | 6'/m' 2/m 2'/m' | `m'.6':m'` | black-white (III / MP3) |  |
| Hexagonal | D<sub>6h</sub>(C<sub>6h</sub>) | `6/mm'm'` | 6/m 2'/m' 2'/m' | `m'.6:m` | black-white (III / MP3) |  |
| Hexagonal | D<sub>6h</sub>(D<sub>6</sub>) | `6/m'm'm'` | 6/m' 2/m' 2/m' | `m'.6:m'` | black-white (III / MP3) |  |
| Hexagonal | D<sub>6h</sub>(C<sub>6v</sub>) | `6/m'mm` | 6/m' 2'/m 2'/m | `m.6:m'` | black-white (III / MP3) |  |
| Hexagonal | D<sub>6h</sub>(D<sub>3h</sub>) | `6'/mm'm` | 6'/m 2'/m 2/m' | `m.6':m` | black-white (III / MP3) |  |
| Cubic | T | `23` | 23 | `3/2` | colourless (I / MP2) |  |
| Cubic | T<sub>h</sub> | `m-3` | 2/m -3 | `-6/2` | colourless (I / MP2) | Birss Table 6 short = m3 (barless); app keeps bar |
| Cubic | T<sub>h</sub>(T) | `m'-3'` | 2/m' -3' | `-6'/2` | black-white (III / MP3) | Birss Table 6 short = m'3; app keeps bar+prime |
| Cubic | O | `432` | 432 | `3/4` | colourless (I / MP2) |  |
| Cubic | O(T) | `4'32'` | 4'32' | `3/4'` | black-white (III / MP3) |  |
| Cubic | T<sub>d</sub> | `-43m` | -43m | `3/-4` | colourless (I / MP2) |  |
| Cubic | T<sub>d</sub>(T) | `-4'3m'` | -4'3m' | `3/-4'` | black-white (III / MP3) |  |
| Cubic | O<sub>h</sub> | `m-3m` | 4/m -3 2/m | `-6/4` | colourless (I / MP2) | Birss Table 6 short = m3m (barless); app keeps bar |
| Cubic | O<sub>h</sub>(T<sub>h</sub>) | `m-3m'` | 4'/m -3 2'/m' | `-6/4'` | black-white (III / MP3) | Birss Table 6 short = m3m'; app keeps bar |
| Cubic | O<sub>h</sub>(O) | `m'-3'm'` | 4/m' -3' 2/m' | `-6'/4'` | black-white (III / MP3) | Birss Table 6 short = m'3m'; app keeps bar+prime |
| Cubic | O<sub>h</sub>(T<sub>d</sub>) | `m'-3'm` | 4'/m' -3' 2'/m | `-6'/4` | black-white (III / MP3) | Birss Table 6 short = m'3m; app keeps bar+prime |

## Table B — Symmetry operators & generators (Birss Table 6)

| Schoenflies | App key | Symmetry operators | σ(N) / σ'(N) |
|---|---|---|---|
| C<sub>1</sub> | `1` | 1 | σ(0)  /  — |
| C<sub>i</sub> | `-1` | 1, -1 | σ(1)  /  — |
| C<sub>i</sub>(C<sub>1</sub>) | `-1'` | 1, -1' | σ(0)  /  σ'(1) |
| C<sub>2</sub> | `2` | 1, 2_z | σ(3)  /  — |
| C<sub>2</sub>(C<sub>1</sub>) | `2'` | 1, 2'_z | σ(0)  /  σ'(3) |
| C<sub>s</sub> | `m` | 1, -2_z | σ(5)  /  — |
| C<sub>s</sub>(C<sub>1</sub>) | `m'` | 1, -2'_z | σ(0)  /  σ'(5) |
| C<sub>2h</sub> | `2/m` | 1, -1, 2_z, -2_z | σ(1), σ(3)  /  — |
| C<sub>2h</sub>(C<sub>i</sub>) | `2'/m'` | 1, -1, 2'_z, -2'_z | σ(1)  /  σ'(3) |
| C<sub>2h</sub>(C<sub>2</sub>) | `2/m'` | 1, 2_z, -1', -2'_z | σ(3)  /  σ'(1) |
| C<sub>2h</sub>(C<sub>s</sub>) | `2'/m` | 1, -2_z, -1', 2'_z | σ(5)  /  σ'(1) |
| D<sub>2</sub> | `222` | 1, 2_x, 2_y, 2_z | σ(2), σ(3)  /  — |
| D<sub>2</sub>(C<sub>2</sub>) | `2'2'2` | 1, 2_z, 2'_x, 2'_y | σ(3)  /  σ'(2) |
| C<sub>2v</sub> | `mm2` | 1, 2_z, -2_x, -2_y | σ(3), σ(4)  /  — |
| C<sub>2v</sub>(C<sub>2</sub>) | `m'm'2` | 1, 2_z, -2'_x, -2'_y | σ(3)  /  σ'(4) |
| C<sub>2v</sub>(C<sub>s</sub>) | `2'm'm` | 1, -2_z, 2'_x, -2'_y | σ(5)  /  σ'(4) |
| D<sub>2h</sub> | `mmm` | 1, -1, 2_x, 2_y, 2_z, -2_x, -2_y, -2_z | σ(1), σ(2), σ(3)  /  — |
| D<sub>2h</sub>(C<sub>2h</sub>) | `m'm'm` | 1, -1, 2_z, -2_z, 2'_x, 2'_y, -2'_x, -2'_y | σ(1), σ(3)  /  σ'(2) |
| D<sub>2h</sub>(D<sub>2</sub>) | `m'm'm'` | 1, 2_x, 2_y, 2_z, -1', -2'_x, -2'_y, -2'_z | σ(2), σ(3)  /  σ'(1) |
| D<sub>2h</sub>(C<sub>2v</sub>) | `mmm'` | 1, 2_z, -2_x, -2_y, -1', 2'_x, 2'_y, -2'_z | σ(3), σ(4)  /  σ'(1) |
| C<sub>4</sub> | `4` | 1, 2_z, ±4_z | σ(7)  /  — |
| C<sub>4</sub>(C<sub>2</sub>) | `4'` | 1, 2_z, ±4'_z | σ(3)  /  σ'(7) |
| S<sub>4</sub> | `-4` | 1, 2_z, ±-4_z | σ(8)  /  — |
| S<sub>4</sub>(C<sub>2</sub>) | `-4'` | 1, 2_z, ±-4'_z | σ(3)  /  σ'(8) |
| C<sub>4h</sub> | `4/m` | 1, -1, 2_z, -2_z, ±4_z, ±-4_z | σ(1), σ(7)  /  — |
| C<sub>4h</sub>(C<sub>2h</sub>) | `4'/m` | 1, -1, 2_z, -2_z, ±4'_z, ±-4'_z | σ(1), σ(3)  /  σ'(7) |
| C<sub>4h</sub>(C<sub>4</sub>) | `4/m'` | 1, 2_z, ±4_z, -1', -2'_z, ±-4'_z | σ(7)  /  σ'(1) |
| C<sub>4h</sub>(S<sub>4</sub>) | `4'/m'` | 1, 2_z, ±-4_z, -1', -2'_z, ±4'_z | σ(8)  /  σ'(1) |
| D<sub>4</sub> | `422` | 1, 2_x, 2_y, 2_z, 2_xy, 2_-xy, ±4_z | σ(2), σ(7)  /  — |
| D<sub>4</sub>(D<sub>2</sub>) | `4'22'` | 1, 2_x, 2_y, 2_z, 2'_xy, 2'_-xy, ±4'_z | σ(2), σ(3)  /  σ'(7) |
| D<sub>4</sub>(C<sub>4</sub>) | `42'2'` | 1, 2_z, ±4_z, 2'_x, 2'_y, 2'_xy, 2'_-xy | σ(7)  /  σ'(2) |
| C<sub>4v</sub> | `4mm` | 1, 2_z, -2_x, -2_y, -2_xy, -2_-xy, ±4_z | σ(4), σ(7)  /  — |
| C<sub>4v</sub>(C<sub>2v</sub>) | `4'mm'` | 1, 2_z, -2_x, -2_y, -2'_xy, -2'_-xy, ±4'_z | σ(3), σ(4)  /  σ'(7) |
| C<sub>4v</sub>(C<sub>4</sub>) | `4m'm'` | 1, 2_z, ±4_z, -2'_x, -2'_y, -2'_xy, -2'_-xy | σ(7)  /  σ'(4) |
| D<sub>2d</sub> | `-42m` | 1, 2_x, 2_y, 2_z, -2_xy, -2_-xy, ±-4_z | σ(2), σ(8)  /  — |
| D<sub>2d</sub>(D<sub>2</sub>) | `-4'2m'` | 1, 2_x, 2_y, 2_z, -2'_xy, -2'_-xy, ±-4'_z | σ(2), σ(3)  /  σ'(8) |
| D<sub>2d</sub>(C<sub>2v</sub>) | `-4'm2'` | 1, 2_z, -2_xy, -2_-xy, 2'_x, 2'_y, ±-4'_z | σ(3), σ(4)  /  σ'(8) |
| D<sub>2d</sub>(S<sub>4</sub>) | `-42'm'` | 1, 2_z, ±-4_z, 2'_x, 2'_y, -2'_xy, -2'_-xy | σ(8)  /  σ'(2) |
| D<sub>4h</sub> | `4/mmm` | 1, -1, 2_x, 2_y, 2_z, 2_xy, 2_-xy, -2_x, -2_y, -2_z, -2_xy, -2_-xy, ±4_z, ±-4_z | σ(1), σ(2), σ(7)  /  — |
| D<sub>4h</sub>(D<sub>2h</sub>) | `4'/mmm'` | 1, -1, 2_x, 2_y, 2_z, -2_x, -2_y, -2_z, 2'_xy, 2'_-xy, -2'_xy, -2'_-xy, ±4'_z, ±-4'_z | σ(1), σ(2), σ(3)  /  σ'(7) |
| D<sub>4h</sub>(C<sub>4h</sub>) | `4/mm'm'` | 1, -1, 2_z, -2_z, ±4_z, ±-4_z, 2'_x, 2'_y, 2'_xy, 2'_-xy, -2'_x, -2'_y, -2'_xy, -2'_-xy | σ(1), σ(7)  /  σ'(2) |
| D<sub>4h</sub>(D<sub>4</sub>) | `4/m'm'm'` | 1, 2_x, 2_y, 2_z, 2_xy, 2_-xy, ±4_z, -1', -2'_x, -2'_y, -2'_z, -2'_xy, -2'_-xy, ±-4'_z | σ(2), σ(7)  /  σ'(1) |
| D<sub>4h</sub>(C<sub>4v</sub>) | `4/m'mm` | 1, 2_z, -2_x, -2_y, -2_xy, -2_-xy, ±4_z, -1', 2'_x, 2'_y, -2'_z, 2'_xy, 2'_-xy, ±-4'_z | σ(4), σ(7)  /  σ'(1) |
| D<sub>4h</sub>(D<sub>2d</sub>) | `4'/m'm'm` | 1, 2_x, 2_y, 2_z, -2_xy, -2_-xy, ±-4_z, -1', -2'_x, -2'_y, -2'_z, 2'_xy, 2'_-xy, ±4'_z | σ(2), σ(8)  /  σ'(1) |
| C<sub>3</sub> | `3` | 1, ±3_z | σ(6)  /  — |
| S<sub>6</sub> | `-3` | 1, -1, ±3_z, ±-3_z | σ(1), σ(6)  /  — |
| S<sub>6</sub>(C<sub>3</sub>) | `-3'` | 1, ±3_z, -1', ±-3'_z | σ(6)  /  σ'(1) |
| D<sub>3</sub> | `32` | 1, 3(2⊥), ±3_z | σ(2), σ(6)  /  — |
| D<sub>3</sub>(C<sub>3</sub>) | `32'` | 1, ±3_z, 3(2'⊥) | σ(6)  /  σ'(2) |
| C<sub>3v</sub> | `3m` | 1, 3(-2⊥), ±3_z | σ(4), σ(6)  /  — |
| C<sub>3v</sub>(C<sub>3</sub>) | `3m'` | 1, ±3_z, 3(-2'⊥) | σ(6)  /  σ'(4) |
| D<sub>3d</sub> | `-3m` | 1, -1, 3(2⊥), 3(-2⊥), ±3_z, ±-3_z | σ(1), σ(2), σ(6)  /  — |
| D<sub>3d</sub>(S<sub>6</sub>) | `-3m'` | 1, -1, ±3_z, ±-3_z, 3(2'⊥), 3(-2'⊥) | σ(1), σ(6)  /  σ'(2) |
| D<sub>3d</sub>(D<sub>3</sub>) | `-3'm'` | 1, 3(2⊥), ±3_z, -1', 3(-2'⊥), ±-3'_z | σ(2), σ(6)  /  σ'(1) |
| D<sub>3d</sub>(C<sub>3v</sub>) | `-3'm` | 1, ±3_z, 3(-2⊥), -1', 3(2'⊥), ±-3'_z | σ(4), σ(6)  /  σ'(1) |
| C<sub>6</sub> | `6` | 1, 2_z, ±3_z, ±6_z | σ(3), σ(6)  /  — |
| C<sub>6</sub>(C<sub>3</sub>) | `6'` | 1, ±3_z, 2'_z, ±6'_z | σ(6)  /  σ'(3) |
| C<sub>3h</sub> | `-6` | 1, -2_z, ±3_z, ±-6_z | σ(5), σ(6)  /  — |
| C<sub>3h</sub>(C<sub>3</sub>) | `-6'` | 1, ±3_z, -2'_z, ±-6'_z | σ(6)  /  σ'(5) |
| C<sub>6h</sub> | `6/m` | 1, -1, 2_z, -2_z, ±3_z, ±-3_z, ±6_z, ±-6_z | σ(1), σ(3), σ(6)  /  — |
| C<sub>6h</sub>(S<sub>6</sub>) | `6'/m'` | 1, -1, ±3_z, ±-3_z, 2'_z, -2'_z, ±6'_z, ±-6'_z | σ(1), σ(6)  /  σ'(3) |
| C<sub>6h</sub>(C<sub>6</sub>) | `6/m'` | 1, 2_z, ±3_z, ±6_z, -1', -2'_z, ±-3'_z, ±-6'_z | σ(3), σ(6)  /  σ'(1) |
| C<sub>6h</sub>(C<sub>3h</sub>) | `6'/m` | 1, -2_z, ±3_z, ±-6_z, -1', 2'_z, ±-3'_z, ±6'_z | σ(5), σ(6)  /  σ'(1) |
| D<sub>6</sub> | `622` | 1, 6(2⊥), 2_z, ±3_z, ±6_z | σ(2), σ(3), σ(6)  /  — |
| D<sub>6</sub>(D<sub>3</sub>) | `6'22'` | 1, 3(2⊥), ±3_z, 3(2'⊥), 2_z, ±6_z | σ(2), σ(6)  /  σ'(3) |
| D<sub>6</sub>(C<sub>6</sub>) | `62'2'` | 1, 2_z, ±3_z, ±6_z, 6(2'⊥) | σ(3), σ(6)  /  σ'(2) |
| C<sub>6v</sub> | `6mm` | 1, 2_z, 6(-2⊥), ±3_z, ±6_z | σ(3), σ(4), σ(6)  /  — |
| C<sub>6v</sub>(C<sub>3v</sub>) | `6'mm'` | 1, 3(-2⊥), ±3_z, 2'_z, ±6'_z, 3(-2'⊥) | σ(4), σ(6)  /  σ'(5) |
| C<sub>6v</sub>(C<sub>6</sub>) | `6m'm'` | 1, 2_z, ±3_z, ±6_z, 6(-2'⊥) | σ(3), σ(6)  /  σ'(4) |
| D<sub>3h</sub> | `-6m2` | 1, 3(2⊥), 3(-2⊥), -2_z, ±3_z, ±-6_z | σ(4), σ(5), σ(6)  /  — |
| D<sub>3h</sub>(D<sub>3</sub>) | `-6'2m'` | 1, 3(2⊥), ±3_z, -2'_z, ±-6'_z, 3(-2'⊥) | σ(2), σ(6)  /  σ'(5) |
| D<sub>3h</sub>(C<sub>3v</sub>) | `-6'm2'` | 1, 3(-2⊥), ±3_z, 3(2'⊥), -2'_z, ±-6'_z | σ(4), σ(6)  /  σ'(5) |
| D<sub>3h</sub>(C<sub>3h</sub>) | `-6m'2'` | 1, -2_z, ±3_z, ±-6_z, 3(2'⊥), 3(-2'⊥) | σ(5), σ(6)  /  σ'(2) |
| D<sub>6h</sub> | `6/mmm` | 1, -1, 6(2⊥), 2_z, 6(-2⊥), -2_z, ±3_z, ±-3_z, ±6_z, ±-6_z | σ(1), σ(2), σ(3), σ(6)  /  — |
| D<sub>6h</sub>(D<sub>3d</sub>) | `6'/m'mm'` | 1, -1, 3(2⊥), 3(-2⊥), ±3_z, ±-3_z, 3(2'⊥), 2'_z, 3(-2'⊥), -2'_z, ±6'_z, ±-6'_z | σ(1), σ(2), σ(6)  /  σ'(2) |
| D<sub>6h</sub>(C<sub>6h</sub>) | `6/mm'm'` | 1, -1, 2_z, -2_z, ±3_z, ±-3_z, ±6_z, ±-6_z, 6(2'⊥), 6(-2'⊥) | σ(1), σ(3), σ(6)  /  σ'(2) |
| D<sub>6h</sub>(D<sub>6</sub>) | `6/m'm'm'` | 1, 6(2⊥), 2_z, ±3_z, ±6_z, -1', -2'_z, ±-3'_z, ±-6'_z, 6(-2'⊥) | σ(2), σ(3), σ(6)  /  σ'(1) |
| D<sub>6h</sub>(C<sub>6v</sub>) | `6/m'mm` | 1, 2_z, 6(-2⊥), ±3_z, ±6_z, -1', -2'_z, 6(2'⊥), ±-3'_z, ±-6'_z | σ(3), σ(4), σ(6)  /  σ'(1) |
| D<sub>6h</sub>(D<sub>3h</sub>) | `6'/mm'm` | 1, 3(2⊥), 3(-2⊥), -2_z, ±3_z, ±-6_z, -1', 2'_z, 3(2'⊥), 3(-2'⊥), ±-3'_z, ±6'_z | σ(4), σ(5), σ(6)  /  σ'(1) |
| T | `23` | 1, 3(2), 4(±3) | σ(3), σ(9)  /  — |
| T<sub>h</sub> | `m-3` | 1, -1, 3(2), 3(-2), 4(±3), 4(±-3) | σ(1), σ(3), σ(9)  /  — |
| T<sub>h</sub>(T) | `m'-3'` | 1, 3(2), 4(±3), -1', 3(-2'), 4(±-3') | σ(3), σ(9)  /  σ'(1) |
| O | `432` | 1, 9(2), 4(±3), 3(±4) | σ(7), σ(9)  /  — |
| O(T) | `4'32'` | 1, 3(2), 4(±3), 6(2'), 3(±4') | σ(3), σ(9)  /  σ'(7) |
| T<sub>d</sub> | `-43m` | 1, 3(2), 6(-2), 4(±3), 3(±-4) | σ(8), σ(9)  /  — |
| T<sub>d</sub>(T) | `-4'3m'` | 1, 3(2), 4(±3), 6(-2'), 3(±-4') | σ(3), σ(9)  /  σ'(8) |
| O<sub>h</sub> | `m-3m` | 1, -1, 9(2), 9(-2), 4(±3), 4(±-3), 3(±4), 3(±-4) | σ(1), σ(7), σ(9)  /  — |
| O<sub>h</sub>(T<sub>h</sub>) | `m-3m'` | 1, -1, 3(2), 3(-2), 4(±3), 4(±-3), 6(2'), 6(-2'), 3(±4'), 3(±-4') | σ(1), σ(3), σ(9)  /  σ'(7) |
| O<sub>h</sub>(O) | `m'-3'm'` | 1, 9(2), 4(±3), 3(±4), -1', 9(-2'), 4(±-3'), 3(±-4') | σ(7), σ(9)  /  σ'(1) |
| O<sub>h</sub>(T<sub>d</sub>) | `m'-3'm` | 1, 3(2), 6(-2), 4(±3), 3(±-4), -1', 3(-2'), 6(2'), 4(±-3'), 3(±4') | σ(8), σ(9)  /  σ'(1) |

## Table C — The 32 grey groups (Type II / ITC MP1), derived

Not in ITC 1.5.2.3 or Birss Table 6. Each = classical parent ⊗ {1,1'}: Schoenflies = parent<sub>R</sub>, HM/Shubnikov = parent + `1'`. Operators = the parent's operators **plus their time-reversed (×1') copies**; generators = the parent's σ(N) **plus** the pure time-reversal generator `1'`.

| System | Schoenflies | App key | HM full | Shubnikov | Parent |
|---|---|---|---|---|---|
| Triclinic | C<sub>1R</sub> | `11'` | 11' | `11'` | `1` |
| Triclinic | C<sub>iR</sub> | `-11'` | -11' | `-21'` | `-1` |
| Monoclinic | C<sub>2R</sub> | `21'` | 1121' | `21'` | `2` |
| Monoclinic | C<sub>sR</sub> | `m1'` | 11m1' | `m1'` | `m` |
| Monoclinic | C<sub>2hR</sub> | `2/m1'` | 11 2/m1' | `2:m1'` | `2/m` |
| Orthorhombic | D<sub>2R</sub> | `2221'` | 2221' | `2:21'` | `222` |
| Orthorhombic | C<sub>2vR</sub> | `mm21'` | mm21' | `2.m1'` | `mm2` |
| Orthorhombic | D<sub>2hR</sub> | `mmm1'` | 2/m 2/m 2/m1' | `m.2:m1'` | `mmm` |
| Tetragonal | C<sub>4R</sub> | `41'` | 41' | `41'` | `4` |
| Tetragonal | S<sub>4R</sub> | `-41'` | -41' | `-41'` | `-4` |
| Tetragonal | C<sub>4hR</sub> | `4/m1'` | 4/m1' | `4:m1'` | `4/m` |
| Tetragonal | D<sub>4R</sub> | `4221'` | 4221' | `4:21'` | `422` |
| Tetragonal | C<sub>4vR</sub> | `4mm1'` | 4mm1' | `4.m1'` | `4mm` |
| Tetragonal | D<sub>2dR</sub> | `-42m1'` | -42m1' | `-4.m1'` | `-42m` |
| Tetragonal | D<sub>4hR</sub> | `4/mmm1'` | 4/m 2/m 2/m1' | `m.4:m1'` | `4/mmm` |
| Trigonal | C<sub>3R</sub> | `31'` | 31' | `31'` | `3` |
| Trigonal | S<sub>6R</sub> | `-31'` | -31' | `-61'` | `-3` |
| Trigonal | D<sub>3R</sub> | `321'` | 3211' | `3:21'` | `32` |
| Trigonal | C<sub>3vR</sub> | `3m1'` | 3m11' | `3.m1'` | `3m` |
| Trigonal | D<sub>3dR</sub> | `-3m1'` | -3 2/m 11' | `-6.m1'` | `-3m` |
| Hexagonal | C<sub>6R</sub> | `61'` | 61' | `61'` | `6` |
| Hexagonal | C<sub>3hR</sub> | `-61'` | -61' | `3:m1'` | `-6` |
| Hexagonal | C<sub>6hR</sub> | `6/m1'` | 6/m1' | `6:m1'` | `6/m` |
| Hexagonal | D<sub>6R</sub> | `6221'` | 6221' | `6:21'` | `622` |
| Hexagonal | C<sub>6vR</sub> | `6mm1'` | 6mm1' | `6.m1'` | `6mm` |
| Hexagonal | D<sub>3hR</sub> | `-6m21'` | -6m21' | `m.3:m1'` | `-6m2` |
| Hexagonal | D<sub>6hR</sub> | `6/mmm1'` | 6/m 2/m 2/m1' | `m.6:m1'` | `6/mmm` |
| Cubic | T<sub>R</sub> | `231'` | 231' | `3/21'` | `23` |
| Cubic | T<sub>hR</sub> | `m-31'` | 2/m -31' | `-6/21'` | `m-3` |
| Cubic | O<sub>R</sub> | `4321'` | 4321' | `3/41'` | `432` |
| Cubic | T<sub>dR</sub> | `-43m1'` | -43m1' | `3/-41'` | `-43m` |
| Cubic | O<sub>hR</sub> | `m-3m1'` | 4/m -3 2/m1' | `-6/41'` | `m-3m` |

**Totals:** 90 (ITC 1.5.2.3: 32 colourless + 58 black-white) + 32 grey = **122**.

*Sources:* Schoenflies & full HM — ITC Table 1.5.2.3 (`ch1o5_.pdf`; hexagonal and cubic rows read directly from the page image, including the O<sub>h</sub>/T<sub>h</sub> full-HM). Shubnikov, operators, generators — Birss Table 6. Type scheme — ITC §1.5.2 / Bradley–Cracknell.

*Rendering note:* column widths are not settable in Markdown; Tables A and B are split precisely so that long full-HM strings (Table A) and long operator lists (Table B) each get the full column width and stop wrapping across many lines.
