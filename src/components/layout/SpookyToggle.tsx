"use client";

import { useSpooky } from "../../lib/spookyTheme";

export default function SpookyToggle() {
  const { spooky, setSpooky } = useSpooky();

  return (
    <button
      onClick={() => setSpooky(!spooky)}
      className={`
        relative flex items-center gap-2 px-4 py-2 rounded-full
        transition-all duration-300 font-medium text-sm
        ${spooky 
          ? 'bg-gradient-to-r from-orange-500 to-purple-600 text-white shadow-lg shadow-orange-500/30' 
          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
        }
      `}
      title={spooky ? "Switch to Normal Theme" : "Switch to Halloween Theme"}
    >
      <span className={`text-xl ${spooky ? 'spooky-float' : ''}`}>
        {spooky ? '🎃' : '🌙'}
      </span>
      <span>{spooky ? 'Spooky Mode' : 'Normal Mode'}</span>
      {spooky && (
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
        </span>
      )}
    </button>
  );
}
