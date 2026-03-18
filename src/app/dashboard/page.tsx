"use client"
import React, { useEffect, useState } from 'react'
import MarketSelector from '@/components/MarketSelector'
import TopMovers from '@/components/TopMovers'
import OrderbookDepth from '@/components/OrderbookDepth'
import TradesFeed from '@/components/TradesFeed'
import { useOrderbookStream } from '@/hooks/useOrderbookStream'
import { useTradesStream } from '@/hooks/useTradesStream'
import YieldsPanel from '@/components/YieldsPanel'

export default function DashboardPage() {
  const [markets, setMarkets] = useState<any[]>([])
  const [selected, setSelected] = useState<string | undefined>(undefined)
  const [trades, setTrades] = useState<any[]>([])
  const [orderbook, setOrderbook] = useState<{ bids: any[]; asks: any[] }>({ bids: [], asks: [] })
  const [yields, setYields] = useState<any>(null)

  useEffect(() => {
    fetch('/api/markets')
      .then((r) => r.json())
      .then((data) => {
        setMarkets(data || [])
        if (data && data.length > 0) setSelected(data[0].id ?? data[0].marketId ?? `${data[0].base}-${data[0].quote}`)
      })
      .catch(() => {})
  }, [])

  // use real-time streams when available
  const streamedOrderbook = useOrderbookStream(selected)
  const streamedTrades = useTradesStream(selected)

  useEffect(() => {
    if (streamedOrderbook) setOrderbook(streamedOrderbook)
  }, [streamedOrderbook])

  useEffect(() => {
    if (streamedTrades && streamedTrades.length) setTrades(streamedTrades)
  }, [streamedTrades])

  useEffect(() => {
    fetch('/api/yields')
      .then((r) => r.json())
      .then((d) => setYields(d))
      .catch(() => {})
  }, [])

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 font-sans">
      <div className="mx-auto max-w-[1400px] flex flex-col gap-8">
        <header className="flex w-full flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4 backdrop-blur-md bg-white/5 dark:bg-black/20 border border-white/10 dark:border-white/5 rounded-2xl px-6 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.5)]">
               <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
               </svg>
            </div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Kora Terminal</h1>
          </div>
          <div className="w-full sm:w-80">
            <MarketSelector markets={markets} value={selected} onChange={(v) => setSelected(v)} />
          </div>
        </header>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-4">
          <div className="xl:col-span-3 flex flex-col gap-6">
            <div className="flex-1 rounded-3xl bg-white/5 dark:bg-black/40 backdrop-blur-xl border border-white/10 dark:border-white/5 shadow-2xl overflow-hidden transition-all duration-300 hover:border-cyan-500/30 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12),0_0_20px_rgba(6,182,212,0.1)]">
              <div className="p-6 h-full flex flex-col">
                <OrderbookDepth bids={orderbook.bids} asks={orderbook.asks} />
              </div>
            </div>
            <div className="h-96 rounded-3xl bg-white/5 dark:bg-black/40 backdrop-blur-xl border border-white/10 dark:border-white/5 shadow-2xl overflow-hidden transition-all duration-300 hover:border-indigo-500/30 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12),0_0_20px_rgba(99,102,241,0.1)]">
              <div className="p-6 h-full flex flex-col">
                <TradesFeed trades={trades} />
              </div>
            </div>
          </div>

          <aside className="flex flex-col gap-6">
            <div className="rounded-3xl bg-white/5 dark:bg-black/40 backdrop-blur-xl border border-white/10 dark:border-white/5 shadow-2xl p-6 transition-all duration-300 hover:border-purple-500/30 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12),0_0_20px_rgba(168,85,247,0.1)] flex-1">
               <TopMovers markets={markets} onSelect={(id) => setSelected(id)} />
            </div>
            <div className="rounded-3xl bg-white/5 dark:bg-black/40 backdrop-blur-xl border border-white/10 dark:border-white/5 shadow-2xl p-6 transition-all duration-300 hover:border-emerald-500/30 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12),0_0_20px_rgba(16,185,129,0.1)] flex-1">
               <YieldsPanel data={yields} />
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
