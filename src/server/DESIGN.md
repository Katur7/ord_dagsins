# Orð dagsins — Design specification

This document describes the visual and structural design of the
word-of-the-day page: tokens, layout, component behavior, and the
rationale behind each decision. The live source code is the source of
truth for what ships; this document explains *why* the values are what
they are.

---

## 1 · Design tokens

```css
/* Color */
--ink:    #15171a;   /* primary text, folio rule */
--paper:  #f7f4ec;   /* page background */
--rule:   #d9d2c2;   /* hairlines between examples */
--muted:  #6a6055;   /* secondary text, Dæmi peg, italics */
--accent: #7a1a22;   /* oxblood: pegs, dot separator, vertical example rule */

/* Type */
--font-serif: 'Newsreader', serif;     /* headword + body + italics */
--font-label: 'Inter', sans-serif;     /* small-caps labels + folio */

/* Headword fit limits */
--headword-min-phone:   32px;
--headword-max-phone:   76px;
--headword-min-desktop: 36px;
--headword-max-desktop: 92px;

/* Layout */
--page-padding-phone:   40px 44px 48px;
--page-padding-desktop: 56px 80px 64px;
--column-gap-desktop:   96px;
--examples-padding-y:   18px (phone) / 32px (desktop);
--examples-rule-gap:    22px (phone) / 32px (desktop);
```

### Font loading

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,400;6..72,500;6..72,600&family=Inter:wght@500;600;700&display=swap" rel="stylesheet">
```

Use `font-display: swap`. The headword auto-fit re-runs on
`document.fonts.ready` to recalculate after Newsreader loads.

---

## 2 · Page structure

```
┌─────────────────────────────────────────┐
│  ORÐ DAGSINS         6. APRÍL 2026      │  ← folio header
│ ─────────────────────────────────────── │  ← ink-black hairline
│                                         │
│  ▪ ÍSLENSKA                             │  ← peg + label
│                                         │
│  verðskuldaður                          │  ← headword (auto-fit)
│  lýsingarorð                            │  ← word class (italic, muted)
│                                         │
│  ▪ SVENSKA                              │
│                                         │
│  välförtjänt                            │  ← translation list (dots between)
│                                         │
│  ▪ DÆMI                                 │  ← Dæmi peg uses muted color
│                                         │
│  │ hann vann verðskuldaðan sigur …      │  ← vertical oxblood rule
│  │ han vann en välförtjänt seger …      │     italic + muted SE line
│  │ ─────────────────────────────────    │  ← hairline between examples
│  │ verðlaunin sem hún fékk voru …       │
│  │ priset som hon fick var …            │
└─────────────────────────────────────────┘
```

### Folio header

- `display: flex; justify-content: space-between; align-items: baseline`
- Inter 11px, weight 600, letter-spacing `0.18em`, uppercase, color `--muted`
- Padding-bottom `12px`, border-bottom `1px solid var(--ink)`
- Margin-bottom `32px` (phone) / `56px` (desktop)
- Left text: `Orð dagsins`
- Right text: Icelandic-formatted date — `6. apríl 2026`

### Peg label

A 7×7 oxblood square + an Inter small-caps label.

```css
.peg {
  display: flex;
  align-items: center;
  gap: 12px;
  font-family: var(--font-label);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.22em;
  text-transform: uppercase;
}
.peg::before {
  content: '';
  width: 7px;
  height: 7px;
  background: var(--accent);
  display: block;
  flex-shrink: 0;
}
.peg.is, .peg.se { color: var(--accent); }
.peg.daemi       { color: var(--muted); }
```

The Dæmi peg uses muted color; the square stays oxblood. This subtle
distinction tells the eye that ÍSLENSKA / SVENSKA are language labels and
DÆMI is a section header — same visual vocabulary, different rank.

### Headword

- Newsreader 500, color `--ink`, letter-spacing `-0.02em`, line-height `1.02`
- Auto-fit (see §3) within `[min, max]` for the breakpoint
- Margin-top `14px` (phone) / `16px` (desktop) below the peg

### Word class (gloss line)

- Newsreader italic, 16px (phone) / 18px (desktop)
- Color `--muted`
- Margin-top `14px` / `18px` below headword
- Format: `lýsingarorð` for adjective, `nafnorð · kvenkyn` for fem. noun, etc.
  Spelled out in Icelandic; gender appended with ` · ` when applicable.
  Display strings are produced by `format.ts` from the raw codes in the
  data — see §5.

### Translation list

- Newsreader regular, 30px (phone) / 34px (desktop)
- Color `--ink`, letter-spacing `-0.01em`, line-height `1.22`
- Items separated by `·` in `var(--accent)`, italic
- Each item wrapped so it doesn't break across lines (`white-space: nowrap`
  on the item span; the `·` separator and surrounding spaces in their own
  inline-block can break)
- Margin-top `14px` / `16px` below the SVENSKA peg

### Examples block

- Wrapper: `margin-left: 14px; padding-left: 22px (phone) / 32px (desktop);
  border-left: 1px solid var(--accent)`
- Each example: padding-top/bottom `18px` (phone) / `32px` (desktop), with
  `1px solid var(--rule)` between adjacent examples
- The first example uses `padding-top: 4px` (phone) / `6px` (desktop)
- The last example uses `padding-bottom: 0`
- IS line: Newsreader, 17px / 24px, line-height 1.5, color `--ink`
- SE line: Newsreader italic, 16px / 21px, line-height 1.5, color `--muted`
- Margin-top `6px` / `12px` between IS and SE lines

---

## 3 · Headword auto-fit (the long-word fix)

The single most important behavior. A naive layout lets long compound
headwords (`þjóðfélagshagfræðingur`, `sjálfsmorðshugleiðingar`) overflow
the column or break mid-syllable; this design measures and shrinks.

```js
function fitHeadword(el, minPx, maxPx) {
  // Binary-search the largest font-size that fits the container width
  // on a single line. If even minPx doesn't fit, allow wrapping.
  const measure = el.querySelector('[data-measure]');
  const visible = el.querySelector('[data-visible]');
  const available = el.clientWidth;

  measure.style.fontSize = maxPx + 'px';
  if (measure.offsetWidth <= available) {
    visible.style.fontSize = maxPx + 'px';
    visible.style.whiteSpace = 'nowrap';
    return;
  }
  measure.style.fontSize = minPx + 'px';
  if (measure.offsetWidth > available) {
    // Even minimum doesn't fit — allow wrap
    visible.style.fontSize = minPx + 'px';
    visible.style.whiteSpace = 'normal';
    visible.style.wordBreak = 'break-word';
    return;
  }
  let lo = minPx, hi = maxPx, best = minPx;
  for (let i = 0; i < 22; i++) {
    const mid = (lo + hi) / 2;
    measure.style.fontSize = mid + 'px';
    if (measure.offsetWidth <= available) { best = mid; lo = mid; }
    else { hi = mid; }
  }
  visible.style.fontSize = Math.floor(best) + 'px';
  visible.style.whiteSpace = 'nowrap';
}
```

### Wiring

```js
const el = document.querySelector('.headword-fit');
const isDesktop = matchMedia('(min-width: 720px)').matches;
const min = isDesktop ? 36 : 32;
const max = isDesktop ? 92 : 76;

