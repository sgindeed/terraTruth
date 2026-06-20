import React from 'react';
import { MapContainer, TileLayer, Circle, CircleMarker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

function SyncMapView({ center }) {
  const map = useMap();
  map.setView(center, map.getZoom());
  return null;
}

export default function MapVisualizer({ lat, lon, anomalyCount, isTargetLoaded }) {
  const position = [lat || 22.5726, lon || 88.3639];
  const isDanger = anomalyCount > 0;
  const targetColor = isDanger ? '#ff2a2a' : '#00e5ff';

  return (
    <div className="w-full h-full relative">
      <div className="absolute top-4 left-4 z-[400] bg-[#111]/90 backdrop-blur border border-[#222] px-3 py-2 rounded-lg font-mono text-[10px] text-white flex flex-col gap-1 shadow-xl">
        <div><span className="text-[#666]">LAT //</span> {position[0].toFixed(4)}</div>
        <div><span className="text-[#666]">LON //</span> {position[1].toFixed(4)}</div>
      </div>

      <MapContainer 
        center={position} 
        zoom={13} 
        zoomControl={false} 
        style={{ height: '100%', width: '100%', backgroundColor: '#050505' }}
      >
        <SyncMapView center={position} />
        
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution="Tiles &copy; Esri"
        />

        <div className="absolute inset-0 z-[200] bg-black/40 pointer-events-none"></div>

        {isTargetLoaded && (
          <>
            <Circle 
              center={position} 
              pathOptions={{ color: targetColor, fillColor: targetColor, fillOpacity: 0.1, weight: 1.5, dashArray: "4 4" }} 
              radius={3000} 
            />
            <CircleMarker 
              center={position} 
              pathOptions={{ color: targetColor, fillColor: targetColor, fillOpacity: 1, weight: 1 }} 
              radius={6} 
            />
          </>
        )}
      </MapContainer>
    </div>
  );
}