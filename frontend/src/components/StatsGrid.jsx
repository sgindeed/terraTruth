import React from 'react';
import { ShieldAlert, Database } from 'lucide-react';

export default function StatsGrid({ total, anomalies }) {
  const hasAnomalies = anomalies > 0;

  return (
    <div className="grid grid-cols-1 gap-4">
      <div className="glass-panel p-5 relative overflow-hidden">
        <div className="flex justify-between items-start mb-4">
          <span className="font-mono text-xs text-textMuted uppercase">Data Points</span>
          <Database size={16} className="text-primary" />
        </div>
        <p className="text-4xl font-light tracking-tight">{total || 0}</p>
      </div>

      <div className={`glass-panel p-5 relative overflow-hidden transition-all duration-500 ${hasAnomalies ? 'shadow-glow-danger border-danger/30' : ''}`}>
        <div className="flex justify-between items-start mb-4">
          <span className={`font-mono text-xs uppercase ${hasAnomalies ? 'text-danger' : 'text-textMuted'}`}>Anomalies</span>
          <ShieldAlert size={16} className={hasAnomalies ? 'text-danger' : 'text-textMuted'} />
        </div>
        <p className={`text-4xl font-light tracking-tight ${hasAnomalies ? 'text-danger' : 'text-white'}`}>{anomalies || 0}</p>
        
        {hasAnomalies && (
          <div className="absolute top-0 right-0 w-32 h-32 bg-danger/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
        )}
      </div>
    </div>
  );
}