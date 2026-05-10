import { describe, it, expect } from 'vitest';
import {
    parseOfl,
    processItems,
    shouldKeep,
    extractRecord,
    loadIgnoreSet,
    type RawItem,
    type RawRecord,
} from './extract.ts';

describe('parseOfl', () => {
    it('returns pos and gender for nouns', () => {
        expect(parseOfl('n f')).toEqual({ pos: 'n', gender: 'f' });
        expect(parseOfl('n m')).toEqual({ pos: 'n', gender: 'm' });
        expect(parseOfl('n npl')).toEqual({ pos: 'n', gender: 'npl' });
        expect(parseOfl('n f/m')).toEqual({ pos: 'n', gender: 'f/m' });
    });

    it('returns null gender for non-nouns', () => {
        expect(parseOfl('v')).toEqual({ pos: 'v', gender: null });
        expect(parseOfl('adj')).toEqual({ pos: 'adj', gender: null });
        expect(parseOfl('adv/adj')).toEqual({ pos: 'adv/adj', gender: null });
    });

    it('handles missing ofl', () => {
        expect(parseOfl(null)).toEqual({ pos: '', gender: null });
        expect(parseOfl(undefined)).toEqual({ pos: '', gender: null });
    });
});

describe('processItems', () => {
    it('pairs DÆMI with SE-þýð via paritem', () => {
        const items: RawItem[] = [
            { itid: 1, texti: 'íslenskt dæmi', paritem: -1, teg: 'DÆMI' },
            { itid: 2, texti: 'sænsk þýðing', paritem: 1, teg: 'SE-þýð' },
        ];
        expect(processItems(items)).toEqual({
            translations: [],
            examples: [{ is: 'íslenskt dæmi', se: 'sænsk þýðing' }],
        });
    });

    it('skips DÆMI without a matching SE-þýð', () => {
        const items: RawItem[] = [
            { itid: 1, texti: 'íslenskt dæmi', paritem: -1, teg: 'DÆMI' },
        ];
        expect(processItems(items).examples).toEqual([]);
    });

    it('collects SE-jafn entries as translations', () => {
        const items: RawItem[] = [
            { itid: 1, texti: 'eitt', paritem: -1, teg: 'SE-jafn' },
            { itid: 2, texti: 'tvö', paritem: -1, teg: 'SE-jafn' },
        ];
        expect(processItems(items).translations).toEqual(['eitt', 'tvö']);
    });

    it('dedupes repeated SE-jafn translations, preserving first-occurrence order', () => {
        const items: RawItem[] = [
            { itid: 1, texti: 'sin', paritem: 100, teg: 'SE-jafn' },
            { itid: 2, texti: 'sin', paritem: 101, teg: 'SE-jafn' },
            { itid: 3, texti: 'hans', paritem: 102, teg: 'SE-jafn' },
            { itid: 4, texti: 'sin', paritem: 103, teg: 'SE-jafn' },
            { itid: 5, texti: 'hennes', paritem: 104, teg: 'SE-jafn' },
        ];
        expect(processItems(items).translations).toEqual(['sin', 'hans', 'hennes']);
    });

    it('caps translations at 20, preserving order', () => {
        const items: RawItem[] = Array.from({ length: 25 }, (_, i) => ({
            itid: i + 1,
            texti: `gloss${i + 1}`,
            paritem: -1,
            teg: 'SE-jafn',
        }));
        const { translations } = processItems(items);
        expect(translations).toHaveLength(20);
        expect(translations[0]).toBe('gloss1');
        expect(translations[19]).toBe('gloss20');
    });

    it('ignores unrelated teg values', () => {
        const items: RawItem[] = [
            { itid: 1, texti: 'foo', paritem: -1, teg: 'FRAMB' },
            { itid: 2, texti: 'bar', paritem: -1, teg: 'ISL-TEXTI' },
        ];
        expect(processItems(items)).toEqual({ translations: [], examples: [] });
    });
});

