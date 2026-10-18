import React, { useState, useEffect, useMemo } from 'react';
import { Navigation, MapPin, Search, ArrowRight, Clock, Footprints, Bus, Sparkles, CheckCircle2, ChevronDown } from 'lucide-react';
import { planJourney } from '../utils/journeyPlanner';
import { ROUTE_CONFIG } from '../utils/constants';

export default function RoutePlanner({
  locations,
  stopsList,
  routes,
  routeDurations,
  currentTime,
  currentDay,
  userLocation,
  initialOrigin,
  initialDest,
  onSelectRouteOnMap
}) {
  const [originQuery, setOriginQuery] = useState('');
  const [destQuery, setDestQuery] = useState('');
  const [selectedOrigin, setSelectedOrigin] = useState(null);
  const [selectedDest, setSelectedDest] = useState(null);
  const [isOriginOpen, setIsOriginOpen] = useState(false);
  const [isDestOpen, setIsDestOpen] = useState(false);

  // Sync initialOrigin / initialDest if provided from Map
  useEffect(() => {
    if (initialOrigin) {
      setSelectedOrigin(initialOrigin);
      setOriginQuery(initialOrigin.name);
    }
  }, [initialOrigin]);

  useEffect(() => {
    if (initialDest) {
      setSelectedDest(initialDest);
      setDestQuery(initialDest.name);
    }
  }, [initialDest]);

  // Combined searchable points of interest (Locations + Bus Stops)
  const allLocations = useMemo(() => {
    const list = [];
    (locations || []).forEach(loc => {
      list.push({
        id: loc.id,
        name: loc.name,
        category: loc.category || 'faculty',
        lat: loc.lat,
        lon: loc.lon,
        nearestStop: loc.nearestStop
      });
    });

    (stopsList || []).forEach(stop => {
      list.push({
        id: stop.id,
        name: `Bus Stop: ${stop.name} (${stop.id})`,
        category: 'bus_stop',
        lat: stop.lat,
        lon: stop.lon,
        isStop: true
      });
    });

    return list;
  }, [locations, stopsList]);

  // Filtered Origin Suggestions
  const originSuggestions = useMemo(() => {
    if (!originQuery.trim()) return allLocations.slice(0, 8);
    const q = originQuery.toLowerCase();
    return allLocations.filter(l => l.name.toLowerCase().includes(q) || l.id.toLowerCase().includes(q)).slice(0, 10);
  }, [allLocations, originQuery]);

  // Filtered Destination Suggestions
  const destSuggestions = useMemo(() => {
    if (!destQuery.trim()) return allLocations.slice(0, 8);
    const q = destQuery.toLowerCase();
    return allLocations.filter(l => l.name.toLowerCase().includes(q) || l.id.toLowerCase().includes(q)).slice(0, 10);
  }, [allLocations, destQuery]);

  // Set Origin from User GPS
  const handleUseCurrentLocation = () => {
    if (userLocation) {
      setSelectedOrigin({
        id: 'USER_LOC',
        name: 'My Current Location (GPS)',
        lat: userLocation.lat,
        lon: userLocation.lon,
        category: 'user'
      });
      setOriginQuery('My Current Location (GPS)');
      setIsOriginOpen(false);
    }
  };

  // Plan Journey
  const journeyPlan = useMemo(() => {
    if (!selectedOrigin || !selectedDest) return null;
    return planJourney({
      origin: selectedOrigin,
      destination: selectedDest,
      stopsList,
      routes,
      routeDurations,
      currentTimeStr: currentTime,
      dayName: currentDay
    });
  }, [selectedOrigin, selectedDest, stopsList, routes, routeDurations, currentTime, currentDay]);

  return (
    <div className="flex flex-col h-full bg-slate-50 text-slate-800 overflow-y-auto">
      
      {/* Header Form Panel */}
      <div className="p-4 sm:p-6 bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-4xl mx-auto space-y-4">
          
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 shadow-xs">
              <Navigation className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-sans">
                Smart Trip Planner
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Find the best route: Walking + Shuttle Bus in real-time.
              </p>
            </div>
          </div>

          {/* Form Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 relative">
            
            {/* Origin Input */}
            <div className="relative">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                Departure Point (Where from?)
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-blue-600 absolute left-3 top-3" />
                <input
                  type="text"
                  value={originQuery}
                  onFocus={() => setIsOriginOpen(true)}
                  onChange={(e) => {
                    setOriginQuery(e.target.value);
                    setIsOriginOpen(true);
                  }}
                  placeholder="Choose starting location or GPS..."
                  className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                />
              </div>

              {/* Origin Autocomplete Dropdown */}
              {isOriginOpen && (
                <div className="absolute left-0 right-0 top-16 mt-1 p-2 rounded-2xl bg-white border border-slate-200 shadow-xl z-30 space-y-1 max-h-60 overflow-y-auto">
                  {userLocation && (
                    <button
                      onClick={handleUseCurrentLocation}
                      className="w-full flex items-center gap-2.5 p-2 rounded-xl text-left text-xs text-blue-700 hover:bg-blue-50 font-bold border border-blue-200 mb-1"
                    >
                      <Navigation className="w-4 h-4 text-blue-600" />
                      Use My Current Location (GPS)
                    </button>
                  )}

                  {originSuggestions.map(loc => (
                    <button
                      key={loc.id}
                      onClick={() => {
                        setSelectedOrigin(loc);
                        setOriginQuery(loc.name);
                        setIsOriginOpen(false);
                      }}
                      className="w-full flex items-center justify-between p-2 rounded-xl text-left text-xs text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                      <span className="truncate font-medium">{loc.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono ml-2 uppercase">[{loc.category}]</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Destination Input */}
            <div className="relative">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                Destination (Where to?)
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-red-600 absolute left-3 top-3" />
                <input
                  type="text"
                  value={destQuery}
                  onFocus={() => setIsDestOpen(true)}
                  onChange={(e) => {
                    setDestQuery(e.target.value);
                    setIsDestOpen(true);
                  }}
                  placeholder="Choose destination..."
                  className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-500 focus:bg-white transition-colors"
                />
              </div>

              {/* Destination Autocomplete Dropdown */}
              {isDestOpen && (
                <div className="absolute left-0 right-0 top-16 mt-1 p-2 rounded-2xl bg-white border border-slate-200 shadow-xl z-30 space-y-1 max-h-60 overflow-y-auto">
                  {destSuggestions.map(loc => (
                    <button
                      key={loc.id}
                      onClick={() => {
                        setSelectedDest(loc);
                        setDestQuery(loc.name);
                        setIsDestOpen(false);
                      }}
                      className="w-full flex items-center justify-between p-2 rounded-xl text-left text-xs text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                      <span className="truncate font-medium">{loc.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono ml-2 uppercase">[{loc.category}]</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap gap-2 pt-1 items-center">
            <span className="text-[11px] text-slate-500 font-semibold">Popular Destinations:</span>
            {[
              { name: 'PSZ (Main Library)', id: 'PSZ' },
              { name: 'FKE (P19A)', id: 'P19A' },
              { name: 'Cluster (T02)', id: 'T02' },
              { name: 'Centre Point (CP)', id: 'CP' },
              { name: 'College 9 & 10', id: 'K9' }
            ].map(preset => (
              <button
                key={preset.id}
                onClick={() => {
                  const found = allLocations.find(l => l.id === preset.id || l.name.includes(preset.id));
                  if (found) {
                    setSelectedDest(found);
                    setDestQuery(found.name);
                  }
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[11px] font-medium text-slate-700 border border-slate-200 transition-colors"
              >
                {preset.name}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* Results Section */}
      <div className="max-w-4xl mx-auto w-full p-4 sm:p-6 space-y-6">
        
        {journeyPlan && journeyPlan.results.length > 0 ? (
          <div className="space-y-4">
            
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-600" />
                Suggested Routes ({journeyPlan.results.length} Options Found)
              </h2>
            </div>

            {/* List of Options */}
            <div className="space-y-4">
              {journeyPlan.results.map((opt, idx) => {
                const isBest = idx === 0;
                const isBus = opt.type === 'DIRECT_BUS';
                const routeConf = isBus ? ROUTE_CONFIG[opt.routeName] : null;

                return (
                  <div
                    key={idx}
                    className={`p-5 rounded-3xl border transition-all shadow-sm ${
                      isBest
                        ? 'bg-white border-blue-200 ring-2 ring-blue-500/10 shadow-md'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {/* Option Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold tracking-wide ${
                            isBest ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {isBest ? 'RECOMMENDED' : `OPTION ${idx + 1}`}
                          </span>
                          <span className="text-xs font-semibold text-slate-500">
                            {opt.badge}
                          </span>
                        </div>
                        <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-1">
                          {opt.title}
                        </h3>
                      </div>

                      <div className="flex items-center gap-4 self-start sm:self-auto">
                        <div className="text-right">
                          <div className="text-xs text-slate-400 font-medium">Total Duration</div>
                          <div className="text-lg font-mono font-bold text-blue-600">
                            ~{opt.totalDurationMins} min
                          </div>
                        </div>
                        <div className="text-right border-l border-slate-200 pl-4">
                          <div className="text-xs text-slate-400 font-medium">Est. Arrival</div>
                          <div className="text-lg font-mono font-bold text-emerald-600">
                            {opt.arrivalTime}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Step by Step Breakdown */}
                    <div className="space-y-3">
                      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Step-by-Step Directions:
                      </div>

                      <div className="space-y-2 relative pl-4 border-l-2 border-slate-200 ml-2">
                        {opt.steps.map((st, sIdx) => {
                          const isStepWalk = st.type === 'walk';
                          const isStepBus = st.type === 'bus';
                          const isStepWait = st.type === 'wait';

                          return (
                            <div key={sIdx} className="relative group">
                              {/* Step Dot */}
                              <div className={`absolute -left-[23px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white flex items-center justify-center shadow-xs ${
                                isStepBus ? 'bg-blue-600' : isStepWalk ? 'bg-emerald-500' : 'bg-amber-500'
                              }`}></div>

                              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                                    {isStepBus && <Bus className="w-3.5 h-3.5 text-blue-600" />}
                                    {isStepWalk && <Footprints className="w-3.5 h-3.5 text-emerald-600" />}
                                    {isStepWait && <Clock className="w-3.5 h-3.5 text-amber-600" />}
                                    {st.title}
                                  </span>
                                  <span className="font-mono text-slate-500">~{st.durationMins} min</span>
                                </div>
                                <p className="text-slate-600 text-[11px] leading-relaxed">
                                  {st.instructions}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>

          </div>
        ) : (
          <div className="p-12 text-center text-slate-500 space-y-3">
            <Navigation className="w-12 h-12 mx-auto text-slate-300" />
            <div className="text-base font-bold text-slate-800">Choose Departure & Destination</div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              The system calculates active shuttle buses, minimal wait times, and the fastest walking connections for you.
            </p>
          </div>
        )}

      </div>

    </div>
  );
}
