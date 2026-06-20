import React, { useState } from 'react';
import { MapPin, Crosshair, Radar } from 'lucide-react';

export default function ControlPanel({ onScan, isLoading, errorMsg }) {
  const [lat, setLat] = useState("22.5726");
  const [lon, setLon] = useState("88.3639");

  const handleLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setLat(pos.coords.latitude.toFixed(4));
        setLon(pos.coords.longitude.toFixed(4));
      });
    }
  };

  return (
    <div className="glass-panel p-5 flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h2 className="font-mono text-xs text-textMuted uppercase tracking-widest flex items-center gap-2">
          <MapPin size={14} /> Coordinates
        </h2>
        <button onClick={handleLocation} className="text-textMuted hover:text-primary transition-colors">
          <Crosshair size={14} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="relative group">
          <input 
            type="number" value={lat} onChange={(e) => setLat(e.target.value)}
            className="w-full bg-[#0a0a0a] border border-surfaceBorder rounded-lg px-3 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-primary transition-colors"
          />
          <span className="absolute -top-2 left-2 bg-[#0a0a0a] px-1 text-[10px] text-textMuted font-mono">LAT</span>
        </div>
        <div className="relative group">
          <input 
            type="number" value={lon} onChange={(e) => setLon(e.target.value)}
            className="w-full bg-[#0a0a0a] border border-surfaceBorder rounded-lg px-3 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-primary transition-colors"
          />
          <span className="absolute -top-2 left-2 bg-[#0a0a0a] px-1 text-[10px] text-textMuted font-mono">LON</span>
        </div>
      </div>

      <button 
        onClick={() => onScan(lat, lon)}
        disabled={isLoading}
        className="w-full mt-2 bg-white text-black font-medium py-2.5 rounded-lg hover:bg-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
      >
        {isLoading ? <Radar className="animate-spin" size={16} /> : "Initiate Scan"}
      </button>

      {errorMsg && <p className="text-danger text-xs font-mono mt-2">{errorMsg}</p>}
    </div>
  );
}