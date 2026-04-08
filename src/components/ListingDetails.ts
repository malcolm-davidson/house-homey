import type { Anchor, Core, Listing, ListingMetrics } from '../domain/types';

const fmt = (n: number | null | undefined): string => (typeof n === 'number' ? n.toFixed(1) : '—');

export function renderListingDetails(
  container: HTMLElement,
  listing: Listing | null,
  metrics: ListingMetrics | null,
  cores: Core[],
  anchors: Anchor[],
): void {
  if (!listing) {
    container.innerHTML = '<h3>Listing Details</h3><p>Select a listing marker.</p>';
    return;
  }

  const coreRows = cores
    .map((core) => `<li>${core.name}: ${fmt(metrics?.distancesMiles[core.id])} mi</li>`)
    .join('');
  const anchorRows = anchors
    .map((anchor) => `<li>${anchor.name}: ${fmt(metrics?.distancesMiles[anchor.id])} mi</li>`)
    .join('');

  container.innerHTML = `
    <h3>Listing Details</h3>
    <p><strong>${listing.address}</strong></p>
    <p>Price: ${listing.price ? `$${listing.price.toLocaleString()}` : '—'} · Beds/Baths: ${listing.beds ?? '—'}/${listing.baths ?? '—'} · Sqft: ${listing.sqft ?? '—'}</p>
    <p>Nearest downtown: ${metrics?.nearestDowntownCoreId ?? '—'}</p>
    <p>Inside walk zones: ${metrics?.insideWalkZoneIds.join(', ') || 'None'}</p>
    <h4>Downtown distances</h4>
    <ul>${coreRows}</ul>
    <h4>Anchor distances</h4>
    <ul>${anchorRows}</ul>
    ${listing.url ? `<p><a href="${listing.url}" target="_blank" rel="noreferrer">Listing URL</a></p>` : ''}
  `;
}
