import React, { useEffect, useState, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Polygon, useMap, useMapEvents, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ROUTE_CONFIG, LOCATION_CATEGORIES, UTM_CENTER } from '../utils/constants';
import { findNearestStop, formatDistance, getDistance } from '../utils/geoUtils';
import {
  Bus,
  MapPin,
  Navigation,
  Clock,
  Compass,
  Layers,
  Check,
  Sparkles,
  AlertCircle,
  Footprints,
  Search,
  X,
  ArrowRight,
  ChevronRight,
  Info,
  GraduationCap,
  Home,
  BookOpen,
  Utensils,
  Building2,
  Activity
} from 'lucide-react';

// Fix default leaflet marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Category Icons Mapping
const CATEGORY_ICON_MAP = {
  faculty: GraduationCap,
  academic: GraduationCap,
  hostel: Home,
  residential: Home,
  library: BookOpen,
  food: Utensils,
  dining: Utensils,
  admin: Building2,
  administrative: Building2,
  facility: Activity,
  sports: Activity,
  bus_stop: Bus,
  transit: Bus
};

// 1. Bus Stop Marker Icon: White Bus Symbol inside a Blue Circle
function createBusStopDivIcon(stop, isSelected, isNextStation) {
  const size = isSelected ? 32 : isNextStation ? 30 : 26;

  const html = `
    <div class="relative flex items-center justify-center cursor-pointer transition-transform duration-200">
      ${
        isNextStation
          ? `<div class="absolute -inset-2.5 rounded-full bg-blue-500/30 radar-station-pulse"></div>
             <div class="absolute -top-3.5 px-1.5 py-0.2 rounded-full bg-blue-600 text-white text-[9px] font-black tracking-wider uppercase shadow-md border border-white/80">NEXT</div>`
          : ''
      }
      <div class="relative flex items-center justify-center rounded-full bg-blue-600 text-white border-2 ${
        isSelected
          ? 'border-amber-400 ring-4 ring-amber-400/40 scale-125 shadow-xl'
          : isNextStation
          ? 'border-white shadow-lg shadow-blue-500/60 ring-2 ring-blue-400'
          : 'border-white shadow-md shadow-blue-900/40 hover:scale-110 hover:bg-blue-500'
      }" style="width: ${size}px; height: ${size}px;">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 6 4 17"/>
          <path d="M4 17 C4 18.1 4.9 19 6 19 L6 20 C6 20.6 6.4 21 7 21 L7.5 21 C8.1 21 8.5 20.6 8.5 20 L8.5 19 L15.5 19 L15.5 20 C15.5 20.6 15.9 21 16.5 21 L17 21 C17.6 21 18 20.6 18 20 L18 19 C19.1 19 20 18.1 20 17 L20 6 C20 4.3 18.7 3 17 3 L7 3 C5.3 3 4 4.3 4 6 Z"/>
          <path d="M4 10 L20 10"/>
          <circle cx="7.5" cy="14.5" r="1.5" fill="currentColor"/>
          <circle cx="16.5" cy="14.5" r="1.5" fill="currentColor"/>
        </svg>
      </div>
    </div>
  `;

  return L.divIcon({
    className: 'custom-bus-stop-icon',
    html,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2]
  });
}

// 2. Selected Place / Dropped Pin Marker Icon (Google Maps Style Pin)
function createPlacePinIcon(color = '#EA4335') {
  const html = `
    <div class="relative flex flex-col items-center group cursor-pointer transform -translate-y-full animate-bounce">
      <div class="w-8 h-8 rounded-full flex items-center justify-center text-white shadow-xl border-2 border-white" style="background-color: ${color};">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
      </div>
      <div class="w-2 h-2 rounded-full bg-slate-900/60 blur-xs mt-0.5"></div>
    </div>
  `;

  return L.divIcon({
    className: 'custom-place-pin',
    html,
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -40]
  });
}

