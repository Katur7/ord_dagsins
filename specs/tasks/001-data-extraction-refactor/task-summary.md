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

## 001b — Data extraction refactor (pending)

See [001b-data-extraction.md](001b-data-extraction.md). Lands on top of the 001a layout.
