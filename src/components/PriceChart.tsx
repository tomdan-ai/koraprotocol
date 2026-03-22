import { useState, useEffect, useRef, useMemo } from 'react'
import {
  createChart, ColorType, IChartApi, ISeriesApi, CandlestickSeries, Time,
} from 'lightweight-charts'
import { Market } from '../types'
import { injectiveClient } from '../api/injectiveClient'

interface PriceChartProps { market: Market | null; loading: boolean; error: string | null }
interface OhlcCandle { time: Time; open: number; high: number; low: number; close: number }
interface Timeframe { label: string; ms: number; interval: string }

const TIMEFRAMES: Timeframe[] = [
  { label: '1m',  ms: 60_000,         interval: '1 minute'  },
  { label: '5m',  ms: 300_000,        interval: '5 minutes' },
  { label: '15m', ms: 900_000,        interval: '15 minutes'},
  { label: '1H',  ms: 3_600_000,      interval: '1 hour'    },
  { label: '4H',  ms: 14_400_000,     interval: '4 hours'   },
  { label: '1D',  ms: 86_400_000,     interval: '1 day'     },
]

function buildCandles(ticks: { time: number; price: number }[], ms: number): OhlcCandle[] {
  if (!ticks.length) return []
  const buckets = new Map<number, { open: number; high: number; low: number; close: number }>()
  for (const tick of ticks) {
    const t = Math.floor(tick.time / ms) * ms
    if (!buckets.has(t)) {
      buckets.set(t, { open: tick.price, high: tick.price, low: tick.price, close: tick.price })
    } else {
      const c = buckets.get(t)!
      c.high = Math.max(c.high, tick.price)
      c.low  = Math.min(c.low, tick.price)
      c.close = tick.price
    }
  }
  return Array.from(buckets.entries()).sort(([a], [b]) => a - b)
    .map(([t, o]) => ({ time: Math.floor(t / 1000) as Time, ...o }))
}

function fmt(n: number) {
  if (n >= 10_000) return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  if (n >= 1) return n.toFixed(4)
  return n.toPrecision(4)
}

