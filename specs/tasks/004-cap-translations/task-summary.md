# Task 004 — Cap translations at 20 · summary

A handful of polysemous flettur carried very long Swedish gloss
lists (`vinna` verb: 28; `leggja`: 20; 21 entries total over 10).
Long tails clutter the rendered card without adding signal — the
canonical senses are always at the head of the list. Cap is a
guardrail, not an editorial trim; today it touches one entry.

## What shipped

- [src/preprocess/extract.ts](../../../src/preprocess/extract.ts) —
  exported `MAX_TRANSLATIONS = 20`; `processItems` now early-exits
  the `SE-jafn` branch once the cap is hit. Order preserved
  (source order ≈ canonical-sense first).
- [src/preprocess/extract.test.ts](../../../src/preprocess/extract.test.ts) —
  added one test (25 unique glosses → 20, head-preserved).
- `processed/shuffled.json` regenerated via `npm run preprocess`.
  Record count unchanged (16,987). One entry changed:
  `vinna` (verb, flid 45772): 28 → 20.

## Validation

- `npx vitest run src/preprocess` → 30/30 pass.
- `npm run preprocess` runs cleanly (54,396 → 16,987).
- Spot check: max translations across corpus is now 20; `vinna`
  (flid 45772) starts with `slita som ett djur, arbeta, jobba, …`
  — the original first 20.

## Out of scope

- Choosing *which* 20 to keep beyond source order (no ranking).
- Capping `examples` similarly — not currently a problem.
- A UI "show more" affordance for truncated entries.
