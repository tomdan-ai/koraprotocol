import { FormattedTrade } from '../api/injectiveClient'
import { Market } from '../types'
import { formatPrice, formatQuantity, formatTimeAgo } from '../utils/format'
import Loader from './Loader'
import { useState, useEffect, useMemo, useCallback } from 'react'

interface TradesListProps {
  trades: FormattedTrade[]
  market: Market | null
  loading: boolean
  error: string | null
}

export default function TradesList({ trades, market, loading, error }: TradesListProps) {
  const tickSize = market?.minPriceTickSize || 0.0001

  const [prevLen, setPrevLen]       = useState(0)
  const [newTradeId, setNewTradeId] = useState<string | null>(null)
  const [hoveredRow, setHoveredRow] = useState<string | null>(null)

  useEffect(() => {
    if (trades.length > prevLen && prevLen > 0) {
      setNewTradeId(trades[0]?.id || null)
      const t = setTimeout(() => setNewTradeId(null), 1800)
      return () => clearTimeout(t)
    }
    setPrevLen(trades.length)
  }, [trades, prevLen])

  const stats = useMemo(() => {
    if (!trades.length) return null
    const buys      = trades.filter(t => t.direction === 'buy')
    const sells     = trades.filter(t => t.direction === 'sell')
    const buyVol    = buys.reduce((s, t) => s + parseFloat(t.quantity || '0'), 0)
    const sellVol   = sells.reduce((s, t) => s + parseFloat(t.quantity || '0'), 0)
    return {
      buys: buys.length,
      sells: sells.length,
      buyVol: buyVol.toFixed(2),
      sellVol: sellVol.toFixed(2),
      ratio: buys.length > 0 ? ((buys.length / trades.length) * 100).toFixed(0) : '0',
    }
  }, [trades])

  const handleHover = useCallback((id: string | null) => setHoveredRow(id), [])

  if (loading && trades.length === 0) {
    return <div className="panel" style={{ padding: 24 }}><Loader /></div>
  }

  if (error && trades.length === 0) {
    return (
      <div className="panel" style={{ padding: 20, borderColor: 'var(--signal-sell-border)' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', color: 'var(--signal-sell)' }}>
          Error: {error}
        </span>
      </div>
    )
  }

  const thStyle: React.CSSProperties = {
    fontFamily: 'var(--font-mono)',
    fontSize: 'var(--text-xs)',
    color: 'var(--ink-4)',
    fontWeight: 400,
    letterSpacing: '0.04em',
    padding: '0 0 8px 0',
    borderBottom: '1px solid var(--border-subtle)',
    whiteSpace: 'nowrap',
  }

  return (
    <div className="panel" style={{ padding: '20px 20px' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 10,
          marginBottom: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-base)',
              fontWeight: 600,
              color: 'var(--ink-1)',
            }}
          >
            Recent Trades
          </span>
          {trades.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span className="live-dot" />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--ink-3)' }}>
                LIVE
              </span>
            </div>
          )}
        </div>

        {stats && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-xs)',
              color: 'var(--ink-3)',
            }}
          >
            <span><span style={{ color: 'var(--signal-buy)' }}>{stats.buys}</span> buys</span>
            <span style={{ color: 'var(--ink-6)' }}>|</span>
            <span><span style={{ color: 'var(--signal-sell)' }}>{stats.sells}</span> sells</span>
            <span style={{ color: 'var(--ink-6)' }}>|</span>
            <span>Ratio: <span style={{ color: 'var(--ink-2)' }}>{stats.ratio}%</span></span>
            <span style={{ color: 'var(--ink-6)' }}>|</span>
            <span style={{ color: 'var(--ink-4)' }}>{trades.length} trades · 3s</span>
          </div>
        )}
      </div>

      {/* Volume summary */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
          <div className="panel-inset" style={{ padding: '8px 12px' }}>
            <div className="section-label" style={{ marginBottom: 3 }}>Buy Volume</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', color: 'var(--signal-buy)', fontWeight: 500 }}>
              {stats.buyVol} <span style={{ color: 'var(--ink-4)', fontSize: 'var(--text-xs)' }}>{market?.baseDenom}</span>
            </div>
          </div>
          <div className="panel-inset" style={{ padding: '8px 12px' }}>
            <div className="section-label" style={{ marginBottom: 3 }}>Sell Volume</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', color: 'var(--signal-sell)', fontWeight: 500 }}>
              {stats.sellVol} <span style={{ color: 'var(--ink-4)', fontSize: 'var(--text-xs)' }}>{market?.baseDenom}</span>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: '32%' }} />
            <col style={{ width: '28%' }} />
            <col style={{ width: '22%' }} />
            <col style={{ width: '18%' }} />
          </colgroup>
          <thead>
            <tr>
              <th style={{ ...thStyle, textAlign: 'left' }}>
                Price ({market?.quoteDenom || ''})
              </th>
              <th style={{ ...thStyle, textAlign: 'right' }}>
                Amount ({market?.baseDenom || ''})
              </th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Time</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Side</th>
            </tr>
          </thead>
          <tbody>
            {trades.length > 0 ? (
              trades.map((trade, index) => {
                const isNew = trade.id === newTradeId
                const isHov = hoveredRow === (trade.id || String(index))
                const isBuy = trade.direction === 'buy'

                return (
                  <tr
                    key={trade.id || trade.hash || index}
                    onMouseEnter={() => handleHover(trade.id || String(index))}
                    onMouseLeave={() => handleHover(null)}
                    className={isNew ? 'flash-new' : ''}
                    style={{
                      background: isHov ? 'rgba(255,255,255,0.025)' : 'transparent',
                      transition: 'background var(--dur-xs) var(--ease-out)',
                      borderBottom: '1px solid var(--border-subtle)',
                    }}
                  >
                    <td style={{ padding: '7px 0' }}>
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: 'var(--text-sm)',
                          fontWeight: 500,
                          color: isBuy ? 'var(--signal-buy)' : 'var(--signal-sell)',
                        }}
                      >
                        {formatPrice(trade.price, tickSize, market?.baseDenom, market?.quoteDenom)}
                      </span>
                    </td>
                    <td style={{ padding: '7px 0', textAlign: 'right' }}>
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: 'var(--text-sm)',
                          color: 'var(--ink-2)',
                        }}
                      >
                        {formatQuantity(trade.quantity, market?.baseDenom)}
                      </span>
                    </td>
                    <td style={{ padding: '7px 0', textAlign: 'right' }}>
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: 'var(--text-xs)',
                          color: 'var(--ink-4)',
                        }}
                      >
                        {formatTimeAgo(trade.timestamp)}
                      </span>
                    </td>
                    <td style={{ padding: '7px 0', textAlign: 'right' }}>
                      <span className={`badge ${isBuy ? 'badge-buy' : 'badge-sell'}`}>
                        {isBuy ? 'BUY' : 'SELL'}
                      </span>
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td
                  colSpan={4}
                  style={{
                    padding: '40px 0',
                    textAlign: 'center',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--text-xs)',
                    color: 'var(--ink-5)',
                  }}
                >
                  No trades available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      {trades.length > 0 && (
        <div
          style={{
            marginTop: 14,
            paddingTop: 12,
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            justifyContent: 'space-between',
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-xs)',
            color: 'var(--ink-4)',
          }}
        >
          <span>Latest: {formatTimeAgo(trades[0]?.timestamp || 0)}</span>
          <span>Auto-refresh every 3s</span>
        </div>
      )}
    </div>
  )
}