// 3. Animated Moving Shuttle Bus Marker Icon
function createBusDivIcon(bus) {
  const routeConf = ROUTE_CONFIG[bus.routeName] || { color: '#2563eb', border: '#1d4ed8' };
  const rotation = bus.bearing || 0;

  const html = `
    <div class="relative flex flex-col items-center group cursor-pointer transition-transform duration-300">
      <!-- Route Badge -->
      <div class="px-2 py-0.5 mb-1 rounded-full text-[10px] font-bold shadow-md border whitespace-nowrap bg-white text-slate-900 border-slate-200 flex items-center gap-1">
        <span class="w-2 h-2 rounded-full inline-block animate-pulse" style="background-color: ${routeConf.color}"></span>
        <span>${bus.routeName}</span>
      </div>

      <!-- Bus Circle Icon with Bearing Arrow -->
      <div class="relative flex items-center justify-center w-8 h-8 rounded-full shadow-lg border-2 border-white transition-all transform hover:scale-110" style="background: ${routeConf.color}; box-shadow: 0 4px 12px ${routeConf.color}55;">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-white" style="transform: rotate(${rotation}deg);">
          <path d="m12 19-7-7 7-7"/>
          <path d="M19 12H5"/>
        </svg>
      </div>

      <!-- Live Radar Ping Indicator -->
      <div class="absolute -bottom-1 w-3 h-3 rounded-full bg-emerald-500 opacity-75 animate-ping"></div>
    </div>
  `;

  return L.divIcon({
    className: 'custom-bus-marker',
    html,
    iconSize: [80, 56],
    iconAnchor: [40, 48],
    popupAnchor: [0, -48]
  });
}

// 4. User Walking Distance Badge Icon on Mid-line
function createWalkingBadgeIcon(distanceMeters, stopName) {
  const walkMins = Math.ceil(distanceMeters / 75);
  const distText = formatDistance(distanceMeters);

  const html = `
    <div class="px-2.5 py-1 rounded-xl bg-white border border-blue-200 shadow-md text-slate-800 text-[11px] font-semibold flex items-center gap-1.5 whitespace-nowrap backdrop-blur-md transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
      <span class="p-0.5 rounded-full bg-blue-50 text-blue-600 font-bold">🚶</span>
      <span class="text-blue-600 font-mono font-bold">${distText}</span>
      <span class="text-slate-500">(~${walkMins} min)</span>
      <span class="text-slate-700">to ${stopName}</span>
    </div>
  `;

  return L.divIcon({
    className: 'walking-mid-badge',
    html,
    iconSize: [170, 28],
    iconAnchor: [85, 14]
  });
}

// Map Controller for Smooth FlyTo & Map Events
function MapInteractionHandler({ selectedTarget, onMapClick }) {
  const map = useMap();

  useMapEvents({
    click(e) {
      if (onMapClick) {
        onMapClick({ lat: e.latlng.lat, lon: e.latlng.lng });
      }
    }
  });

  useEffect(() => {
    if (selectedTarget && selectedTarget.lat && selectedTarget.lon) {
      map.flyTo([selectedTarget.lat, selectedTarget.lon], 17, { duration: 0.8 });
    }
  }, [selectedTarget, map]);

  return null;
}

// Memoized Route Polylines to completely prevent rendering lag during map dragging
const RoutePolylines = React.memo(function RoutePolylines({
  preParsedGeometries,
  visibleRoutes,
  selectedRouteFilter,
  activeRouteNames
}) {
  return (
    <>
      {preParsedGeometries.map(({ key, routeName, positions }) => {
        const routeConf = ROUTE_CONFIG[routeName] || { color: '#94a3b8' };

        // Visibility Filter
        if (!visibleRoutes[routeName]) return null;
        if (selectedRouteFilter && selectedRouteFilter !== routeName) return null;

        const isFiltered = selectedRouteFilter === routeName;
        const isRouteActive = activeRouteNames.has(routeName);

        // Active = Vibrant color & solid; Inactive = Grey, dashed, semi-transparent
        const polyColor = isRouteActive ? routeConf.color : '#94a3b8';
        const polyWeight = isFiltered ? 6 : isRouteActive ? 4 : 2;
        const polyOpacity = isFiltered ? 1.0 : isRouteActive ? 0.85 : 0.35;
        const polyDashArray = isRouteActive ? null : '6, 8';

        return (
          <Polyline
            key={key}
            positions={positions}
            pathOptions={{
              color: polyColor,
              weight: polyWeight,
              opacity: polyOpacity,
              dashArray: polyDashArray,
              lineCap: 'round',
              lineJoin: 'round'
            }}
          >
            <Popup>
              <div className="p-2.5 max-w-xs text-slate-800">
                <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-1.5 mb-1.5">
                  <span className="font-bold text-sm text-slate-900">{key}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isRouteActive
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}>
                    {isRouteActive ? '🟢 ACTIVE' : '⚪ INACTIVE'}
                  </span>
                </div>
                <div className="text-xs text-slate-600 leading-relaxed">
                  {isRouteActive ? (
                    <span className="text-emerald-700 font-medium">
                      Buses are currently operating on this route.
                    </span>
                  ) : (
                    <span className="text-slate-500">
                      Route shown in grey because no shuttles are scheduled at this time.
                    </span>
                  )}
                </div>
              </div>
            </Popup>
          </Polyline>
        );
      })}
    </>
  );
});

