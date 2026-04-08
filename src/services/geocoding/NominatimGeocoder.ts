import type { Geocoder, GeocodeResult } from '../../domain/types';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class NominatimGeocoder implements Geocoder {
  async geocode(address: string): Promise<GeocodeResult | null> {
    await sleep(500);
    const url = new URL('https://nominatim.openstreetmap.org/search');
    url.searchParams.set('q', address);
    url.searchParams.set('format', 'jsonv2');
    url.searchParams.set('limit', '1');

    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as Array<{ lat: string; lon: string; display_name?: string }>;
    const first = payload[0];
    if (!first) return null;
    const lat = Number(first.lat);
    const lng = Number(first.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    return {
      lat,
      lng,
      normalizedAddress: first.display_name,
    };
  }
}
