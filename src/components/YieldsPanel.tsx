'use client'
import React from 'react'

type Props = {
  data?: { stakingApy?: number; inflation?: number; bondedRatio?: number }
}

function formatPct(value: unknown) {
  const n = Number(value)
  if (Number.isFinite(n)) return `${n.toFixed(2)}%`
  return '—'
}

export default function YieldsPanel({ data }: Props) {
  return (
    <div className="flex flex-col h-full uppercase tracking-wider">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-bold text-zinc-400">Yield Analytics</h3>
          <p className="text-[10px] text-zinc-500 mt-1 font-mono tracking-normal leading-none italic">Verified Staking Metrics</p>
        </div>
        <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
      </div>

      <div className="flex flex-col gap-4">
        <div className="group relative p-4 rounded-2xl bg-white/5 border border-white/5 transition-all duration-300 hover:border-cyan-500/30">
          <div className="text-[10px] font-bold text-zinc-500 mb-1">STAKING APY</div>
          <div className="text-2xl font-black text-cyan-400 font-mono tracking-tighter drop-shadow-[0_0_10px_rgba(34,211,238,0.3)]">
            {formatPct(data?.stakingApy)}
          </div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20 group-hover:opacity-40 transition-opacity">
            <svg className="w-8 h-8 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/5 transition-all duration-300 hover:border-purple-500/30">
            <div className="text-[10px] font-bold text-zinc-500 mb-1">INFLATION</div>
            <div className="text-xl font-bold text-purple-400 font-mono tracking-tighter">
              {formatPct(data?.inflation)}
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/5 transition-all duration-300 hover:border-emerald-500/30">
            <div className="text-[10px] font-bold text-zinc-500 mb-1">BONDED</div>
            <div className="text-xl font-bold text-emerald-400 font-mono tracking-tighter">
              {formatPct(data?.bondedRatio)}
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-8 pt-4 border-t border-white/5">
        <div className="flex items-center justify-between text-[10px] font-mono text-zinc-600">
          <span>TX_LOAD: NOMINAL</span>
          <span>LATENCY: 42MS</span>
        </div>
      </div>
    </div>
  )
}
