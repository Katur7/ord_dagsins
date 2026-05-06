# 001 — Task summary

## 001a — Code reorganization (done)

Split `src/` into role-based folders. No behavior change.

**Layout:**
- `src/preprocess/` — `filter.ts`, `shuffle.ts`, `ignore.txt`
- `src/server/` — `server.ts`, `word.ts`, `views/`, `styles/`
- `src/scripts/` — `nextWords.ts`

**Edits beyond moves:**
- `src/server/server.ts` — views/styles paths now point at `./src/server/...`
- `src/preprocess/shuffle.ts` — `ignore.txt` path updated to `./src/preprocess/ignore.txt`
- `src/scripts/nextWords.ts` — import of `word.ts` now `../server/word.ts`
- `Dockerfile` — `CMD` now runs `src/server/server.ts`

**Validation:**
- Server boots, `GET /` renders HTML, `/styles/index.css` serves, JSON endpoint returns the expected word for 2026-05-06.
- `nextWords.ts` runs end-to-end against committed `processed/shuffled.json`.
- `filter.ts` and `shuffle.ts` resolve all imports/paths cleanly (full runs require gitignored `raw/` and `processed/filtered.json`, not present in this worktree).

## 001b — Data extraction refactor (done)

Richer per-word data, tighter filters, and a refactor into one runner + pure modules with tests.

**Output schema:** `flid`, `fletta`, `pos`, `gender` (nullable), `stuttbeyg` (nullable), `translations[]`, `examples[] {is, se}`.

**Filter rules** (drop if any apply): `pos === "skst"`, `fletta` shorter than 4 chars (ignoring hyphens/whitespace), contains a space, starts/ends with `-`, listed in `ignore.txt` (case-insensitive), or missing translation/example. Old blanket `inf`/`prae/adv`/`adv` exclusion dropped.

**Layout:**
- `src/preprocess/extract.ts` — pure: `parseOfl`, `processItems`, `shouldKeep`, `extractRecord`, `loadIgnoreSet`
- `src/preprocess/shuffle.ts` — pure: `seededRandom`, `hashStringToSeed`, `deterministicShuffle`
- `src/preprocess/build.ts` — single runner: `raw/` → `processed/shuffled.json` (no `filtered.json` intermediate)
- `extract.test.ts`, `shuffle.test.ts` — 28 unit tests
- `src/preprocess/filter.ts` deleted

**Validation:**
- `npx tsx src/preprocess/build.ts`: 54,396 → 16,989 records (master baseline 16,572).
- All observed genders present (`m`, `f`, `n`, plurals, mixed); both `adj` and `v` `stuttbeyg` examples surviving.
- `npx vitest run src/preprocess` → 28/28 pass.