describe('shouldKeep', () => {
    const empty = new Set<string>();
    const base: RawRecord = { flid: 1, fletta: 'orðabók', ofl: 'n f', stuttbeyg: null, items: [] };

    it('drops skst', () => {
        expect(shouldKeep({ ...base, ofl: 'skst' }, empty)).toBe(false);
    });

    it('drops words shorter than 4 chars (ignoring hyphens/whitespace)', () => {
        expect(shouldKeep({ ...base, fletta: 'af' }, empty)).toBe(false);
        expect(shouldKeep({ ...base, fletta: 'aldrei' }, empty)).toBe(true);
    });

    it('drops multi-word entries', () => {
        expect(shouldKeep({ ...base, fletta: 'að aftan' }, empty)).toBe(false);
    });

    it('drops affix entries (leading or trailing hyphen)', () => {
        expect(shouldKeep({ ...base, fletta: 'al-' }, empty)).toBe(false);
        expect(shouldKeep({ ...base, fletta: '-aður' }, empty)).toBe(false);
    });

    it('drops entries listed in the ignore set (case-insensitive)', () => {
        expect(shouldKeep({ ...base, fletta: 'Garbage' }, new Set(['garbage']))).toBe(false);
    });
});

describe('extractRecord', () => {
    it('returns null when no translations', () => {
        const item: RawRecord = {
            flid: 1, fletta: 'aldrei', ofl: 'adv', stuttbeyg: null,
            items: [
                { itid: 1, texti: 'dæmi', paritem: -1, teg: 'DÆMI' },
                { itid: 2, texti: 'översättning', paritem: 1, teg: 'SE-þýð' },
            ],
        };
        expect(extractRecord(item, new Set())).toBeNull();
    });

    it('returns null when no examples', () => {
        const item: RawRecord = {
            flid: 1, fletta: 'aldrei', ofl: 'adv', stuttbeyg: null,
            items: [{ itid: 1, texti: 'aldrig', paritem: -1, teg: 'SE-jafn' }],
        };
        expect(extractRecord(item, new Set())).toBeNull();
    });

    it('returns null when fletta is in the ignore set', () => {
        const item: RawRecord = {
            flid: 1, fletta: 'aldrei', ofl: 'adv', stuttbeyg: null,
            items: [
                { itid: 1, texti: 'aldrig', paritem: -1, teg: 'SE-jafn' },
                { itid: 2, texti: 'dæmi', paritem: -1, teg: 'DÆMI' },
                { itid: 3, texti: 'översättning', paritem: 2, teg: 'SE-þýð' },
            ],
        };
        expect(extractRecord(item, new Set(['aldrei']))).toBeNull();
    });

    it('returns shaped record when valid', () => {
        const item: RawRecord = {
            flid: 42, fletta: 'aðdáanlegur', ofl: 'adj', stuttbeyg: 'hann er aðdáanlegur',
            items: [
                { itid: 1, texti: 'beundransvärd', paritem: -1, teg: 'SE-jafn' },
                { itid: 2, texti: 'íslensk dæmi', paritem: -1, teg: 'DÆMI' },
                { itid: 3, texti: 'svensk översättning', paritem: 2, teg: 'SE-þýð' },
            ],
        };
        expect(extractRecord(item, new Set())).toEqual({
            flid: 42,
            fletta: 'aðdáanlegur',
            pos: 'adj',
            gender: null,
            stuttbeyg: 'hann er aðdáanlegur',
            translations: ['beundransvärd'],
            examples: [{ is: 'íslensk dæmi', se: 'svensk översättning' }],
        });
    });

    it('extracts gender for nouns', () => {
        const item: RawRecord = {
            flid: 7, fletta: 'orðabók', ofl: 'n f', stuttbeyg: null,
            items: [
                { itid: 1, texti: 'ordbok', paritem: -1, teg: 'SE-jafn' },
                { itid: 2, texti: 'dæmi', paritem: -1, teg: 'DÆMI' },
                { itid: 3, texti: 'översättning', paritem: 2, teg: 'SE-þýð' },
            ],
        };
        const r = extractRecord(item, new Set());
        expect(r?.pos).toBe('n');
        expect(r?.gender).toBe('f');
    });
});

describe('loadIgnoreSet', () => {
    it('lowercases, trims, and skips blank lines', () => {
        const text = '  Foo  \n\nBAR\n  \nbaz';
        expect(loadIgnoreSet(text)).toEqual(new Set(['foo', 'bar', 'baz']));
    });
});
