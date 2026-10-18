import React from 'react';
import { Map, Activity, Navigation, Calendar, MapPin, Bus } from 'lucide-react';

export default function MobileNav({
  activeTab,
  setActiveTab,
  activeBusCount
}) {
  const tabs = [
    { id: 'map', label: 'Live Map', icon: Map },
    { id: 'live', label: 'Radar', icon: Activity, badge: activeBusCount > 0 ? activeBusCount : null },
    { id: 'planner', label: 'Planner', icon: Navigation },
    { id: 'schedule', label: 'Timetable', icon: Calendar },
    { id: 'stops', label: 'Stops', icon: MapPin }
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200 safe-bottom shadow-lg">
      <div className="flex items-center justify-around px-2 py-1.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 ${
                isActive
                  ? 'text-blue-600 font-bold scale-105'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 text-blue-600' : 'text-slate-500'}`} />
                {tab.badge !== null && tab.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2.5 flex items-center justify-center min-w-4 h-4 px-1 rounded-full bg-emerald-500 text-[10px] font-mono font-bold text-white shadow-xs">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] tracking-tight mt-0.5 font-medium">
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute bottom-0 w-8 h-1 rounded-full bg-blue-600"></span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
