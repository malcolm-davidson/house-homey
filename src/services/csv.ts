import Papa from 'papaparse';
import type { Listing } from '../domain/types';
import { listingId } from '../utils/ids';

const maybeNumber = (value: unknown): number | null => {
  if (value === undefined || value === null || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const keyMap: Record<string, keyof Listing | 'lot_size' | 'year_built'> = {
  address: 'address',
  price: 'price',
  beds: 'beds',
  baths: 'baths',
  sqft: 'sqft',
  lot_size: 'lot_size',
  year_built: 'year_built',
  hoa: 'hoa',
  url: 'url',
  lat: 'lat',
  lng: 'lng',
};

export interface ParseResult {
  listings: Listing[];
  warnings: string[];
}

export function parseListingCsv(input: string): ParseResult {
  const parsed = Papa.parse<Record<string, string>>(input, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim().toLowerCase(),
  });

  const warnings: string[] = [];
  const listings: Listing[] = [];

  parsed.data.forEach((row, index) => {
    const normalized: Record<string, string> = {};
    for (const [k, v] of Object.entries(row)) {
      const key = keyMap[k] ? k : k.trim().toLowerCase();
      normalized[key] = (v ?? '').trim();
    }
    const address = normalized.address;
    if (!address) {
      warnings.push(`Row ${index + 2}: missing address`);
      return;
    }

    const lat = maybeNumber(normalized.lat);
    const lng = maybeNumber(normalized.lng);
    if ((lat === null) !== (lng === null)) {
      warnings.push(`Row ${index + 2}: lat/lng must both be present, got partial`);
    }

    listings.push({
      id: listingId(address, index + 2),
      address,
      lat,
      lng,
      price: maybeNumber(normalized.price),
      beds: maybeNumber(normalized.beds),
      baths: maybeNumber(normalized.baths),
      sqft: maybeNumber(normalized.sqft),
      lotSize: maybeNumber(normalized.lot_size),
      yearBuilt: maybeNumber(normalized.year_built),
      hoa: maybeNumber(normalized.hoa),
      url: normalized.url || null,
      favorite: false,
      dismissed: false,
      sourceRow: index + 2,
    });
  });

  return { listings, warnings };
}

export function parsePastedInput(input: string): ParseResult {
  const trimmed = input.trim();
  if (!trimmed) return { listings: [], warnings: [] };
  const firstLine = trimmed.split('\n')[0]?.toLowerCase() ?? '';
  if (firstLine.includes(',') || firstLine.includes('address')) {
    return parseListingCsv(trimmed);
  }

  const rows = trimmed
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const listings = rows.map((address, i) => ({
    id: listingId(address, i + 1),
    address,
    lat: null,
    lng: null,
    favorite: false,
    dismissed: false,
    sourceRow: i + 1,
  }));

  return { listings, warnings: [] };
}
