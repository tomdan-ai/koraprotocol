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
    <div className="min-h-screen bg-zinc-50 p-6 dark:bg-black">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Kora — Live Dashboard</h1>
          <div className="w-64">
            <MarketSelector markets={markets} value={selected} onChange={(v) => setSelected(v)} />
          </div>
        </header>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-lg bg-transparent">
              <OrderbookDepth bids={orderbook.bids} asks={orderbook.asks} />
            </div>
            <div className="mt-2">
              <TradesFeed trades={trades} />
            </div>
          </div>

          <aside className="space-y-6">
            <TopMovers markets={markets} onSelect={(id) => setSelected(id)} />
            <YieldsPanel data={yields} />
          </aside>
        </div>
      </div>
    </div>
  )
}
