# Code-Review-Report: The Birss App v0.7.0

**Datum:** 27. Juni 2026  
**Scope:** Vollständiger Review der gesamten Codebase  
**Geprüfte Version:** Commit `3d36b9a` (v0.7.0)  
**Codebase-Umfang:** ~7.000 Zeilen TypeScript/TSX, 753 Tests in 8 Dateien

---

## 1. Zusammenfassung

Die Birss App ist eine hochwertige, wissenschaftliche Single-Page-Application, die nichtlineare optische Tensor-Komponenten (ED, MD, EQ) und SHG-Quellterme für alle 122 magnetischen Punktgruppen berechnet. Die Codebase zeichnet sich durch eine klare Schichtenarchitektur, rigorosen TypeScript Strict Mode und eine beeindruckende Testabdeckung mit 753 physikbasierten Tests aus.

### Gesamtbewertung: Sehr gut

| Kategorie | Bewertung | Anmerkung |
|---|---|---|
| Architektur | ★★★★☆ | Saubere Schichtentrennung, aber App.tsx zu groß |
| Code-Qualität | ★★★★★ | TypeScript Strict, konsistente Konventionen |
| Testabdeckung | ★★★★☆ | Exzellent für Services, Lücken bei Components |
| Sicherheit | ★★★★★ | Keine Schwachstellen, minimale Angriffsfläche |
| Performance | ★★★★☆ | Gute Memoization, kein Code-Splitting |
| Barrierefreiheit | ★★★★☆ | Solide ARIA-Nutzung, kleinere Lücken |
| CI/CD | ★★★★★ | Vollständige Pipeline mit CodeQL |

### Hauptstärken
- Deterministische, rein client-seitige Berechnungsengine ohne externe Abhängigkeiten
- Tiered Test-Strategie mit Golden Fixtures, verifiziert gegen publizierte kristallographische Tabellen
- TypeScript Strict Mode konsequent durchgesetzt (CI-Gate)
- 0 npm-Vulnerabilities, 0 TypeScript-Fehler, 753/753 Tests bestanden

### Wichtigste Verbesserungsvorschläge
- `App.tsx` (861 Zeilen, ~20 `useState`-Hooks) in kleinere Module aufteilen
- ESLint/Prettier für konsistente Code-Formatierung einführen
- Component-Tests und Hook-Tests ergänzen

---

## 2. Architektur & Struktur

### 2.1 Schichtenarchitektur

Die App folgt einer klaren, unidirektionalen Schichtenarchitektur:

```
Data (pointGroups.ts)
  ↓
Services (symmetryGroups → tensorProjection → latexFormatting)
         (trigPoly → symbolicProjection → trigPolyFormat)
  ↓
Hooks (useSimulatorState, useDialogA11y)
  ↓
Components (PointGroupExplorer, SimulatorPage, HelpPage, etc.)
  ↓
App.tsx (Root-Component, State-Management, Routing)
```

**Positiv:**
- Abhängigkeiten fließen strikt in eine Richtung
- `tensorCalculator.ts` als sauberer Barrel-Export der gesamten Physics-API
- Services haben keine React-Abhängigkeiten — rein funktional und testbar

**Modulabhängigkeiten (Services):**
```
tensorCalculator.ts (Barrel)
├── symmetryGroups.ts          (Gruppentheorie, Generatoren, Closure)
├── tensorProjection.ts        (Numerische Projektion, SHG)
├── latexFormatting.ts         (LaTeX-Rendering)
├── trigPoly.ts                (Trigonometrische Polynom-Algebra)
├── symbolicProjection.ts      (Symbolische SHG-Terme)
└── trigPolyFormat.ts          (TrigPoly → LaTeX)
```

### 2.2 State-Management

**Entscheidung:** Kein externes State-Management (Redux, Zustand, etc.). Alle ~20 State-Variablen leben als `useState`-Hooks direkt in `App.tsx` und werden als Props an Child-Components weitergereicht.

