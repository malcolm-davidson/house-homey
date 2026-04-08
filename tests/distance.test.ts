import { describe, expect, it } from 'vitest';
import { haversineMiles, isInsideRadiusMiles } from '../src/utils/distance';

describe('distance utils', () => {
  it('returns near zero for identical points', () => {
    expect(haversineMiles({ lat: 37.1, lng: -122.1 }, { lat: 37.1, lng: -122.1 })).toBeCloseTo(0, 5);
  });

  it('checks radius inclusion', () => {
    expect(isInsideRadiusMiles({ lat: 37.3947, lng: -122.0782 }, { lat: 37.3947, lng: -122.0782 }, 0.5)).toBe(true);
  });
});
