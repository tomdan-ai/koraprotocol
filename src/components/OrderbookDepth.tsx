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
    <div className="w-full h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold tracking-wider text-zinc-400 uppercase">Market Depth</h3>
          <div className="flex items-center gap-2 mt-1">
             <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
             <span className="text-[10px] text-zinc-500 font-mono">LIVE FEED</span>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-cyan-500/50 border border-cyan-400" />
            <span className="text-[10px] text-zinc-400 font-medium">BIDS</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-rose-500/50 border border-rose-400" />
            <span className="text-[10px] text-zinc-400 font-medium">ASKS</span>
          </div>
        </div>
      </div>
      
      <div className="flex-1 min-h-[200px] relative mt-2 group">
        <svg 
          viewBox={`0 0 ${width} ${height}`} 
          width="100%" 
          height="100%" 
          preserveAspectRatio="none"
          className="filter drop-shadow-[0_0_8px_rgba(0,0,0,0.5)]"
        >
          <defs>
            <linearGradient id="gBid" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="gAsk" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background Grid */}
          <g stroke="white" strokeOpacity="0.03" strokeWidth="0.5">
            {[...Array(10)].map((_, i) => (
              <line key={`h-${i}`} x1="0" y1={(height / 10) * i} x2={width} y2={(height / 10) * i} />
            ))}
            {[...Array(20)].map((_, i) => (
              <line key={`v-${i}`} x1={(width / 20) * i} y1="0" x2={(width / 20) * i} y2={height} />
            ))}
          </g>

          {bidPath && (
            <path 
              d={bidPath} 
              fill="url(#gBid)" 
              stroke="#22d3ee" 
              strokeWidth={1.5} 
              filter="url(#glow)"
              className="transition-all duration-700 ease-out"
            />
          )}
          {askPath && (
            <path 
              d={askPath} 
              fill="url(#gAsk)" 
              stroke="#fb7185" 
              strokeWidth={1.5} 
              filter="url(#glow)"
              className="transition-all duration-700 ease-out"
            />
          )}

          {/* Center Price Indicator */}
          <line 
            x1={mid} y1={0} x2={mid} y2={height} 
            stroke="white" 
            strokeOpacity="0.1" 
            strokeWidth={1} 
            strokeDasharray="4 4"
          />
          
          <rect 
            x={mid - 40} y={height / 2 - 12} 
            width={80} height={24} 
            rx={12} 
            fill="black" 
            fillOpacity="0.6"
            stroke="white"
            strokeOpacity="0.2"
            className="backdrop-blur-sm"
          />
          <text 
            x={mid} y={height / 2 + 5} 
            textAnchor="middle" 
            className="fill-white text-[10px] font-bold font-mono tracking-tighter"
          >
            MID POINT
          </text>
        </svg>
      </div>
    </div>
  )
}
