import React, { useState, useMemo } from 'react';
import { Bus, MapPin, Search, Clock, ArrowRight, Compass, ShieldCheck } from 'lucide-react';
import { ROUTE_CONFIG } from '../utils/constants';

export default function BusStopsDrawer({
  stopsList,
  selectedStop,
  onSelectStop,
  upcomingBusesByStop,
  routes,
  onViewOnMap
}) {
  const [searchQuery, setSearchQuery] = useState('');

  // Find routes that serve each stop
  const routesByStopId = useMemo(() => {
    const map = {};
    (routes || []).forEach(r => {
      (r.services || []).forEach(s => {
        (s.trips || []).forEach(t => {
          (t.stops_sequence || []).forEach(stopId => {
            if (!map[stopId]) map[stopId] = new Set();
            map[stopId].add(r.name);
          });
        });
      });
    });

    const result = {};
    Object.keys(map).forEach(k => {
      result[k] = Array.from(map[k]);
    });
    return result;
  }, [routes]);

  // Filtered stops list
  const filteredStops = useMemo(() => {
    if (!searchQuery.trim()) return stopsList || [];
    const q = searchQuery.toLowerCase();
    return (stopsList || []).filter(s =>
      s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q)
    );
  }, [stopsList, searchQuery]);

  return (
    <div className="flex flex-col h-full bg-slate-50 text-slate-800 overflow-y-auto">
      
      {/* Header */}
      <div className="p-4 sm:p-6 bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-4xl mx-auto space-y-4">
          
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 shadow-xs">
              <MapPin className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-sans">
                Campus Bus Stop Directory
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                57 UTM campus shuttle stops with real-time countdown arrivals for each station.
              </p>
            </div>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search bus stops (e.g. Centre Point, College 9, P19A, KDOJ)..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
            />
          </div>

        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto w-full p-4 sm:p-6 space-y-4">
        
        {/* Selected Stop Focus Detail View */}
        {selectedStop && (
          <div className="p-5 rounded-3xl bg-white border-2 border-blue-500 shadow-md space-y-4">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-blue-100 text-blue-800">
                  SELECTED STOP [{selectedStop.id}]
                </span>
                <h2 className="text-lg font-bold text-slate-900 mt-1">
                  {selectedStop.name}
                </h2>
                <p className="text-xs text-slate-500 font-mono">
                  Coordinates: {selectedStop.lat.toFixed(5)}, {selectedStop.lon.toFixed(5)}
                </p>
              </div>

              <button
                onClick={() => onViewOnMap(selectedStop)}
                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs active:scale-95"
              >
                View on Map
              </button>
            </div>

            {/* Routes Passing Through */}
            <div>
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                Routes Serving This Stop:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(routesByStopId[selectedStop.id] || []).map(rName => {
                  const conf = ROUTE_CONFIG[rName] || { color: '#2563eb', badge: 'bg-blue-600 text-white' };
                  return (
                    <span key={rName} className={`px-2.5 py-1 rounded-lg text-xs font-bold ${conf.badge}`}>
                      {rName}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Upcoming Arrivals Timeline */}
            <div className="space-y-2">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Next Shuttle Arrivals:
              </div>

              {(upcomingBusesByStop[selectedStop.id] || []).length > 0 ? (
                <div className="space-y-2">
                  {(upcomingBusesByStop[selectedStop.id] || []).map((bus, idx) => {
                    const rConf = ROUTE_CONFIG[bus.routeName] || { color: '#2563eb' };
                    return (
                      <div
                        key={idx}
                        className={`flex items-center justify-between p-3 rounded-2xl border text-xs ${
                          idx === 0
                            ? 'bg-blue-50/60 border-blue-200'
                            : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: rConf.color }}></span>
                          <div>
                            <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                              {bus.routeName}
                              {idx === 0 && (
                                <span className="px-1.5 py-0.2 text-[9px] rounded bg-emerald-100 text-emerald-800 font-bold">
                                  NEXT
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500">{bus.headsign}</div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-sm font-mono font-bold text-blue-600">
                            {bus.minutesUntil === 0 ? 'Arriving now' : `in ~${bus.minutesUntil} min`}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            Est. arrival: <strong className="text-slate-800">{bus.arrivalTime}</strong>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 text-xs text-slate-500 text-center italic">
                  No shuttle trips scheduled in the next 90 minutes.
                </div>
              )}
            </div>
          </div>
        )}

        {/* List of All Stops */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredStops.map(stop => {
            const isSelected = selectedStop?.id === stop.id;
            const passing = routesByStopId[stop.id] || [];
            const upcoming = upcomingBusesByStop[stop.id] || [];
            const nextBus = upcoming[0];

            return (
              <div
                key={stop.id}
                onClick={() => onSelectStop(stop)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-50/60 border-blue-500 ring-1 ring-blue-500/30 shadow-sm'
                    : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300 shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-blue-600">[{stop.id}]</span>
                    <h3 className="text-sm font-bold text-slate-900">{stop.name}</h3>
                  </div>
                  {nextBus && (
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {nextBus.minutesUntil === 0 ? 'Now' : `~${nextBus.minutesUntil} min`}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {passing.map(rName => {
                    const conf = ROUTE_CONFIG[rName] || { color: '#2563eb' };
                    return (
                      <span
                        key={rName}
                        className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1"
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: conf.color }}></span>
                        {rName}
                      </span>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
}
