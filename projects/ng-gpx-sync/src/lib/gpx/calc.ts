
const EARTH_RADIUS_IN_METERS = 6371000;

export function toRad(value: number): number {
  return value * Math.PI / 180;
};

export function calcDistance(lon1: number, lat1: number, lon2: number, lat2: number): number {
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const startLat = toRad(lat1);
  const endLat = toRad(lat2);

  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(startLat) * Math.cos(endLat);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_IN_METERS * c;
};

export function calcPace(dt: number, dx: number): number {
  return (dt / 60.0) * (1.0 / dx) * 1000.0
}
