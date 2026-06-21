import React, { useState } from "react";
import { ShieldAlert, Activity, MapPin, Crosshair, Terminal, Database, Layers, MessageSquare, X, CheckCircle2 } from "lucide-react";
import MapVisualizer from "./components/MapVisualizer";
import AnomalyChart from "./components/AnomalyChart";
import SarChart from "./components/SarChart";
import RagChat from "./components/RagChat";

export default function App() {
  const [scanMode, setScanMode] = useState("multivariate"); 
  const [isChatOpen, setIsChatOpen] = useState(false); 
  const [showAnomalies, setShowAnomalies] = useState(false);
  const [showAllEvents, setShowAllEvents] = useState(false); // NEW: State for All Events Modal
  
  const [data, setData] = useState(null);
  const [canopyData, setCanopyData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [lat, setLat] = useState("22.5726");
  const [lon, setLon] = useState("88.3639");
  const [locationInput, setLocationInput] = useState("");
  
  const [displayLocation, setDisplayLocation] = useState({ name: "", coords: "" });

  const handleGetCurrentLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(pos.coords.latitude.toFixed(4));
          setLon(pos.coords.longitude.toFixed(4));
          setLocationInput(`${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
        },
        () => setErrorMsg("Geolocation access denied.")
      );
    }
  };

  const resolveAndScan = async () => {
    setLoading(true);
    setErrorMsg("");
    setDisplayLocation({ name: "", coords: "" });
    
    let targetLat = lat;
    let targetLon = lon;
    let targetName = "";

    try {
      const isCoordinateInput = locationInput && locationInput.includes(",") && !/[a-zA-Z]/.test(locationInput);

      if (isCoordinateInput) {
        const [l, n] = locationInput.split(",");
        targetLat = parseFloat(l.trim());
        targetLon = parseFloat(n.trim());
        setLat(targetLat);
        setLon(targetLon);

        const res = await fetch(`http://localhost:8000/api/reverse-geocode?lat=${targetLat}&lon=${targetLon}`);
        if (res.ok) {
          const locData = await res.json();
          targetName = locData.name;
        } else {
          targetName = "Unknown Coordinates Sector";
        }

      } else if (locationInput) {
        const res = await fetch(`http://localhost:8000/api/resolve-coordinates?place_name=${locationInput}`, { method: 'POST' });
        if (!res.ok) throw new Error("Could not resolve location name.");
        
        const loc = await res.json();
        targetLat = loc.lat;
        targetLon = loc.lon;
        setLat(targetLat);
        setLon(targetLon);
        targetName = locationInput.toUpperCase();
      } else {
        const res = await fetch(`http://localhost:8000/api/reverse-geocode?lat=${targetLat}&lon=${targetLon}`);
        if (res.ok) {
          const locData = await res.json();
          targetName = locData.name;
        } else {
          targetName = "Unknown Coordinates Sector";
        }
      }

      setDisplayLocation({
        name: targetName,
        coords: `${Number(targetLat).toFixed(4)}° N, ${Number(targetLon).toFixed(4)}° E`
      });

      await initiateScan(targetLat, targetLon);

    } catch (e) {
      setErrorMsg(e.message);
      setLoading(false);
    }
  };

  const initiateScan = async (finalLat, finalLon) => {
    setIsChatOpen(false); 
    setShowAnomalies(false);
    setShowAllEvents(false); // Close modal on new scan
    
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

  const anomaliesList = scanMode === "multivariate" 
    ? (data?.anomalies || (data?.timeseries ? data.timeseries.filter(t => t.is_anomaly) : []))
    : [];

  // NEW: List of all events for the new modal
  const allEventsList = scanMode === "multivariate" 
    ? (data?.timeseries || []) 
    : (canopyData?.timeseries_sar || []);

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
              <button onClick={handleGetCurrentLocation} className="text-[#888] hover:text-[#00e5ff] transition-colors" title="Use Current Location">
                <Crosshair size={14} />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <input 
                type="text" 
                placeholder="Place name or Lat, Lon..."
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && resolveAndScan()}
                className="bg-[#0a0a0a] border border-[#222] rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-[#00e5ff] transition-colors"
              />

              {displayLocation.name && !loading && (
                <div className="bg-[#0a0a0a] border border-[#00e5ff]/30 rounded-lg p-3 flex flex-col gap-1 shadow-[0_0_15px_rgba(0,229,255,0.05)] animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center gap-2 text-[9px] font-mono text-[#888] tracking-widest uppercase">
                    <CheckCircle2 size={10} className="text-[#00e5ff]" /> Target Locked
                  </div>
                  <span className="text-xs font-mono text-[#00e5ff] truncate" title={displayLocation.name}>
                    {displayLocation.name}
                  </span>
                  <span className="text-[10px] font-mono text-[#b5b5b5]">
                    {displayLocation.coords}
                  </span>
                </div>
              )}
            </div>

            <div className="bg-[#0a0a0a] rounded-lg p-1 border border-[#222] flex text-[10px] font-mono tracking-widest font-bold mt-1">
              <button onClick={() => setScanMode("multivariate")} className={`flex-1 py-2 rounded transition-colors ${scanMode === "multivariate" ? 'bg-[#222] text-[#00e5ff]' : 'text-[#666] hover:text-white'}`}>MULTIVARIATE</button>
              <button onClick={() => setScanMode("canopy")} className={`flex-1 py-2 rounded transition-colors ${scanMode === "canopy" ? 'bg-[#222] text-[#00e5ff]' : 'text-[#666] hover:text-white'}`}>SAR CANOPY</button>
            </div>

            <button onClick={resolveAndScan} disabled={loading} className="w-full bg-[#111] text-[#00e5ff] border border-[#00e5ff]/30 font-mono text-xs tracking-widest uppercase py-3 rounded-lg hover:bg-[#00e5ff]/10 transition-all disabled:opacity-40">
              {loading ? "EXECUTING..." : "INITIATE SCAN"}
            </button>
            {errorMsg && <p className="text-[#ff2a2a] text-xs font-mono border border-[#ff2a2a]/20 bg-[#ff2a2a]/5 p-2 rounded">{errorMsg}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            
            {/* NEW: CLICKABLE TOTAL EVENTS CARD */}
            <div 
              onClick={() => currentEvents > 0 && setShowAllEvents(true)}
              className={`bg-[#111] border rounded-xl p-4 flex flex-col justify-between h-28 transition-all shadow-lg ${currentEvents > 0 ? 'border-[#00e5ff]/40 cursor-pointer hover:bg-[#00e5ff]/10 shadow-[0_0_15px_rgba(0,229,255,0.05)]' : 'border-[#222]'}`}
            >
              <div className="flex items-center justify-between text-[#888] font-mono text-[10px] tracking-wider">
                <span className={currentEvents > 0 ? "text-[#00e5ff]" : ""}>TOTAL EVENTS</span>
                <Database size={12} className={currentEvents > 0 ? "text-[#00e5ff]" : ""} />
              </div>
              <p className={`text-3xl font-light font-mono mt-2 ${currentEvents > 0 ? 'text-[#00e5ff]' : 'text-white'}`}>
                {currentEvents || "---"}
              </p>
            </div>

            {/* EXISTING CLICKABLE ANOMALIES CARD */}
            <div 
              onClick={() => currentAnomalies > 0 && setShowAnomalies(true)}
              className={`bg-[#111] border rounded-xl p-4 flex flex-col justify-between h-28 transition-all shadow-lg ${currentAnomalies > 0 ? 'border-[#ff2a2a]/40 shadow-[0_0_15px_rgba(255,42,42,0.05)] cursor-pointer hover:bg-[#ff2a2a]/10' : 'border-[#222]'}`}
            >
              <div className="flex items-center justify-between text-[#888] font-mono text-[10px] tracking-wider">
                <span className={currentAnomalies > 0 ? "text-[#ff2a2a]" : ""}>{scanMode === 'canopy' ? 'DEF. FLAG' : 'ANOMALIES'}</span>
                <ShieldAlert size={12} className={currentAnomalies > 0 ? "text-[#ff2a2a] animate-pulse" : ""} />
              </div>
              <p className={`text-3xl font-light font-mono mt-2 ${currentAnomalies > 0 ? 'text-[#ff2a2a]' : 'text-white'}`}>
                {currentAnomalies !== undefined ? currentAnomalies : "---"}
              </p>
            </div>
            
          </div>

          <div className="bg-[#111] border border-[#222] rounded-xl flex flex-col flex-grow min-h-[300px] shadow-lg">
            <div className="flex items-center gap-2 font-mono text-xs font-bold text-white p-3 tracking-wider uppercase border-b border-[#222]">
              <Terminal size={14} className="text-[#ff2a2a]" /> Legal Prosecution Dossier
            </div>
            <div className="flex-grow overflow-y-auto custom-scrollbar p-4 text-xs text-[#b5b5b5] font-serif leading-relaxed">
              {dossierText ? dossierText.split("\n").map((para, i) => (
                <p key={i} className="mb-3 pl-3 border-l border-[#333] text-justify" dangerouslySetInnerHTML={{ __html: para.replace(/\*\*(.*?)\*\*/g, '<strong class="text-[#00e5ff] font-mono tracking-wide">$1</strong>') }} />
              )) : <div className="h-full flex items-center justify-center font-mono text-[11px] text-[#555] text-center px-4">Awaiting spatial synthesis to construct payload...</div>}
            </div>
          </div>
        </div>

        <div className="col-span-12 md:col-span-8 xl:col-span-9 flex flex-col gap-4 h-full min-h-0">
          <div className="flex-grow bg-[#111] border border-[#222] rounded-xl relative overflow-hidden z-0 shadow-lg">
            <MapVisualizer lat={parseFloat(lat)} lon={parseFloat(lon)} anomalyCount={currentAnomalies} isTargetLoaded={isTargetLoaded} />
          </div>
          <div className="h-1/3 min-h-[180px] bg-[#111] border border-[#222] rounded-xl p-4 flex flex-col z-0 shadow-lg">
            <div className="flex justify-between items-center mb-3 border-b border-[#222] pb-2">
              <h3 className="text-[#00e5ff] text-xs font-mono uppercase tracking-widest font-bold">
                {scanMode === "multivariate" ? "MULTIVARIATE SENSOR FUSION (S5P + LST + AOD)" : "SAR BACKSCATTER TELEMETRY (SENTINEL-1)"}
              </h3>
            </div>
            <div className="flex-grow min-h-0">
              {data?.timeseries && scanMode === "multivariate" ? <AnomalyChart data={data.timeseries} /> : canopyData?.timeseries_sar && scanMode === "canopy" ? <SarChart data={canopyData.timeseries_sar} /> : <div className="h-full flex items-center justify-center text-[#555] font-mono text-xs">Telemetry chart payload offline. Run scan to mount data.</div>}
            </div>
          </div>
        </div>
      </div>

      {/* NEW: ALL EVENTS MODAL */}
      {showAllEvents && (
        <div className="fixed inset-0 z-[999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#0a0a0a] border border-[#00e5ff]/30 rounded-xl w-full max-w-4xl overflow-hidden shadow-[0_0_50px_rgba(0,229,255,0.15)] flex flex-col max-h-[80vh]">
            <div className="flex items-center justify-between p-4 border-b border-[#222] bg-[#111]">
              <h3 className="text-[#00e5ff] text-sm font-mono font-bold flex items-center gap-2 tracking-widest uppercase">
                <Database size={16} /> Complete Telemetry Log
              </h3>
              <button onClick={() => setShowAllEvents(false)} className="text-[#666] hover:text-white transition-colors"><X size={18} /></button>
            </div>
            <div className="overflow-y-auto p-4 custom-scrollbar">
              {scanMode === "multivariate" && allEventsList.length > 0 ? (
                <table className="w-full text-left font-mono text-xs text-[#b5b5b5]">
                  <thead className="text-[#888] border-b border-[#333]">
                    <tr>
                      <th className="pb-3 font-normal">TIMESTAMP</th>
                      <th className="pb-3 font-normal">STATUS</th>
                      <th className="pb-3 font-normal">THREAT SCORE</th>
                      <th className="pb-3 font-normal">HEAT (LST °C)</th>
                      <th className="pb-3 font-normal">GAS (S5P)</th>
                      <th className="pb-3 font-normal">AEROSOL (AOD)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allEventsList.map((a, i) => (
                      <tr key={i} className={`border-b border-[#222] transition-colors ${a.is_anomaly ? 'bg-[#ff2a2a]/5 hover:bg-[#ff2a2a]/10' : 'hover:bg-[#111]'}`}>
                        <td className="py-3 text-white">{a.date}</td>
                        <td className="py-3">
                          {a.is_anomaly ? (
                            <span className="text-[#ff2a2a] flex items-center gap-1"><ShieldAlert size={10}/> ANOMALY</span>
                          ) : (
                            <span className="text-[#00e5ff]">NOMINAL</span>
                          )}
                        </td>
                        <td className={`py-3 ${a.is_anomaly ? 'text-[#ff2a2a]' : 'text-[#b5b5b5]'}`}>{a.threat_score}</td>
                        <td className="py-3">{a.modis_lst_c}</td>
                        <td className="py-3">{a.s5p_aai}</td>
                        <td className="py-3">{a.modis_aod}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : scanMode === "canopy" && allEventsList.length > 0 ? (
                <table className="w-full text-left font-mono text-xs text-[#b5b5b5]">
                  <thead className="text-[#888] border-b border-[#333]">
                    <tr>
                      <th className="pb-3 font-normal">TIMESTAMP</th>
                      <th className="pb-3 font-normal">SAR VV BACKSCATTER</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allEventsList.map((a, i) => (
                      <tr key={i} className="border-b border-[#222] hover:bg-[#111] transition-colors">
                        <td className="py-3 text-white">{a.date}</td>
                        <td className="py-3 text-[#00e5ff]">{a.sar_vv}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center font-mono text-xs text-[#555] py-4">No telemetry data available.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* EXISTING: FORENSIC ANOMALY MODAL */}
      {showAnomalies && (
        <div className="fixed inset-0 z-[999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#0a0a0a] border border-[#ff2a2a]/30 rounded-xl w-full max-w-3xl overflow-hidden shadow-[0_0_50px_rgba(255,42,42,0.15)] flex flex-col max-h-[80vh]">
            <div className="flex items-center justify-between p-4 border-b border-[#222] bg-[#111]">
              <h3 className="text-[#ff2a2a] text-sm font-mono font-bold flex items-center gap-2 tracking-widest uppercase"><ShieldAlert size={16} /> Forensic Anomaly Log</h3>
              <button onClick={() => setShowAnomalies(false)} className="text-[#666] hover:text-white transition-colors"><X size={18} /></button>
            </div>
            <div className="overflow-y-auto p-4 custom-scrollbar">
              {scanMode === "multivariate" && anomaliesList.length > 0 ? (
                <table className="w-full text-left font-mono text-xs text-[#b5b5b5]">
                  <thead className="text-[#888] border-b border-[#333]"><tr><th className="pb-3 font-normal">TIMESTAMP</th><th className="pb-3 font-normal">THREAT SCORE</th><th className="pb-3 font-normal">HEAT (LST °C)</th><th className="pb-3 font-normal">GAS (S5P)</th><th className="pb-3 font-normal">AEROSOL (AOD)</th></tr></thead>
                  <tbody>
                    {anomaliesList.map((a, i) => (
                      <tr key={i} className="border-b border-[#222] hover:bg-[#111] transition-colors"><td className="py-3 text-white">{a.date}</td><td className="py-3 text-[#ff2a2a]">{a.threat_score}</td><td className="py-3">{a.modis_lst_c}</td><td className="py-3">{a.s5p_aai}</td><td className="py-3">{a.modis_aod}</td></tr>
                    ))}
                  </tbody>
                </table>
              ) : scanMode === "canopy" && canopyData?.canopy_loss_flag ? (
                 <div className="text-[#ff2a2a] font-mono text-xs p-4 bg-[#ff2a2a]/10 border border-[#ff2a2a]/20 rounded">CRITICAL: Significant SAR backscatter drop detected. This signature is highly indicative of severe canopy/biomass loss over the designated monitoring period.</div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* FLOATING RAG BOT CHAT */}
      {isTargetLoaded && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
          {isChatOpen ? (
            <div className="animate-in fade-in zoom-in-95 duration-200 origin-bottom-right">
              <RagChat targetLoaded={isTargetLoaded} lat={lat} lon={lon} anomalyCount={currentAnomalies} onClose={() => setIsChatOpen(false)} />
            </div>
          ) : (
            <div className="relative group flex items-center">
              <div className="absolute right-full mr-5 whitespace-nowrap bg-[#111] border border-[#222] text-[#ededed] font-mono text-[10px] px-3 py-2 rounded-lg shadow-xl flex items-center gap-2 pointer-events-none transform translate-x-2 opacity-80 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00e5ff] animate-pulse"></span>CIPHER.AI // Ready for interrogation.
                <div className="absolute right-[-5px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[5px] border-l-[#222]"></div>
              </div>
              <button onClick={() => setIsChatOpen(true)} className="h-16 w-16 rounded-full overflow-hidden border-2 border-[#00e5ff] shadow-[0_0_30px_rgba(0,229,255,0.4)] hover:scale-105 hover:shadow-[0_0_40px_rgba(0,229,255,0.6)] transition-all duration-300 cursor-pointer relative group-hover:ring-4 ring-[#00e5ff]/20">
                <img src="https://api.dicebear.com/7.x/bottts-neutral/svg?seed=Cipher&backgroundColor=00e5ff" alt="Cipher.AI Avatar" className="w-full h-full object-cover" />
                <div className="absolute inset-0 rounded-full border border-white/20 animate-pulse"></div>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}