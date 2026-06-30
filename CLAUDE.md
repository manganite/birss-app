# Claude Code — Project Instructions

**Read `AGENTS.md` before starting any work.** It contains build commands, architecture, conventions, and git workflow rules that must be followed.

## Critical rules (from AGENTS.md)

- **Never commit directly to `main`.** Always create a feature/fix/refactor branch first.
- **Branch prefixes:** `feature/`, `fix/`, `hotfix/`, `refactor/`, `docs/`, `chore/`
- **Conventional Commits:** `type(scope): lowercase summary` (e.g. `feat(simulator): add polarimetry tooltip`)
- **Quality gates before merging:** `npm run lint && npm run test`
- **Merge method:** `--no-ff` for local merges; pull request for physics/tensor changes
- **CHANGELOG.md:** Update `[Unreleased]` for user-facing changes

## Current backlog

Read **`STATUS.md`** (root) first — canonical map for the current cycle. Then
**`docs/planning/ROADMAP-next.md`** (wave order + dependencies) and
**`docs/planning/TODO-next.md`** (detailed findings + `Status:` tags) for per-item
detail. Honour the per-item contract there: fixtures-first for data/math, resolve
`Open decision` / `Derivation pending` items before coding, gate on
`npm run lint && npm run test`.

## Architecture (quick reference)

- All cross-page state lives in `App.tsx`, passed via grouped prop objects (`TensorConfig`, `OrientationState`, `SimulationState` from `src/types.ts`)
- Services have no React dependencies — pure functions, tested via Vitest
- Styling: Tailwind CSS v4, ink/paper palette, no CSS Modules
- Math rendering: `react-katex` (`InlineMath` / `BlockMath`)
