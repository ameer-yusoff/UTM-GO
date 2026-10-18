import { getDistance, findNearestStop } from './geoUtils';
import { timeToMinutes, minutesToTime, getStopOffsetMinutes, isDuringFridayPrayer } from './scheduleEngine';

const WALKING_SPEED_M_PER_MIN = 75; // Average walking speed ~4.5 km/h = 75 meters/min

/**
 * Smart Journey Planner for UTM Campus
 */
export function planJourney({
  origin,
  destination,
  stopsList,
  routes,
  routeDurations,
  currentTimeStr,
  dayName
}) {
  if (!origin || !destination || !stopsList || !routes) {
    return null;
  }

  const currentMinutes = timeToMinutes(currentTimeStr);
  const directWalkDist = getDistance(origin.lat, origin.lon, destination.lat, destination.lon);
  const directWalkMins = Math.ceil(directWalkDist / WALKING_SPEED_M_PER_MIN);

  const results = [];

  // Option 1: Walk only
  results.push({
    type: 'WALK_ONLY',
    title: 'Direct Walking',
    badge: 'Walking / Direct',
    totalDurationMins: directWalkMins,
    totalDistanceMeters: directWalkDist,
    departureTime: currentTimeStr,
    arrivalTime: minutesToTime(currentMinutes + directWalkMins),
    steps: [
      {
        type: 'walk',
        title: `Walk from ${origin.name} to ${destination.name}`,
        distance: directWalkDist,
        durationMins: directWalkMins,
        instructions: `Walk directly ~${Math.round(directWalkDist)} meters to your destination.`
      }
    ]
  });

  // Find nearest stop to Origin and Destination
  const nearestOrigin = findNearestStop(origin.lat, origin.lon, stopsList);
  const nearestDest = findNearestStop(destination.lat, destination.lon, stopsList);

  if (!nearestOrigin || !nearestDest) {
    return { results, bestOption: results[0] };
  }

  const walkToOriginStopDist = nearestOrigin.distance;
  const walkToOriginStopMins = Math.ceil(walkToOriginStopDist / WALKING_SPEED_M_PER_MIN);

  const walkFromDestStopDist = nearestDest.distance;
  const walkFromDestStopMins = Math.ceil(walkFromDestStopDist / WALKING_SPEED_M_PER_MIN);

  // Stop IDs
  const origStopId = nearestOrigin.stop.id;
  const destStopId = nearestDest.stop.id;

  // Search for Direct Bus Routes
  for (const route of routes) {
    const activeService = route.services?.find(s => s.days?.map(d => d.toLowerCase()).includes(dayName.toLowerCase()));
    if (!activeService) continue;

    for (const trip of activeService.trips || []) {
      const origIndex = trip.stops_sequence?.indexOf(origStopId);
      const destIndex = trip.stops_sequence?.indexOf(destStopId);

      // Direct route exists if both stops are in trip and origin stop comes before destination stop
      if (origIndex !== -1 && destIndex !== -1 && origIndex < destIndex) {
        const origOffset = getStopOffsetMinutes(route.name, trip.headsign, origIndex, routeDurations);
        const destOffset = getStopOffsetMinutes(route.name, trip.headsign, destIndex, routeDurations);
        const busRideMins = Math.max(2, destOffset - origOffset);

        // Find next valid departure that the user can catch after walking to origin stop
        const earlistBoardingMins = currentMinutes + walkToOriginStopMins;

        for (const depTime of trip.times || []) {
          const tripStartMins = timeToMinutes(depTime);
          const busArrivalAtOrigMins = tripStartMins + origOffset;

          if (dayName.toLowerCase() === 'friday') {
            if (isDuringFridayPrayer(minutesToTime(busArrivalAtOrigMins), dayName)) continue;
          }

          if (busArrivalAtOrigMins >= earlistBoardingMins) {
            const waitTimeMins = Math.round(busArrivalAtOrigMins - earlistBoardingMins);
            const busArrivalAtDestMins = tripStartMins + destOffset;
            const finalArrivalMins = busArrivalAtDestMins + walkFromDestStopMins;
            const totalJourneyMins = Math.round(finalArrivalMins - currentMinutes);

            results.push({
              type: 'DIRECT_BUS',
              title: `${route.name} (${trip.headsign})`,
              badge: 'Direct Shuttle',
              routeName: route.name,
              headsign: trip.headsign,
              totalDurationMins: totalJourneyMins,
              totalDistanceMeters: walkToOriginStopDist + walkFromDestStopDist + (busRideMins * 400),
              departureTime: currentTimeStr,
              arrivalTime: minutesToTime(finalArrivalMins),
              busBoardingTime: minutesToTime(busArrivalAtOrigMins),
              busAlightingTime: minutesToTime(busArrivalAtDestMins),
              waitTimeMins,
              steps: [
                {
                  type: 'walk',
                  title: `Walk to ${nearestOrigin.stop.name} Stop`,
                  durationMins: walkToOriginStopMins,
                  distance: walkToOriginStopDist,
                  instructions: `Walk ${Math.round(walkToOriginStopDist)}m (~${walkToOriginStopMins} min) to ${nearestOrigin.stop.name} bus stop.`
                },
                {
                  type: 'wait',
                  title: `Wait for ${route.name}`,
                  durationMins: waitTimeMins,
                  instructions: `Shuttle is scheduled to arrive at ${minutesToTime(busArrivalAtOrigMins)} (wait ~${waitTimeMins} min).`
                },
                {
                  type: 'bus',
                  title: `Board ${route.name} (${trip.headsign})`,
                  durationMins: busRideMins,
                  routeName: route.name,
                  headsign: trip.headsign,
                  boardStop: nearestOrigin.stop.name,
                  alightStop: nearestDest.stop.name,
                  passedStopsCount: destIndex - origIndex,
                  instructions: `Ride ${route.name} from ${nearestOrigin.stop.name} to ${nearestDest.stop.name} (~${busRideMins} min, ${destIndex - origIndex} stops).`
                },
                {
                  type: 'walk',
                  title: `Walk to ${destination.name}`,
                  durationMins: walkFromDestStopMins,
                  distance: walkFromDestStopDist,
                  instructions: `Walk ${Math.round(walkFromDestStopDist)}m (~${walkFromDestStopMins} min) to final destination.`
                }
              ]
            });

            // Found next bus for this route pattern, break to avoid duplicating same route multiple times
            break;
          }
        }
      }
    }
  }

  // Sort results by total duration
  results.sort((a, b) => a.totalDurationMins - b.totalDurationMins);

  return {
    origin,
    destination,
    nearestOriginStop: nearestOrigin.stop,
    nearestDestStop: nearestDest.stop,
    results,
    bestOption: results[0] || null
  };
}
