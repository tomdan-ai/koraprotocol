'use client'
import React, { useMemo } from 'react'

type Props = {
  bids?: [number, number][]
  asks?: [number, number][]
}

function accumulateDepth(entries: [number, number][]) {
  // entries: [price, size]
  const sorted = [...entries].sort((a, b) => a[0] - b[0])
  const acc: { price: number; size: number; cum: number }[] = []
  let total = 0
  for (const [price, size] of sorted) {
    total += size
    acc.push({ price, size, cum: total })
  }
  return acc
}

export default function OrderbookDepth({ bids = [], asks = [] }: Props) {
  const bidAcc = useMemo(() => accumulateDepth(bids), [bids])
  const askAcc = useMemo(() => accumulateDepth(asks), [asks])

  const maxCum = Math.max(
    bidAcc.length ? bidAcc[bidAcc.length - 1].cum : 0,
    askAcc.length ? askAcc[askAcc.length - 1].cum : 0,
  )

  // render a simple SVG area chart: bids on left (green), asks on right (red)
  const width = 800
  const height = 260
  const mid = width / 2

  const buildPath = (arr: { price: number; size: number; cum: number }[], left: boolean) => {
    if (!arr.length) return ''
    const points = arr.map((p, i) => {
      const x = left ? mid - (p.cum / maxCum) * (mid - 20) : mid + (p.cum / maxCum) * (mid - 20)
      const y = height - (i / (arr.length - 1 || 1)) * (height - 40) - 20
      return `${x.toFixed(2)},${y.toFixed(2)}`
    })
    // close path to baseline
    const baselineX = left ? mid : mid
    const top = points.join(' ')
    const last = points[points.length - 1]
    const first = points[0]
    return `M ${baselineX},${height - 20} L ${first} L ${top} L ${last} L ${baselineX},${height - 20} Z`
  }

  const bidPath = buildPath(bidAcc.slice().reverse(), true)
  const askPath = buildPath(askAcc, false)

  return (
    <div className="w-full rounded-lg bg-white p-3 shadow-sm dark:bg-[#04121a]">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">Orderbook Depth</div>
          <div className="text-xs text-zinc-500">Live snapshot</div>
        </div>
      </div>
      <div className="mt-3 overflow-hidden rounded-md">
        <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} preserveAspectRatio="none">
          <defs>
            <linearGradient id="gBid" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.02" />
            </linearGradient>
            <linearGradient id="gAsk" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.16" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          {bidPath && <path d={bidPath} fill="url(#gBid)" stroke="#10B981" strokeWidth={1} />}
          {askPath && <path d={askPath} fill="url(#gAsk)" stroke="#ef4444" strokeWidth={1} />}
          {/* center line */}
          <line x1={mid} y1={10} x2={mid} y2={height - 10} stroke="#e6e6e6" strokeWidth={1} />
        </svg>
      </div>
    </div>
  )
}
