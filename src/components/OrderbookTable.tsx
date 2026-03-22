import { Orderbook, Market } from '../types'
import { formatPrice, formatQuantity } from '../utils/format'
import Loader from './Loader'
import { useState, useEffect, useMemo, useCallback } from 'react'

interface OrderbookTableProps {
  orderbook: Orderbook
  market: Market | null
  loading: boolean
  error: string | null
}

export default function OrderbookTable({ orderbook, market, loading, error }: OrderbookTableProps) {
  const { bids = [], asks = [] } = orderbook
  const tickSize = market?.minPriceTickSize || 0.0001

  const [isUpdating, setIsUpdating]           = useState(false)
  const [prevBidsLen, setPrevBidsLen]         = useState(0)
  const [prevAsksLen, setPrevAsksLen]         = useState(0)
  const [hoveredRow, setHoveredRow]           = useState<string | null>(null)

  useEffect(() => {
    if (bids.length !== prevBidsLen || asks.length !== prevAsksLen) {
      setIsUpdating(true)
      const t = setTimeout(() => setIsUpdating(false), 300)
      return () => clearTimeout(t)
    }
    setPrevBidsLen(bids.length)
    setPrevAsksLen(asks.length)
  }, [bids.length, asks.length, prevBidsLen, prevAsksLen])

  const { maxBidQty, maxAskQty } = useMemo(() => ({
    maxBidQty: Math.max(...bids.map(b => parseFloat(b.quantity) || 0), 0),
    maxAskQty: Math.max(...asks.map(a => parseFloat(a.quantity) || 0), 0),
  }), [bids, asks])

  const { bestBid, bestAsk, spreadPct } = useMemo(() => {
    const bid = bids[0]?.price ? parseFloat(bids[0].price) : 0
    const ask = asks[0]?.price ? parseFloat(asks[0].price) : 0
    const spread = bid > 0 && ask > 0 ? ask - bid : 0
    return { bestBid: bid, bestAsk: ask, spreadPct: bid > 0 ? (spread / bid) * 100 : 0 }
  }, [bids, asks])

  const { totalBidVol, totalAskVol } = useMemo(() => ({
    totalBidVol: bids.reduce((s, b) => s + (parseFloat(b.quantity) || 0), 0),
    totalAskVol: asks.reduce((s, a) => s + (parseFloat(a.quantity) || 0), 0),
  }), [bids, asks])

  const handleHover = useCallback((id: string | null) => setHoveredRow(id), [])

  const colHeader: React.CSSProperties = {
    fontFamily: 'var(--font-mono)',
    fontSize: 'var(--text-xs)',
    color: 'var(--ink-4)',
    letterSpacing: '0.04em',
    paddingBottom: 6,
    borderBottom: '1px solid var(--border-subtle)',
    marginBottom: 4,
  }

  if (loading && bids.length === 0 && asks.length === 0) {
    return <div className="panel" style={{ padding: 24 }}><Loader /></div>
  }

  if (error && bids.length === 0 && asks.length === 0) {
    return (
      <div className="panel" style={{ padding: 20, borderColor: 'var(--signal-sell-border)' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', color: 'var(--signal-sell)' }}>
          Error: {error}
        </span>
      </div>
    )
  }

  const renderRow = (
    item: { price: string; quantity: string },
    index: number,
    side: 'bid' | 'ask',
    maxQty: number,
  ) => {
    const qty    = parseFloat(item.quantity) || 0
    const width  = maxQty > 0 ? (qty / maxQty) * 100 : 0
    const rowId  = `${side}-${index}-${item.price}`
    const isHov  = hoveredRow === rowId
    const color  = side === 'bid' ? 'var(--signal-buy)' : 'var(--signal-sell)'
    const bg     = side === 'bid' ? 'rgba(34,197,94,0.07)' : 'rgba(239,68,68,0.07)'

    return (
      <div
        key={rowId}
        onMouseEnter={() => handleHover(rowId)}
        onMouseLeave={() => handleHover(null)}
        style={{
          position: 'relative',
          padding: '4px 8px',
          borderRadius: 'var(--r-sm)',
          background: isHov ? 'rgba(255,255,255,0.03)' : 'transparent',
          transition: 'background var(--dur-xs) var(--ease-out)',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          alignItems: 'center',
        }}
      >
        {/* Depth bar */}
        <div
          style={{
            position: 'absolute',
            [side === 'bid' ? 'left' : 'right']: 0,
            top: 0,
            height: '100%',
            width: `${width}%`,
            background: bg,
            borderRadius: 'var(--r-sm)',
            transition: 'width 0.2s var(--ease-out)',
            pointerEvents: 'none',
          }}
        />
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-sm)',
            color,
            position: 'relative',
            zIndex: 1,
          }}
        >
          {formatPrice(item.price, tickSize, market?.baseDenom, market?.quoteDenom)}
        </span>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-sm)',
            color: 'var(--ink-2)',
            textAlign: 'right',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {formatQuantity(item.quantity, market?.baseDenom)}
        </span>
      </div>
    )
  }

  return (
    <div className="panel" style={{ padding: '20px 20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-base)',
              fontWeight: 600,
              color: 'var(--ink-1)',
            }}
          >
            Order Book
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span className="live-dot" style={{ opacity: isUpdating ? 1 : 0.6 }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--ink-3)' }}>
              LIVE
            </span>
          </div>
        </div>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--ink-4)' }}>
          <span style={{ color: 'var(--signal-buy)' }}>{bids.length}</span>
          {' bids · '}
          <span style={{ color: 'var(--signal-sell)' }}>{asks.length}</span>
          {' asks · 3s'}
        </span>
      </div>

      {/* Depth summary */}
      {(bids.length > 0 || asks.length > 0) && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-xs)',
            color: 'var(--ink-4)',
            background: 'var(--surface-inset)',
            padding: '6px 10px',
            borderRadius: 'var(--r-sm)',
            marginBottom: 14,
          }}
        >
          <span>Bid <span style={{ color: 'var(--signal-buy)' }}>{totalBidVol.toFixed(2)}</span></span>
          <span>Ask <span style={{ color: 'var(--signal-sell)' }}>{totalAskVol.toFixed(2)}</span></span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Bids */}
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', ...colHeader }}>
            <span style={{ color: 'var(--signal-buy)' }}>Price</span>
            <span style={{ textAlign: 'right' }}>Size</span>
          </div>
          <div
            style={{
              maxHeight: 280,
              overflowY: 'auto',
              overflowX: 'hidden',
            }}
          >
            {bids.length === 0 ? (
              <div
                style={{
                  padding: '24px 0',
                  textAlign: 'center',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--ink-5)',
                  border: '1px dashed var(--border-subtle)',
                  borderRadius: 'var(--r-sm)',
                  marginTop: 4,
                }}
              >
                No bids
              </div>
            ) : (
              bids.map((bid, i) => renderRow(bid, i, 'bid', maxBidQty))
            )}
          </div>
        </div>

        {/* Asks */}
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', ...colHeader }}>
            <span style={{ color: 'var(--signal-sell)' }}>Price</span>
            <span style={{ textAlign: 'right' }}>Size</span>
          </div>
          <div
            style={{
              maxHeight: 280,
              overflowY: 'auto',
              overflowX: 'hidden',
            }}
          >
            {asks.length === 0 ? (
              <div
                style={{
                  padding: '24px 0',
                  textAlign: 'center',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--ink-5)',
                  border: '1px dashed var(--border-subtle)',
                  borderRadius: 'var(--r-sm)',
                  marginTop: 4,
                }}
              >
                No asks
              </div>
            ) : (
              asks.map((ask, i) => renderRow(ask, i, 'ask', maxAskQty))
            )}
          </div>
        </div>
      </div>

      {/* Spread */}
      {bestBid > 0 && bestAsk > 0 && (
        <div
          style={{
            marginTop: 16,
            paddingTop: 14,
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-xs)',
              color: 'var(--ink-3)',
            }}
          >
            <span>Spread</span>
            <span style={{ color: 'var(--ink-2)' }}>
              {formatPrice(bestBid.toString(), tickSize)} – {formatPrice(bestAsk.toString(), tickSize)}
            </span>
            <span
              className={`badge ${spreadPct < 0.1 ? 'badge-buy' : spreadPct < 0.5 ? 'badge-warn' : 'badge-sell'}`}
            >
              {spreadPct.toFixed(3)}%
            </span>
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--ink-4)' }}>
            Mid {formatPrice(((bestBid + bestAsk) / 2).toString(), tickSize)}
          </span>
        </div>
      )}
    </div>
  )
}