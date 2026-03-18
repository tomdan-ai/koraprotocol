'use client'
import React from 'react'
import { Clock } from 'lucide-react'

type Props = {
  trades?: any[]
}

export default function TradesFeed({ trades = [] }: Props) {
  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
            <Clock size={16} />
          </div>
          <h3 className="text-sm font-bold tracking-wider text-zinc-400 uppercase">Live Trades</h3>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-zinc-800/50 border border-white/5">
           <div className="h-1 w-1 rounded-full bg-emerald-500" />
           <span className="text-[10px] font-mono text-zinc-400">SYNCED</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {trades.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 opacity-50">
            <div className="w-8 h-8 rounded-full border-2 border-dashed border-zinc-700 animate-spin" />
            <span className="text-xs font-mono text-zinc-500 uppercase">Waiting for data...</span>
          </div>
        ) : (
          <div className="space-y-2">
            {trades.map((t, idx) => {
              const isBuy = t.side === 'buy' || t.s === 'buy';
              return (
                <div 
                  key={t.tradeId ?? idx} 
                  className={`group relative flex items-center justify-between px-4 py-3 rounded-xl border border-white/5 bg-white/5 transition-all duration-300 hover:bg-white/10 ${
                    idx === 0 ? 'animate-in fade-in slide-in-from-left-4 duration-500 ring-1 ring-white/10' : ''
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-bold font-mono text-zinc-100 tabular-nums">
                      {t.price ?? t.p}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-tighter">
                      Size: {t.size ?? t.quantity}
                    </span>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                      isBuy 
                        ? 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20 shadow-[0_0_10px_rgba(34,211,238,0.1)]' 
                        : 'text-rose-400 bg-rose-400/10 border-rose-400/20 shadow-[0_0_10px_rgba(244,63,94,0.1)]'
                    }`}>
                      {isBuy ? 'BUY' : 'SELL'}
                    </span>
                    <span className="text-[9px] text-zinc-600 font-mono">
                      {new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>

                  {/* Flash effect for newest trade */}
                  {idx === 0 && (
                    <div className={`absolute inset-0 rounded-xl pointer-events-none animate-pulse-once opacity-0 ${isBuy ? 'bg-cyan-500/10' : 'bg-rose-500/10'}`} />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  )
}
