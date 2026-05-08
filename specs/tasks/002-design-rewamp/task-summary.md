# Task 002 — Design revamp · summary

Replaced the warm card-stack visual with an editorial dictionary-page
layout. The full design rationale moved to `src/server/DESIGN.md` and
lives with the project from here on.

## What shipped

- New typographic layout: folio header, oxblood pegs, Newsreader headword
  with binary-search auto-fit, dot-separated translation list, vertical
  rule on examples block.
- Server-side display mapping (`src/server/format.ts`): `pos` and
  `gender` codes from the data layer translated to fully spelled-out
  Icelandic word labels (`lýsingarorð`, `karlkyn fleirtala`, etc.).
  Display happens via `formatDateIs`, `mapPos`, `mapGender`.
- `?fletta=` and `?flid=` lookup query params for direct word access
  (used for QA, also a real product surface). Invalid `?date=` and
  unmatched lookups return HTTP 400.
- Static asset mount at `/public` for the auto-fit script.
- Page title now includes the formatted date.
- 35 unit tests added covering the three pure helpers.
- Dockerfile narrowed to `src/server/` only (preprocess no longer
  ships in the production image).
- `hinn` (the only `pos: 'gr'` entry) added to `ignore.txt`; corpus
  regenerated.

## Deferred to follow-ups

- `stuttbeyg` rendering — the data carries free-form prose, not the
  bare-form list the original design assumed. Needs a design pass.
- Visual review of long plural/combo gender labels
  (`karlkyn fleirtala`, etc.) once they're in production.
- Empty / error state design.
- Dark mode, print stylesheet, prev/next navigation, word-index counter.
- Content-negotiation bug in `server.ts` (`Content-Type` → `Accept`) —
  pre-existing, intentionally untouched here to keep scope tight.

## Notable deviations from the plan

- Two `?fletta=` QA examples in the plan were stale relative to the
  actual data (`vinna` resolves to the noun, not the verb). The plan
  doc gets discarded; flagged in case it surfaces later.
- A small phone-layout fix landed during QA: `min-width: 0` on `.hero`
  and `.examples` was hoisted out of the desktop media query — without
  it, long nowrap content could push a grid track wider than its
  column. Documented in `DESIGN.md §4`.
