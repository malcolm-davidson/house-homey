import type { Anchor, Core, Listing, ListingMetrics } from './types';
import { isInsideRadiusMiles, haversineMiles } from '../utils/distance';

export function computeListingMetrics(
  listing: Listing,
  cores: Core[],
  anchors: Anchor[],
  walkRadiusMiles: number,
): ListingMetrics | null {
  if (listing.lat === null || listing.lng === null) {
    return null;
  }
  const point = { lat: listing.lat, lng: listing.lng };
  const enabledCores = cores.filter((core) => core.enabled);
  const distancesMiles: Record<string, number> = {};

  for (const core of cores) {
    distancesMiles[core.id] = haversineMiles(point, core);
  }
  for (const anchor of anchors) {
    distancesMiles[anchor.id] = haversineMiles(point, anchor);
  }

  let nearestDowntownCoreId: string | null = null;
  let nearestDistance = Number.POSITIVE_INFINITY;
  for (const core of enabledCores) {
    const d = distancesMiles[core.id];
    if (d < nearestDistance) {
      nearestDistance = d;
      nearestDowntownCoreId = core.id;
    }
  }

  const insideWalkZoneIds = enabledCores
    .filter((core) => isInsideRadiusMiles(point, core, walkRadiusMiles))
    .map((core) => core.id);

  return {
    listingId: listing.id,
    nearestDowntownCoreId,
    distancesMiles,
    insideWalkZoneIds,
  };
}
