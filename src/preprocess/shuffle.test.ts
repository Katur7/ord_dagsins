import { describe, it, expect } from 'vitest';
import { seededRandom, hashStringToSeed, deterministicShuffle } from './shuffle.ts';

describe('hashStringToSeed', () => {
    it('returns the same seed for the same string', () => {
        expect(hashStringToSeed('WORD')).toBe(hashStringToSeed('WORD'));
    });

    it('returns different seeds for different strings', () => {
        expect(hashStringToSeed('WORD')).not.toBe(hashStringToSeed('OTHER'));
    });

    it('returns a non-negative integer', () => {
        const seed = hashStringToSeed('anything');
        expect(Number.isInteger(seed)).toBe(true);
        expect(seed).toBeGreaterThanOrEqual(0);
    });
});

describe('seededRandom', () => {
    it('produces the same sequence for the same seed', () => {
        const a = seededRandom(42);
        const b = seededRandom(42);
        for (let i = 0; i < 10; i++) expect(a()).toBe(b());
    });

    it('produces different sequences for different seeds', () => {
        const a = seededRandom(1);
        const b = seededRandom(2);
        expect(a()).not.toBe(b());
    });

    it('returns values in [0, 1)', () => {
        const rng = seededRandom(123);
        for (let i = 0; i < 50; i++) {
            const v = rng();
            expect(v).toBeGreaterThanOrEqual(0);
            expect(v).toBeLessThan(1);
        }
    });
});

describe('deterministicShuffle', () => {
    it('preserves all elements', () => {
        const input = [1, 2, 3, 4, 5];
        expect(deterministicShuffle(input, 42).slice().sort()).toEqual([1, 2, 3, 4, 5]);
    });

    it('does not mutate input', () => {
        const input = [1, 2, 3, 4, 5];
        deterministicShuffle(input, 42);
        expect(input).toEqual([1, 2, 3, 4, 5]);
    });

    it('is deterministic for the same seed', () => {
        const input = ['a', 'b', 'c', 'd', 'e', 'f'];
        expect(deterministicShuffle(input, 99)).toEqual(deterministicShuffle(input, 99));
    });

    it('handles empty arrays', () => {
        expect(deterministicShuffle([], 1)).toEqual([]);
    });
});
