import React from 'react';
import { X, Clock, Calendar, Sparkles, RotateCcw, ShieldAlert, Sun, Moon, Sunset, Sunrise } from 'lucide-react';
import { DAYS_OF_WEEK } from '../utils/scheduleEngine';

export default function DevSimulationPanel({
  isOpen,
  onClose,
  currentTime,
  currentDay,
  isDevMode,
  onSetTime,
  onSetDay,
  onResetToRealTime
}) {
  if (!isOpen) return null;

  const [hours, minutes] = currentTime.split(':').map(Number);

  const presets = [
    {
      label: 'Morning Peak',
      desc: 'All morning shifts active',
      time: '07:35',
      day: 'monday',
      icon: Sunrise,
      color: 'text-amber-700 bg-amber-50 border-amber-200'
    },
    {
      label: 'Midday Transit',
      desc: 'Lunch & lecture transitions',
      time: '12:15',
      day: 'wednesday',
      icon: Sun,
      color: 'text-orange-700 bg-orange-50 border-orange-200'
    },
    {
      label: 'Friday Prayer',
      desc: 'Verify 12:40-14:00 service break',
      time: '13:00',
      day: 'friday',
      icon: ShieldAlert,
      color: 'text-rose-700 bg-rose-50 border-rose-200'
    },
    {
      label: 'Tuesday Stadium',
      desc: 'Route J Stadium service',
      time: '14:45',
      day: 'tuesday',
      icon: Sparkles,
      color: 'text-indigo-700 bg-indigo-50 border-indigo-200'
    },
    {
      label: 'Evening Rush',
      desc: 'Peak dispersal to colleges',
      time: '17:15',
      day: 'thursday',
      icon: Sunset,
      color: 'text-purple-700 bg-purple-50 border-purple-200'
    },
    {
      label: 'Night Shuttle',
      desc: 'Night routes (A, C, E, F)',
      time: '20:05',
      day: 'monday',
      icon: Moon,
      color: 'text-blue-700 bg-blue-50 border-blue-200'
    },
    {
      label: 'Weekend Service',
      desc: 'Route E Weekend (E1/E2)',
      time: '10:00',
      day: 'saturday',
      icon: Calendar,
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl bg-white border border-slate-200 shadow-2xl p-5 sm:p-6 space-y-5 text-slate-800">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 shadow-xs">
              <Clock className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 font-sans">
                Time Travel Simulator
              </h3>
              <p className="text-xs text-slate-500">
                Adjust simulated time & day to test bus schedules, active vehicles, and live movements.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Test Setting Display */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200 font-mono">
          <div>
            <div className="text-[10px] text-slate-500 uppercase font-sans font-bold">Simulated Time</div>
            <div className="text-2xl font-bold text-blue-600">{currentTime}</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-slate-500 uppercase font-sans font-bold">Simulated Day</div>
            <div className="text-lg font-bold text-slate-900 capitalize font-sans">{currentDay}</div>
          </div>
        </div>

        {/* Custom Hour & Minute Sliders */}
        <div className="space-y-4">
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-semibold text-slate-700">
              <span>Hour: {String(hours).padStart(2, '0')}</span>
              <span className="text-slate-400 font-mono">00 - 23</span>
            </div>
            <input
              type="range"
              min="0"
              max="23"
              value={hours}
              onChange={(e) => {
                const newH = String(e.target.value).padStart(2, '0');
                const newM = String(minutes).padStart(2, '0');
                onSetTime(`${newH}:${newM}`);
              }}
              className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs font-semibold text-slate-700">
              <span>Minute: {String(minutes).padStart(2, '0')}</span>
              <span className="text-slate-400 font-mono">00 - 59</span>
            </div>
            <input
              type="range"
              min="0"
              max="59"
              value={minutes}
              onChange={(e) => {
                const newH = String(hours).padStart(2, '0');
                const newM = String(e.target.value).padStart(2, '0');
                onSetTime(`${newH}:${newM}`);
              }}
              className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
            />
          </div>

          {/* Day Selector */}
          <div className="space-y-1.5">
            <div className="text-xs font-semibold text-slate-700">Select Test Day:</div>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-1">
              {DAYS_OF_WEEK.map((d) => (
                <button
                  key={d}
                  onClick={() => onSetDay(d)}
                  className={`py-1.5 px-2 rounded-xl text-xs font-bold capitalize transition-all ${
                    currentDay.toLowerCase() === d
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  {d.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Scenario Presets */}
        <div className="space-y-2">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Quick Scenarios:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {presets.map((p, idx) => {
              const Icon = p.icon;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    onSetTime(p.time);
                    onSetDay(p.day);
                  }}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all hover:scale-[1.01] active:scale-[0.99] ${p.color}`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <div>
                    <div className="text-xs font-bold leading-tight">{p.label} ({p.time})</div>
                    <div className="text-[10px] text-slate-600">{p.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-3">
          <button
            onClick={() => {
              onResetToRealTime();
              onClose();
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 border border-slate-200 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Use Real Time
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs"
          >
            Apply & Close
          </button>
        </div>

      </div>
    </div>
  );
}
