import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useMarkets } from '../hooks/useMarkets'
import { useOrderbook } from '../hooks/useOrderbook'
import { useTrades } from '../hooks/useTrades'
import { Market } from '../types'
import PriceChart from '../components/PriceChart'
import AIAdvisory from '../components/AIAdvisory'
import TradePanel from '../components/TradePanel'
import { formatPrice, formatQuantity, formatTimeAgo } from '../utils/format'

const NETWORK = (import.meta as any).env?.VITE_INJECTIVE_NETWORK === 'mainnet' ? 'Mainnet' : 'Testnet'

/* ─── Inline Navbar ─────────────────────────────────────────────────────── */
function Navbar({
  markets,
  selectedMarket,
  onMarketChange,
  marketsLoading,
  onBack,
}: {
  markets: Market[]
  selectedMarket: Market | null
  onMarketChange: (m: Market) => void
  marketsLoading: boolean
  onBack?: () => void
}) {
  const [walletConnected, setWalletConnected] = useState(false)
  const [walletAddress, setWalletAddress]     = useState<string | null>(null)
  const [connecting, setConnecting]           = useState(false)

  const handleConnect = async () => {
    setConnecting(true)
    try {
      if ((window as any).keplr) {
        const chainId = 'injective-888'
        await (window as any).keplr.enable(chainId)
        const signer = (window as any).getOfflineSigner(chainId)
        const accounts = await signer.getAccounts()
        if (accounts?.length) {
          setWalletAddress(accounts[0].address)
          setWalletConnected(true)
        }
        return
      }
      if ((window as any).ethereum) {
        const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' })
        if (accounts?.length) {
          setWalletAddress(accounts[0])
          setWalletConnected(true)
        }
        return
      }
      alert('No wallet found. Install Keplr or MetaMask.')
    } catch (e) {
      console.error(e)
    } finally {
      setConnecting(false)
    }
  }

  const shortAddr = walletAddress
    ? `${walletAddress.slice(0, 6)}…${walletAddress.slice(-6)}`
    : null

  return (
    <header
      style={{
        height: 52,
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        gap: 12,
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      {/* Logo + back */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 160 }}>
        {onBack && (
          <button
            onClick={onBack}
            title="Back to home"
            style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px',
              color: 'var(--text-2)', borderRadius: 'var(--r-sm)',
              display: 'flex', alignItems: 'center',
              transition: 'color var(--dur-sm)',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-1)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-2)')}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <img
          src="/kora.png"
          alt="Kora"
          style={{ width: 26, height: 26, borderRadius: '50%', border: '1px solid var(--border-mid)', objectFit: 'cover' }}
          onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
        />
        <div>
          <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: 13, color: 'var(--text-1)', lineHeight: 1 }}>
            Injective Protocol
          </div>
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: 10, color: 'var(--text-2)', lineHeight: 1.2, marginTop: 1 }}>
            Modern Crypto Trading Dashboard
          </div>
        </div>
      </div>

      {/* Market selector — center */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
        <span style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--text-2)' }}>Market:</span>
        <div style={{ position: 'relative' }}>
          <select
            className="kora-select"
            value={selectedMarket?.id || ''}
            disabled={marketsLoading || markets.length === 0}
            onChange={e => {
              const m = markets.find(mk => mk.id === e.target.value)
              if (m) onMarketChange(m)
            }}
            style={{ minWidth: 160, fontWeight: 600, fontSize: 13, paddingRight: 36 }}
          >
            {markets.length === 0 && <option value="">Loading…</option>}
            {markets.map(m => (
              <option key={m.id} value={m.id}>{m.ticker}</option>
            ))}
          </select>
          <svg
            style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-2)' }}
            width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Right: network + wallet */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 160, justifyContent: 'flex-end' }}>
        {walletConnected ? (
          <div
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              background: 'var(--buy-dim)', border: '1px solid var(--buy-border)',
              borderRadius: 'var(--r-md)', padding: '5px 10px',
              fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--buy)',
            }}
          >
            <span className="live-dot" />
            <span>Connected: keplr ({shortAddr})</span>
          </div>
        ) : (
          <button
            className="btn"
            onClick={handleConnect}
            disabled={connecting}
            style={{ fontSize: 12, padding: '5px 12px' }}
          >
            {connecting ? 'Connecting…' : 'Connect Wallet'}
          </button>
        )}
        <div
          style={{
            width: 28, height: 28,
            borderRadius: '50%',
            background: 'var(--bg-inset)',
            border: '1px solid var(--border-mid)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--info)',
          }}
        >
          ⟠
        </div>
      </div>
    </header>
  )
}