const run = () => fitHeadword(el, min, max);
new ResizeObserver(run).observe(el);
document.fonts.ready.then(run);
window.addEventListener('load', run);
```

The markup is two stacked spans inside the headword container — one
hidden measurement node, one visible. The measurement node has the same
font family/weight/letter-spacing as the visible one and is positioned
offscreen with `position: absolute; visibility: hidden; left: -99999px`.

### CSS-only fallback

If JS is disabled, the `<h1>` falls back to:

```css
.headword-fit h1 {
  font-size: clamp(32px, 9vw, 76px);
  word-break: break-word;
}
```

This is worse than the JS path but won't break out of the layout.

---

## 4 · Breakpoints and responsive behavior

Single breakpoint at `720px`. Below: stacked phone layout. Above:
two-column desktop layout.

### Phone (`width < 720px`)

- Single column
- Page padding `40px 44px 48px`
- Headword fit `[32, 76]px`
- Sections stacked: folio · ÍSLENSKA + headword · SVENSKA + translations · DÆMI + examples
- Section spacing: `36px` margin-top between major sections

### Desktop (`width ≥ 720px`)

- Two-column grid: `grid-template-columns: minmax(50%, 1fr) 1.65fr`
- `gap: 96px`
- Page padding `56px 80px 64px`
- Headword fit `[36, 92]px`
- Left column stacks: ÍSLENSKA + headword + class, then `44px` gap, then
  SVENSKA + translations
- Right column: DÆMI + examples block, larger type than phone (24/21)

### `min-width: 0` on grid items

Both `.hero` and `.examples` carry `min-width: 0` at all viewport widths.
Without it, a grid track's implicit minimum is `auto` (content-based);
content with intrinsic width greater than the track's `1fr` share — long
nowrap headwords pre-fit, long nowrap translation spans — would push the
track wider than its column. `min-width: 0` floors the track at zero so
the auto-fit script can actually constrain the headword to the column.

### `minmax(50%, 1fr)` on desktop

A naive `1fr 1.65fr` grid lets the hero column collapse arbitrarily small
when the right column gets greedy (multi-translation case). A bare `1fr 1fr`
gives the hero too much. `minmax(50%, 1fr)` floors the hero at half the
canvas — enough room for `verðskuldaður` at 76px+ — and lets it grow to its
1fr share when the right column is content-light.

---

## 5 · Data shape and display mapping

The `WordOfTheDay` interface (see `word.ts`) carries raw codes from the
upstream data:

```ts
export interface WordOfTheDay {
  flid: number;
  fletta: string;
  pos: string;             // 'adj' | 'n' | 'v' | 'adv' | 'conj' | 'prae' | 'pron' | ...
  gender: string | null;   // 'm' | 'f' | 'n' | 'mpl' | 'fpl' | 'npl' | 'f/m' | ...
  stuttbeyg: string | null;
  translations: string[];
  examples: Example[];
}
```

Display strings are produced server-side by `format.ts` and passed to
the template:

- **`mapPos(code)`** — maps each `pos` value to a fully spelled-out
  Icelandic word (e.g. `adj` → `lýsingarorð`, `n` → `nafnorð`). Combined
  forms (e.g. `adj/adv`) split on `/` and join the parts with ` · `.
  Returns `null` for unmapped codes; the word-class line is hidden in
  that case.
- **`mapGender(code)`** — maps each `gender` value similarly (e.g. `m` →
  `karlkyn`, `mpl` → `karlkyn fleirtala`, `f/m` → `kvenkyn · karlkyn`).
  Returns `null` for `null` input or unmapped codes; the gender portion
  is omitted in that case (the pos word still shows, if mapped).

The word-class line is composed as `mapPos(pos)` followed by ` · ` and
`mapGender(gender)` when both are non-null; just `mapPos(pos)` when
gender is null; hidden entirely when `mapPos` is null.

`stuttbeyg` is currently not rendered. The data carries free-form prose
(adjective sentences, verb conjugation tables) rather than a bare-form
list, and a visual treatment that matches the data shape has not yet
been designed.

`translations` is an array; the template iterates and inserts the
oxblood `·` between items via CSS `::before`. `examples` is rendered
verbatim.

The Icelandic word labels read as page chrome rather than as codes —
`Íslenska` / `Svenska` / `Dæmi` instead of ÍS / SE / EX — which adds a
half-ounce of dictionary feel.

---

## 6 · Date formatting

The folio header shows the date in Icelandic long form:

```
6. apríl 2026
```

```js
const IS_MONTHS = [
  'janúar','febrúar','mars','apríl','maí','júní',
  'júlí','ágúst','september','október','nóvember','desember'
];
function formatDateIs(iso) {
  const d = new Date(iso + 'T12:00:00');
  return `${d.getDate()}. ${IS_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}
```

The folio uses Inter 11px small-caps so the rendered date reads as
`6. APRÍL 2026`. Formatting happens server-side; the template receives
a pre-formatted string.

---

## 7 · Edge cases the design handles

- **Long compounds** (`þjóðfélagshagfræðingur`,
  `sjálfsmorðshugleiðingar`): auto-fit shrinks to fit; if the minimum
  size still doesn't fit, the word wraps.
- **Multi-translation lists** (5+ items): inline `·` separators with
  `white-space: nowrap` on each item; the list wraps between items,
  never inside a word.
- **Single-example words**: no hairline appears since hairlines only sit
  between adjacent examples.
- **Two-example words**: one hairline.
- **Very short words** (`ég`, `og`): fit at the maximum size; the line
  of type feels lighter but the rest of the page (gloss, translation,
  examples) keeps the column anchored.

---

## 8 · Known limitations

The design does not currently address:

- Empty / error states (invalid date, missing word, no Swedish translation)
- Dark mode
- Print stylesheet (the layout is print-friendly but no print rules)
- Prev / next day navigation
- Word-index counter ("1 / 5891")
- Multi-sense words (one fletta, multiple unrelated meanings — currently
  rendered as separate entries with the same headword)
- `stuttbeyg` rendering (see §5)
- Visual treatment for plural / ambiguous-combo gender values
  (`karlkyn fleirtala`, `kvenkyn · karlkyn`, etc.) — they map cleanly to
  display strings but may push the metadata line further than intended

---

## 9 · Accessibility notes

- All color pairs against the paper background pass WCAG AA at body sizes:
  - ink `#15171a` on paper `#f7f4ec` → 17.4:1
  - muted `#6a6055` on paper → 5.6:1
  - accent `#7a1a22` on paper → 8.3:1
- The 11px small-caps labels on muted color need to be checked at the
  smallest rendered size; they currently pass AA for normal text.
- The headword uses a real `<h1>`; the rest of the labels are spans
  within semantic landmarks (`<header>`, `<main>`, `<section>`).
- The vertical oxblood rule is purely decorative — it's a `border-left`,
  not a semantic divider.
- Language attributes: `<html lang="is">`, the SE translation list and
  example SE lines carry `lang="sv"`.

---

## 10 · Where the design lives

- **`src/server/views/index.pug`** — markup
- **`src/server/styles/index.css`** — tokens, layout, breakpoints, all
  component styles
- **`src/server/public/headword-fit.js`** — auto-fit binary search,
  served as a static asset
- **`src/server/format.ts`** — `formatDateIs`, `mapPos`, `mapGender`
- **`src/server/server.ts`** — render-opts composition (assembles the
  word-class line, formatted date, etc., before passing to the template)
