# Task 003 — Translation dedup · summary

Polysemous flettur in the source dictionary list the same Swedish gloss
under multiple senses. The preprocessor flattened senses but didn't
dedupe, producing translation lists like `sinn → sin, sin, sin, sin,
sin, hans, hennes` that rendered verbatim in the UI. Worst case before
dedup: 5 repeats of one gloss; ~6% of entries (983 / 16,574) carried at
least one duplicate.

## What shipped

- `src/preprocess/extract.ts` — `processItems` now skips a `SE-jafn`
  whose `texti` is already present, via a `seen` set. Order-preserving;
  no other behavior change.
- `src/preprocess/extract.test.ts` — added one test covering
  `sin/sin/hans/sin/hennes → sin/hans/hennes`.
- `processed/shuffled.json` regenerated. Record count unchanged
  (16,987); 1,333 redundant translation slots removed across 983
  entries. Zero entries lost.
- `package.json` — added `npm run preprocess` script
  (`node src/preprocess/build.ts`).
- `.claude/settings.json` — `Bash(npm run preprocess)` added to the
  project allowlist.
- `src/scripts/nextWords.ts` — now defaults to 100 days, accepts an
  optional CLI arg for count (`node src/scripts/nextWords.ts 1000`).

## Validation

- `npx vitest run src/preprocess` → 29/29 pass.
- `npm run preprocess` regenerates the corpus end-to-end.
- Spot checks: `sinn → [sin, hans, hennes]`, `bitur → [bitter, bitande,
  isande, vass, skarp]`, `bensíntankur → [bensintank]`.
- Generated 1000-day list and grep'd for any line where translations
  contained a duplicate after split: 0 matches (was ~60 before).

## Out of scope (deferred)

- Sense-preserving structure in the JSON / view (Path B). Translations
  remain a flat list per fletta; the dictionary's sense distinctions
  are still discarded.
- Trimming near-duplicate flettur across the year (e.g.
  `beiskur`/`bitur` both glossing primarily as `bitter`).
- Other data-quality flags surfaced during the 1000-word review:
  identity translations (`tipptopp → tipptopp`), embedded usage
  examples (`vaxinn`), parens/quotes/whitespace artifacts in glosses,
  suspected Swedish typos (`modlfällt`, `skrälldus`).
