import { describe, it, expect } from 'vitest';
import { formatDateIs, mapGender, mapPos } from './format.ts';

describe('formatDateIs', () => {
  it('formats a normal date in long Icelandic form', () => {
    expect(formatDateIs('2026-04-06')).toBe('6. apríl 2026');
  });

  it('uses single-digit day without leading zero', () => {
    expect(formatDateIs('2026-01-01')).toBe('1. janúar 2026');
  });

  it('handles two-digit day', () => {
    expect(formatDateIs('2026-12-25')).toBe('25. desember 2026');
  });

  it('handles month boundary correctly (no off-by-one from TZ)', () => {
    expect(formatDateIs('2026-03-01')).toBe('1. mars 2026');
  });

  it('handles leap day', () => {
    expect(formatDateIs('2024-02-29')).toBe('29. febrúar 2024');
  });

  it('handles year rollover', () => {
    expect(formatDateIs('2025-12-31')).toBe('31. desember 2025');
  });
});

describe('mapPos', () => {
  it('maps adj to lýsingarorð', () => {
    expect(mapPos('adj')).toBe('lýsingarorð');
  });

  it('maps n to nafnorð', () => {
    expect(mapPos('n')).toBe('nafnorð');
  });

  it('maps v to sagnorð', () => {
    expect(mapPos('v')).toBe('sagnorð');
  });

  it('maps adv to atviksorð', () => {
    expect(mapPos('adv')).toBe('atviksorð');
  });

  it('maps conj to samtenging', () => {
    expect(mapPos('conj')).toBe('samtenging');
  });

  it('maps prae to forsetning', () => {
    expect(mapPos('prae')).toBe('forsetning');
  });

  it('maps pron to fornafn', () => {
    expect(mapPos('pron')).toBe('fornafn');
  });

  it('maps num to töluorð', () => {
    expect(mapPos('num')).toBe('töluorð');
  });

  it('maps int to upphrópun', () => {
    expect(mapPos('int')).toBe('upphrópun');
  });

  it('maps adj/adv combo in data order with dot separator', () => {
    expect(mapPos('adj/adv')).toBe('lýsingarorð · atviksorð');
  });

  it('maps adv/adj combo in data order (different from adj/adv)', () => {
    expect(mapPos('adv/adj')).toBe('atviksorð · lýsingarorð');
  });

  it('maps adv/prae combo', () => {
    expect(mapPos('adv/prae')).toBe('atviksorð · forsetning');
  });

  it('maps prae/adv combo', () => {
    expect(mapPos('prae/adv')).toBe('forsetning · atviksorð');
  });

  it('returns null for unmapped value', () => {
    expect(mapPos('gr')).toBeNull();
    expect(mapPos('xyz')).toBeNull();
  });

  it('returns null for empty input', () => {
    expect(mapPos('')).toBeNull();
  });

  it('returns null when one part of a combo is unmapped', () => {
    expect(mapPos('adj/xyz')).toBeNull();
  });
});

describe('mapGender', () => {
  it('maps m to karlkyn', () => {
    expect(mapGender('m')).toBe('karlkyn');
  });

  it('maps f to kvenkyn', () => {
    expect(mapGender('f')).toBe('kvenkyn');
  });

  it('maps n to hvorugkyn', () => {
    expect(mapGender('n')).toBe('hvorugkyn');
  });

  it('maps mpl to karlkyn fleirtala', () => {
    expect(mapGender('mpl')).toBe('karlkyn fleirtala');
  });

  it('maps fpl to kvenkyn fleirtala', () => {
    expect(mapGender('fpl')).toBe('kvenkyn fleirtala');
  });

  it('maps npl to hvorugkyn fleirtala', () => {
    expect(mapGender('npl')).toBe('hvorugkyn fleirtala');
  });

  it('maps f/m combo with dot separator', () => {
    expect(mapGender('f/m')).toBe('kvenkyn · karlkyn');
  });

  it('maps f/n combo', () => {
    expect(mapGender('f/n')).toBe('kvenkyn · hvorugkyn');
  });

  it('maps m/n combo', () => {
    expect(mapGender('m/n')).toBe('karlkyn · hvorugkyn');
  });

  it('maps n/f combo', () => {
    expect(mapGender('n/f')).toBe('hvorugkyn · kvenkyn');
  });

  it('returns null for null input', () => {
    expect(mapGender(null)).toBeNull();
  });

  it('returns null for unmapped value', () => {
    expect(mapGender('xyz')).toBeNull();
  });
});
