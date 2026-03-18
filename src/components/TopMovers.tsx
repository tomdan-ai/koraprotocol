'use client'
import React from 'react'
import { TrendingUp } from 'lucide-react'

type Props = {
  markets: any[]
  onSelect?: (id: string) => void
}

export default function TopMovers({ markets = [], onSelect }: Props) {
  const top = markets.slice(0, 10)
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
            <TrendingUp size={16} />
          </div>
          <h3 className="text-sm font-bold tracking-wider text-zinc-400 uppercase">Top Movers</h3>
        </div>
        <span className="text-[10px] font-mono text-zinc-500 bg-zinc-800/50 px-2 py-0.5 rounded-md border border-white/5 tracking-widest">24H</span>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto pr-1 scrollbar-hide">
        {top.map((m, idx) => {
          const isNegative = m.change && m.change.toString().startsWith('-');
          const val = m.id ?? m.marketId ?? `${m.base}-${m.quote}`;
          return (
            <button
              key={val}
              onClick={() => onSelect?.(val)}
              className="flex w-full items-center justify-between gap-3 px-4 py-3 rounded-xl border border-white/5 bg-white/5 transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:scale-[1.02] active:scale-[0.98] group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 border border-white/10 flex items-center justify-center text-[10px] font-bold text-zinc-400 group-hover:border-cyan-500/50 transition-colors">
                  {(m.base ?? 'A')[0]}
                </div>
                <div className="flex flex-col text-left">
                  <div className="text-sm font-bold text-zinc-100">{m.name ?? m.marketId ?? `${m.base}/${m.quote}`}</div>
                  <div className="text-[10px] text-zinc-500 font-mono uppercase">{m.base ?? '---'}</div>
                </div>
              </div>
              <div className={`px-2.5 py-1 rounded-lg text-xs font-bold tabular-nums border ${
                isNegative 
                  ? 'text-rose-400 bg-rose-400/10 border-rose-400/20' 
                  : 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20'
              }`}>
                {m.change ?? '+0.0%'}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  )
}
