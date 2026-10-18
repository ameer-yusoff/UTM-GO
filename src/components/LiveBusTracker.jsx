import React from 'react';
import { Bus, Clock, MapPin, Navigation, ArrowRight, Activity, AlertCircle, Compass } from 'lucide-react';
import { ROUTE_CONFIG } from '../utils/constants';

export default function LiveBusTracker({
  activeBuses,
  onFocusBus,
  onOpenSchedule,
  isFridayBreak
}) {
  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 text-slate-800">
      
      {/* Header Bar */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/50">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
            </span>
            <h2 className="text-sm font-bold tracking-tight text-slate-900 uppercase flex items-center gap-1.5">
              Live Shuttle Radar
            </h2>
          </div>
          <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
            {activeBuses.length} ACTIVE
          </span>
        </div>
        <p className="text-xs text-slate-500">
          Real-time simulation tracking of campus shuttle buses.
        </p>
      </div>

      {/* Friday Prayer Alert */}
      {isFridayBreak && (
        <div className="m-3 p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-600 mt-0.5" />
          <div>
            <span className="font-bold block">Friday Prayer Service Break</span>
            <span>Bus service is paused temporarily (12:40 PM - 2:00 PM) and resumes promptly after prayer.</span>
          </div>
        </div>
      )}

      {/* Active Bus List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {activeBuses.length > 0 ? (
          activeBuses.map((bus) => {
            const routeConf = ROUTE_CONFIG[bus.routeName] || { color: '#2563eb', bg: 'bg-blue-50' };

            return (
              <div
                key={bus.id}
                onClick={() => onFocusBus(bus)}
                className="group p-3.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-blue-400 transition-all cursor-pointer shadow-sm hover:shadow-md active:scale-[0.99]"
              >
                {/* Route Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0 ring-2 ring-slate-100"
                      style={{ backgroundColor: routeConf.color }}
                    ></span>
                    <span className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
                      {bus.routeName}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 text-[11px] font-mono text-slate-700 border border-slate-200">
                    <Clock className="w-3 h-3 text-blue-600" />
                    <span>Departs {bus.departureTime}</span>
                  </div>
                </div>

                {/* Headsign */}
                <div className="text-xs font-semibold text-slate-600 mb-3 flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span className="truncate">{bus.headsign}</span>
                </div>

                {/* Stop Transition (Current -> Next) */}
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs mb-2.5 space-y-1.5">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Previous Stop</span>
                    <span className="text-slate-700 font-medium truncate max-w-[140px]">{bus.currentStopName}</span>
                  </div>
                  <div className="flex items-center justify-between text-blue-700 font-semibold">
                    <span className="text-[10px] uppercase font-bold text-blue-600 flex items-center gap-1">
                      <ArrowRight className="w-3 h-3 text-blue-600" /> Next Stop:
                    </span>
                    <span className="truncate max-w-[140px] text-blue-700 font-bold">{bus.nextStopName}</span>
                  </div>
                </div>

                {/* Progress Bar & ETA */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                    <span>Progress: <strong className="text-slate-900 font-mono">{bus.progress}%</strong></span>
                    <span className="text-blue-700 font-bold font-mono">ETA ~{bus.etaRemainingMins} min</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden ring-1 ring-slate-200">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${bus.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center text-slate-500 space-y-4 my-auto">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
              <Bus className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">No Active Buses Right Now</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
                UTM Shuttle buses operate from 7:00 AM to 6:30 PM (plus night services 7:45 PM – 11:00 PM).
              </p>
            </div>
            <button
              onClick={onOpenSchedule}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white transition-all shadow-sm active:scale-95"
            >
              <Clock className="w-3.5 h-3.5" />
              View Full Timetable
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
