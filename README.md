# Orð dagsins

A daily Icelandic word with its Swedish translation and a couple of example sentences. One word per day, the same word for everyone, drawn from the ÍSLEX Icelandic-Swedish dictionary.

Live at **[ord-dagsins.pippinn.me](https://ord-dagsins.pippinn.me)**.

![Word of the day](screenshots/third%20design.png)

## What it is

The page shows a single headword keyed by today's date — `verðskuldaður` on the 6th of April, something else on the 7th. The sequence is reproducible: indexing into a pre-shuffled corpus by days since a fixed epoch means a link you share today still resolves to the same word a year from now, and the server keeps no state.

URLs are addressable:

```
/                       today's word
/?date=2026-04-06       a specific date
```

Set `Accept: application/json` on any of those and you get the raw record instead of the rendered page.

## Data

The corpus comes from the [ÍSLEX](https://islex.arnastofnun.is/) Icelandic-Swedish dictionary, published by [Stofnun Árna Magnússonar í íslenskum fræðum](https://arnastofnun.is/). The raw API response is paginated 5 000 entries at a time into [raw/](raw/), then a preprocess pipeline filters, reshapes, and deterministically shuffles them into [processed/shuffled.json](processed/shuffled.json) — the only data file the server reads at runtime.

See [src/preprocess/README.md](src/preprocess/README.md) for the source schema, the filtering rules, and how examples get paired with their translations.

## Running

Requires Node 24+ (the server runs `.ts` directly via Node's built-in TypeScript support).

```
npm install
npm run dev         # node --watch
npm start
npm test
```

Server listens on `:3000`. The repo ships with `processed/shuffled.json` already built — you only need to regenerate it if you re-fetch the raw data:

```
npm run preprocess
```

### Docker

```
npm run docker:build
docker compose up
```

The image only carries the server and the shuffled JSON — no raw data, no preprocess pipeline.

## Layout

```
src/
  preprocess/  raw ÍSLEX dump → processed/shuffled.json   (see README)
  server/      Express + Pug renderer for the daily page  (see README)
  scripts/     ad-hoc tooling
raw/           paginated ÍSLEX API responses (gitignored)
processed/     shuffled.json — the only file the server reads
specs/tasks/   per-feature design notes
```

The design rationale for the rendered page — tokens, typography, the headword auto-fit, the two-column desktop grid — lives in [src/server/DESIGN.md](src/server/DESIGN.md).

## License & attribution

The code in this repository is MIT-licensed — see [LICENSE](LICENSE).

The dictionary data shipped in [processed/shuffled.json](processed/shuffled.json) is derived from the ÍSLEX Icelandic-Swedish dictionary, © [Stofnun Árna Magnússonar í íslenskum fræðum](https://arnastofnun.is/) and its Scandinavian co-publishers, and distributed by them under [CC BY-NC-ND 4.0](https://creativecommons.org/licenses/by-nc-nd/4.0/). The code's MIT license does not extend to the data: any reuse beyond running this project for non-commercial purposes should be cleared with Árnastofnun directly.
