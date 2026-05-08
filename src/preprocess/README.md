# preprocess

Turns the raw ÍSLEX dictionary dump into the trimmed, shuffled JSON the server reads.

## Source data

The raw files in [raw/](../../raw/) come from the ÍSLEX Icelandic-Swedish dictionary API at `islex.arnastofnun.is`, paginated 5 000 entries at a time:

```
curl 'https://islex.arnastofnun.is/django/api/flettur_v4/?lang=SE&limit=5000&offset=0' > flettur1-5000.json
```

Each file is a page response with shape:

```json
{
  "count": 54396,
  "next": "...",
  "previous": null,
  "results": [ /* array of flettur (entries) */ ]
}
```

A **fletta** is one dictionary entry (headword). Its top-level fields:

| Field       | Meaning                                                                 |
| ----------- | ----------------------------------------------------------------------- |
| `flid`      | Numeric entry id (stable, used as a primary key downstream)             |
| `fletta`    | The Icelandic headword itself                                           |
| `ofl`       | Part-of-speech tag (see [ofl values](#ofl-values))                      |
| `stuttbeyg` | Short inflection hint, e.g. `"ég abbast, við öbbumst; hann abbaðist"`   |
| `items`     | Array of sub-entries: pronunciations, translations, examples, etc.      |

## ofl values

`ofl` (*orðflokkur*, "word class") encodes part of speech and, for nouns, gender. The pipeline parses it as `pos[ space gender ]` — the first token is the POS, and the second is only meaningful when `pos === 'n'`.

| ofl          | Meaning                              | Kept? |
| ------------ | ------------------------------------ | ----- |
| `n m`        | nafnorð, karlkyn (masculine noun)    | yes   |
| `n f`        | nafnorð, kvenkyn (feminine noun)     | yes   |
| `n n`        | nafnorð, hvorugkyn (neuter noun)     | yes   |
| `n mpl`      | masc noun, plurale tantum            | yes   |
| `n fpl`      | fem noun, plurale tantum             | yes   |
| `n npl`      | neuter noun, plurale tantum          | yes   |
| `n f/m`, `n m/n`, `n f/n`, `n n/m` | mixed-gender nouns | yes   |
| `adj`        | lýsingarorð (adjective)              | yes   |
| `v`          | sögn (verb)                          | yes   |
| `adv`        | atviksorð (adverb)                   | yes   |
| `prae`       | forsetning (preposition)             | yes   |
| `prae/adv`, `adv/prae` | preposition / adverb       | yes   |
| `adj/adv`, `adv/adj`   | adjective / adverb         | yes   |
| `forl`       | forliður (prefix)                    | yes   |
| `pron`       | fornafn (pronoun)                    | yes   |
| `conj`       | samtenging (conjunction)             | yes   |
| `int`        | upphrópun (interjection)             | yes   |
| `num`, `num adj` | töluorð (numeral)                | yes   |
| `inf`        | nafnháttarmerki (`að`)               | yes\* |
| `skst`       | skammstöfun (abbreviation)           | **no** — dropped in `shouldKeep` |

\* `inf` survives `shouldKeep`, but the only entry with that tag (`að`) is filtered out earlier by the 4-character minimum.

## How items inside a fletta relate

Each `fletta.items[]` entry has:

```json
{
  "itid": 151670,        // sub-entry id, unique within the fletta
  "texti": "...",        // the actual text payload
  "paritem": -1,         // parent itid, or -1 if it has no parent
  "teg": "DÆMI"          // sub-entry type
}
```

`paritem` is the glue: it points at another item's `itid` to express "this belongs to that one". `-1` means top-level.

The `teg` (*tegund*, "type") values seen in the raw data, and how the pipeline treats each:

| teg          | Meaning                               | Used? |
| ------------ | ------------------------------------- | ----- |
| `SE-jafn`    | Swedish equivalent (translation)      | **yes** — collected as `translations[]` |
| `DÆMI`       | Icelandic example sentence            | **yes** — paired with its `SE-þýð` child |
| `SE-þýð`     | Swedish translation of a parent       | **yes** — only when `paritem` points at a `DÆMI` |
| `FRAMB`      | pronunciation audio reference         | ignored |
| `BEYGING`    | inflection table link (BÍN)           | ignored |
| `MORFO-SE`   | Swedish morphology hint               | ignored |
| `HLUTAR`     | compound parts                        | ignored |
| `SOSTÆÐA`    | verb construction template            | ignored |
| `OSTÆÐA`, `OSAMB`, `FALLSTJ`, `FALLSTJ-FS`, `FRUMLAG`, `FORM`, `SOHAUS` | grammatical metadata | ignored |
| `TILFØJELSE`, `SE-skýr`, `SE-kateg`, `KOM-se`, `NOT-se`, `NOTKUN`, `ATH-se` | usage notes / glosses | ignored |
| `SVIÐ`, `Z-MERKING`, `Z-LO`, `Z-PERSÓNA`, `Z-HESTUR`, `LIÐUR` | semantic / domain tags | ignored |
| `MYND`, `WWW`, `STRIK`, `VÍSUN`, `ISL-TEXTI` | media / cross-refs | ignored |

### Pairing examples to translations

`DÆMI` (Icelandic example) and `SE-þýð` (Swedish translation) are stored as **separate** items linked through `paritem`. To reconstruct an example pair you find each `DÆMI`, then locate the `SE-þýð` item whose `paritem === DÆMI.itid`:

```
items[
  { itid: 151674, teg: "DÆMI",   texti: "hann abbaðist upp á stúlkur á ballinu", paritem: 151670 },
  { itid: 1031269, teg: "SE-þýð", texti: "han var påflugen mot en del flickor på festen", paritem: 151674 },
]
                                                                                    ^^^^^^
                                                          points at the DÆMI's itid
```

A `DÆMI` without a matching `SE-þýð` is dropped — we only keep examples that have a Swedish translation.

`SE-jafn` items are flat: their `paritem` is irrelevant for our purposes; we just collect every `texti` into `translations[]`.

## Pipeline

[build.ts](build.ts) is the entry point. It walks every file in [raw/](../../raw/), runs each entry through [extract.ts](extract.ts), then deterministically shuffles the result and writes [processed/shuffled.json](../../processed/shuffled.json).

```
raw/*.json  →  extractRecord  →  deterministicShuffle("WORD")  →  processed/shuffled.json
```

### Filtering — `shouldKeep`

A fletta is dropped when any of these are true:

- `pos === 'skst'` (abbreviation)
- The headword contains a space (multi-word entry)
- The headword starts or ends with `-` (affix, not a standalone word)
- The headword has fewer than 4 letters after stripping hyphens and spaces
- The headword (lowercased, trimmed) is in [ignore.txt](ignore.txt)

Then `extractRecord` additionally drops entries with **zero translations** or **zero examples** — both lists must be non-empty.

### Output shape

Each surviving fletta is reshaped into a `WordRecord`:

```ts
{
  flid: number,
  fletta: string,
  pos: string,                 // "n", "v", "adj", ...
  gender: string | null,       // "m" / "f" / "n" / "fpl" / ... — only for pos === "n"
  stuttbeyg: string | null,
  translations: string[],      // every SE-jafn texti
  examples: { is: string; se: string }[],  // DÆMI paired with its SE-þýð
}
```

### Shuffle

[shuffle.ts](shuffle.ts) implements a Park-Miller LCG seeded from a hashed string (Fisher-Yates, deterministic). [build.ts](build.ts) seeds with the literal `"WORD"`, so re-running the pipeline always produces the same ordering — the "word of the day" sequence is reproducible.

## Running

```
npx tsx src/preprocess/build.ts
```

Logs per-file kept counts and a final total, then writes `processed/shuffled.json`.
