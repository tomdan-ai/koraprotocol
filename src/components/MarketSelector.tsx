'use client'
import React from 'react'
import { ChevronDown } from 'lucide-react'

type Props = {
  markets: any[]
  value?: string
  onChange?: (m: string) => void
}

export default function MarketSelector({ markets = [], value, onChange }: Props) {
  return (
    <div className="w-full">
      <label className="block text-xs font-semibold tracking-wide text-zinc-600 dark:text-zinc-300">Market</label>
      <div className="mt-2 relative">
        <select
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className="appearance-none w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm transition-shadow duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:bg-[#071018] dark:border-zinc-800 dark:text-zinc-100"
        >
          {markets.map((m) => (
            <option key={m.id ?? m.marketId ?? m.base} value={m.id ?? m.marketId ?? `${m.base}-${m.quote}`}>
              {m.name ?? m.marketId ?? `${m.base}/${m.quote}`}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-zinc-400">
          <ChevronDown size={16} />
        </div>
      </div>
    </div>
  )
}
