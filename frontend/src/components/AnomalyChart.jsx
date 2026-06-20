import React from 'react';
import { ResponsiveContainer, ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export default function AnomalyChart({ data }) {
  if (!data || data.length === 0) return null;

  const chartData = data.map(d => ({
    ...d,
    anomalyHighlight: d.is_anomaly ? Math.max(d.modis_lst_c || 50, 50) : 0 
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={chartData} margin={{ top: 10, right: -5, left: -25, bottom: 0 }}>
        <CartesianGrid strokeDasharray="2 2" stroke="#222" />
        <XAxis dataKey="date" stroke="#444" tick={{fill: '#666', fontSize: 10, fontFamily: 'monospace'}} />
        <YAxis yAxisId="left" stroke="#444" tick={{fill: '#666', fontSize: 10, fontFamily: 'monospace'}} />
        <YAxis yAxisId="right" orientation="right" stroke="#444" tick={{fill: '#666', fontSize: 10, fontFamily: 'monospace'}} />
        
        <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: '#333', color: '#fff', fontFamily: 'monospace', fontSize: '11px' }} />
        <Legend wrapperStyle={{ fontFamily: 'monospace', fontSize: '10px', paddingTop: '5px' }} />

        <Bar yAxisId="right" dataKey="anomalyHighlight" fill="#ff2a2a" opacity={0.15} name="Anomaly Triggered" barSize={24} />
        <Line connectNulls={true} yAxisId="right" type="monotone" dataKey="modis_lst_c" name="MODIS LST (°C)" stroke="#ffaa00" strokeWidth={1.5} dot={false} />
        <Line connectNulls={true} yAxisId="left" type="monotone" dataKey="s5p_aai" name="S5P AAI" stroke="#00e5ff" strokeWidth={1.5} dot={false} />
        <Line connectNulls={true} yAxisId="left" type="monotone" dataKey="modis_aod" name="MODIS AOD" stroke="#3b82f6" strokeWidth={1.5} dot={false} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}