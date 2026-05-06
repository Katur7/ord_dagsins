import { describe, it, expect } from 'vitest';
import { daysBetween } from './word.ts';

describe('daysBetween', () => {
  it('returns the number of days between two dates', () => {
    expect(daysBetween('2026-01-01', '2026-01-02')).toBe(1);
  });
});