/* ─── Inline Orderbook + Trades tabbed panel ────────────────────────────── */
function MarketDataPanel({
  orderbook,
  trades,
  market,
  orderbookLoading,
  tradesLoading,
  orderbookError,
  tradesError,
}: {
  orderbook: any
  trades: any[]
  market: Market | null
  orderbookLoading: boolean
  tradesLoading: boolean
  orderbookError: string | null
  tradesError: string | null
}) {
  const [tab, setTab] = useState<'orderbook' | 'trades'>('orderbook')
  const tickSize = market?.minPriceTickSize || 0.0001

  const { bids = [], asks = [] } = orderbook

  const maxBidQty = useMemo(() => Math.max(...bids.map((b: any) => parseFloat(b.quantity) || 0), 0), [bids])
  const maxAskQty = useMemo(() => Math.max(...asks.map((a: any) => parseFloat(a.quantity) || 0), 0), [asks])

  const bestBid = bids[0]?.price ? parseFloat(bids[0].price) : 0
  const bestAsk = asks[0]?.price ? parseFloat(asks[0].price) : 0
  const spread  = bestBid && bestAsk ? ((bestAsk - bestBid) / bestBid * 100).toFixed(3) : null

  const [newTradeId, setNewTradeId] = useState<string | null>(null)
  const prevLenRef = useRef(0)
  useEffect(() => {
    if (trades.length > prevLenRef.current && prevLenRef.current > 0) {
      setNewTradeId(trades[0]?.id || null)
      const t = setTimeout(() => setNewTradeId(null), 1500)
      return () => clearTimeout(t)
    }
    prevLenRef.current = trades.length
  }, [trades])

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      {/* Tab bar */}
      <div className="tab-nav" style={{ flexShrink: 0 }}>
        <button className={`tab-btn${tab === 'orderbook' ? ' active' : ''}`} onClick={() => setTab('orderbook')}>
          Order Book
        </button>
        <button className={`tab-btn${tab === 'trades' ? ' active' : ''}`} onClick={() => setTab('trades')}>
          Recent Trades
        </button>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', padding: '0 12px', gap: 6 }}>
          <span className="live-dot" style={{ width: 5, height: 5 }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-2)' }}>LIVE</span>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
        {tab === 'orderbook' ? (
          <div>
            {/* Orderbook header */}
            <div
              style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
                padding: '6px 10px',
                borderBottom: '1px solid var(--border)',
                position: 'sticky', top: 0, background: 'var(--bg-card)', zIndex: 1,
              }}
            >
              {['Price', 'Size', 'Total'].map((h, i) => (
                <span
                  key={h}
                  style={{
                    fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--text-2)',
                    textTransform: 'uppercase', letterSpacing: '0.05em',
                    textAlign: i === 0 ? 'left' : 'right',
                  }}
                >
                  {h}
                </span>
              ))}
            </div>

            {/* Asks (sell side) — reversed so highest ask is at top */}
            {asks.length > 0 && (
              <div>
                {[...asks].reverse().map((ask: any, i: number) => {
                  const qty = parseFloat(ask.quantity) || 0
                  const prc = parseFloat(ask.price) || 0
                  const total = qty * prc
                  const pct = maxAskQty > 0 ? (qty / maxAskQty) * 100 : 0
                  return (
                    <div
                      key={`ask-${i}`}
                      style={{
                        position: 'relative',
                        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
                        padding: '3px 10px',
                        cursor: 'default',
                      }}
                    >
                      <div
                        style={{
                          position: 'absolute', right: 0, top: 0, height: '100%',
                          width: `${pct}%`, background: 'var(--sell-dim)',
                          pointerEvents: 'none',
                        }}
                      />
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--sell)', position: 'relative' }}>
                        {formatPrice(ask.price, tickSize, market?.baseDenom, market?.quoteDenom)}
                      </span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-1)', textAlign: 'right', position: 'relative' }}>
                        {formatQuantity(ask.quantity, market?.baseDenom)}
                      </span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-2)', textAlign: 'right', position: 'relative' }}>
                        {total > 0 ? total.toLocaleString('en-US', { maximumFractionDigits: 2 }) : '—'}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Spread */}
            {spread && (
              <div
                style={{
                  padding: '5px 10px',
                  borderTop: '1px solid var(--border)',
                  borderBottom: '1px solid var(--border)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  background: 'var(--bg-inset)',
                }}
              >
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-2)' }}>Spread</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-1)' }}>{spread}%</span>
              </div>
            )}

            {/* Bids (buy side) */}
            {bids.length > 0 && (
              <div>
                {bids.map((bid: any, i: number) => {
                  const qty = parseFloat(bid.quantity) || 0
                  const prc = parseFloat(bid.price) || 0
                  const total = qty * prc
                  const pct = maxBidQty > 0 ? (qty / maxBidQty) * 100 : 0
                  return (
                    <div
                      key={`bid-${i}`}
                      style={{
                        position: 'relative',
                        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
                        padding: '3px 10px',
                        cursor: 'default',
                      }}
                    >
                      <div
                        style={{
                          position: 'absolute', right: 0, top: 0, height: '100%',
                          width: `${pct}%`, background: 'var(--buy-dim)',
                          pointerEvents: 'none',
                        }}
                      />
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--buy)', position: 'relative' }}>
                        {formatPrice(bid.price, tickSize, market?.baseDenom, market?.quoteDenom)}
                      </span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-1)', textAlign: 'right', position: 'relative' }}>
                        {formatQuantity(bid.quantity, market?.baseDenom)}
                      </span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-2)', textAlign: 'right', position: 'relative' }}>
                        {total > 0 ? total.toLocaleString('en-US', { maximumFractionDigits: 2 }) : '—'}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}

            {bids.length === 0 && asks.length === 0 && (
              <div style={{ padding: '32px 0', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)' }}>
                {orderbookLoading ? 'Loading…' : orderbookError || 'No data'}
              </div>
            )}
          </div>
        ) : (
          /* ── Trades tab ── */
          <div>
            <div
              style={{
                display: 'grid', gridTemplateColumns: '2fr 2fr 2fr 1fr 1fr',
                padding: '6px 10px',
                borderBottom: '1px solid var(--border)',
                position: 'sticky', top: 0, background: 'var(--bg-card)', zIndex: 1,
              }}
            >
              {['Price', 'Size', 'Total', 'Time', 'Side'].map((h, i) => (
                <span
                  key={h}
                  style={{
                    fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--text-2)',
                    textTransform: 'uppercase', letterSpacing: '0.05em',
                    textAlign: i === 0 ? 'left' : 'right',
                  }}
                >
                  {h}
                </span>
              ))}
            </div>
            {trades.length > 0 ? trades.map((trade: any, idx: number) => {
              const isBuy = trade.direction === 'buy'
              const qty = parseFloat(trade.quantity) || 0
              const prc = parseFloat(trade.price) || 0
              const total = qty * prc
              const isNew = trade.id === newTradeId
              return (
                <div
                  key={trade.id || idx}
                  className={isNew ? 'row-new' : ''}
                  style={{
                    display: 'grid', gridTemplateColumns: '2fr 2fr 2fr 1fr 1fr',
                    padding: '4px 10px',
                    borderBottom: '1px solid rgba(255,255,255,0.02)',
                    transition: 'background var(--dur-xs)',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
                  onMouseLeave={e => (e.currentTarget.style.background = '')}
                >
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: isBuy ? 'var(--buy)' : 'var(--sell)' }}>
                    {formatPrice(trade.price, tickSize, market?.baseDenom, market?.quoteDenom)}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-1)', textAlign: 'right' }}>
                    {formatQuantity(trade.quantity, market?.baseDenom)}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-2)', textAlign: 'right' }}>
                    {total > 0 ? total.toLocaleString('en-US', { maximumFractionDigits: 2 }) : '—'}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-2)', textAlign: 'right' }}>
                    {formatTimeAgo(trade.timestamp)}
                  </span>
                  <span style={{ textAlign: 'right' }}>
                    <span className={`badge ${isBuy ? 'badge-buy' : 'badge-sell'}`} style={{ fontSize: 10, padding: '1px 5px' }}>
                      {isBuy ? 'Buy' : 'Sell'}
                    </span>
                  </span>
                </div>
              )
            }) : (
              <div style={{ padding: '32px 0', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)' }}>
                {tradesLoading ? 'Loading…' : tradesError || 'No trades'}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Main Dashboard ────────────────────────────────────────────────────── */
export default function Dashboard({ onBack }: { onBack?: () => void }) {
  const { markets, loading: marketsLoading, error: marketsError } = useMarkets()
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null)
  const [aiTradeRequest, setAiTradeRequest] = useState<{ action: 'buy' | 'sell'; quantity: number } | null>(null)
  const initialDone = useRef(false)

  useEffect(() => {
    if (markets.length > 0 && !selectedMarket && !initialDone.current) {
      const saved = localStorage.getItem('selectedMarketId')
      const found = saved ? markets.find(m => m.id === saved) : null
      setSelectedMarket(found || markets[0])
      initialDone.current = true
    }
  }, [markets, selectedMarket])

  useEffect(() => {
    if (selectedMarket) localStorage.setItem('selectedMarketId', selectedMarket.id)
  }, [selectedMarket])

  const { orderbook, loading: obLoading, error: obError } = useOrderbook(selectedMarket?.id || null)
  const { trades, loading: trLoading, error: trError }    = useTrades(selectedMarket?.id || null)

  const currentPrice = useMemo(() => {
    if (orderbook.asks.length > 0) return Number(orderbook.asks[0].price)
    if (orderbook.bids.length > 0) return Number(orderbook.bids[0].price)
    return 0
  }, [orderbook])

  const handleMarketChange = useCallback((m: Market) => setSelectedMarket(m), [])
  const clearAiTrade       = useCallback(() => setAiTradeRequest(null), [])
  const handleAiTrade      = useCallback((action: 'buy' | 'sell', quantity: number) => {
    setAiTradeRequest({ action, quantity })
  }, [])

  const errorMessage = marketsError || obError || trError

  return (
    <>
      {/* Navbar */}
      <Navbar
        markets={markets}
        selectedMarket={selectedMarket}
        onMarketChange={handleMarketChange}
        marketsLoading={marketsLoading}
        onBack={onBack}
      />

      {/* Error banner */}
      {errorMessage && (
        <div
          style={{
            background: 'var(--sell-dim)', borderBottom: '1px solid var(--sell-border)',
            padding: '8px 16px',
            fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--sell)',
          }}
        >
          ⚠ {errorMessage}
        </div>
      )}

      {/* Main content */}
      {selectedMarket ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: 'calc(100vh - 52px)',
            overflow: 'hidden',
          }}
        >
          {/* ── Top row: Chart (left) + Trade Panel (right) ── */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 320px',
              gap: 0,
              borderBottom: '1px solid var(--border)',
              flex: '0 0 auto',
              height: '55vh',
              minHeight: 380,
            }}
          >
            {/* Chart */}
            <div
              className="card"
              style={{
                borderRadius: 0,
                borderLeft: 'none',
                borderTop: 'none',
                borderBottom: 'none',
                borderRight: '1px solid var(--border)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <PriceChart
                key={`chart-${selectedMarket.id}`}
                market={selectedMarket}
                loading={trLoading}
                error={trError}
              />
            </div>

            {/* Trade panel */}
            <div
              className="card"
              style={{
                borderRadius: 0,
                borderTop: 'none',
                borderRight: 'none',
                borderBottom: 'none',
                overflowY: 'auto',
              }}
            >
              <TradePanel
                market={selectedMarket}
                currentPrice={currentPrice}
                loading={obLoading}
                aiTrade={aiTradeRequest}
                onAiTradeComplete={clearAiTrade}
              />
            </div>
          </div>

          {/* ── Bottom row: AI Advisory (left) + OrderBook/Trades (right) ── */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '340px 1fr',
              gap: 0,
              flex: 1,
              minHeight: 0,
              overflow: 'hidden',
            }}
          >
            {/* AI Advisory */}
            <div
              className="card"
              style={{
                borderRadius: 0,
                borderLeft: 'none',
                borderBottom: 'none',
                borderRight: '1px solid var(--border)',
                overflowY: 'auto',
              }}
            >
              <AIAdvisory
                market={selectedMarket}
                currentPrice={currentPrice}
                orderbook={orderbook}
                trades={trades}
                onTrade={handleAiTrade}
              />
            </div>

            {/* Tabbed Orderbook + Trades */}
            <MarketDataPanel
              orderbook={orderbook}
              trades={trades}
              market={selectedMarket}
              orderbookLoading={obLoading}
              tradesLoading={trLoading}
              orderbookError={obError}
              tradesError={trError}
            />
          </div>
        </div>
      ) : (
        /* Empty state */
        <div
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            height: 'calc(100vh - 52px)',
            flexDirection: 'column', gap: 12,
          }}
        >
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: 15, color: 'var(--text-1)', fontWeight: 500 }}>
            {marketsLoading ? 'Loading markets…' : 'Select a market to begin'}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)' }}>
            {NETWORK} · Injective Protocol
          </div>
        </div>
      )}
    </>
  )
}