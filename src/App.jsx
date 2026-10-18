import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Header from './components/Header';
import MapView from './components/MapView';
import LiveBusTracker from './components/LiveBusTracker';
import ScheduleView from './components/ScheduleView';
import RoutePlanner from './components/RoutePlanner';
import BusStopsDrawer from './components/BusStopsDrawer';
import MobileNav from './components/MobileNav';
import DevSimulationPanel from './components/DevSimulationPanel';

import scheduleData from './data/schedule.json';
import campusLocationsData from './data/campus_locations.json';
import routeGeometriesData from './data/route_geometries.json';
import routeDurationsData from './data/route_durations.json';
import campusPolygonData from './data/campus_polygon.json';

import {
  getCurrentDayName,
  getActiveSimulatedBuses,
  getUpcomingBusesForStop,
  isDuringFridayPrayer
} from './utils/scheduleEngine';

export default function App() {
  // Navigation State ('map' | 'live' | 'planner' | 'schedule' | 'stops')
  const [activeTab, setActiveTab] = useState('map');

  // Time & Simulation State
  const [isDevMode, setIsDevMode] = useState(false);
  const [customTime, setCustomTime] = useState(null);
  const [customDay, setCustomDay] = useState(null);
  const [isDevPanelOpen, setIsDevPanelOpen] = useState(false);

  // Stop Selection & Filtering
  const [selectedStop, setSelectedStop] = useState(null);
  const [selectedRouteFilter, setSelectedRouteFilter] = useState(null);

  // Trip Planner Initial Points (when navigated from map place cards)
  const [plannerInitialOrigin, setPlannerInitialOrigin] = useState(null);
  const [plannerInitialDest, setPlannerInitialDest] = useState(null);

  // User Geolocation
  const [userLocation, setUserLocation] = useState(null);

  // Real-time Clock Ticker
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto detect user location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
            accuracy: pos.coords.accuracy
          });
        },
        () => {
          // Default fallback on campus (Centre Point UTM)
          setUserLocation({
            lat: 1.559728,
            lon: 103.634814,
            accuracy: 30
          });
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      setUserLocation({
        lat: 1.559728,
        lon: 103.634814,
        accuracy: 30
      });
    }
  }, []);

  // Effective Current Time and Day
  const currentTime = useMemo(() => {
    if (isDevMode && customTime) return customTime;
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  }, [now, isDevMode, customTime]);

  const currentDay = useMemo(() => {
    if (isDevMode && customDay) return customDay;
    return getCurrentDayName();
  }, [isDevMode, customDay]);

  // Stops and Routes Data
  const stopsList = scheduleData.stops || [];
  const routes = scheduleData.routes || [];
  const locations = campusLocationsData.locations || [];
  const routeGeometries = routeGeometriesData || {};
  const routeDurations = routeDurationsData || {};

  // Stop Map for O(1) Lookups
  const stopsMap = useMemo(() => {
    const map = {};
    stopsList.forEach(s => { map[s.id] = s; });
    return map;
  }, [stopsList]);

  // Simulated Active Buses
  const activeBuses = useMemo(() => {
    return getActiveSimulatedBuses(
      routes,
      routeGeometries,
      routeDurations,
      stopsMap,
      currentTime,
      currentDay
    );
  }, [routes, routeGeometries, routeDurations, stopsMap, currentTime, currentDay]);

  // Upcoming Buses by Stop ID
  const upcomingBusesByStop = useMemo(() => {
    const map = {};
    stopsList.forEach(stop => {
      map[stop.id] = getUpcomingBusesForStop(
        stop.id,
        routes,
        routeDurations,
        currentTime,
        currentDay
      );
    });
    return map;
  }, [stopsList, routes, routeDurations, currentTime, currentDay]);

  // Geolocation Handler
  const handleGetLocation = useCallback(() => {
    if (!navigator.geolocation) {
      alert('Your browser does not support GPS location services.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          accuracy: pos.coords.accuracy
        });
      },
      (err) => {
        console.warn('Geolocation error:', err.message);
        setUserLocation({
          lat: 1.559728,
          lon: 103.634814,
          accuracy: 50
        });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  // Time Travel Controls
  const handleSetCustomTime = (timeStr) => {
    setIsDevMode(true);
    setCustomTime(timeStr);
  };

  const handleSetCustomDay = (dayStr) => {
    setIsDevMode(true);
    setCustomDay(dayStr);
  };

  const handleResetToRealTime = () => {
    setIsDevMode(false);
    setCustomTime(null);
    setCustomDay(null);
  };

  // Google Maps Style Navigation Handlers
  const handlePlanTripTo = (place) => {
    setPlannerInitialDest(place);
    setActiveTab('planner');
  };

  const handlePlanTripFrom = (place) => {
    setPlannerInitialOrigin(place);
    setActiveTab('planner');
  };

  const isFridayBreak = isDuringFridayPrayer(currentTime, currentDay);

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-50 text-slate-900 overflow-hidden select-none font-sans">
      
      {/* Top Header */}
      <Header
        currentTime={currentTime}
        currentDay={currentDay}
        activeBusCount={activeBuses.length}
        onOpenSchedule={() => setActiveTab('schedule')}
        onOpenPlanner={() => setActiveTab('planner')}
        onOpenDevPanel={() => setIsDevPanelOpen(true)}
        isDevMode={isDevMode}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main App Body */}
      <div className="flex-1 relative flex overflow-hidden">
        
        {/* DESKTOP SIDEBAR (Visible on lg screens when in map mode or standalone tab) */}
        <div className="hidden lg:flex w-96 flex-shrink-0 flex-col h-full border-r border-slate-200 bg-white z-20 shadow-xs">
          <LiveBusTracker
            activeBuses={activeBuses}
            onFocusBus={(bus) => {
              setSelectedRouteFilter(bus.routeName);
            }}
            onOpenSchedule={() => setActiveTab('schedule')}
            isFridayBreak={isFridayBreak}
          />
        </div>

        {/* MAP VIEW CONTAINER */}
        <div className="flex-1 relative h-full w-full">
          
          {/* Always Render Map underneath */}
          <MapView
            stopsList={stopsList}
            stopsMap={stopsMap}
            locations={locations}
            routes={routes}
            routeGeometries={routeGeometries}
            activeBuses={activeBuses}
            selectedStop={selectedStop}
            onSelectStop={(stop) => {
              setSelectedStop(stop);
            }}
            userLocation={userLocation}
            onGetLocation={handleGetLocation}
            upcomingBusesByStop={upcomingBusesByStop}
            selectedRouteFilter={selectedRouteFilter}
            onSelectRouteFilter={setSelectedRouteFilter}
            campusPolygon={campusPolygonData}
            onPlanTripTo={handlePlanTripTo}
            onPlanTripFrom={handlePlanTripFrom}
          />

          {/* OVERLAY VIEWS FOR MOBILE OR FULLSCREEN TABS */}
          {activeTab === 'live' && (
            <div className="lg:hidden absolute inset-0 z-30 bg-white animate-in fade-in duration-200">
              <LiveBusTracker
                activeBuses={activeBuses}
                onFocusBus={(bus) => {
                  setSelectedRouteFilter(bus.routeName);
                  setActiveTab('map');
                }}
                onOpenSchedule={() => setActiveTab('schedule')}
                isFridayBreak={isFridayBreak}
              />
            </div>
          )}

          {activeTab === 'planner' && (
            <div className="absolute inset-0 z-30 bg-slate-50 animate-in fade-in duration-200">
              <RoutePlanner
                locations={locations}
                stopsList={stopsList}
                routes={routes}
                routeDurations={routeDurations}
                currentTime={currentTime}
                currentDay={currentDay}
                userLocation={userLocation}
                initialOrigin={plannerInitialOrigin}
                initialDest={plannerInitialDest}
                onSelectRouteOnMap={(rName) => {
                  setSelectedRouteFilter(rName);
                  setActiveTab('map');
                }}
              />
            </div>
          )}

          {activeTab === 'schedule' && (
            <div className="absolute inset-0 z-30 bg-slate-50 animate-in fade-in duration-200">
              <ScheduleView
                routes={routes}
                currentTime={currentTime}
                currentDay={currentDay}
                onSelectRouteOnMap={(rName) => {
                  setSelectedRouteFilter(rName);
                  setActiveTab('map');
                }}
              />
            </div>
          )}

          {activeTab === 'stops' && (
            <div className="absolute inset-0 z-30 bg-slate-50 animate-in fade-in duration-200">
              <BusStopsDrawer
                stopsList={stopsList}
                selectedStop={selectedStop}
                onSelectStop={(stop) => {
                  setSelectedStop(stop);
                }}
                upcomingBusesByStop={upcomingBusesByStop}
                routes={routes}
                onViewOnMap={(stop) => {
                  setSelectedStop(stop);
                  setActiveTab('map');
                }}
              />
            </div>
          )}

        </div>

      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeBusCount={activeBuses.length}
      />

      {/* Dev Simulation & Time Travel Modal */}
      <DevSimulationPanel
        isOpen={isDevPanelOpen}
        onClose={() => setIsDevPanelOpen(false)}
        currentTime={currentTime}
        currentDay={currentDay}
        isDevMode={isDevMode}
        onSetTime={handleSetCustomTime}
        onSetDay={handleSetCustomDay}
        onResetToRealTime={handleResetToRealTime}
      />

    </div>
  );
}