export default function PriceChart({ market, error }: PriceChartProps) {
  const [selectedTf, setSelectedTf]         = useState(TIMEFRAMES[1]) // default 5m like reference
  const [candles, setCandles]               = useState<OhlcCandle[]>([])
  const [currentPrice, setCurrentPrice]     = useState('—')
  const [hoveredCandle, setHoveredCandle]   = useState<OhlcCandle | null>(null)

  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef     = useRef<IChartApi | null>(null)
  const seriesRef    = useRef<ISeriesApi<'Candlestick'> | null>(null)
  const ticksRef     = useRef<{ time: number; price: number }[]>([])

  useEffect(() => { ticksRef.current = []; setCandles([]); setCurrentPrice('—'); setHoveredCandle(null) }, [market?.id])
  useEffect(() => { setCandles(buildCandles(ticksRef.current, selectedTf.ms)) }, [selectedTf])

  useEffect(() => {
    if (!market) return
    const poll = async () => {
      const { price } = await injectiveClient.getCurrentPrice(market)
      if (price === '0') return
      const num = parseFloat(price)
      if (isNaN(num) || num <= 0) return
      setCurrentPrice(fmt(num))
      ticksRef.current = [...ticksRef.current, { time: Date.now(), price: num }].slice(-10000)
      setCandles(buildCandles(ticksRef.current, selectedTf.ms))
    }
    poll(); const id = setInterval(poll, 1000); return () => clearInterval(id)
  }, [market, selectedTf.ms])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const chart = createChart(container, {
      layout: {
        background: { type: ColorType.Solid, color: '#161b22' },
        textColor: '#8b949e',
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: 'rgba(255,255,255,0.04)' },
        horzLines: { color: 'rgba(255,255,255,0.04)' },
      },
      crosshair: {
        vertLine: { color: 'rgba(255,255,255,0.15)', labelBackgroundColor: '#1c2128' },
        horzLine: { color: 'rgba(255,255,255,0.15)', labelBackgroundColor: '#1c2128' },
      },
      width: container.clientWidth,
      height: container.clientHeight,
      timeScale: { borderColor: 'rgba(255,255,255,0.06)', timeVisible: true, secondsVisible: false },
      rightPriceScale: { borderColor: 'rgba(255,255,255,0.06)', scaleMargins: { top: 0.08, bottom: 0.08 } },
    })

    const series = chart.addSeries(CandlestickSeries, {
      upColor: '#3fb950', downColor: '#f85149',
      borderUpColor: '#3fb950', borderDownColor: '#f85149',
      wickUpColor: '#3fb950', wickDownColor: '#f85149',
      priceFormat: { type: 'price', precision: 4, minMove: 0.0001 },
    })

    chart.subscribeCrosshairMove(param => {
      if (!param?.time) { setHoveredCandle(null); return }
      setHoveredCandle((param.seriesData.get(series) as OhlcCandle) ?? null)
    })

    chartRef.current = chart; seriesRef.current = series

    const onResize = () => {
      if (chartRef.current && containerRef.current)
        chartRef.current.applyOptions({ width: containerRef.current.clientWidth, height: containerRef.current.clientHeight })
    }
    window.addEventListener('resize', onResize)
    return () => { window.removeEventListener('resize', onResize); chart.remove(); chartRef.current = null; seriesRef.current = null }
  }, [])

  useEffect(() => {
    if (!seriesRef.current || !candles.length) return
    seriesRef.current.setData(candles)
    chartRef.current?.timeScale().scrollToRealTime()
  }, [candles])

  const stats = useMemo(() => {
    if (!candles.length) return null
    const first = candles[0], last = candles[candles.length - 1]
    const change = last.close - first.open
    return { open: first.open, high: Math.max(...candles.map(c => c.high)), low: Math.min(...candles.map(c => c.low)), close: last.close, change, pct: (change / first.open) * 100 }
  }, [candles])

  if (!market) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#161b22' }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)' }}>Select a market</span>
    </div>
  )

  if (error) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#161b22' }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--sell)' }}>{error}</span>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#161b22' }}>
      {/* Chart toolbar — matches reference: ticker, timeframes left, OHLC inline */}
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 16, padding: '8px 12px',
          borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0, flexWrap: 'wrap',
        }}
      >
        {/* Timeframes */}
        <div style={{ display: 'flex', gap: 2 }}>
          {TIMEFRAMES.map(tf => (
            <button
              key={tf.label}
              onClick={() => setSelectedTf(tf)}
              style={{
                padding: '3px 8px',
                borderRadius: 'var(--r-sm)',
                border: `1px solid ${selectedTf.label === tf.label ? 'rgba(255,255,255,0.2)' : 'transparent'}`,
                background: selectedTf.label === tf.label ? 'rgba(255,255,255,0.08)' : 'transparent',
                color: selectedTf.label === tf.label ? '#e6edf3' : '#8b949e',
                fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 500,
                cursor: 'pointer', transition: 'all var(--dur-xs)',
              }}
            >
              {tf.label}
            </button>
          ))}
        </div>

        {/* OHLC hover data — inline like reference */}
        <div style={{ display: 'flex', gap: 12, fontFamily: 'var(--font-mono)', fontSize: 11 }}>
          {hoveredCandle ? (
            <>
              <span style={{ color: '#8b949e' }}>O <span style={{ color: '#e6edf3' }}>{fmt(hoveredCandle.open)}</span></span>
              <span style={{ color: '#8b949e' }}>H <span style={{ color: 'var(--buy)' }}>{fmt(hoveredCandle.high)}</span></span>
              <span style={{ color: '#8b949e' }}>L <span style={{ color: 'var(--sell)' }}>{fmt(hoveredCandle.low)}</span></span>
              <span style={{ color: '#8b949e' }}>C <span style={{ color: '#e6edf3' }}>{fmt(hoveredCandle.close)}</span></span>
              <span style={{ color: hoveredCandle.close >= hoveredCandle.open ? 'var(--buy)' : 'var(--sell)' }}>
                {hoveredCandle.close >= hoveredCandle.open ? '+' : ''}{fmt(hoveredCandle.close - hoveredCandle.open)}
              </span>
            </>
          ) : stats ? (
            <>
              <span style={{ color: '#8b949e' }}>O <span style={{ color: '#e6edf3' }}>{fmt(stats.open)}</span></span>
              <span style={{ color: '#8b949e' }}>H <span style={{ color: 'var(--buy)' }}>{fmt(stats.high)}</span></span>
              <span style={{ color: '#8b949e' }}>L <span style={{ color: 'var(--sell)' }}>{fmt(stats.low)}</span></span>
              <span style={{ color: '#8b949e' }}>C <span style={{ color: '#e6edf3' }}>{fmt(stats.close)}</span></span>
              <span style={{ color: stats.change >= 0 ? 'var(--buy)' : 'var(--sell)' }}>
                {stats.change >= 0 ? '+' : ''}{fmt(stats.change)} ({stats.pct.toFixed(2)}%)
              </span>
            </>
          ) : (
            <span style={{ color: '#484f58' }}>Collecting data…</span>
          )}
        </div>

        {/* Live price right-aligned */}
        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 400, color: '#e6edf3', letterSpacing: '-0.01em', lineHeight: 1 }}>
            {currentPrice}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#8b949e', marginTop: 2 }}>
            {market.quoteSymbol} · LIVE
          </div>
        </div>
      </div>

      {/* Chart area */}
      <div style={{ position: 'relative', flex: 1, minHeight: 0 }}>
        <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
        {candles.length === 0 && (
          <div
            style={{
              position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 8, background: '#161b22',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 0.9s linear infinite' }}>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              <circle cx="12" cy="12" r="9" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />
              <path d="M12 3a9 9 0 0 1 9 9" stroke="#8b949e" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#484f58' }}>Collecting price data…</span>
          </div>
        )}
      </div>
    </div>
  )
}