**Bewertung:** Für die aktuelle Größe der App (6 Views, ~7.000 Zeilen) ist dieser Ansatz vertretbar. Bei weiterem Wachstum wird Props-Drilling zum Problem — insbesondere `SimulatorPage` empfängt bereits 18 Props (siehe Abschnitt 3.3).

### 2.3 Routing

View-Wechsel wird über einen `currentView`-State gelöst (`'calculator' | 'simulator' | 'explorer' | 'help'`). Kein React-Router. Dies ist für eine reine SPA ohne URL-basierte Navigation akzeptabel, bedeutet aber: kein Deep-Linking, kein Browser-Back.

### 2.4 Dateistruktur

```
src/
├── App.tsx                       (861 Zeilen)  ← Root + Calculator-View
├── main.tsx                      (13 Zeilen)
├── index.css                     (12 Zeilen)
├── components/                   (6 Dateien, ~1.580 Zeilen)
├── services/                     (7 Module + 8 Testdateien + 2 Fixtures)
├── hooks/                        (2 Custom Hooks)
└── data/                         (1 Datei — Punktgruppen-Registry)
```

---

## 3. Code-Qualität

### 3.1 TypeScript & Typsicherheit

- **Strict Mode** ist aktiv (`"strict": true` in `tsconfig.json`) und wird im CI-Gate erzwungen (`tsc --noEmit`)
- **Target:** ES2022 — sauberer, moderner Code ohne Polyfills
- Typen sind durchgehend explizit definiert: `TensorType`, `TensorTimeReversal`, `Matrix3x3`, `SHGExpression`, `SHGOptions`, etc.
- Keine `any`-Typen in der Codebase gefunden
- `isolatedModules: true` erzwingt korrekte Modul-Isolation

**Bewertung:** Vorbildlich. Die Typsicherheit ist durchgehend auf hohem Niveau.

### 3.2 Naming-Konventionen

- **Dateien:** PascalCase für Components (`SimulatorPage.tsx`), camelCase für Services (`tensorProjection.ts`)
- **Funktionen:** camelCase, beschreibend (`calculateSHGExpressions`, `formatTrigPoly`, `isCentrosymmetric`)
- **Konstanten:** UPPER_SNAKE_CASE (`GENERATORS`, `EPSILON`, `SNAP_VALUES`, `MAX_GROUP_SIZE`)
- **Interfaces:** PascalCase (`Matrix3x3`, `SHGOptions`, `PointGroupData`)
- **React-Components:** PascalCase als Funktionsdeklaration (`export function SimulatorPage(...)`)

**Bewertung:** Konsistent und etablierten Konventionen folgend.

### 3.3 Findings

#### Finding 1 (Hoch): App.tsx als „God Component"

**Datei:** `src/App.tsx` (861 Zeilen)

`App.tsx` vereint mehrere Verantwortlichkeiten:
- Root-Layout mit Header, Navigation, Footer
- Globales State-Management (~20 `useState`-Hooks)
- Suchlogik mit Dropdown (Combobox)
- Vollständige Calculator-View (Tensor-Auswahl, Ergebnis-Tabs, Rotationssteuerung, Orientierungs-Presets)
- Kategorie-Filterung

Die Calculator-View sollte in eine eigene `CalculatorPage.tsx` extrahiert werden, analog zu `SimulatorPage.tsx`, `HelpPage.tsx` und `PointGroupExplorer.tsx`. Dies würde App.tsx um ~400 Zeilen reduzieren.

#### Finding 2 (Mittel): Umfangreiches Props-Drilling bei SimulatorPage

**Datei:** `src/components/SimulatorPage.tsx` (Zeile 10–32)

`SimulatorPage` empfängt 18 individuelle Props, darunter 5 Winkel-Setter-Paare. Dies ist ein typisches Symptom für fehlendes Context-basiertes State-Sharing.

```typescript
interface SimulatorPageProps {
  selectedGroup: PointGroupData | null;
  selectedTensorType: TensorType;
  setSelectedTensorType: (t: TensorType) => void;
  selectedTimeReversal: TensorTimeReversal;
  setSelectedTimeReversal: (t: TensorTimeReversal) => void;
  thetaX: number;
  setThetaX: (t: number) => void;
  // ... 10 weitere Props
}
```

