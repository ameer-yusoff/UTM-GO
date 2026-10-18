import React, { useState, useMemo } from 'react';
import { ROUTE_CONFIG } from '../utils/constants';
import busUnitsData from '../data/bus_units.json';
import { Clock, Calendar, Search, Filter, ShieldAlert, Bus, ChevronRight, Sparkles, Check } from 'lucide-react';
import { timeToMinutes } from '../utils/scheduleEngine';

export default function ScheduleView({
  routes,
  currentTime,
  currentDay,
  onSelectRouteOnMap
}) {
  const [selectedRouteName, setSelectedRouteName] = useState('All');
  const [selectedDriverBus, setSelectedDriverBus] = useState('All');
  const [selectedDayTab, setSelectedDayTab] = useState('weekday'); // 'weekday' | 'weekend'
  const [selectedPeriod, setSelectedPeriod] = useState('all'); // 'all' | 'morning' | 'afternoon' | 'evening'
  const [searchQuery, setSearchQuery] = useState('');

  // Bus Units Array
  const busUnitsList = useMemo(() => Object.values(busUnitsData), []);

  // Filtered Bus Units
  const filteredBusUnits = useMemo(() => {
    return busUnitsList.filter(unit => {
      // Filter by Route
      if (selectedRouteName !== 'All') {
        if (selectedRouteName === 'Route E' && !unit.route.startsWith('Route E')) return false;
        if (selectedRouteName !== 'Route E' && unit.route !== selectedRouteName) return false;
      }

      // Filter by Specific Bus Unit
      if (selectedDriverBus !== 'All' && unit.busNumber !== selectedDriverBus) {
        return false;
      }

      // Filter by Day Tab
      if (selectedDayTab === 'weekend') {
        if (unit.serviceType !== 'WEEKEND') return false;
      } else {
        if (unit.serviceType === 'WEEKEND') return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = unit.route.toLowerCase().includes(q);
        const matchBus = unit.busNumber.toLowerCase().includes(q);
        const matchDesc = unit.description.toLowerCase().includes(q);
        if (!matchName && !matchBus && !matchDesc) return false;
      }

      return true;
    });
  }, [busUnitsList, selectedRouteName, selectedDriverBus, selectedDayTab, searchQuery]);

  const currentMinutes = timeToMinutes(currentTime);

  return (
    <div className="flex flex-col h-full bg-slate-50 text-slate-800 overflow-y-auto">
      
      {/* Top Banner & Title */}
      <div className="p-4 sm:p-6 bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto space-y-4">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 shadow-xs">
                  <Calendar className="w-5 h-5" />
                </span>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-sans">
                  Official UTM Shuttle Timetable 2026/2027
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Official verified schedules from UTM Fleet Management Unit, Session 2026/2027.
              </p>
            </div>

            {/* Current System Time Indicator */}
            <div className="flex items-center gap-2 self-start md:self-auto px-3.5 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="text-slate-600 font-medium">Clock:</span>
              <span className="font-mono font-bold text-slate-900 text-sm">{currentTime}</span>
              <span className="text-slate-500 capitalize">({currentDay})</span>
            </div>
          </div>

          {/* Friday Prayer Banner Alert */}
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs">
            <ShieldAlert className="w-5 h-5 flex-shrink-0 text-amber-600" />
            <div className="leading-relaxed">
              <strong className="font-bold">Friday Prayer Service Notice:</strong> Every Friday, shuttle services pause between <span className="font-mono font-bold text-amber-950">12:40 PM and 2:00 PM</span>.
            </div>
          </div>

          {/* Filters Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
            
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search route or bus unit..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
              />
            </div>

            {/* Route Filter Dropdown */}
            <div>
              <select
                value={selectedRouteName}
                onChange={(e) => setSelectedRouteName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-semibold focus:outline-none focus:border-blue-500 focus:bg-white"
              >
                <option value="All">All Routes</option>
                <option value="Route A">Route A (KP ⇋ CP)</option>
                <option value="Route B">Route B (KP - K9/10 ⇋ Cluster)</option>
                <option value="Route C">Route C (K9/10 ⇋ Lingkaran Ilmu CP)</option>
                <option value="Route D">Route D (CP ⇋ FKT N29)</option>
                <option value="Route E">Route E (KDOJ ⇋ Cluster)</option>
                <option value="Route F">Route F (KTR ⇋ P19A FKE)</option>
                <option value="Route G">Route G (KTR ⇋ FKT N29)</option>
                <option value="Route H">Route H (CP ⇋ V01 TMN U)</option>
                <option value="Route J">Route J (CP ⇋ Stadium)</option>
              </select>
            </div>

            {/* Day Tab Selector */}
            <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs">
              <button
                onClick={() => setSelectedDayTab('weekday')}
                className={`flex-1 py-1 px-2 rounded-lg font-bold transition-all ${
                  selectedDayTab === 'weekday'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Monday – Friday
              </button>
              <button
                onClick={() => setSelectedDayTab('weekend')}
                className={`flex-1 py-1 px-2 rounded-lg font-bold transition-all ${
                  selectedDayTab === 'weekend'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Saturday & Sunday
              </button>
            </div>

            {/* Time Period Filter */}
            <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs">
              {[
                { id: 'all', label: 'All' },
                { id: 'morning', label: 'Morning' },
                { id: 'afternoon', label: 'Afternoon' },
                { id: 'evening', label: 'Evening/Night' }
              ].map(p => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPeriod(p.id)}
                  className={`flex-1 py-1 px-1 rounded-lg text-[11px] font-semibold transition-all ${
                    selectedPeriod === p.id
                      ? 'bg-white text-slate-900 font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

          </div>

        </div>
      </div>

      {/* Main Schedule Content */}
      <div className="max-w-7xl mx-auto w-full p-4 sm:p-6 space-y-6">
        
        {filteredBusUnits.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredBusUnits.map(unit => {
              const routeConf = ROUTE_CONFIG[unit.route] || { color: '#2563EB', badge: 'bg-blue-600 text-white' };
              const directions = Object.entries(unit.directions || {});

              return (
                <div
                  key={unit.busNumber}
                  className="rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-sm hover:shadow-md hover:border-slate-300 transition-all"
                >
                  {/* Card Header */}
                  <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-50 to-slate-100/70 border-b border-slate-200 flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold tracking-wide bg-blue-100 text-blue-800 border border-blue-200">
                          BUS UNIT: {unit.busNumber}
                        </span>
                        <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${routeConf.badge}`}>
                          {unit.route}
                        </span>
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 pt-1">
                        {unit.description}
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Effective Schedule: {unit.effectiveDate} • {unit.serviceType}
                      </p>
                    </div>

                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xs border border-slate-200"
                      style={{ backgroundColor: `${routeConf.color}15`, color: routeConf.color }}
                    >
                      <Bus className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Directions Timetable Grid */}
                  <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {directions.map(([dirName, timings]) => {
                      let morningList = timings.morning || [];
                      let afternoonList = timings.afternoon || [];
                      let eveningList = timings.evening || [];
                      let nightList = timings.night || [];

                      const showMorning = selectedPeriod === 'all' || selectedPeriod === 'morning';
                      const showAfternoon = selectedPeriod === 'all' || selectedPeriod === 'afternoon';
                      const showEvening = selectedPeriod === 'all' || selectedPeriod === 'evening';

                      return (
                        <div key={dirName} className="rounded-2xl bg-slate-50 p-3.5 border border-slate-200 space-y-3">
                          {/* Direction Title */}
                          <div className="border-b border-slate-200 pb-2">
                            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                              DEPARTURE DIRECTION
                            </span>
                            <h4 className="text-xs font-bold text-blue-800 mt-0.5 truncate" title={dirName}>
                              {dirName}
                            </h4>
                          </div>

                          {/* Morning Section */}
                          {showMorning && morningList.length > 0 && (
                            <div className="space-y-1.5">
                              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Morning (Pagi)
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {morningList.map(time => {
                                  const mins = timeToMinutes(time);
                                  const isUpcoming = mins >= currentMinutes && mins - currentMinutes <= 60;
                                  return (
                                    <span
                                      key={time}
                                      className={`px-2 py-1 rounded-lg text-xs font-mono font-bold transition-colors ${
                                        isUpcoming
                                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 ring-1 ring-emerald-400/40'
                                          : 'bg-white text-slate-700 border border-slate-200'
                                      }`}
                                    >
                                      {time}
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Afternoon Section */}
                          {showAfternoon && afternoonList.length > 0 && (
                            <div className="space-y-1.5">
                              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span> Afternoon (Tengah Hari)
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {afternoonList.map(time => {
                                  const mins = timeToMinutes(time);
                                  const isUpcoming = mins >= currentMinutes && mins - currentMinutes <= 60;
                                  const isFriNoSvc = timings.afternoonFridayNoService?.includes(time);

                                  return (
                                    <span
                                      key={time}
                                      title={isFriNoSvc ? 'No service during Friday prayer' : ''}
                                      className={`px-2 py-1 rounded-lg text-xs font-mono font-bold transition-colors relative group ${
                                        isFriNoSvc
                                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                          : isUpcoming
                                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                          : 'bg-white text-slate-700 border border-slate-200'
                                      }`}
                                    >
                                      {time}
                                      {isFriNoSvc && <span className="text-[8px] text-amber-700 ml-1 font-sans">*Fri off</span>}
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Evening & Night Section */}
                          {showEvening && (eveningList.length > 0 || nightList.length > 0) && (
                            <div className="space-y-1.5">
                              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span> Evening & Night (Petang/Malam)
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {[...eveningList, ...nightList].map(time => {
                                  const mins = timeToMinutes(time);
                                  const isUpcoming = mins >= currentMinutes && mins - currentMinutes <= 60;
                                  return (
                                    <span
                                      key={time}
                                      className={`px-2 py-1 rounded-lg text-xs font-mono font-bold transition-colors ${
                                        isUpcoming
                                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 ring-1 ring-emerald-400/40'
                                          : 'bg-white text-slate-700 border border-slate-200'
                                      }`}
                                    >
                                      {time}
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                        </div>
                      );
                    })}
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center text-slate-500 space-y-3">
            <Calendar className="w-10 h-10 mx-auto text-slate-300" />
            <div className="text-base font-bold text-slate-800">No bus schedules match your search</div>
            <p className="text-xs text-slate-500">Please adjust your filter options or search keyword above.</p>
          </div>
        )}

      </div>

    </div>
  );
}
