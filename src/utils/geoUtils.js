/**
 * Distance in meters between two lat/lon points using Haversine formula
 */
export function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Radius of Earth in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Format distance to human readable string (e.g. "350 m" or "1.2 km")
 */
export function formatDistance(meters) {
  if (!meters && meters !== 0) return '';
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

/**
 * Find nearest bus stop to given coordinates
 */
export function findNearestStop(lat, lon, stopsList) {
  if (!stopsList || stopsList.length === 0) return null;
  let nearest = null;
  let minDistance = Infinity;

  for (const stop of stopsList) {
    const d = getDistance(lat, lon, stop.lat, stop.lon);
    if (d < minDistance) {
      minDistance = d;
      nearest = { stop, distance: d };
    }
  }

  return nearest;
}

/**
 * Calculate bearing angle between two coordinates in degrees [0..360]
 */
export function getBearing(lat1, lon1, lat2, lon2) {
  const y = Math.sin((lon2 - lon1) * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180);
  const x = Math.cos(lat1 * Math.PI / 180) * Math.sin(lat2 * Math.PI / 180) -
    Math.sin(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.cos((lon2 - lon1) * Math.PI / 180);
  const theta = Math.atan2(y, x);
  return (theta * 180 / Math.PI + 360) % 360;
}

/**
 * Interpolate a position and bearing along a GeoJSON coordinates array [[lon, lat], ...]
 * @param {Array<[number, number]>} coords - [[lon, lat], ...]
 * @param {number} progress - value between 0 and 1
 * @returns {{ lat: number, lon: number, bearing: number }}
 */
export function interpolatePolyline(coords, progress) {
  if (!coords || coords.length === 0) return { lat: 1.56, lon: 103.638, bearing: 0 };
  if (coords.length === 1 || progress <= 0) {
    return { lat: coords[0][1], lon: coords[0][0], bearing: 0 };
  }
  if (progress >= 1) {
    const last = coords[coords.length - 1];
    const prev = coords[coords.length - 2];
    const b = getBearing(prev[1], prev[0], last[1], last[0]);
    return { lat: last[1], lon: last[0], bearing: b };
  }

  // 1. Calculate cumulative segment lengths
  const segLengths = [];
  let totalLength = 0;
  for (let i = 0; i < coords.length - 1; i++) {
    const d = getDistance(coords[i][1], coords[i][0], coords[i + 1][1], coords[i + 1][0]);
    segLengths.push(d);
    totalLength += d;
  }

  if (totalLength === 0) {
    return { lat: coords[0][1], lon: coords[0][0], bearing: 0 };
  }

  // 2. Find target distance
  const targetDist = progress * totalLength;
  let accumulated = 0;

  for (let i = 0; i < segLengths.length; i++) {
    const len = segLengths[i];
    if (accumulated + len >= targetDist) {
      const segProgress = (targetDist - accumulated) / (len || 1);
      const p1 = coords[i];
      const p2 = coords[i + 1];
      const lat = p1[1] + (p2[1] - p1[1]) * segProgress;
      const lon = p1[0] + (p2[0] - p1[0]) * segProgress;
      const bearing = getBearing(p1[1], p1[0], p2[1], p2[0]);
      return { lat, lon, bearing };
    }
    accumulated += len;
  }

  const last = coords[coords.length - 1];
  return { lat: last[1], lon: last[0], bearing: 0 };
}
