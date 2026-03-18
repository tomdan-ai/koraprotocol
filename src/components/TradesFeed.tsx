'use client'
import React from 'react'
import { Clock } from 'lucide-react'

type Props = {
  trades?: any[]
}

export default function TradesFeed({ trades = [] }: Props) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-zinc-500" />
          <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">Recent Trades</h3>
        </div>
        <div className="text-xs text-zinc-500">Latest</div>
      </div>
      <div className="mt-3 space-y-1 overflow-hidden rounded-xl border border-zinc-100 bg-white p-2 text-sm shadow-sm dark:bg-[#04121a] dark:border-zinc-800">
        {trades.length === 0 && <div className="p-4 text-xs text-zinc-500">No recent trades</div>}
        {trades.map((t, idx) => (
          <div key={t.tradeId ?? idx} className="flex items-center justify-between px-3 py-2 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900">
            <div>
              <div className="font-medium text-zinc-900 dark:text-zinc-50">{t.price ?? t.p}</div>
              <div className="text-xs text-zinc-500">{t.size ?? t.quantity}</div>
            </div>
            <div className={`text-sm font-semibold ${t.side === 'buy' ? 'text-emerald-600' : 'text-rose-500'}`}>
              {t.side ?? t.s ?? '—'}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
