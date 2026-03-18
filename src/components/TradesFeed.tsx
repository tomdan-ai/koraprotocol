'use client'
import React from 'react'

type Props = {
  trades?: any[]
}

export default function TradesFeed({ trades = [] }: Props) {
  return (
    <div className="w-full">
      <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">Recent Trades</h3>
      <div className="mt-2 space-y-2 rounded-lg border border-zinc-100 bg-white p-2 text-sm dark:bg-[#04121a] dark:border-zinc-800">
        {trades.length === 0 && <div className="p-4 text-xs text-zinc-500">No recent trades</div>}
        {trades.map((t, idx) => (
          <div key={t.tradeId ?? idx} className="flex items-center justify-between px-2 py-2">
            <div>
              <div className="font-medium text-zinc-900 dark:text-zinc-50">{t.price ?? t.p}</div>
              <div className="text-xs text-zinc-500">{t.size ?? t.quantity}</div>
            </div>
            <div className={`text-sm font-medium ${t.side === 'buy' ? 'text-emerald-600' : 'text-rose-500'}`}>
              {t.side ?? t.s ?? '—'}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
