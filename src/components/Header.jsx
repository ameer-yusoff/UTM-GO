import React from 'react';
import { Bus, Clock, Calendar, ShieldAlert, Sparkles, Navigation, Layers, Compass } from 'lucide-react';
import { isDuringFridayPrayer } from '../utils/scheduleEngine';

export default function Header({
  currentTime,
  currentDay,
  activeBusCount,
  onOpenSchedule,
  onOpenPlanner,
  onOpenDevPanel,
  isDevMode,
  activeTab,
  setActiveTab
}) {
  const isFridayBreak = isDuringFridayPrayer(currentTime, currentDay);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 text-slate-800 px-4 py-2.5 transition-all shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-red-700 via-rose-800 to-red-900 shadow-md shadow-red-900/10 ring-1 ring-black/5">
            <Bus className="w-5 h-5 text-white" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-white"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-slate-900 font-sans">
                UTM GO
              </h1>
              <span className="px-1.5 py-0.5 text-[10px] font-bold tracking-wide uppercase rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                2026/2027
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium hidden sm:block">
              Campus Shuttle Tracker & Navigator
            </p>
          </div>
        </div>

        {/* Live Status Pill & Navigation */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Friday Prayer Alert */}
          {isFridayBreak && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-300 text-amber-800 text-xs font-semibold animate-pulse">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden md:inline">Friday Prayer Service Break (12:40 PM - 2:00 PM)</span>
              <span className="md:hidden">Friday Break</span>
            </div>
          )}

          {/* Active Buses Counter */}
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
            </span>
            <span className="text-slate-700 font-medium">
              <strong className="text-emerald-700 font-bold">{activeBusCount}</strong> {activeBusCount === 1 ? 'bus active' : 'buses active'}
            </span>
          </div>

          {/* Live Clock & Simulator Trigger */}
          <button
            onClick={onOpenDevPanel}
            title="Click to simulate specific time or day"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 hover:border-slate-300 text-xs font-mono transition-all group shadow-xs"
          >
            <Clock className="w-3.5 h-3.5 text-blue-600 group-hover:rotate-12 transition-transform" />
            <span className="font-bold text-slate-800 tracking-wider">{currentTime}</span>
            <span className="text-slate-500 text-[11px] capitalize font-sans ml-0.5 hidden xs:inline">({currentDay.slice(0, 3)})</span>
            {isDevMode && (
              <span className="px-1 text-[9px] font-sans font-bold bg-purple-100 text-purple-700 border border-purple-200 rounded">SIM</span>
            )}
          </button>

          {/* Desktop Navigation Tabs */}
          <div className="hidden lg:flex items-center gap-1 ml-2 border-l border-slate-200 pl-3">
            <button
              onClick={() => setActiveTab('map')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'map'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Live Map
            </button>
            <button
              onClick={() => setActiveTab('planner')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'planner'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Trip Planner
            </button>
            <button
              onClick={() => setActiveTab('schedule')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'schedule'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Timetable
            </button>
            <button
              onClick={() => setActiveTab('stops')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'stops'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Bus Stops
            </button>
          </div>

        </div>

      </div>
    </header>
  );
}
