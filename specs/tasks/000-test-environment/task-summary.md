# Task 000 — Test environment setup

## What shipped

- Vitest installed as a dev dependency.
- `npm test` runs the suite once (CI-friendly); `npm run test:watch` enters the TDD watcher.
- One passing test for `daysBetween` in [src/word.test.ts](../../../src/word.test.ts).
- `daysBetween` exported from [src/word.ts](../../../src/word.ts) (only production change).

## Key decisions

- **Vitest, not `node:test`.** Better DX (matchers, watch UI), near-zero config, runs `.ts` directly via esbuild without a `tsconfig.json`.
- **No unified TS pipeline.** Dev/prod stay on Node 22 strip-types; tests run on Vitest's esbuild. Two transformers, but they don't need to agree because tests don't ship. Avoids the "works in dev, breaks in prod" risk that comes from running esbuild in dev and strip-types in prod.
- **No dev-runtime tool added.** `node --watch src/server.ts` is enough; same runtime as prod.
- **Co-located tests** (`src/*.test.ts`), not a separate `tests/` tree.
- **Scope held tight.** Only one production change (`export` keyword). No refactor of top-level side effects in `filter.ts` / `shuffle.ts` / `word.ts` / `server.ts`.

## Known caveat

Importing `word.ts` in a test triggers `fs.readFileSync('./processed/shuffled.json')` at module load. Works because that file is committed (whitelisted in `.gitignore`), but it means tests aren't fully isolated from disk state. Acceptable for now.

## Follow-ups

- Extract pure logic from `filter.ts` / `shuffle.ts` so pre-processing is testable without I/O on import.
- Make `word.ts` not read JSON at module load (accept words as a parameter; thin wrapper does the file read).
- Split `server.ts` into `app.ts` + `server.ts`; add supertest integration tests.
- Decide whether the per-request example shuffle in `server.ts` should be deterministic per date.
