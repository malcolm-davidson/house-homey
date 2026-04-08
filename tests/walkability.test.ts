import { describe, expect, it } from 'vitest';
import { computeListingMetrics } from '../src/domain/metrics';
import { DEFAULT_ANCHORS } from '../src/data/anchors';
import { DEFAULT_CORES } from '../src/data/cores';

describe('walkability metrics', () => {
  it('computes nearest core and inside zones', () => {
    const listing = {
      id: '1',
      address: 'test',
      lat: 37.3947,
      lng: -122.0782,
      favorite: false,
      dismissed: false,
    };
    const metrics = computeListingMetrics(listing, DEFAULT_CORES, DEFAULT_ANCHORS, 0.75);
    expect(metrics?.nearestDowntownCoreId).toBe('downtown-mountain-view');
    expect(metrics?.insideWalkZoneIds).toContain('downtown-mountain-view');
  });
});
