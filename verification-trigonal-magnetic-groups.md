# Verifikation: Trigonale magnetische Gruppen (Tabelle 6 & 7)

**Datum**: 2026-06-30
**Umfang**: Die 11 trigonalen Zeilen in `table-6.md` und `table-7.md` —
`3`, `-3`, `-3'`, `32`, `32'`, `3m`, `3m'`, `-3m`, `-3m'`, `-3'm'`, `-3'm`
(Tabelle 6/7, Zeilen 73–83 im jeweiligen Markdown).

**Fragestellung**: Gibt es Fehler bezüglich Generatoren, Symmetrieelementen,
Untergruppen oder den daraus resultierenden Tensorkomponenten in diesem Block?

**Ergebnis**: Kein Fehler gefunden. Alle 11 Zeilen in beiden Tabellen sind
intern konsistent und stimmen mit der Originalquelle überein.

---

## Methodik

Drei unabhängige Prüfwege, die sich gegenseitig nicht voraussetzen:

1. **Gruppentheoretische Herleitung** der Symmetrieoperatoren in Tabelle 6 aus
   Tabelle 3, über die in `conventions-reference.md` §12 dokumentierte Formel
   `M = H ∪ (G\H)'`.
2. **Tensor-Kreuzformel** (`conventions-reference.md` / `table-7.md` "Notes and
   Status") zur Neuberechnung der i-/c-Tensor-Symbolklassen in Tabelle 7 aus
   Tabelle 4a, ausgehend von den eingetragenen A-/B-Spalten.
3. **Direkter Abgleich mit der Originalquelle**: R. R. Birss, *Proc. Phys.
   Soc.* **79**, 946 (1962), Table 2(a) — anhand der vorhandenen Scans in
   `.tmp_ocr/` (`p9_trig1.png`, `p9_trig2.png`, `t7_trig_hex_AB_*.png`).

---

## 1. Generatoren / Symmetrieoperatoren / Untergruppen (Tabelle 6)

Für jede primed (schwarz-weiße) Zeile wurde `M = H ∪ (G\H)'` direkt aus
Tabelle 3 hergeleitet, mit `G = unprime(Spalte 2)` und `H` = "Classical
subgroup":

| Magn. Gruppe M | G (Tab. 3) | H (Tab. 3) | G\H | Hergeleitetes M | Tabelle-6-Eintrag |
|---|---|---|---|---|---|
| `-3'` | `-3` = 1,-1,±3_z,±-3_z | `3` = 1,±3_z | -1, ±-3_z | 1,±3_z,-1',±-3'_z | ✓ identisch |
| `32'` | `32` = 1,3(2⊥),±3_z | `3` = 1,±3_z | 3(2⊥) | 1,±3_z,3(2'⊥) | ✓ identisch |
| `3m'` | `3m` = 1,3(-2⊥),±3_z | `3` = 1,±3_z | 3(-2⊥) | 1,±3_z,3(-2'⊥) | ✓ identisch |
| `-3m'` | `-3m` = 1,-1,3(2⊥),3(-2⊥),±3_z,±-3_z | `-3` = 1,-1,±3_z,±-3_z | 3(2⊥),3(-2⊥) | 1,-1,±3_z,±-3_z,3(2'⊥),3(-2'⊥) | ✓ identisch |
| `-3'm'` | `-3m` | `32` = 1,3(2⊥),±3_z | -1,3(-2⊥),±-3_z | 1,3(2⊥),±3_z,-1',3(-2'⊥),±-3'_z | ✓ identisch |
| `-3'm` | `-3m` | `3m` = 1,3(-2⊥),±3_z | -1,3(2⊥),±-3_z | 1,±3_z,3(-2⊥),-1',3(2'⊥),±-3'_z | ✓ identisch |

Alle sechs primed Zeilen reproduzieren exakt die in Tabelle 6 eingetragenen
Symmetrieoperatoren. Die Generatorspalten (`σ(N)` für H, `σ'(N)` für den
zusätzlichen Generator von G\H) sind ebenfalls konsistent — z. B. bei
`-3'm'` vs. `-3'm` korrekt unterschiedlich:

- `-3'm'` (Shubnikov `-6'.m'`): sowohl der Inversions-/`-6`-Anteil **als
  auch** der Spiegel-Anteil stammen aus G\H und sind primed → beide Teile
  des Shubnikov-Symbols tragen einen Strich.
- `-3'm` (Shubnikov `-6'.m`): hier liegt der Spiegelanteil `m` bereits in
  H (= `3m`) und bleibt unprimed; nur der `-6`-Anteil (aus G\H) trägt den
  Strich.

Diese feine Unterscheidung ist in `table-6.md` korrekt umgesetzt.

## 2. Tensorkomponenten (Tabelle 7)

Für jede primed Zeile wurden die c-Tensor-Spalten über die dokumentierte
Kreuzformel aus den A-/B-Spalten neu berechnet:

- c-Polar-even (Sp. 9) = Table4a(B), Axial-even
- c-Axial-even (Sp. 10) = Table4a(A), Axial-even
- c-Polar-odd (Sp. 11) = Table4a(A), Polar-odd
- c-Axial-odd (Sp. 12) = Table4a(B), Polar-odd

| Magn. Gruppe | A | B | Berechnet (c9–c12) | Tabelle-7-Eintrag |
|---|---|---|---|---|
| `-3'` | 3 | -3 | -, K_m, K_n, - | ✓ identisch |
| `32'` | 3m | 3m | M_m, M_m, M_n, M_n | ✓ identisch |
| `3m'` | 32 | 3m | M_m, L_m, L_n, M_n | ✓ identisch |
| `-3m'` | -3m | 3m | M_m, -, -, M_n | ✓ identisch |
| `-3'm'` | 32 | -3m | -, L_m, L_n, - | ✓ identisch |
| `-3'm` | 3m | -3m | -, M_m, M_n, - | ✓ identisch |

Auch die i-Tensor-Spalten (5–8 = Table4a(G)) stimmen für alle 11 Zeilen
exakt überein.

## 3. Abgleich mit der Originalquelle (Birss 1962, Table 2(a))

Da ein systematischer Fehler in den A-/B-Spalten selbst durch die obigen
internen Konsistenzprüfungen nicht aufgedeckt würde (er würde sich einfach
fehlerfrei "fortpflanzen"), wurden die A-/B-Werte zusätzlich gegen die
gescannten Originalseiten geprüft (`.tmp_ocr/p9_trig1.png`,
`p9_trig2.png`, `t7_trig_hex_AB_big.png`, `_top.png`, `_bot.png`).

Die A-/B-Spalten im Original sind unprimed (keine Lese-Mehrdeutigkeit durch
die Underline-Prime-Notation der Quelle) und damit eindeutig lesbar. Alle
11 Zeilen — inklusive der heiklen Reihenfolge
`-3m → -3m' → -3'm' → -3'm` mit
`(A,B) = (-,-) → (-3m,3m) → (32,-3m) → (3m,-3m)` —
stimmen exakt mit der Transkription in `table-7.md` überein.

---

## Fazit

Generatoren, Symmetrieoperatoren, Untergruppen und die daraus resultierenden
i-/c-Tensor-Symbolklassen sind im trigonalen Block (`3` bis `-3'm`) beider
Tabellen vollständig korrekt und konsistent:

- gruppentheoretisch (Tabelle 3 → Tabelle 6, über `M = H ∪ (G\H)'`),
- tensoriell (Tabelle 4a → Tabelle 7, über die A-/B-Kreuzformel),
- und gegen die Originalquelle (Birss 1962, Table 2(a)).

Dies deckt sich mit den in `table-6.md`/`table-7.md` bereits dokumentierten
"2026-06 Verifikationspässen", die genau diesen Block als geprüft/korrigiert
ausweisen. Die vorliegende Prüfung ist eine unabhängige Bestätigung dieser
früheren Ergebnisse, kein Widerspruch dazu.
