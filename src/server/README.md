# server

Renders the daily Icelandic-Swedish word page.

## Why a server at all

The data is static — it could ship as a single HTML file generated at build time. A server exists because the page is keyed by *today's date* in the visitor's sense of "today", and because we want addressable URLs for arbitrary dates and arbitrary words (`?date=`, `?fletta=`, `?flid=`) without pre-rendering 50 000 pages. Render on request, hold the JSON in memory, done.

## Why deterministic, not random

`getWordOfTheDay` indexes into the pre-shuffled list by days since a fixed epoch. Two consequences fall out of that choice:

- The same date always shows the same word, so a link you share today still resolves tomorrow.
- The sequence is reproducible from the preprocess seed alone — no database, no "which words have we shown" state to keep in sync.

The shuffle happens once, offline, in [the preprocess pipeline](../preprocess/README.md). The server only does lookup.

## Why server-rendered Pug

The page is a single read with no client-side state. Server-rendering gives us a fast first paint, a working no-JS fallback, and lets the headword auto-fit script (the only real client-side logic) stay tiny — see [DESIGN.md](DESIGN.md) for the visual rationale.

Content negotiation: send `Content-Type: application/json` and you get the raw record instead of HTML. Same URL, same lookup, different shell.

## Why no database

The processed corpus fits in memory (~50 000 entries, one JSON file). A database would buy us nothing the file doesn't already give us, and would cost a connection, a schema, and a migration story. If the corpus grows past what a single file can hold, that's the signal to revisit — not before.

## Running

```
npm run dev    # node --watch
npm start
npm test
```

Server listens on `:3000`. Requires `processed/shuffled.json` — generate it via the [preprocess pipeline](../preprocess/README.md) first.
