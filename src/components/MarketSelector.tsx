'use client'
import React from 'react'

type Props = {
  markets: any[]
  value?: string
  onChange?: (m: string) => void
}

export default function MarketSelector({ markets = [], value, onChange }: Props) {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200">Market</label>
      <div className="mt-2">
        <select
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:bg-[#0b0b0b] dark:border-zinc-800"
        >
          {markets.map((m) => (
            <option key={m.id ?? m.marketId ?? m.base} value={m.id ?? m.marketId ?? `${m.base}-${m.quote}`}>
              {m.name ?? m.marketId ?? `${m.base}/${m.quote}`}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
