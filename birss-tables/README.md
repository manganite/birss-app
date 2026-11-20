# Birss Symmetry & Magnetism — Transcription Project

These are the transcribed Birss (1966) reference tables that back the app; see the app's own
[README](../README.md) for the tool itself.

Markdown transcriptions of selected tables from:

> R. R. Birss, *Symmetry and Magnetism*, North-Holland / Elsevier, 1966.
> Free online access: [Internet Archive](https://archive.org/details/symmetrymagnetis0000robe)

This project digitises the key reference tables into clean, cross-referenced Markdown, and compares them with the corresponding tables in the International Tables for Crystallography (ITC).

---

## Files

| File | Contents |
|---|---|
| `conventions-reference.md` | Master reference: coordinate conventions, notation systems (HM / Schoenflies / Shubnikov), the σ(0)–σ(9) generating matrix pool, tensor type definitions (polar/axial, i-/c-tensor), and the complete cross-reference guide for all tables. **Read this first.** |
| `birss-tables.tex` | LaTeX source compiling the transcribed tables into a single typeset document. |
| `birss-tables.pdf` | Compiled PDF of the tables. |
| `table-3.md` | The 32 crystallographic point groups — symmetry operations, Schoenflies / HM / Shubnikov symbols, and generating matrices. |
| `table-4a.md` | Symbol-equivalence mapping: assigns each of the 32 point groups a letter symbol class (A–U) for each tensor type (polar/axial × even/odd rank). Gateway to Tables 4b–4f. |
| `table-4b.md` | Tensor forms, rank 0 (scalars) across all 32 point groups. |
| `table-4c.md` | Tensor forms, rank 1 (vectors) across all 32 point groups. |
| `table-4d.md` | Tensor forms, rank 2 across all 32 point groups. |
| `table-4e.md` | Tensor forms, rank 3 across all 32 point groups. |
| `table-4f.md` | Tensor forms, rank 4 across all 32 point groups. |
| `table-6.md` | The 90 magnetic point groups (32 classical + 58 black-and-white), with generating matrices including primed (time-reversal-combined) operations. |
| `table-7.md` | Magnetic point groups mapped to i-tensor and c-tensor symbol classes (extensions of the Table 4a scheme to magnetically ordered materials). |
| `birss-itc-comparison.md` | Comparison of Birss's tables with the corresponding International Tables for Crystallography (ITC) entries. |

## Corrections and book errors

This repository is a reference: the tables are meant to be correct, and every difference from the
printed book can be traced.

- **Transcription errors** are corrected against the print. The file concerned records each
  correction: a dated pass note says what was read on which printed page and why the entry
  changed, and the file's `Changelog` section lists the change with its commit or pull request.
- **Errors of the book itself** (misprints) are documented where they occur, with what the book
  prints, the printed page and the evidence. In Tables 3 and 6 the table holds the corrected value;
  in Table 7 two cells are kept as printed and marked as book errors in the notes below the table.
  The inventory of all documented book errors is in `conventions-reference.md`.
- A verification that found nothing is recorded as well, as a pass note with its date.

The copy vendored in [birss-app](https://github.com/manganite/birss-app) (`birss-tables/`) holds
the same tables and reference texts; the generators and generated files that sit beside them there
(`tools/`, `table-nomenclature.md`) belong to the app and are not part of this reference.

## How to use

1. Start with `conventions-reference.md` to understand the notation.
2. Look up a point group in `table-3.md` to find its symbol and generating matrices.
3. Use `table-4a.md` to find the symbol class for the tensor type and rank you need.
4. Look up that symbol class in the appropriate `table-4b` through `table-4f`.

For magnetic point groups, follow the same chain starting from `table-6.md` and `table-7.md`.

> **Note on the 32 "grey" groups:** The 32 Type II (grey) magnetic point groups are omitted from Tables 6 and 7 because their i-tensors are identical to the classical groups in Table 3, and their c-tensors are identically zero.

## Regenerating `table-nomenclature.md`

`table-nomenclature.md` is a generated artifact, not hand-maintained:

```bash
python3 tools/generate_nomenclature.py
```

It reads the ITC 1.5.2.3 Schoenflies/full-HM transcription held in the script's own `rows` list
(the source of record for those two columns — they aren't tabulated anywhere else in the repo)
and `table-6.md` (Shubnikov symbols, operators, σ(N)/σ'(N) generators), deriving the 32 grey rows
by the G ⊗ {1,1'} rule. It writes `table-nomenclature.md` next to it. CI runs this script and
fails the build if the committed file drifts from its output, so any edit to `table-6.md` or the
script's `rows` requires regenerating and committing the table.
