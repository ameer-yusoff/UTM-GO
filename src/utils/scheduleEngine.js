import { FRIDAY_PRAYER_START, FRIDAY_PRAYER_END } from './constants';
import { interpolatePolyline } from './geoUtils';
import busUnitsData from '../data/bus_units.json';

export const DAYS_OF_WEEK = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

export function timeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const parts = timeStr.split(':');
  const h = parseInt(parts[0], 10) || 0;
  const m = parseInt(parts[1], 10) || 0;
  const s = parseInt(parts[2], 10) || 0;
  return h * 60 + m + (s / 60);
}

export function minutesToTime(totalMinutes) {
  const mins = Math.floor(totalMinutes);
  const h = Math.floor(mins / 60) % 24;
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function getCurrentDayName(dayOverride = null) {
  if (dayOverride) return dayOverride.toLowerCase();
  return DAYS_OF_WEEK[new Date().getDay()];
}

export function isDuringFridayPrayer(timeStr, dayName) {
  if (dayName?.toLowerCase() !== 'friday') return false;
  const mins = timeToMinutes(timeStr);
  const start = timeToMinutes(FRIDAY_PRAYER_START);
  const end = timeToMinutes(FRIDAY_PRAYER_END);
  return mins >= start && mins < end;
}

/**
 * Get dynamic offset between origin and target stop for a specific route & headsign
 */
export function getStopOffsetMinutes(routeName, headsign, stopIndex, routeDurations) {
  if (stopIndex <= 0) return 0;
  const key = `${routeName}_${headsign}`;
  const durData = routeDurations?.[key];

  if (!durData?.segments) {
    return stopIndex * 2.5; // default fallback ~2.5 mins per stop
  }

  let cumulativeSecs = 0;
  const maxIdx = Math.min(stopIndex, durData.segments.length);
  for (let i = 0; i < maxIdx; i++) {
    if (durData.segments[i]) {
      const segTime = durData.segments[i].drivingSecs || durData.segments[i].totalSecs || 60;
      cumulativeSecs += segTime + 20; // 20s dwell buffer at bus stop
    }
  }

  return Math.round(cumulativeSecs / 60);
}

/**
 * Get total route duration in minutes
 */
export function getRouteTotalDurationMinutes(routeName, headsign, routeDurations) {
  const key = `${routeName}_${headsign}`;
  const durData = routeDurations?.[key];
  if (durData?.allocatedMins) return durData.allocatedMins;
  if (durData?.totalTime) return Math.ceil(durData.totalTime / 60);
  return 20; // fallback 20 mins per trip
}

/**
 * Calculate upcoming bus arrivals for a specific stop
 */
export function getUpcomingBusesForStop(stopId, routes, routeDurations, currentTimeStr, dayName) {
  const currentMinutes = timeToMinutes(currentTimeStr);
  const upcoming = [];

  if (!routes) return upcoming;

  for (const route of routes) {
    // Find active service for the given day
    const activeService = route.services?.find(s => s.days?.map(d => d.toLowerCase()).includes(dayName.toLowerCase()));
    if (!activeService) continue;

    for (const trip of activeService.trips || []) {
      const stopIndex = trip.stops_sequence?.indexOf(stopId);
      if (stopIndex === -1) continue; // Stop not served in this trip

      const offsetMins = getStopOffsetMinutes(route.name, trip.headsign, stopIndex, routeDurations);

      for (const departureTime of trip.times || []) {
        const depMinutes = timeToMinutes(departureTime);
        const arrivalMinutes = depMinutes + offsetMins;

        // Skip if arrival falls during Friday prayer break
        if (dayName.toLowerCase() === 'friday') {
          const arrTimeStr = minutesToTime(arrivalMinutes);
          if (isDuringFridayPrayer(arrTimeStr, dayName)) continue;
        }

        const minutesUntil = Math.round(arrivalMinutes - currentMinutes);

        // Include buses arriving within the next 90 minutes (or just departed < 2 min ago)
        if (minutesUntil >= -2 && minutesUntil <= 90) {
          upcoming.push({
            routeId: route.name,
            routeName: route.name,
            headsign: trip.headsign,
            tripStartTime: departureTime,
            arrivalTime: minutesToTime(arrivalMinutes),
            minutesUntil: Math.max(0, minutesUntil),
            stopIndex,
            totalStops: trip.stops_sequence.length,
            isNext: false
          });
        }
      }
    }
  }

  // Sort by arrival time
  upcoming.sort((a, b) => a.minutesUntil - b.minutesUntil);

  if (upcoming.length > 0) {
    upcoming[0].isNext = true;
  }

  return upcoming;
}

/**
 * Calculate simulated real-time positions for all currently active buses on campus
 */
export function getActiveSimulatedBuses(routes, routeGeometries, routeDurations, stopsMap, currentTimeStr, dayName) {
  const currentMinutes = timeToMinutes(currentTimeStr);
  const activeBuses = [];

  if (!routes || !routeGeometries) return activeBuses;

  for (const route of routes) {
    const activeService = route.services?.find(s => s.days?.map(d => d.toLowerCase()).includes(dayName.toLowerCase()));
    if (!activeService) continue;

    for (const trip of activeService.trips || []) {
      const totalTripDurationMins = getRouteTotalDurationMinutes(route.name, trip.headsign, routeDurations);
      const geomKey = `${route.name} : ${trip.headsign}`;
      const geometry = routeGeometries[geomKey];
      const coords = geometry?.coordinates;

      if (!coords || coords.length === 0) continue;

      for (const departureTime of trip.times || []) {
        const depMinutes = timeToMinutes(departureTime);
        const elapsedMinutes = currentMinutes - depMinutes;

        // Check if bus is currently en route (elapsed >= 0 and elapsed <= totalTripDurationMins)
        if (elapsedMinutes >= 0 && elapsedMinutes < totalTripDurationMins) {
          // Check Friday prayer break
          if (dayName.toLowerCase() === 'friday') {
            const timeStr = minutesToTime(depMinutes);
            if (isDuringFridayPrayer(timeStr, dayName)) continue;
          }

          const progress = Math.min(1, Math.max(0, elapsedMinutes / totalTripDurationMins));
          const { lat, lon, bearing } = interpolatePolyline(coords, progress);

          // Find current / next stop
          let currentStopIndex = 0;
          let nextStopName = '';
          const seq = trip.stops_sequence || [];

          for (let i = 0; i < seq.length; i++) {
            const stopOffset = getStopOffsetMinutes(route.name, trip.headsign, i, routeDurations);
            if (elapsedMinutes >= stopOffset) {
              currentStopIndex = i;
            }
          }

          const nextStopId = seq[Math.min(currentStopIndex + 1, seq.length - 1)];
          nextStopName = stopsMap?.[nextStopId]?.name || nextStopId || 'Terminal';

          activeBuses.push({
            id: `${route.name}_${trip.headsign}_${departureTime}`,
            routeName: route.name,
            headsign: trip.headsign,
            departureTime,
            lat,
            lon,
            bearing,
            progress: Math.round(progress * 100),
            currentStopId: seq[currentStopIndex],
            currentStopName: stopsMap?.[seq[currentStopIndex]]?.name || seq[currentStopIndex],
            nextStopId,
            nextStopName,
            elapsedMinutes: Math.round(elapsedMinutes),
            totalTripDurationMins,
            etaRemainingMins: Math.max(1, Math.round(totalTripDurationMins - elapsedMinutes))
          });
        }
      }
    }
  }

  return activeBuses;
}

/**
 * Get Driver Shift metadata from bus_units.json
 */
export function getBusUnitsList() {
  return Object.values(busUnitsData);
}
