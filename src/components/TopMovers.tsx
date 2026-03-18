'use client'
import React from 'react'

type Props = {
  markets: any[]
  onSelect?: (id: string) => void
}

export default function TopMovers({ markets = [], onSelect }: Props) {
  const top = markets.slice(0, 10)
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">Top Movers</h3>
        <span className="text-xs text-zinc-500">24h</span>
      </div>
      <div className="divide-y divide-zinc-100 rounded-lg border border-zinc-100 bg-white p-2 dark:bg-[#071018] dark:border-zinc-800">
        {top.map((m, idx) => (
          <button
            key={m.id ?? m.marketId ?? idx}
            onClick={() => onSelect?.(m.id ?? m.marketId ?? `${m.base}-${m.quote}`)}
            className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left hover:bg-zinc-50 dark:hover:bg-zinc-900"
          >
            <div>
              <div className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{m.name ?? m.marketId ?? `${m.base}/${m.quote}`}</div>
              <div className="text-xs text-zinc-500">{m.base ?? ''}</div>
            </div>
            <div className="text-sm font-semibold text-emerald-600">{m.change ?? '+0.0%'}</div>
          </button>
        ))}
      </div>
    </div>
  )
}
