# Task 004 — Cap translations at 20

## Problem

A handful of polysemous flettur carry very long translation lists.
`vinna` has 28 glosses; `leggja` has 20; 21 entries total exceed 10
translations and the long tail clutters the rendered card without
adding signal — the first few glosses are the canonical senses, the
rest are idiom/collocation-specific.

Distribution (from `processed/shuffled.json`, 16,987 entries):

```
1–2 translations: 13,034 (76.7%)
3–5             :  3,637 (21.4%)
6–10            :    295  (1.7%)
11–20           :     20  (0.1%)
>20             :      1  (vinna, 28)
```

Capping at 20 affects exactly **one** entry today (`vinna`: 28 → 20).
The cap is mostly a guardrail against future regressions / source-data
changes.

## Scope

Truncate each entry's `translations` array to the first 20 entries
during preprocessing. Order is already meaningful (source order from
the dictionary, which puts canonical senses first), so a head-slice
is the right operation — no ranking needed.

## Changes

- [src/preprocess/extract.ts](../../../src/preprocess/extract.ts) —
  add a `MAX_TRANSLATIONS = 20` constant and slice in `processItems`
  (or in `extractRecord` after dedup). Slicing inside the dedup loop
  is slightly cheaper but the difference is irrelevant at this scale;
  prefer whichever reads cleaner. Leaning toward: early-exit in the
  `processItems` loop once `translations.length === 20` to avoid
  pointless `seen` churn.
- [src/preprocess/extract.test.ts](../../../src/preprocess/extract.test.ts) —
  one test: feed 25 unique `SE-jafn` items, assert output length is 20
  and preserves order.
- `processed/shuffled.json` — regenerate via `npm run preprocess`.
  Expect: 1 entry changes (`vinna` 28 → 20), record count unchanged.

## Validation

- `npx vitest run src/preprocess` — all green, including the new test.
- `npm run preprocess` runs cleanly.
- Spot check: `vinna` in `processed/shuffled.json` has exactly 20
  translations, starting with `slita som ett djur, arbeta, jobba, …`
  (the original first 20).
- Re-run the distribution query; max translations per entry == 20.

## Out of scope

- Choosing *which* 20 to keep beyond source order (no ranking,
  scoring, or sense-clustering).
- Capping `examples` similarly — separate concern, not currently
  problematic.
- Backfilling a UI-side "show more" affordance — the data layer is
  the right place to draw the line.

## Open questions

- Is 20 the right number, or should it be lower (e.g. 10)? At 10 we'd
  truncate 21 entries instead of 1, which starts to feel like an
  editorial decision rather than a guardrail. Flagging for the user
  before implementing.
