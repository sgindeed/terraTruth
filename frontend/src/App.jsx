import React, { useState } from "react";
import { ShieldAlert, Activity, MapPin, Crosshair, Terminal, Database, Layers, MessageSquare, X } from "lucide-react";
import MapVisualizer from "./components/MapVisualizer";
import AnomalyChart from "./components/AnomalyChart";
import SarChart from "./components/SarChart";
import RagChat from "./components/RagChat";

export default function App() {
  const [scanMode, setScanMode] = useState("multivariate"); 
  const [isChatOpen, setIsChatOpen] = useState(false); 
  const [showAnomalies, setShowAnomalies] = useState(false);
  
  const [data, setData] = useState(null);
  const [canopyData, setCanopyData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [lat, setLat] = useState("22.5726");
  const [lon, setLon] = useState("88.3639");
  const [locationInput, setLocationInput] = useState("");

  const handleGetCurrentLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(pos.coords.latitude.toFixed(4));
          setLon(pos.coords.longitude.toFixed(4));
        },
        () => setErrorMsg("Geolocation access denied.")
      );
    }
  };

  const resolveAndScan = async () => {
    setLoading(true);
    setErrorMsg("");
    
    let targetLat = lat;
    let targetLon = lon;

    // Resolve location if user typed a place name
    if (locationInput) {
      if (locationInput.includes(",")) {
        const [l, n] = locationInput.split(",");
        targetLat = l.trim();
        targetLon = n.trim();
        setLat(targetLat);
        setLon(targetLon);
      } else {
        try {
          const res = await fetch(`http://localhost:8000/api/resolve-coordinates?place_name=${locationInput}`, { method: 'POST' });
          const loc = await res.json();
          targetLat = loc.lat;
          targetLon = loc.lon;
          setLat(targetLat);
          setLon(targetLon);
        } catch (e) {
          setErrorMsg("Could not resolve location name.");
          setLoading(false);
          return;
        }
      }
    }
    
    initiateScan(targetLat, targetLon);
  };

  const initiateScan = async (finalLat, finalLon) => {
    setIsChatOpen(false); 
    setShowAnomalies(false);
    
    if (scanMode === "multivariate") setData(null);
    if (scanMode === "canopy") setCanopyData(null);
    
    try {
      const endpoint = scanMode === "multivariate" 
        ? "http://localhost:8000/api/analyze-location"
        : "http://localhost:8000/api/analyze-canopy";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat: parseFloat(finalLat), lon: parseFloat(finalLon) })
      });
      
      const result = await response.json();
      if (!response.ok) throw new Error(result.detail || "Failed to scan target region.");
      
      if (scanMode === "multivariate") {
        setData(result);
      } else {
        setCanopyData(result.data);
      }
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  const isTargetLoaded = !!data || !!canopyData;
  const currentAnomalies = scanMode === "multivariate" 
    ? data?.anomaly_count 
    : (canopyData?.canopy_loss_flag ? 1 : 0);
    
  const currentEvents = scanMode === "multivariate" 
    ? (data?.total_events || data?.timeseries?.length) 
    : canopyData?.timeseries_sar?.length;

  const dossierText = data?.llm_dossier || data?.llm_report;

  // Direct map to the backend's explicit anomaly list
  const anomaliesList = scanMode === "multivariate" && data?.anomalies 
    ? data.anomalies 
    : [];

  return (
    <div className="h-screen w-screen bg-[#0a0a0a] text-[#ededed] font-sans flex flex-col overflow-hidden select-none relative">
      
      <header className="h-14 border-b border-[#222] bg-[#111] px-6 flex items-center justify-between z-10 shadow-md">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold font-mono tracking-wider text-white">
            TERRA<span className="text-[#00e5ff]">TRUTH</span>
          </h1>
          <span className="text-xs font-mono text-[#555]">//</span>
          <p className="text-xs font-mono text-[#888] tracking-widest uppercase hidden md:block">Autonomous Exploitation Detection Engine</p>
        </div>
        <div className="flex items-center gap-3 font-mono text-xs text-[#888]">
          <span className={`w-2 h-2 rounded-full ${loading ? 'bg-[#ffaa00] animate-pulse' : 'bg-[#00e5ff]'}`}></span>
          {loading ? "PROCESSING TELEMETRY" : "SYSTEM READY"}
        </div>
      </header>

      <div className="flex-grow grid grid-cols-12 p-4 gap-4 h-[calc(100vh-3.5rem)] overflow-hidden">
        
        <div className="col-span-12 md:col-span-4 xl:col-span-3 flex flex-col gap-4 h-full overflow-y-auto custom-scrollbar">
          
          <div className="bg-[#111] border border-[#222] rounded-xl p-4 flex flex-col gap-4 shadow-lg">
            <div className="flex items-center justify-between border-b border-[#222] pb-2">
              <span className="text-xs font-mono font-bold text-[#888] tracking-widest flex items-center gap-2">
                <MapPin size={14} className="text-[#00e5ff]" /> TARGET INTERFACE
              </span>
              <button onClick={handleGetCurrentLocation} className="text-[#888] hover:text-[#00e5ff] transition-colors"><Crosshair size={14} /></button>
            </div>

            <input 
              type="text" 
              placeholder="Place name or Lat, Lon..."
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              className="bg-[#0a0a0a] border border-[#222] rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-[#00e5ff]"
            />

            <div className="bg-[#0a0a0a] rounded-lg p-1 border border-[#222] flex text-[10px] font-mono tracking-widest font-bold">
              <button onClick={() => setScanMode("multivariate")} className={`flex-1 py-2 rounded transition-colors ${scanMode === "multivariate" ? 'bg-[#222] text-[#00e5ff]' : 'text-[#666]'}`}>MULTIVARIATE</button>
              <button onClick={() => setScanMode("canopy")} className={`flex-1 py-2 rounded transition-colors ${scanMode === "canopy" ? 'bg-[#222] text-[#00e5ff]' : 'text-[#666]'}`}>SAR CANOPY</button>
            </div>

            <button onClick={resolveAndScan} disabled={loading} className="w-full bg-[#111] text-[#00e5ff] border border-[#00e5ff]/30 font-mono text-xs tracking-widest uppercase py-3 rounded-lg hover:bg-[#00e5ff]/10">
              {loading ? "EXECUTING..." : "INITIATE SCAN"}
            </button>
            {errorMsg && <p className="text-[#ff2a2a] text-xs font-mono border border-[#ff2a2a]/20 bg-[#ff2a2a]/5 p-2 rounded">{errorMsg}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#111] border border-[#222] rounded-xl p-4 flex flex-col justify-between h-28 shadow-lg">
              <div className="flex items-center justify-between text-[#888] font-mono text-[10px] tracking-wider"><span>TOTAL EVENTS</span><Database size={12} /></div>
              <p className="text-3xl font-light font-mono text-white mt-2">{currentEvents || "---"}</p>
            </div>
            <div onClick={() => currentAnomalies > 0 && setShowAnomalies(true)} className={`bg-[#111] border rounded-xl p-4 flex flex-col justify-between h-28 cursor-pointer ${currentAnomalies > 0 ? 'border-[#ff2a2a]/40 shadow-glow-red hover:bg-[#ff2a2a]/10' : 'border-[#222]'}`}>
              <div className="flex items-center justify-between text-[#888] font-mono text-[10px] tracking-wider"><span>ANOMALIES</span><ShieldAlert size={12} /></div>
              <p className={`text-3xl font-light font-mono mt-2 ${currentAnomalies > 0 ? 'text-[#ff2a2a]' : 'text-white'}`}>{currentAnomalies || "---"}</p>
            </div>
          </div>

          <div className="bg-[#111] border border-[#222] rounded-xl flex flex-col flex-grow min-h-[300px] shadow-lg">
            <div className="flex items-center gap-2 font-mono text-xs font-bold text-white p-3 border-b border-[#222]">
              <Terminal size={14} className="text-[#ff2a2a]" /> LEGAL DOSSIER
            </div>
            <div className="flex-grow overflow-y-auto custom-scrollbar p-4 text-xs text-[#b5b5b5] font-serif">
              {dossierText ? dossierText.split("\n").map((para, i) => (
                <p key={i} className="mb-3 pl-3 border-l border-[#333] text-justify" dangerouslySetInnerHTML={{ __html: para.replace(/\*\*(.*?)\*\*/g, '<strong class="text-[#00e5ff]">$1</strong>') }} />
              )) : <div className="text-center font-mono text-[11px] text-[#555]">Awaiting synthesis...</div>}
            </div>
          </div>
        </div>

        <div className="col-span-12 md:col-span-8 xl:col-span-9 flex flex-col gap-4 h-full min-h-0">
          <div className="flex-grow bg-[#111] border border-[#222] rounded-xl relative overflow-hidden shadow-lg">
            <MapVisualizer lat={parseFloat(lat)} lon={parseFloat(lon)} anomalyCount={currentAnomalies} isTargetLoaded={isTargetLoaded} />
          </div>
          <div className="h-1/3 min-h-[180px] bg-[#111] border border-[#222] rounded-xl p-4 shadow-lg">
            <h3 className="text-[#00e5ff] text-xs font-mono mb-2 uppercase tracking-widest font-bold">TELEMETRY FUSION</h3>
            {data?.timeseries && scanMode === "multivariate" ? <AnomalyChart data={data.timeseries} /> : canopyData?.timeseries_sar ? <SarChart data={canopyData.timeseries_sar} /> : <div className="h-full flex items-center justify-center text-[#555] font-mono text-xs">Awaiting data...</div>}
          </div>
        </div>
      </div>

      {showAnomalies && (
        <div className="fixed inset-0 z-[999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0a0a0a] border border-[#ff2a2a]/30 rounded-xl w-full max-w-3xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-[#222]"><h3 className="text-[#ff2a2a] text-sm font-mono font-bold">FORENSIC LOG</h3><button onClick={() => setShowAnomalies(false)}><X size={18}/></button></div>
            <div className="overflow-y-auto p-4 custom-scrollbar">
              <table className="w-full text-left font-mono text-xs text-[#b5b5b5]">
                <thead className="text-[#888] border-b border-[#333]"><tr><th>TIMESTAMP</th><th>THREAT</th><th>HEAT</th><th>GAS</th><th>AEROSOL</th></tr></thead>
                <tbody>{anomaliesList.map((a, i) => <tr key={i} className="border-b border-[#222]"><td className="py-3 text-white">{a.date}</td><td className="py-3 text-[#ff2a2a]">{a.threat_score}</td><td className="py-3">{a.modis_lst_c}</td><td className="py-3">{a.s5p_aai}</td><td className="py-3">{a.modis_aod}</td></tr>)}</tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {isTargetLoaded && (
        <div className="fixed bottom-6 right-6 z-50">
          {isChatOpen ? (
            <RagChat targetLoaded={isTargetLoaded} lat={lat} lon={lon} anomalyCount={currentAnomalies} onClose={() => setIsChatOpen(false)} />
          ) : (
            <button onClick={() => setIsChatOpen(true)} className="h-16 w-16 rounded-full overflow-hidden border-2 border-[#00e5ff] shadow-glow-cyan hover:scale-105 transition-all">
              <img src="https://api.dicebear.com/7.x/bottts-neutral/svg?seed=Cipher&backgroundColor=00e5ff" alt="Cipher.AI" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}