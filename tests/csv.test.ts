import { describe, expect, it } from 'vitest';
import { parseListingCsv, parsePastedInput } from '../src/services/csv';

describe('csv parsing', () => {
  it('parses sample csv rows', () => {
    const { listings, warnings } = parseListingCsv('address,price\n123 Main,100');
    expect(warnings).toHaveLength(0);
    expect(listings).toHaveLength(1);
    expect(listings[0]?.address).toBe('123 Main');
    expect(listings[0]?.price).toBe(100);
  });

  it('parses line-delimited addresses', () => {
    const { listings } = parsePastedInput('One St\nTwo St');
    expect(listings).toHaveLength(2);
    expect(listings[1]?.address).toBe('Two St');
  });
});