**Empfehlung:** Einen `AppStateContext` oder ein Gruppen-Objekt (`orientationState`, `tensorConfig`) einführen.

#### Finding 3 (Mittel): Duplizierte Rotationsfunktionen

`symmetryGroups.ts` definiert `getRotationX/Y/Z()` → `Matrix3x3` (Zeilen 46–81).  
`tensorProjection.ts` definiert `rotX/Y/Z()` → `number[][]` (Zeilen 18–31).

Diese berechnen identische Matrizen, geben aber unterschiedliche Typen zurück. Zwar ist die Typdifferenz (`Matrix3x3` mit `isAntiUnitary` vs. plain `number[][]`) ein bewusster Design-Unterschied, dennoch ist die duplizierte Berechnung unelegant. Eine gemeinsame Basis-Funktion mit optionalem Wrapping wäre sauberer.

#### Finding 4 (Niedrig): Inline-Style-Block in App.tsx

**Datei:** `src/App.tsx` (Zeile 850–858)

```jsx
<style>{`
  @keyframes spin-slow {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  .animate-spin-slow {
    animation: spin-slow 12s linear infinite;
  }
`}</style>
```

Dieser CSS-Block sollte in `index.css` oder als Tailwind-Plugin-Konfiguration verschoben werden. Inline-Styles in JSX erschweren Wartung und können bei jedem Re-Render unnötig ins DOM eingefügt werden.

#### Finding 5 (Niedrig): Fehlende Fehlerbehandlung für ungültige Gruppennamen

Wenn `GENERATORS[groupName]` nicht existiert, wird `undefined` an `getFullGroup` übergeben. Es gibt nur einen einzigen `throw` in der gesamten Service-Schicht (Closure-Timeout in `symmetryGroups.ts`). Defensive Guards am API-Einstiegspunkt (`calculateSHGExpressions`, `calculateTensorComponents`) für ungültige Gruppennamen fehlen. In der aktuellen App ist das unkritisch (da Gruppennamen nur aus der festen `POINT_GROUPS`-Liste stammen), wäre aber für eine eventuelle Bibliotheks-Nutzung relevant.

---

## 4. Testergebnis & Testabdeckung

### 4.1 Testergebnis

```
✅ npm run lint  — 0 TypeScript-Fehler
✅ npm run test  — 753/753 Tests bestanden (46,8s)

 Test Files  8 passed (8)
      Tests  753 passed (753)
```

### 4.2 Tiered Test-Strategie

| Tier | Prüfgegenstand | Beschreibung |
|---|---|---|
| **Tier 1** | Gruppenordnung | Alle 122 Gruppen liefern korrekte Operationszahl |
| **Tier 1b** | Gruppenabschluss | Paarweise Produkte sind Gruppenelemente (Closure) |
| **Tier 2** | Paritätsinvarianten | ED verschwindet für zentrosymmetrische Gruppen, EQ nie null |
| **Tier 3** | Golden Fixtures | 40+ handkuratierte Tensor-Relationen gegen Birss-Tabellen verifiziert |

### 4.3 Testdateien

| Datei | Zeilen | Fokus |
|---|---|---|
| `tensorCalculator.test.ts` | 173 | Integrationstests: Komponenten, Invarianten, Golden Fixtures |
| `trigPoly.test.ts` | 264 | TrigPoly-Algebra: Arithmetik, Vereinfachung, Evaluation |
| `symbolicProjection.test.ts` | 289 | Symbolische SHG-Terme, Konsistenz numerisch↔symbolisch |
| `trigPolyFormat.test.ts` | 120 | LaTeX-Formatierung von TrigPoly-Ausdrücken |
| `rotatedSHG.test.ts` | 102 | Rotierte SHG-Ausdrücke gegen Fixtures |
| `orientation.test.ts` | 75 | Miller-Index → Winkel-Konversion |
| `symmetryGroups.test.ts` | 45 | Gruppenordnung, Closure-Validierung |
| `goldenTensors.test.ts` | 19 | Golden-Fixture-Runner (40+ Fixtures in separater Datei) |

**Fixture-Dateien:** `goldenTensors.fixtures.ts` (715 Zeilen), `rotatedSHG.fixtures.ts` (197 Zeilen)

### 4.4 Testlücken

| Bereich | Status | Priorität |
|---|---|---|
| Services (Physics-Engine) | ✅ Umfassend getestet | — |
| React-Components (`.test.tsx`) | ❌ Keine Tests | Mittel |
| Custom Hooks (`useSimulatorState`, `useDialogA11y`) | ❌ Keine Tests | Niedrig |
| E2E / Browser-Tests | ❌ Nicht vorhanden | Niedrig |
| Accessibility-Tests (z.B. axe-core) | ❌ Nicht vorhanden | Niedrig |

**Empfehlung:** Da die fachliche Korrektheit (Physics-Engine) hervorragend abgedeckt ist, wäre die nächste Priorität Integration-Tests für die View-Logik — insbesondere die Interaktion zwischen Gruppen-Auswahl, Tensor-Typ-Wechsel und Ergebnisanzeige.

---

## 5. Sicherheit

### 5.1 Angriffsfläche

Die Birss App ist eine **rein statische Client-Side-Applikation** ohne Backend, API-Calls, Authentifizierung, Datenbank oder Benutzerdaten-Speicherung. Die Angriffsfläche ist minimal.

### 5.2 Prüfergebnisse

| Prüfpunkt | Ergebnis |
|---|---|
| `innerHTML` / `dangerouslySetInnerHTML` | ✅ Nicht verwendet |
| `eval()` / `Function()` | ✅ Nicht verwendet |
| Hardcoded Secrets / API-Keys | ✅ Keine gefunden |
| `localStorage` / `sessionStorage` | ✅ Nicht verwendet |
| `postMessage` | ✅ Nicht verwendet |
| Externe Links | ✅ Alle mit `target="_blank" rel="noopener noreferrer"` |
| User-Input-Handling | ✅ Sicher (String-Filterung, Integer-Validierung) |
| Math-Rendering | ✅ KaTeX (sandboxed, kein HTML-Injection-Risiko) |
| `npm audit` | ✅ 0 Vulnerabilities |
| Dependency-Scanning | ✅ CodeQL-Workflow aktiv (wöchentlich + bei PRs) |

### 5.3 Input-Handling im Detail

**Suchfeld** (`App.tsx:30–35`): Normalisierung via `normalizeString()` — sicher, nur Zeichenersetzung und Lowercasing, keine dynamische Evaluation.

**Miller-Index-Eingabe** (`App.tsx:667–677`): Input wird zu `Number` geparst und auf Integer geprüft (`Number.isInteger()`), bevor er an `hklToPresetAngles()` weitergegeben wird. Kein Injection-Risiko.

**Build-Zeit-Variable** (`__APP_VERSION__`): Wird aus `package.json` injiziert (build-time constant via Vite `define`), nicht aus User-Input. Sicher.

### 5.4 Gesamtbewertung Sicherheit

**Keine Schwachstellen identifiziert.** Die App folgt Best Practices für statische Client-Side-Anwendungen. Die SECURITY.md dokumentiert den Reporting-Prozess via GitHub Security Advisories.

---

## 6. Performance

### 6.1 Memoization

`useMemo` wird konsequent für teure Berechnungen eingesetzt:

| Berechnung | Abhängigkeiten | Geschätzte Kosten |
|---|---|---|
| `filteredGroups` | searchQuery, activeCategory | Gering |
| `currentComponents` | group, tensorType, trType, setting | Mittel (Tensor-Projektion) |
| `currentExpressions` | group, tensorType, trType, θX, θY, setting | Hoch (vollständige SHG-Berechnung) |
| `symbolicExpressions` | group, tensorType, trType, θX, θY, setting | Hoch (symbolische Projektion) |
| `labFrameBase` | θX, θY | Gering |

**Bewertung:** Die teuren Berechnungen sind korrekt memoized. Die Abhängigkeitsarrays sind vollständig (keine fehlenden Dependencies beobachtet).

### 6.2 Caching

`fullGroupCache` in `symmetryGroups.ts` cached berechnete Gruppenelemente als `Map<string, Matrix3x3[]>`. Dies vermeidet redundante Closure-Berechnungen bei wiederholtem Zugriff auf dieselbe Gruppe.

### 6.3 Optimierungspotenzial

| Maßnahme | Priorität | Impact |
|---|---|---|
| **Code-Splitting/Lazy-Loading** für Views (`React.lazy`) | Niedrig | Bundle-Reduktion beim Initial Load |
| **`React.memo`** auf teure Child-Components (z.B. Tensor-Tabellen) | Niedrig | Weniger Re-Renders |
| **Web Worker** für schwere Berechnungen | Niedrig | Kein UI-Blocking bei großen Gruppen |

**Bewertung:** Für die aktuelle App-Größe (~7.000 Zeilen) und den Anwendungsfall (wissenschaftliches Tool) sind die bestehenden Optimierungen ausreichend. Die Berechnungen laufen in der Praxis flüssig.

---

## 7. Barrierefreiheit (Accessibility)

### 7.1 Umgesetzte Maßnahmen

| Maßnahme | Details |
|---|---|
| **ARIA-Rollen** | `role="combobox"`, `role="listbox"`, `role="option"` für Suche |
| **ARIA-Attribute** | `aria-expanded`, `aria-controls`, `aria-autocomplete`, `aria-activedescendant`, `aria-selected` |
| **Keyboard-Navigation** | ArrowUp/Down, Enter, Escape im Such-Dropdown |
| **Focus-Trap** | `useDialogA11y` Hook für Modals (Tab-Cycling, Escape-to-Close) |
| **Semantisches HTML** | `<header>`, `<main>`, `<section>`, `<button>`, `<footer>` |
| **Disclosure-Buttons** | `aria-expanded` + `aria-controls` für mobile Panels |
| **Kontrast** | #141414 auf #E4E3E0 — hohes Kontrastverhältnis |
| **Externe Links** | `target="_blank" rel="noopener noreferrer"` |

### 7.2 Lücken

| Lücke | Priorität |
|---|---|
| Kein Skip-to-Content-Link | Niedrig |
| `aria-label` nur in 2 von 6 Component-Dateien (4 Vorkommen gesamt) | Mittel |
| Keine `:focus-visible`-Styles explizit definiert (Tailwind-Default) | Niedrig |
| Kein WCAG-Compliance-Statement | Niedrig |
| Keine automatisierten A11y-Tests (z.B. axe-core, jest-axe) | Niedrig |

**Bewertung:** Für eine wissenschaftliche Nischenanwendung ist die Barrierefreiheit überdurchschnittlich gut. Die wichtigsten ARIA-Patterns sind korrekt implementiert.

---

## 8. CI/CD & DevOps

### 8.1 GitHub-Actions-Workflows

| Workflow | Trigger | Funktion |
|---|---|---|
| `ci.yml` | Push auf `main` + alle PRs | `tsc --noEmit` + `vitest run` |
| `deploy.yml` | Semver-Tags (`v*.*.*`) | Build → GitHub Pages Deploy |
| `release.yml` | Semver-Tags | Changelog-Extraktion → GitHub Release |
| `codeql.yml` | Push/PR auf `main` + wöchentlich | Statische Sicherheitsanalyse (JS/TS) |

**Bewertung:** Vollständige und gut konfigurierte Pipeline. Besonders positiv:
- Semver-Format-Validierung vor Deploy (Regex im Workflow)
- Minimale Berechtigungen (RBAC) in jedem Workflow
- CodeQL als zusätzliche Sicherheitsschicht

### 8.2 Code-Qualitätstooling

| Tool | Status | Anmerkung |
|---|---|---|
| TypeScript Strict Mode | ✅ Aktiv | CI-Gate via `tsc --noEmit` |
| ESLint | ❌ Nicht konfiguriert | Empfohlen für Style-Konsistenz |
| Prettier | ❌ Nicht konfiguriert | Empfohlen für Formatierung |
| Vitest | ✅ 753 Tests | CI-Gate |
| CodeQL | ✅ Wöchentlich + PRs | Sicherheitsanalyse |

### 8.3 PWA-Konfiguration

- Service Worker via `vite-plugin-pwa` (Auto-Update)
- Manifest mit korrekten Icons (192×192, 512×512 SVG)
- Display: `standalone` für App-ähnliche Nutzung
- Theme-Color: `#141414`, Background: `#E4E3E0`

### 8.4 Deployment

Deployment erfolgt ausschließlich über getaggte Releases (`v*.*.*`). Kein manueller Deploy möglich. Die Live-Site unter `https://manganite.github.io/birss-app/` spiegelt immer eine stabile, geloggte Version wider.

---

## 9. Empfehlungen (priorisiert)

### Hohe Priorität

| # | Empfehlung | Begründung |
|---|---|---|
| 1 | **Calculator-View aus App.tsx extrahieren** | App.tsx hat 861 Zeilen und ~20 useState-Hooks. Die Calculator-View (~400 Zeilen) sollte als `CalculatorPage.tsx` analog zu `SimulatorPage.tsx` extrahiert werden. |
| 2 | **Geteilten State in Context auslagern** | `selectedGroup`, `selectedTensorType`, `thetaX/thetaY`, etc. werden an mehrere Views weitergereicht. Ein `AppStateContext` würde Props-Drilling eliminieren und App.tsx signifikant vereinfachen. |

### Mittlere Priorität

| # | Empfehlung | Begründung |
|---|---|---|
| 3 | **ESLint + Prettier einführen** | Aktuell gibt es keine automatisierte Code-Formatierung oder Style-Checks. ESLint mit `@typescript-eslint` würde potenzielle Fehler frühzeitig erkennen. |
| 4 | **SimulatorPage-Props gruppieren** | 18 individuelle Props zu 2–3 Gruppen-Objekten zusammenfassen (`tensorConfig`, `orientationState`, `amplitudeState`). |
| 5 | **Duplizierte Rotationsfunktionen konsolidieren** | `getRotationX/Y/Z` (symmetryGroups.ts) und `rotX/Y/Z` (tensorProjection.ts) berechnen identische Matrizen. Eine gemeinsame Basisfunktion einführen. |

### Niedrige Priorität

| # | Empfehlung | Begründung |
|---|---|---|
| 6 | **Lazy-Loading für Views** | `React.lazy` für SimulatorPage, HelpPage, PointGroupExplorer würde den Initial-Bundle verkleinern. |
| 7 | **Component-/Hook-Tests ergänzen** | Mindestens Smoke-Tests für die Hauptviews und den `useSimulatorState`-Hook. |
| 8 | **Skip-to-Content-Link** | Standard-A11y-Pattern, fehlt derzeit. |
| 9 | **Inline-Style in CSS verschieben** | `spin-slow`-Animation (App.tsx:850–858) gehört in `index.css`. |
| 10 | **React-Router für Deep-Linking** | Ermöglicht URL-basierte Navigation und Browser-Zurück. Optional, je nach Nutzerbedarf. |

---

## 10. Fazit

Die Birss App ist eine **bemerkenswert gut konstruierte wissenschaftliche Webanwendung**. Die Physics-Engine ist durch ein mehrschichtiges Testsystem mit Golden Fixtures gegen publizierte Referenzdaten abgesichert. Sicherheitstechnisch gibt es keine Beanstandungen. Die Architektur ist klar strukturiert, wobei `App.tsx` als einziger nennenswerter Refactoring-Kandidat auffällt.

Die Codebase ist bereit für produktiven Einsatz. Die empfohlenen Verbesserungen sind überwiegend Wartbarkeits- und Skalierungsmaßnahmen für zukünftiges Wachstum — keine kritischen Mängel.

---

*Report erstellt durch automatisierte Code-Analyse der gesamten Codebase.*
