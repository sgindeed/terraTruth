import React, { useState, useRef, useEffect } from 'react';
import { Send, Activity, ShieldCheck, X } from 'lucide-react';

export default function RagChat({ targetLoaded, lat, lon, anomalyCount, onClose }) {
  const [messages, setMessages] = useState([
    { role: 'system', content: 'SECURE LEGAL RAG UPLINK ESTABLISHED. Cipher.AI awaiting operator query.' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !targetLoaded) return;

    const userQuery = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userQuery }]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch("http://localhost:8000/api/query-legal-database", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          query: userQuery, 
          location_context: `Lat: ${lat}, Lon: ${lon}`,
          anomaly_count: anomalyCount || 0,
          n_results: 2 
        })
      });
      
      const result = await response.json();
      if (!response.ok) throw new Error("Query failed");

      setMessages(prev => [...prev, { role: 'system', content: result.response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'error', content: "CONNECTION REFUSED. CIPHER ENGINE OFFLINE." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[500px] w-[350px] sm:w-[400px] bg-[#0a0a0a]/95 backdrop-blur-md border border-[#222] rounded-xl shadow-[0_0_40px_rgba(0,0,0,0.8)] overflow-hidden font-mono transform transition-all duration-300">
      
      {/* Upgraded Header with Avatar Mini-Icon */}
      <div className="flex items-center justify-between p-3 border-b border-[#222] bg-[#111]">
        <div className="flex items-center gap-3 text-[#00e5ff] text-xs font-bold tracking-widest uppercase">
          <img 
            src="https://api.dicebear.com/7.x/bottts-neutral/svg?seed=Cipher&backgroundColor=00e5ff" 
            alt="Cipher AI" 
            className="w-7 h-7 rounded-full border border-[#00e5ff] shadow-[0_0_10px_rgba(0,229,255,0.4)]"
          />
          CIPHER.AI Terminal
        </div>
        <button onClick={onClose} className="text-[#666] hover:text-[#ff2a2a] transition-colors">
          <X size={18} />
        </button>
      </div>

      <div className="flex-grow overflow-y-auto custom-scrollbar p-3 space-y-4 text-xs" ref={scrollRef}>
        {!targetLoaded && (
          <div className="flex flex-col items-center justify-center h-full text-[#555] opacity-50">
            <ShieldCheck size={24} className="mb-2" />
            <p>AWAITING TARGET LOCK</p>
          </div>
        )}
        
        {targetLoaded && messages.map((msg, idx) => (
          <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <span className={`text-[9px] mb-1 opacity-50 ${msg.role === 'user' ? 'text-[#00e5ff]' : 'text-[#888]'}`}>
              {msg.role === 'user' ? 'OPERATOR' : 'CIPHER.AI'}
            </span>
            <div className={`p-2 rounded max-w-[90%] whitespace-pre-wrap ${
              msg.role === 'user' 
                ? 'bg-[#00e5ff]/10 border border-[#00e5ff]/30 text-[#00e5ff]' 
                : msg.role === 'error'
                ? 'bg-[#ff2a2a]/10 border border-[#ff2a2a]/30 text-[#ff2a2a]'
                : 'bg-[#1a1a1a] border border-[#333] text-[#b5b5b5]'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex items-center gap-2 text-[#888] text-[10px]">
            <Activity size={10} className="animate-spin text-[#00e5ff]" /> Synthesizing telemetry and statutes...
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="p-3 border-t border-[#222] bg-[#0a0a0a] flex gap-2">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={!targetLoaded || isTyping}
          placeholder={targetLoaded ? "Query database..." : "Locked."}
          className="flex-grow bg-transparent border-b border-[#333] focus:border-[#00e5ff] text-[#ededed] text-xs px-2 py-1 outline-none disabled:opacity-50 transition-colors"
        />
        <button 
          type="submit" 
          disabled={!targetLoaded || isTyping || !input.trim()}
          className="text-[#888] hover:text-[#00e5ff] disabled:opacity-30 transition-colors"
        >
          <Send size={14} />
        </button>
      </form>
    </div>
  );
}