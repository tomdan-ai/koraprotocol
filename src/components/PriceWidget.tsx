import { useState, useEffect, useCallback } from 'react'
import { injectiveClient } from '../api/injectiveClient'
import { Market } from '../types'
import Loader from './Loader'

interface PriceWidgetProps {
  market: Market | null
  loading: boolean
  error: string | null
}

export default function PriceWidget({ market, loading }: PriceWidgetProps) {
  const [price, setPrice]         = useState<string>('0')
  const [source, setSource]       = useState<'pyth' | 'band' | 'none'>('pyth')
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  const fetchPrice = useCallback(async () => {
    if (!market) return
    try {
      const { price: p, source: s } = await injectiveClient.getCurrentPrice(market)
      setPrice(p)
      setSource(s)
      if (p !== '0') setLastUpdate(new Date())
    } catch (err) {
      console.error('Failed to fetch price:', err)
    } finally {
      setIsLoading(false)
    }
  }, [market])

  useEffect(() => {
    if (!market) return
    setIsLoading(true)
    fetchPrice()
    const id = setInterval(fetchPrice, 1000)
    return () => clearInterval(id)
  }, [market, fetchPrice])

  const fmt = (raw: string) => {
    const n = parseFloat(raw)
    if (isNaN(n) || n === 0) return '—'
    if (n >= 10_000) return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    if (n >= 1) return n.toFixed(4)
    return n.toPrecision(4)
  }

  const sourceMeta = {
    pyth: { label: 'Pyth',    sub: 'High-Freq' },
    band: { label: 'Band',    sub: 'Standard'  },
    none: { label: 'N/A',     sub: 'Unavailable' },
  }

  if (loading || !market) {
    return (
      <div className="panel" style={{ padding: 24, minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader size="md" />
      </div>
    )
  }

  return (
    <div className="panel" style={{ padding: '20px 24px' }}>
      {/* Top row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-lg)',
              fontWeight: 700,
              color: 'var(--ink-1)',
              letterSpacing: '-0.01em',
              marginBottom: 2,
            }}
          >
            {market.ticker}
          </div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-xs)',
              color: 'var(--ink-3)',
            }}
          >
            Oracle: {market.baseSymbol}/{market.quoteSymbol}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
            <span className="badge badge-mono">{sourceMeta[source].label}</span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-xs)',
                color: 'var(--ink-4)',
              }}
            >
              {sourceMeta[source].sub}
            </span>
          </div>
        </div>

        {lastUpdate && (
          <div style={{ textAlign: 'right' }}>
            <div className="section-label" style={{ marginBottom: 2 }}>Last Update</div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-sm)',
                color: 'var(--ink-2)',
              }}
            >
              {lastUpdate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
          </div>
        )}
      </div>

      {/* Price */}
      <div style={{ textAlign: 'center', padding: '24px 0' }}>
        {isLoading ? (
          <Loader size="md" />
        ) : price === '0' ? (
          <div style={{ color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)' }}>
            Unavailable for {market.baseSymbol}/{market.quoteSymbol}
          </div>
        ) : (
          <>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-3xl)',
                fontWeight: 400,
                color: 'var(--ink-0)',
                letterSpacing: '-0.02em',
                lineHeight: 1,
                marginBottom: 6,
              }}
            >
              {fmt(price)}
            </div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-xs)',
                color: 'var(--ink-3)',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                marginBottom: 16,
              }}
            >
              {market.quoteSymbol}
            </div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-xs)',
                color: 'var(--ink-3)',
              }}
            >
              <span className="live-dot" />
              <span>Live</span>
              <span style={{ color: 'var(--ink-5)' }}>·</span>
              <span>Updates every 1s</span>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          paddingTop: 14,
          borderTop: '1px solid var(--border-subtle)',
          textAlign: 'center',
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--text-xs)',
          color: 'var(--ink-4)',
        }}
      >
        Powered by{' '}
        <a href="https://pyth.network" target="_blank" rel="noopener noreferrer"
           style={{ color: 'var(--ink-2)', textDecoration: 'none' }}
           onMouseEnter={e => (e.currentTarget.style.color = 'var(--ink-0)')}
           onMouseLeave={e => (e.currentTarget.style.color = 'var(--ink-2)')}
        >
          Pyth
        </a>
        {' · '}
        <a href="https://bandprotocol.com" target="_blank" rel="noopener noreferrer"
           style={{ color: 'var(--ink-2)', textDecoration: 'none' }}
           onMouseEnter={e => (e.currentTarget.style.color = 'var(--ink-0)')}
           onMouseLeave={e => (e.currentTarget.style.color = 'var(--ink-2)')}
        >
          Band
        </a>
      </div>
    </div>
  )
}