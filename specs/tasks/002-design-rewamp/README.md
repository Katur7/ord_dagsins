# Orð dagsins — Redesign handoff

This package is a self-contained design specification for the redesign of
[ord-dagsins.pippinn.me](https://ord-dagsins.pippinn.me/). It is intended to be
handed to an implementation agent (or developer) to wire into the existing
Pug + Express + CSS stack.

## What's in this folder

```
handoff/
├── README.md             ← this file: process, decisions, what we tried
├── DESIGN.md             ← implementation spec: tokens, layout, breakpoints, edge cases
├── preview.html          ← self-contained working demo (open in a browser)
├── reference/
│   ├── index.html        ← static HTML mock matching the converged design
│   └── styles.css        ← matching plain CSS — port these tokens to index.css
└── samples/
    └── data.json         ← the four data scenarios we designed against
```

The reference HTML/CSS uses no React and no build step. It mirrors what the
final Pug template should produce when rendered. **Implementation should
replace `src/styles/index.css` with the rules in `reference/styles.css` and
update `src/views/index.pug` to match the structure in `reference/index.html`.**

## What was wrong with the original

The current page is a warm card stack with emoji flags, a Manrope sans body,
and a Fraunces serif headword that scaled with `clamp()`. It looks pleasant
but has three concrete problems:

1. **Long compound words break out of the card.** The headword used
   `clamp(2.4rem, 10.5vw, 3.35rem)`; words like `þjóðfélagshagfræðingur`
   exceed the card width even at the lower bound, and `overflow-wrap` then
   broke the word mid-syllable in an ugly way.
2. **Visual fidelity didn't match the content.** The card-on-card-on-card
   stack felt SaaS-generic for content that is, fundamentally, a dictionary
   entry — there's centuries of editorial typography this could draw on.
3. **The flag emoji are inconsistent across platforms** and aren't really
   doing label work — they decorate but don't aid scanning.

## How we worked

We explored six fairly different directions on a side-by-side canvas first:

1. **Editorial dictionary** — Newsreader serif, hairline rules, small-caps language labels, numbered example list.
2. **Warm card refined** — the original direction, tightened.
3. **Typographic poster** — the word *is* the design.
4. **Swiss flashcard** — minimal, mono metadata, single highlight.
5. **Nordic specimen** — paper feel, italic headword, oxblood accents.
6. **Playful learning app** — Duolingo-ish energy, audio button, streak.

You picked **1 (editorial)** and **5 (specimen)** as the two strongest. After
a head-to-head comparison we converged on a hybrid taking the strongest
elements of each:

- Folio header (Orð dagsins · 6. apríl 2026) above an ink-black hairline — from V1
- Roman headword in Newsreader 500 — from V1, no italic
- Metadata stack below: peg + label + word class line — from V5
- Oxblood `#7a1a22` accent for the dot separator and section pegs — from V5
- Indented examples block with a vertical oxblood rule on the left — from V5

We then ran a **five-axis exploration** to test each ornament:

- **A. Stripped control** — verified that "remove everything decorative" felt empty.
- **B. No-rules variant** — `※` alone as section break; verified worse than rules.
- **C. Desktop two-column** — examples to the right of the hero.
- **D. Color palettes** — oxblood / forest / ink-blue / sepia / rust. **Oxblood won.**
- **E. Type pairings** — Newsreader / Cormorant / Source Serif / Instrument. **Newsreader won.**

The final round of refinements came out of devil's advocate analysis:

- The two `※`-on-hairline rules were doing the same job as the pegs that
  followed them. **Removed.**
- The em-dash before each Swedish example sentence was redundant with the
  italic + muted color treatment. **Removed.**
- ÍS / SE labels became the **full Icelandic words**: Íslenska, Svenska, Dæmi.
  The labels now read as content rather than codes.

The final piece was the desktop layout. The first attempt squeezed the
examples column on the multi-translation case; the fix was a
`minmax(50%, 1fr) 1.65fr` grid so the hero column never collapses below half
the canvas, and both columns get `min-width: 0` so the headword auto-fit can
actually constrain.

## Decisions made

| Decision | Why |
|---|---|
| **Newsreader serif** for headword and body | Editorial feel; superior italic for examples; reads as "dictionary, not app" |
| **Inter** for small-caps labels and folio | High-quality letterspacing at 11px; pairs cleanly with Newsreader |
| **Paper background `#f7f4ec`** | Warm enough to read as paper; cool enough not to feel sepia |
| **Oxblood `#7a1a22` accent** | Holds against ink-black headword without competing; tested against four other accents |
| **No background gradients or radial washes** | The original two radials worked against the editorial direction |
| **No card chrome (border + shadow + radius)** | Replaced by typographic hierarchy and the vertical example rule |
| **Auto-fit headword** | Binary-searches the largest font size that fits; falls back to wrapping if the minimum (32px on phone, 36px on desktop) still doesn't fit |
| **Spelled-out language labels** | Íslenska / Svenska / Dæmi reads as page chrome, not as codes |
| **Oxblood `·` between Swedish translations** | Pulls the eye through the list; tested vs `,` and `/` — dot won |
| **Vertical oxblood rule on examples block** | Replaces the "card" container; the only structural ornament that survived devil's advocate |
| **Hairlines between adjacent examples** | Survived because they mark example boundaries, not section boundaries — different job |
| **Inflection line in italic, muted, smaller** | Reads as gloss, not as primary content |
| **Word class spelled out in italic** | "lýsingarorð" rather than "lo." — adds a half-ounce of dictionary feel |

## What we tried and rejected

- **`※` between sections.** Read as decorative, not structural. Pegs alone are stronger.
- **Forest / ink-blue / sepia / rust accents.** All workable; oxblood was the most "dictionary."
- **Cormorant Garamond / Source Serif / Instrument Serif.** Cormorant was too delicate; Source Serif too utilitarian; Instrument too display-only.
- **Em-dash before SE example.** Redundant with the italic and color shift.
- **Stripped variant (no pegs, no rules).** Lacked structure; the page felt thin.
- **`※`-only section breaks (no rules).** Worse than the converged design.

## Open questions for implementation

These weren't designed and should be confirmed with the user before
implementation closes:

- **Word class inference.** The current data does not include `wordClass` or
  `gender` fields; the prototype synthesizes them. Implementation must either
  compute these from `fletta` (likely impossible in general) or extend the
  data layer.
- **Inflection line.** Same data-layer question. The prototype shows
  `verðskuldaður · verðskulduð · verðskuldað` for adjectives and
  `samtíð · samtíðir` for nouns; in production this needs a real source.
  Recommend hiding the line entirely if no inflection data is available.
- **Empty / error states.** Not designed. What shows if the date param is
  invalid, or if a word lacks Swedish translations?
- **Dark mode.** Not designed. Out of scope for this round.
- **Print stylesheet.** Not designed but the layout is print-friendly.
- **Prev / next day navigation.** Not designed; out of scope.
- **Word-of-the-day index display** ("1 / 5891"). Not designed; out of scope.

## How to view the design

Open `preview.html` in a browser. It contains four data scenarios on phone and
four on desktop, all rendered with the same component code that should be
ported into Pug.
