export interface Listing {
  id: string;
  address: string;
  lat: number | null;
  lng: number | null;
  price?: number | null;
  beds?: number | null;
  baths?: number | null;
  sqft?: number | null;
  lotSize?: number | null;
  yearBuilt?: number | null;
  hoa?: number | null;
  url?: string | null;
  favorite: boolean;
  dismissed: boolean;
  sourceRow?: number;
}

export interface Core {
  id: string;
  name: string;
  lat: number;
  lng: number;
  enabled: boolean;
}

export interface Anchor {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

export type WalkPreset = 10 | 15 | 20;

export interface AppSettings {
  walkPreset: WalkPreset;
  hideDismissed: boolean;
  favoritesOnly: boolean;
}

export interface ListingMetrics {
  listingId: string;
  nearestDowntownCoreId: string | null;
  distancesMiles: Record<string, number>;
  insideWalkZoneIds: string[];
}

export interface GeocodeResult {
  lat: number;
  lng: number;
  normalizedAddress?: string;
}

export interface Geocoder {
  geocode(address: string): Promise<GeocodeResult | null>;
}
