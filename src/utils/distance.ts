const EARTH_RADIUS_MILES = 3958.8;

const toRadians = (deg: number): number => (deg * Math.PI) / 180;

export function haversineMiles(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);

  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);

  const h = sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLng * sinLng;
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return EARTH_RADIUS_MILES * c;
}

export function isInsideRadiusMiles(
  point: { lat: number; lng: number },
  center: { lat: number; lng: number },
  radiusMiles: number,
): boolean {
  return haversineMiles(point, center) <= radiusMiles;
}
