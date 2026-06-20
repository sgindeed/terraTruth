import React from 'react';
import { Scale, Fingerprint } from 'lucide-react';

export default function Dossier({ report, target, hash }) {
  if (!report) return null;

  return (
    <div className="h-full flex flex-col relative group">
      {/* Decorative top border */}
      <div className="h-1 w-full bg-gradient-to-r from-primary/20 via-primary to-primary/20"></div>
      
      <div className="p-5 flex-grow flex flex-col min-h-0 bg-[#0a0a0a]/50">
        <header className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-white text-sm font-semibold uppercase tracking-widest flex items-center gap-2 mb-1">
              <Scale size={16} className="text-primary"/> Executive Dossier
            </h3>
            {target && <p className="text-xs font-mono text-textMuted">DEFENDANT: <span className="text-white">{target}</span></p>}
          </div>
          {hash && (
            <div className="text-right">
              <span className="flex items-center gap-1 text-[10px] font-mono text-textMuted justify-end mb-1">
                <Fingerprint size={10} /> SHA-256 SIGNATURE
              </span>
              <p className="text-[10px] font-mono text-white/40 max-w-[150px] truncate">{hash}</p>
            </div>
          )}
        </header>

        <div className="flex-grow overflow-y-auto custom-scrollbar pr-4 font-mono text-sm leading-relaxed text-textMain/90">
          {report.split('\n').map((paragraph, idx) => {
            if (!paragraph.trim()) return null;
            return (
              <p key={idx} className="mb-4 pl-4 border-l border-surfaceBorder group-hover:border-primary/50 transition-colors duration-500">
                {paragraph}
              </p>
            );
          })}
        </div>
      </div>
    </div>
  );
}