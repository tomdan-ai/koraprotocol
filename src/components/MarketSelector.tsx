import { Market } from '../types'
import Loader from './Loader'
import { useMemo } from 'react'

interface MarketSelectorProps {
  markets: Market[]
  selectedMarket: Market | null
  onMarketChange: (market: Market) => void
  loading: boolean
  error: string | null
}

export default function MarketSelector({
  markets,
  selectedMarket,
  onMarketChange,
  loading,
  error,
}: MarketSelectorProps) {
  const isInitialLoad = loading && markets.length === 0

  const groupedMarkets = useMemo(() => ({
    spot:        markets.filter(m => m.marketType === 'spot'),
    derivatives: markets.filter(m => m.marketType === 'derivative'),
  }), [markets])

  const handleMarketChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const market = markets.find(m => m.id === e.target.value)
    if (market) onMarketChange(market)
  }

  return (
    <div
      className="panel"
      style={{ padding: '14px 20px', marginBottom: 20 }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        {/* Label */}
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-xs)',
              color: 'var(--ink-3)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: 2,
            }}
          >
            Market
          </div>
          {error && (
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--signal-sell)', marginTop: 2 }}>
              {error}
            </div>
          )}
        </div>

        {/* Select */}
        <div style={{ flex: 1, minWidth: 200, maxWidth: 340, position: 'relative' }}>
          {isInitialLoad ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Loader size="sm" />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', color: 'var(--ink-3)' }}>
                Loading markets…
              </span>
            </div>
          ) : (
            <>
              <select
                value={selectedMarket?.id || ''}
                onChange={handleMarketChange}
                disabled={markets.length === 0}
                aria-label="Select market"
                className="kora-select"
              >
                <option value="">Select market…</option>
                {groupedMarkets.spot.length > 0 && (
                  <optgroup label="Spot">
                    {groupedMarkets.spot.map(m => (
                      <option key={m.id} value={m.id}>{m.ticker}</option>
                    ))}
                  </optgroup>
                )}
                {groupedMarkets.derivatives.length > 0 && (
                  <optgroup label="Derivatives">
                    {groupedMarkets.derivatives.map(m => (
                      <option key={m.id} value={m.id}>{m.ticker}</option>
                    ))}
                  </optgroup>
                )}
              </select>
              {/* Chevron */}
              <svg
                style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--ink-3)' }}
                width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </>
          )}
        </div>

        {/* Selected market badge */}
        {selectedMarket && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 'auto' }}>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-sm)',
                color: 'var(--ink-1)',
                fontWeight: 500,
              }}
            >
              {selectedMarket.ticker}
            </span>
            <span className="badge badge-mono">
              {selectedMarket.marketType === 'spot' ? 'Spot' : 'Perp'}
            </span>
            {!isInitialLoad && loading && <Loader size="sm" />}
          </div>
        )}
      </div>

      {/* Meta row */}
      {selectedMarket && (
        <div
          style={{
            marginTop: 10,
            paddingTop: 10,
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            gap: 20,
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-xs)',
            color: 'var(--ink-4)',
          }}
        >
          <span>tick <span style={{ color: 'var(--ink-2)' }}>{selectedMarket.minPriceTickSize}</span></span>
          <span>min qty <span style={{ color: 'var(--ink-2)' }}>{selectedMarket.minQuantityTickSize}</span></span>
        </div>
      )}
    </div>
  )
}