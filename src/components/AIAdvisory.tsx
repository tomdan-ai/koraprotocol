import { useState, useEffect } from 'react'
import { useAIAnalysis, OrderbookData, TradeData } from '../hooks/useAIAnalysis'
import { Market } from '../types'
import { initializeGemini } from '../services/geminiService'

interface AIAdvisoryProps {
  market: Market | null
  currentPrice: number
  orderbook: OrderbookData
  trades: TradeData[]
  onTrade?: (action: 'buy' | 'sell', quantity: number) => void
}

export default function AIAdvisory({ market, currentPrice, orderbook, trades, onTrade }: AIAdvisoryProps) {
  const [apiKey, setApiKey]           = useState('')
  const [showInput, setShowInput]     = useState(false)
  const [initialized, setInitialized] = useState(false)
  const { analysis, loading, error, analyze } = useAIAnalysis()

  useEffect(() => {
    const saved = localStorage.getItem('gemini_api_key')
    if (saved) {
      try { initializeGemini(saved); setInitialized(true); setApiKey(saved) } catch {}
    }
  }, [])

  const handleSaveKey = () => {
    if (!apiKey.trim()) return
    try {
      initializeGemini(apiKey)
      localStorage.setItem('gemini_api_key', apiKey)
      setInitialized(true); setShowInput(false)
    } catch {}
  }

  const handleAnalyze = async () => {
    if (!market || !initialized) return
    try { await analyze(market, currentPrice, orderbook, trades) } catch {}
  }

  const sentimentColor = (s: string) =>
    s === 'bullish' ? 'var(--buy)' : s === 'bearish' ? 'var(--sell)' : 'var(--warn)'

  /* Circular gauge — matches the reference "Market Sentiment 95% BEARISH" dial */
  const SentimentGauge = ({ sentiment, confidence }: { sentiment: string; confidence: number }) => {
    const color = sentimentColor(sentiment)
    const r = 44, cx = 60, cy = 60
    const startAngle = 210 * (Math.PI / 180)
    const endAngle   = startAngle + ((confidence / 100) * 300 * (Math.PI / 180))
    const x1 = cx + r * Math.cos(startAngle), y1 = cy + r * Math.sin(startAngle)
    const x2 = cx + r * Math.cos(endAngle),   y2 = cy + r * Math.sin(endAngle)
    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 0' }}>
        <svg width="120" height="90" viewBox="0 0 120 90">
          {/* Track */}
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8"
            strokeDasharray="235 300" strokeDashoffset="-60" strokeLinecap="round" />
          {/* Fill */}
          {confidence > 0 && (
            <path
              d={`M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`}
              fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
            />
          )}
          {/* Center text */}
          <text x={cx} y={cy - 4} textAnchor="middle" fontFamily="var(--font-mono)"
            fontSize="18" fontWeight="600" fill={color}>
            {confidence}%
          </text>
          {/* Label ticks */}
          <text x="10" y="82" fontFamily="var(--font-mono)" fontSize="9" fill="rgba(255,255,255,0.25)">0</text>
          <text x="95" y="82" fontFamily="var(--font-mono)" fontSize="9" fill="rgba(255,255,255,0.25)">100</text>
        </svg>
        <div>
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--text-2)', marginBottom: 4 }}>
            Market Sentiment
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 24, fontWeight: 700, color: color, lineHeight: 1, marginBottom: 8 }}>
            {confidence}%
          </div>
          <span
            style={{
              display: 'inline-block',
              padding: '3px 10px',
              background: color === 'var(--buy)' ? 'var(--buy-dim)' : color === 'var(--sell)' ? 'var(--sell-dim)' : 'var(--warn-dim)',
              border: `1px solid ${color === 'var(--buy)' ? 'var(--buy-border)' : color === 'var(--sell)' ? 'var(--sell-border)' : 'var(--warn-border)'}`,
              borderRadius: 'var(--r-sm)',
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              fontWeight: 700,
              color,
              letterSpacing: '0.06em',
            }}
          >
            {sentiment.toUpperCase()}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: 14, color: 'var(--text-1)' }}>
          AI Market Advisory
        </div>
        {initialized && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span className="live-dot" style={{ width: 5, height: 5 }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-2)' }}>Connected</span>
          </div>
        )}
      </div>

      {/* API Key setup */}
      {!initialized && (
        <div
          style={{
            padding: '10px 12px', background: 'var(--info-dim)', border: '1px solid var(--info-border)',
            borderRadius: 'var(--r-md)',
          }}
        >
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--text-2)', marginBottom: 8, lineHeight: 1.5 }}>
            Requires a Gemini API key.{' '}
            <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer"
               style={{ color: 'var(--info)', textDecoration: 'none' }}>
              Get one free ↗
            </a>
          </div>
          {showInput ? (
            <div style={{ display: 'flex', gap: 6 }}>
              <input
                type="password" value={apiKey} onChange={e => setApiKey(e.target.value)}
                placeholder="Paste API key…" className="input"
                style={{ flex: 1, fontSize: 11, padding: '5px 8px' }}
              />
              <button className="btn" onClick={handleSaveKey} style={{ padding: '5px 10px', fontSize: 11 }}>Save</button>
              <button className="btn" onClick={() => setShowInput(false)} style={{ padding: '5px 8px', fontSize: 11 }}>✕</button>
            </div>
          ) : (
            <button className="btn" onClick={() => setShowInput(true)} style={{ fontSize: 11, padding: '5px 12px' }}>
              Add API Key
            </button>
          )}
        </div>
      )}

      {/* Analyze button */}
      {initialized && market && (
        <button
          onClick={handleAnalyze}
          disabled={loading}
          style={{
            width: '100%', padding: '9px 0',
            background: loading ? 'var(--bg-hover)' : 'var(--accent)',
            border: '1px solid var(--info-border)',
            borderRadius: 'var(--r-md)',
            color: loading ? 'var(--text-2)' : '#fff',
            fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background var(--dur-sm)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}
        >
          {loading ? (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 0.8s linear infinite' }}>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                <circle cx="12" cy="12" r="9" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
                <path d="M12 3a9 9 0 0 1 9 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Analyzing…
            </>
          ) : `Analyze ${market.ticker}`}
        </button>
      )}

      {error && (
        <div style={{ padding: '8px 10px', background: 'var(--sell-dim)', border: '1px solid var(--sell-border)', borderRadius: 'var(--r-md)', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--sell)' }}>
          {error}
        </div>
      )}

      {/* Analysis results */}
      {analysis && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Sentiment gauge — matches reference layout */}
          <SentimentGauge sentiment={analysis.sentiment} confidence={analysis.confidence} />

          {/* Analysis text */}
          <div
            style={{
              padding: '10px 12px', background: 'var(--bg-inset)', border: '1px solid var(--border)',
              borderRadius: 'var(--r-md)', fontFamily: 'var(--font-ui)', fontSize: 12,
              color: 'var(--text-2)', lineHeight: 1.6,
            }}
          >
            {analysis.analysis}
          </div>

          {/* Recommendation row */}
          <div
            style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '8px 12px', background: 'var(--bg-inset)', border: '1px solid var(--border)',
              borderRadius: 'var(--r-md)',
            }}
          >
            <div>
              <div style={{ fontFamily: 'var(--font-ui)', fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>
                Recommendation
              </div>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: 15, fontWeight: 700,
                color: analysis.recommendation === 'buy' ? 'var(--buy)' : analysis.recommendation === 'sell' ? 'var(--sell)' : 'var(--warn)',
              }}>
                {analysis.recommendation.toUpperCase()}
              </div>
            </div>
            <span className={`badge ${analysis.riskLevel === 'low' ? 'badge-buy' : analysis.riskLevel === 'medium' ? 'badge-warn' : 'badge-sell'}`}>
              {analysis.riskLevel} risk
            </span>
          </div>

          {/* Price targets */}
          {(analysis.targetPrice || analysis.stopLoss) && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {analysis.targetPrice && (
                <div style={{ padding: '8px 10px', background: 'var(--bg-inset)', border: '1px solid var(--buy-border)', borderRadius: 'var(--r-md)' }}>
                  <div style={{ fontFamily: 'var(--font-ui)', fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>Target</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--buy)', fontWeight: 500 }}>${analysis.targetPrice.toFixed(2)}</div>
                </div>
              )}
              {analysis.stopLoss && (
                <div style={{ padding: '8px 10px', background: 'var(--bg-inset)', border: '1px solid var(--sell-border)', borderRadius: 'var(--r-md)' }}>
                  <div style={{ fontFamily: 'var(--font-ui)', fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>Stop Loss</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--sell)', fontWeight: 500 }}>${analysis.stopLoss.toFixed(2)}</div>
                </div>
              )}
            </div>
          )}

          {/* Execute AI trade */}
          {onTrade && analysis.recommendation !== 'hold' && (
            <button
              onClick={() => onTrade(analysis.recommendation as 'buy' | 'sell', 1)}
              className={analysis.recommendation === 'buy' ? 'btn-buy' : 'btn-sell'}
              style={{
                width: '100%', padding: '9px 0', borderRadius: 'var(--r-md)', border: 'none',
                fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 600, cursor: 'pointer',
              }}
            >
              Execute {analysis.recommendation.toUpperCase()}
            </button>
          )}
        </div>
      )}

      {/* Empty state */}
      {initialized && market && !analysis && !loading && (
        <div style={{ textAlign: 'center', padding: '20px 0', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)' }}>
          Click Analyze to get AI insights
        </div>
      )}

      {!initialized && (
        <div style={{ textAlign: 'center', padding: '20px 0', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)' }}>
          Set up API key to use AI analysis
        </div>
      )}
    </div>
  )
}