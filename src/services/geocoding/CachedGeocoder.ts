import type { Geocoder, GeocodeResult } from '../../domain/types';
import { normalizeAddress } from '../../utils/strings';

export class CachedGeocoder implements Geocoder {
  constructor(
    private readonly delegate: Geocoder,
    private readonly readCache: () => Record<string, GeocodeResult>,
    private readonly writeCache: (cache: Record<string, GeocodeResult>) => void,
  ) {}

  async geocode(address: string): Promise<GeocodeResult | null> {
    const key = normalizeAddress(address);
    const cache = this.readCache();
    if (cache[key]) return cache[key];

    const result = await this.delegate.geocode(address);
    if (result) {
      cache[key] = result;
      this.writeCache(cache);
    }
    return result;
  }
}
