import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export default function SarChart({ data }) {
  if (!data || data.length === 0) return null;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorSar" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#00e5ff" stopOpacity={0.4}/>
            <stop offset="95%" stopColor="#00e5ff" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="2 2" stroke="#222" />
        <XAxis dataKey="date" stroke="#444" tick={{fill: '#666', fontSize: 10, fontFamily: 'monospace'}} />
        <YAxis stroke="#444" tick={{fill: '#666', fontSize: 10, fontFamily: 'monospace'}} domain={['auto', 'auto']} />
        
        <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: '#333', color: '#fff', fontFamily: 'monospace', fontSize: '11px' }} />
        
        <Area 
          type="monotone" 
          dataKey="sar_vv" 
          name="SAR VV Backscatter" 
          stroke="#00e5ff" 
          fill="url(#colorSar)" 
          strokeWidth={2} 
          activeDot={{ r: 4, fill: '#00e5ff', strokeWidth: 0 }} 
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}