export default function MapView({
  stopsList,
  stopsMap,
  locations = [],
  routes,
  routeGeometries,
  activeBuses,
  selectedStop,
  onSelectStop,
  userLocation,
  onGetLocation,
  upcomingBusesByStop,
  selectedRouteFilter,
  onSelectRouteFilter,
  campusPolygon,
  onPlanTripFrom,
  onPlanTripTo
}) {
  const [visibleRoutes, setVisibleRoutes] = useState(() => {
    const all = {};
    Object.keys(ROUTE_CONFIG).forEach(k => { all[k] = true; });
    return all;
  });

  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null); // Selected POI or clicked point

  const searchInputRef = useRef(null);

  // Pre-parse and memoize polyline positions ONCE
  const preParsedGeometries = useMemo(() => {
    if (!routeGeometries) return [];
    return Object.entries(routeGeometries).map(([key, geom]) => {
      const [routeName] = key.split(' : ');
      const positions = (geom.coordinates || []).map(c => [c[1], c[0]]);
      return { key, routeName, positions };
    });
  }, [routeGeometries]);

  // Active routes set
  const activeRouteNames = useMemo(() => {
    const set = new Set();
    (activeBuses || []).forEach(b => set.add(b.routeName));
    return set;
  }, [activeBuses]);

  // Set of Next Station Stop IDs across all active buses
  const nextStationIds = useMemo(() => {
    const set = new Set();
    (activeBuses || []).forEach(b => {
      if (b.nextStopId) set.add(b.nextStopId);
    });
    return set;
  }, [activeBuses]);

  // Find nearest bus stop to user's location
  const nearestStopInfo = useMemo(() => {
    if (!userLocation || !stopsList || stopsList.length === 0) return null;
    return findNearestStop(userLocation.lat, userLocation.lon, stopsList);
  }, [userLocation, stopsList]);

  // Midpoint coordinate between user and nearest stop for floating badge
  const walkingMidPoint = useMemo(() => {
    if (!userLocation || !nearestStopInfo?.stop) return null;
    return [
      (userLocation.lat + nearestStopInfo.stop.lat) / 2,
      (userLocation.lon + nearestStopInfo.stop.lon) / 2
    ];
  }, [userLocation, nearestStopInfo]);

  // All unified POIs (Locations + Bus Stops) for Google Maps-style instant search
  const allPOIs = useMemo(() => {
    const list = [];

    (stopsList || []).forEach(stop => {
      list.push({
        id: `stop_${stop.id}`,
        rawId: stop.id,
        name: stop.name,
        category: 'bus_stop',
        categoryLabel: 'Bus Stop',
        lat: stop.lat,
        lon: stop.lon,
        isBusStop: true,
        stopObj: stop
      });
    });

    (locations || []).forEach(loc => {
      let cat = loc.category || 'faculty';
      if (cat === 'academic' || cat === 'building') cat = 'faculty';
      if (cat === 'residential') cat = 'hostel';
      if (cat === 'dining') cat = 'food';
      if (cat === 'administrative') cat = 'admin';
      if (cat === 'sports') cat = 'facility';

      list.push({
        id: loc.id,
        rawId: loc.id,
        name: loc.name,
        category: cat,
        categoryLabel: LOCATION_CATEGORIES[cat]?.label || 'Facility',
        lat: loc.lat,
        lon: loc.lon,
        isBusStop: false,
        nearestStop: loc.nearestStop
      });
    });

    return list;
  }, [stopsList, locations]);

  // Filtered Search Results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim() && selectedCategory === 'all') return [];

    let filtered = allPOIs;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.rawId.toLowerCase().includes(q) ||
        p.categoryLabel.toLowerCase().includes(q)
      );
    }

    // Compute distance to user if available and sort
    if (userLocation) {
      filtered = filtered.map(p => ({
        ...p,
        distToUser: getDistance(userLocation.lat, userLocation.lon, p.lat, p.lon)
      })).sort((a, b) => a.distToUser - b.distToUser);
    }

    return filtered.slice(0, 15);
  }, [allPOIs, searchQuery, selectedCategory, userLocation]);

  // Handler for selecting a place from search or map
  const handleSelectPlace = (place) => {
    setSelectedPlace(place);
    setIsSearchFocused(false);
    setSearchQuery(place.name);

    if (place.isBusStop && place.stopObj) {
      onSelectStop(place.stopObj);
    }
  };

  // Handler for Map Clicks (Drop Pin anywhere)
  const handleMapClick = ({ lat, lon }) => {
    const nearestStop = findNearestStop(lat, lon, stopsList);
    const place = {
      id: `dropped_pin_${Date.now()}`,
      name: 'Dropped Pin',
      category: 'dropped_pin',
      categoryLabel: 'Custom Location',
      lat,
      lon,
      isDroppedPin: true,
      nearestStopObj: nearestStop?.stop,
      nearestStopDist: nearestStop?.distance
    };
    setSelectedPlace(place);
    setSearchQuery(`Pinned: ${lat.toFixed(5)}, ${lon.toFixed(5)}`);
  };

  const toggleRouteVisibility = (routeName) => {
    setVisibleRoutes(prev => ({
      ...prev,
      [routeName]: !prev[routeName]
    }));
  };

  const toggleAllRoutes = (enable) => {
    const updated = {};
    Object.keys(ROUTE_CONFIG).forEach(k => { updated[k] = enable; });
    setVisibleRoutes(updated);
  };

  // Nearest stop to the selected place
  const selectedPlaceNearestStop = useMemo(() => {
    if (!selectedPlace || selectedPlace.isBusStop) return null;
    return findNearestStop(selectedPlace.lat, selectedPlace.lon, stopsList);
  }, [selectedPlace, stopsList]);

  return (
    <div className="relative w-full h-full min-h-[400px] bg-slate-100 overflow-hidden font-sans">
      
      {/* ========================================================================= */}
      {/* FLOATING GOOGLE MAPS STYLE SEARCH BAR & CATEGORY EXPLORER */}
      {/* ========================================================================= */}
      <div className="absolute top-3 left-3 right-16 sm:right-auto sm:w-96 z-30 space-y-2 pointer-events-auto">
        {/* Search Bar Input Container */}
        <div className="relative rounded-2xl bg-white/95 backdrop-blur-md shadow-lg border border-slate-200/90 transition-all flex items-center px-3 py-2.5">
          <Search className="w-5 h-5 text-slate-400 flex-shrink-0 mr-2.5" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onFocus={() => setIsSearchFocused(true)}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchFocused(true);
            }}
            placeholder="Search UTM locations, faculties, cafes, stops..."
            className="w-full bg-transparent text-xs text-slate-900 placeholder-slate-400 focus:outline-none font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedPlace(null);
                setIsSearchFocused(false);
              }}
              className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Category Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: 'all', label: 'All' },
            { id: 'faculty', label: 'Faculties', icon: GraduationCap },
            { id: 'hostel', label: 'Colleges', icon: Home },
            { id: 'food', label: 'Dining', icon: Utensils },
            { id: 'library', label: 'Libraries', icon: BookOpen },
            { id: 'bus_stop', label: 'Bus Stops', icon: Bus }
          ].map(cat => {
            const isCatActive = selectedCategory === cat.id;
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  if (cat.id !== 'all') setIsSearchFocused(true);
                }}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-semibold whitespace-nowrap shadow-sm transition-all ${
                  isCatActive
                    ? 'bg-blue-600 text-white shadow-blue-500/20'
                    : 'bg-white/95 text-slate-700 hover:bg-slate-50 border border-slate-200/80'
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search Results Dropdown */}
        {isSearchFocused && searchResults.length > 0 && (
          <div className="rounded-2xl bg-white/95 border border-slate-200 shadow-2xl backdrop-blur-xl p-2 max-h-72 overflow-y-auto space-y-1 animate-in fade-in duration-150">
            <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Search Results ({searchResults.length})
            </div>
            {searchResults.map(item => {
              const Icon = CATEGORY_ICON_MAP[item.category] || MapPin;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectPlace(item)}
                  className="w-full flex items-center justify-between p-2 rounded-xl text-left hover:bg-slate-100/80 transition-colors group"
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <Icon className="w-4 h-4" />
                    </span>
                    <div className="truncate">
                      <div className="text-xs font-bold text-slate-800 truncate group-hover:text-blue-600">
                        {item.name}
                      </div>
                      <div className="text-[10px] text-slate-500 capitalize">
                        {item.categoryLabel}
                      </div>
                    </div>
                  </div>

                  {item.distToUser !== undefined && (
                    <span className="text-[11px] font-mono font-semibold text-slate-500 ml-2 whitespace-nowrap">
                      {formatDistance(item.distToUser)}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* LEAFLET MAP CONTAINER */}
      {/* ========================================================================= */}
      <MapContainer
        center={UTM_CENTER}
        zoom={15}
        minZoom={13}
        maxZoom={18}
        zoomControl={false}
        preferCanvas={false}
        className="w-full h-full"
      >
        {/* Open Public OpenStreetMap Tiles (No API key required) */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          subdomains={['a', 'b', 'c']}
          maxZoom={19}
        />

        <MapInteractionHandler
          selectedTarget={selectedPlace || selectedStop}
          onMapClick={handleMapClick}
        />

        {/* UTM Campus Boundary Polygon */}
        {campusPolygon?.geometry?.coordinates && (
          <Polygon
            positions={campusPolygon.geometry.coordinates[0].map(c => [c[1], c[0]])}
            pathOptions={{
              color: '#7B1113',
              weight: 2,
              fillColor: '#7B1113',
              fillOpacity: 0.04,
              dashArray: '6, 6'
            }}
          />
        )}

        {/* Memoized Route Polylines (Lag-free) */}
        <RoutePolylines
          preParsedGeometries={preParsedGeometries}
          visibleRoutes={visibleRoutes}
          selectedRouteFilter={selectedRouteFilter}
          activeRouteNames={activeRouteNames}
        />

        {/* Dashed Walking Guide Line from User to Nearest Bus Stop */}
        {userLocation && nearestStopInfo?.stop && (
          <>
            <Polyline
              positions={[
                [userLocation.lat, userLocation.lon],
                [nearestStopInfo.stop.lat, nearestStopInfo.stop.lon]
              ]}
              pathOptions={{
                color: '#2563eb', // Clean Blue
                weight: 3.5,
                dashArray: '6, 8',
                opacity: 0.85,
                className: 'walking-dashed-line'
              }}
            />

            {walkingMidPoint && (
              <Marker
                position={walkingMidPoint}
                icon={createWalkingBadgeIcon(nearestStopInfo.distance, nearestStopInfo.stop.name)}
                interactive={false}
              />
            )}
          </>
        )}

        {/* 57 Bus Stop Markers: White bus icon with blue circle & Next Station radar pulse */}
        {stopsList?.map(stop => {
          const isSelected = selectedStop?.id === stop.id || selectedPlace?.rawId === stop.id;
          const isNextStation = nextStationIds.has(stop.id);
          const upcoming = upcomingBusesByStop?.[stop.id] || [];

          return (
            <Marker
              key={stop.id}
              position={[stop.lat, stop.lon]}
              icon={createBusStopDivIcon(stop, isSelected, isNextStation)}
              eventHandlers={{
                click: () => {
                  onSelectStop(stop);
                  setSelectedPlace({
                    id: `stop_${stop.id}`,
                    rawId: stop.id,
                    name: stop.name,
                    category: 'bus_stop',
                    categoryLabel: 'Bus Stop',
                    lat: stop.lat,
                    lon: stop.lon,
                    isBusStop: true,
                    stopObj: stop
                  });
                }
              }}
            >
              <Popup>
                <div className="p-3 max-w-xs text-slate-800 font-sans">
                  <div className="flex items-start justify-between gap-2 border-b border-slate-200 pb-2 mb-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-mono font-bold text-blue-600">[{stop.id}]</span>
                        {isNextStation && (
                          <span className="px-1.5 py-0.2 rounded-md bg-blue-600 text-white text-[9px] font-black uppercase">
                            NEXT STATION
                          </span>
                        )}
                      </div>
                      <div className="text-sm font-bold text-slate-900 leading-snug mt-0.5">{stop.name}</div>
                    </div>
                    <span className="p-1.5 rounded-lg bg-blue-600 text-white shadow-sm">
                      <Bus className="w-4 h-4" />
                    </span>
                  </div>

                  {/* Next Buses Countdown */}
                  <div className="space-y-1.5 mb-3">
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Upcoming Shuttle Departures
                    </div>
                    {upcoming.length > 0 ? (
                      upcoming.slice(0, 3).map((bus, idx) => {
                        const rConf = ROUTE_CONFIG[bus.routeName] || { color: '#2563eb' };
                        return (
                          <div key={idx} className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50 text-xs border border-slate-200">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: rConf.color }}></span>
                              <span className="font-bold text-slate-800">{bus.routeName}</span>
                            </div>
                            <div className="text-right">
                              <span className="font-mono font-bold text-blue-600">
                                {bus.minutesUntil === 0 ? 'Arriving now' : `${bus.minutesUntil} min`}
                              </span>
                              <span className="text-[10px] text-slate-500 ml-1">({bus.arrivalTime})</span>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-xs text-slate-500 italic py-1">
                        No shuttles scheduled within 90 minutes.
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => onSelectStop(stop)}
                    className="w-full py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold text-center transition-colors shadow-sm"
                  >
                    View Stop Details
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Selected Dropped Pin or Non-Stop POI Pin */}
        {selectedPlace && !selectedPlace.isBusStop && (
          <Marker
            position={[selectedPlace.lat, selectedPlace.lon]}
            icon={createPlacePinIcon('#EA4335')}
          />
        )}

        {/* Live Active Animated Bus Markers */}
        {activeBuses?.map(bus => (
          <Marker
            key={bus.id}
            position={[bus.lat, bus.lon]}
            icon={createBusDivIcon(bus)}
          >
            <Popup>
              <div className="p-3 max-w-xs text-slate-800 font-sans">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-2">
                  <div>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                      LIVE IN TRANSIT
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 mt-1">{bus.routeName}</h3>
                    <p className="text-xs text-slate-600 font-medium">{bus.headsign}</p>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-blue-600 border border-slate-200">
                    <Bus className="w-5 h-5" />
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span className="text-slate-500">Departure Time:</span>
                    <span className="font-mono font-bold text-slate-900">{bus.departureTime}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span className="text-slate-500">Next Station:</span>
                    <span className="font-semibold text-blue-700 truncate max-w-[140px]">{bus.nextStopName}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span className="text-slate-500">Est. Remaining:</span>
                    <span className="font-mono font-bold text-blue-600">~{bus.etaRemainingMins} min</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-2">
                    <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                      <span>Route Progress</span>
                      <span>{bus.progress}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden ring-1 ring-slate-200">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${bus.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* User GPS Location Marker */}
        {userLocation && (
          <>
            <Circle
              center={[userLocation.lat, userLocation.lon]}
              radius={userLocation.accuracy || 30}
              pathOptions={{
                color: '#2563EB',
                fillColor: '#3B82F6',
                fillOpacity: 0.15,
                weight: 1.5
              }}
            />
            <Marker
              position={[userLocation.lat, userLocation.lon]}
              icon={L.divIcon({
                className: 'custom-user-marker',
                html: `
                  <div class="relative flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 border-2 border-white shadow-xl shadow-blue-500/50">
                    <div class="w-2.5 h-2.5 rounded-full bg-white animate-ping"></div>
                    <div class="absolute w-2 h-2 rounded-full bg-white"></div>
                  </div>
                `,
                iconSize: [24, 24],
                iconAnchor: [12, 12]
              })}
            >
              <Popup>
                <div className="p-2 text-xs font-sans text-slate-800">
                  <span className="font-bold text-blue-600 block">Your Current Location (GPS)</span>
                  {nearestStopInfo && (
                    <p className="text-slate-600 mt-1">
                      Nearest bus stop: <strong className="text-slate-900">{nearestStopInfo.stop.name}</strong> ({formatDistance(nearestStopInfo.distance)})
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          </>
        )}

      </MapContainer>

      {/* ========================================================================= */}
      {/* FLOATING ACTION BUTTONS (Right Side) */}
      {/* ========================================================================= */}
      <div className="absolute top-4 right-4 z-30 flex flex-col gap-2">
        {/* Layer / Route Filter Toggle */}
        <div className="relative">
          <button
            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            title="Filter Routes & Visibility"
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 shadow-md backdrop-blur-md transition-all active:scale-95"
          >
            <Layers className="w-5 h-5 text-blue-600" />
          </button>

          {/* Filter Dropdown Menu */}
          {showFilterDropdown && (
            <div className="absolute right-0 top-12 w-68 p-3 rounded-2xl bg-white border border-slate-200 shadow-2xl z-40 space-y-2 max-h-[75vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Route Filters & Status</span>
                  <span className="text-[10px] text-slate-500">Grey = Inactive</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleAllRoutes(true)}
                    className="text-[10px] font-semibold text-blue-600 hover:underline"
                  >
                    All
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    onClick={() => toggleAllRoutes(false)}
                    className="text-[10px] font-semibold text-slate-500 hover:underline"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                {Object.entries(ROUTE_CONFIG).map(([name, conf]) => {
                  const isVis = visibleRoutes[name];
                  const isRouteActive = activeRouteNames.has(name);

                  return (
                    <button
                      key={name}
                      onClick={() => toggleRouteVisibility(name)}
                      className="w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-colors hover:bg-slate-50"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: isRouteActive ? conf.color : '#94a3b8' }}
                        ></span>
                        <div>
                          <span className={`font-semibold block ${isVis ? (isRouteActive ? 'text-slate-900' : 'text-slate-500') : 'text-slate-400 line-through'}`}>
                            {name}
                          </span>
                          <span className="text-[9px] text-slate-400 font-mono">
                            {isRouteActive ? '🟢 Active' : '⚪ Inactive'}
                          </span>
                        </div>
                      </div>
                      {isVis && <Check className="w-3.5 h-3.5 text-blue-600" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* GPS Locate Me Button */}
        <button
          onClick={onGetLocation}
          title="Locate My GPS Position"
          className="flex items-center justify-center w-10 h-10 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 shadow-md backdrop-blur-md transition-all active:scale-95 group"
        >
          <Navigation className="w-5 h-5 text-blue-600 group-hover:rotate-45 transition-transform" />
        </button>
      </div>

      {/* ========================================================================= */}
      {/* GOOGLE MAPS STYLE PLACE CARD (Bottom Float on Mobile / Left on Desktop) */}
      {/* ========================================================================= */}
      {selectedPlace && (
        <div className="absolute bottom-16 lg:bottom-6 left-3 right-3 sm:left-6 sm:w-96 z-30 animate-in slide-in-from-bottom duration-200">
          <div className="rounded-3xl bg-white/95 backdrop-blur-xl border border-slate-200 p-4 sm:p-5 shadow-2xl space-y-3">
            
            {/* Place Card Header */}
            <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                    {selectedPlace.categoryLabel}
                  </span>
                  {selectedPlace.distToUser !== undefined && (
                    <span className="text-[11px] font-mono text-slate-500">
                      • {formatDistance(selectedPlace.distToUser)} away
                    </span>
                  )}
                </div>
                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {selectedPlace.name}
                </h3>
              </div>

              <button
                onClick={() => setSelectedPlace(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nearest Bus Stop Info */}
            {selectedPlaceNearestStop && (
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Bus className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <div className="truncate">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Nearest Stop</span>
                    <span className="font-semibold text-slate-800 truncate block max-w-[180px]">
                      {selectedPlaceNearestStop.stop.name}
                    </span>
                  </div>
                </div>
                <div className="text-right font-mono font-bold text-blue-700">
                  {formatDistance(selectedPlaceNearestStop.distance)}
                  <span className="text-[10px] text-slate-500 font-sans font-normal block">
                    (~{Math.ceil(selectedPlaceNearestStop.distance / 75)} min walk)
                  </span>
                </div>
              </div>
            )}

            {/* Google Maps Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => {
                  if (onPlanTripTo) onPlanTripTo(selectedPlace);
                }}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm active:scale-95"
              >
                <Navigation className="w-4 h-4" />
                Directions To
              </button>
              <button
                onClick={() => {
                  if (onPlanTripFrom) onPlanTripFrom(selectedPlace);
                }}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-200 transition-all active:scale-95"
              >
                <Footprints className="w-4 h-4 text-slate-600" />
                Depart From
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
