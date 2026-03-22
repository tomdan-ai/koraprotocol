import { useEffect, useRef, useState } from 'react'

interface LandingPageProps {
  onLaunch: () => void
}

/* ─── Animated candlestick data for hero background ────────────────────── */
const CANDLES = [
  { o:42, h:58, l:38, c:55 }, { o:55, h:61, l:50, c:52 }, { o:52, h:56, l:45, c:48 },
  { o:48, h:52, l:40, c:51 }, { o:51, h:68, l:49, c:65 }, { o:65, h:72, l:60, c:70 },
  { o:70, h:75, l:63, c:64 }, { o:64, h:67, l:55, c:58 }, { o:58, h:62, l:52, c:60 },
  { o:60, h:74, l:58, c:72 }, { o:72, h:80, l:68, c:78 }, { o:78, h:82, l:70, c:73 },
  { o:73, h:76, l:64, c:66 }, { o:66, h:70, l:58, c:69 }, { o:69, h:78, l:67, c:76 },
  { o:76, h:84, l:74, c:82 }, { o:82, h:86, l:75, c:77 }, { o:77, h:80, l:68, c:71 },
  { o:71, h:75, l:62, c:73 }, { o:73, h:82, l:71, c:80 },
]

function CandlestickBg() {
  const W = 600, H = 180
  const candleW = 20, gap = 10
  const minV = 35, maxV = 90, range = maxV - minV

  const toY = (v: number) => H - ((v - minV) / range) * (H - 20) - 10

  return (
    <svg
      width={W} height={H}
      viewBox={`0 0 ${W} ${H}`}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.18 }}
      preserveAspectRatio="xMidYMid meet"
    >
      {CANDLES.map((c, i) => {
        const x    = i * (candleW + gap) + gap
        const isBull = c.c >= c.o
        const color  = isBull ? '#3fb950' : '#f85149'
        const bodyTop = toY(Math.max(c.o, c.c))
        const bodyH   = Math.max(2, Math.abs(toY(c.o) - toY(c.c)))
        return (
          <g key={i}>
            {/* Wick */}
            <line x1={x + candleW/2} y1={toY(c.h)} x2={x + candleW/2} y2={toY(c.l)}
              stroke={color} strokeWidth="1" opacity="0.6" />
            {/* Body */}
            <rect x={x} y={bodyTop} width={candleW} height={bodyH} fill={color} rx="1" />
          </g>
        )
      })}
    </svg>
  )
}

/* ─── Ticker tape ───────────────────────────────────────────────────────── */
const TICKERS = [
  { pair: 'INJ/USDT',  price: '24.38',  chg: '+3.2%',  up: true  },
  { pair: 'ETH/USDT',  price: '3412.50', chg: '+1.8%', up: true  },
  { pair: 'BTC/USDT',  price: '67240.00',chg: '-0.4%', up: false },
  { pair: 'ATOM/USDT', price: '8.92',   chg: '+5.1%',  up: true  },
  { pair: 'WETH/USDT', price: '3411.20', chg: '+1.7%', up: true  },
  { pair: 'SOL/USDT',  price: '178.40',  chg: '+2.3%', up: true  },
  { pair: 'TIA/USDT',  price: '6.14',    chg: '-1.2%', up: false },
  { pair: 'PYTH/USDT', price: '0.432',   chg: '+4.6%', up: true  },
]

function TickerTape() {
  const items = [...TICKERS, ...TICKERS] // duplicate for seamless loop
  return (
    <div style={{ overflow: 'hidden', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)', padding: '8px 0' }}>
      <div style={{
        display: 'flex', gap: 40, whiteSpace: 'nowrap',
        animation: 'tickerScroll 28s linear infinite',
        width: 'max-content',
      }}>
        {items.map((t, i) => (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-2)', letterSpacing: '0.04em' }}>
              {t.pair}
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-1)', fontWeight: 500 }}>
              {t.price}
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: t.up ? 'var(--buy)' : 'var(--sell)' }}>
              {t.chg}
            </span>
            <span style={{ color: 'var(--border-mid)', fontSize: 10 }}>·</span>
          </span>
        ))}
      </div>
    </div>
  )
}

/* ─── Feature card ──────────────────────────────────────────────────────── */
function FeatureCard({ icon, tag, title, desc, delay }: {
  icon: string; tag: string; title: string; desc: string; delay: string
}) {
  return (
    <div
      style={{
        padding: '28px 24px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--r-lg)',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        animation: `fadeUp 0.6s var(--ease-out) ${delay} both`,
        transition: 'border-color 0.2s, transform 0.2s',
        cursor: 'default',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.18)'
        ;(e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'
        ;(e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'
      }}
    >
      <div style={{ fontSize: 24 }}>{icon}</div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--info)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        {tag}
      </div>
      <div style={{ fontFamily: "'Syne', var(--font-ui)", fontSize: 16, fontWeight: 700, color: 'var(--text-1)', lineHeight: 1.25 }}>
        {title}
      </div>
      <div style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text-2)', lineHeight: 1.65 }}>
        {desc}
      </div>
    </div>
  )
}

/* ─── Stat ──────────────────────────────────────────────────────────────── */
function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontFamily: "'Syne', var(--font-ui)", fontSize: 32, fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-0.03em', lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-2)', marginTop: 6, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
        {label}
      </div>
    </div>
  )
}

/* ─── Main Landing Page ─────────────────────────────────────────────────── */
export default function LandingPage({ onLaunch }: LandingPageProps) {
  const [mounted, setMounted] = useState(false)
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setMounted(true) }, [])

  /* Parallax grid on mouse move */
  useEffect(() => {
    const el = heroRef.current
    if (!el) return
    const handler = (e: MouseEvent) => {
      const { innerWidth: W, innerHeight: H } = window
      const dx = (e.clientX / W - 0.5) * 20
      const dy = (e.clientY / H - 0.5) * 20
      el.style.setProperty('--px', `${dx}px`)
      el.style.setProperty('--py', `${dy}px`)
    }
    window.addEventListener('mousemove', handler)
    return () => window.removeEventListener('mousemove', handler)
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', color: 'var(--text-1)', fontFamily: 'var(--font-ui)', overflow: 'hidden' }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&display=swap');

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes tickerScroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes gridPulse {
          0%,100% { opacity: 0.4; }
          50%      { opacity: 0.65; }
        }
        @keyframes float {
          0%,100% { transform: translateY(0px); }
          50%      { transform: translateY(-10px); }
        }
        @keyframes scanLine {
          from { transform: translateY(-100%); }
          to   { transform: translateY(100vh); }
        }
        @keyframes glow {
          0%,100% { box-shadow: 0 0 20px rgba(56,139,253,0.3), 0 0 60px rgba(56,139,253,0.1); }
          50%      { box-shadow: 0 0 30px rgba(56,139,253,0.5), 0 0 90px rgba(56,139,253,0.2); }
        }
        @keyframes blink {
          0%,100% { opacity: 1; } 50% { opacity: 0; }
        }
        .launch-btn:hover { background: rgba(56,139,253,0.15) !important; transform: translateY(-1px); }
        .launch-btn:active { transform: scale(0.98); }
        .grid-bg {
          background-image:
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 48px 48px;
          animation: gridPulse 6s ease-in-out infinite;
        }
      `}</style>

      {/* ── Navbar ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        height: 56,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 40px',
        background: 'rgba(13,17,23,0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border)',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/kora.png" alt="Kora"
            style={{ width: 28, height: 28, borderRadius: '50%', border: '1px solid var(--border-mid)', objectFit: 'cover' }}
            onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
          />
          <span style={{ fontFamily: "'Syne', var(--font-ui)", fontSize: 16, fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.01em' }}>
            Kora
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)', marginLeft: 2 }}>
            / Injective
          </span>
        </div>

        {/* Nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          {['Features', 'Markets', 'Docs'].map(l => (
            <a key={l} href="#"
              style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text-2)', textDecoration: 'none', transition: 'color 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-1)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-2)')}
            >
              {l}
            </a>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={onLaunch}
          className="launch-btn"
          style={{
            padding: '7px 18px',
            background: 'transparent',
            border: '1px solid var(--info-border)',
            borderRadius: 'var(--r-md)',
            color: 'var(--info)',
            fontFamily: 'var(--font-ui)',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background 0.15s, transform 0.1s',
          }}
        >
          Launch App →
        </button>
      </nav>

      {/* ── Hero ── */}
      <section
        ref={heroRef}
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          paddingTop: 56,
          overflow: 'hidden',
        }}
      >
        {/* Grid background */}
        <div className="grid-bg" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />

        {/* Radial glow */}
        <div style={{
          position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)',
          width: 600, height: 400,
          background: 'radial-gradient(ellipse, rgba(56,139,253,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '10%', right: '10%',
          width: 300, height: 300,
          background: 'radial-gradient(ellipse, rgba(63,185,80,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Scan line */}
        <div style={{
          position: 'absolute', left: 0, right: 0, height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(56,139,253,0.3), transparent)',
          animation: 'scanLine 8s linear infinite',
          pointerEvents: 'none',
        }} />

        {/* Hero content */}
        <div style={{
          position: 'relative', zIndex: 1, maxWidth: 780,
          padding: '0 24px', textAlign: 'center',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28,
        }}>
          {/* Badge */}
          <div
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '5px 14px',
              background: 'rgba(56,139,253,0.08)',
              border: '1px solid rgba(56,139,253,0.2)',
              borderRadius: 100,
              animation: mounted ? 'fadeUp 0.5s var(--ease-out) 0.1s both' : 'none',
            }}
          >
            <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: 'var(--buy)', animation: 'glow 2s ease-in-out infinite' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--info)', letterSpacing: '0.06em' }}>
              LIVE ON INJECTIVE TESTNET
            </span>
          </div>

          {/* Headline */}
          <div style={{ animation: mounted ? 'fadeUp 0.6s var(--ease-out) 0.2s both' : 'none' }}>
            <h1 style={{
              fontFamily: "'Syne', var(--font-ui)",
              fontSize: 'clamp(42px, 7vw, 76px)',
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: '-0.04em',
              color: 'var(--text-1)',
              margin: 0,
            }}>
              Trade Smarter
              <br />
              <span style={{
                background: 'linear-gradient(135deg, #388bfd 0%, #3fb950 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                On-Chain
              </span>
              <span style={{ color: 'var(--text-3)', animation: 'blink 1.2s step-end infinite', marginLeft: 4 }}>_</span>
            </h1>
          </div>

          {/* Subline */}
          <p style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 'clamp(14px, 2vw, 17px)',
            color: 'var(--text-2)',
            lineHeight: 1.7,
            maxWidth: 560,
            margin: 0,
            animation: mounted ? 'fadeUp 0.6s var(--ease-out) 0.35s both' : 'none',
          }}>
            A precision trading terminal built on Injective Protocol. Real-time orderbooks,
            live candlestick charts, AI-powered market analysis, and on-chain execution —
            all in one dashboard.
          </p>

          {/* CTA buttons */}
          <div
            style={{
              display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center',
              animation: mounted ? 'fadeUp 0.6s var(--ease-out) 0.5s both' : 'none',
            }}
          >
            <button
              onClick={onLaunch}
              style={{
                padding: '13px 32px',
                background: 'var(--accent)',
                border: '1px solid rgba(56,139,253,0.5)',
                borderRadius: 'var(--r-md)',
                color: '#fff',
                fontFamily: "'Syne', var(--font-ui)",
                fontSize: 15,
                fontWeight: 700,
                cursor: 'pointer',
                letterSpacing: '-0.01em',
                transition: 'all 0.15s',
                animation: 'glow 3s ease-in-out infinite',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#58a6ff'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent)'; (e.currentTarget as HTMLButtonElement).style.transform = '' }}
            >
              Launch App →
            </button>
            <a
              href="https://docs.injective.network"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '13px 28px',
                background: 'transparent',
                border: '1px solid var(--border-mid)',
                borderRadius: 'var(--r-md)',
                color: 'var(--text-2)',
                fontFamily: 'var(--font-ui)',
                fontSize: 15,
                fontWeight: 500,
                cursor: 'pointer',
                textDecoration: 'none',
                transition: 'all 0.15s',
                display: 'inline-block',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-1)'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(255,255,255,0.2)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-2)'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--border-mid)' }}
            >
              Read Docs
            </a>
          </div>

          {/* Terminal mockup */}
          <div
            style={{
              width: '100%', maxWidth: 700,
              background: 'var(--bg-card)',
              border: '1px solid var(--border-mid)',
              borderRadius: 'var(--r-lg)',
              overflow: 'hidden',
              boxShadow: '0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)',
              animation: mounted ? 'fadeUp 0.8s var(--ease-out) 0.65s both, float 6s ease-in-out 1.5s infinite' : 'none',
              position: 'relative',
            }}
          >
            {/* Terminal title bar */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '10px 14px',
              borderBottom: '1px solid var(--border)',
              background: 'var(--bg-card-alt)',
            }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#f85149', display: 'inline-block' }} />
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#d29922', display: 'inline-block' }} />
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#3fb950', display: 'inline-block' }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)', marginLeft: 8 }}>
                kora · injective-testnet · live
              </span>
              <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ display: 'inline-block', width: 5, height: 5, borderRadius: '50%', background: 'var(--buy)', animation: 'glow 2s ease-in-out infinite' }} />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--buy)' }}>LIVE</span>
              </span>
            </div>
            {/* Candlestick preview */}
            <div style={{ position: 'relative', height: 180, background: '#0d1117' }}>
              <CandlestickBg />
              {/* Overlay data labels */}
              <div style={{ position: 'absolute', top: 12, left: 14, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-2)', display: 'flex', gap: 16 }}>
                <span>O <span style={{ color: 'var(--text-1)' }}>24.38</span></span>
                <span>H <span style={{ color: 'var(--buy)' }}>25.12</span></span>
                <span>L <span style={{ color: 'var(--sell)' }}>23.90</span></span>
                <span>C <span style={{ color: 'var(--text-1)' }}>24.87</span></span>
                <span style={{ color: 'var(--buy)' }}>+2.02%</span>
              </div>
              <div style={{ position: 'absolute', top: 12, right: 14, textAlign: 'right' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 400, color: 'var(--text-1)', lineHeight: 1 }}>24.87</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)', marginTop: 2 }}>USDT</div>
              </div>
            </div>
            {/* Bottom bar */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(4,1fr)',
              borderTop: '1px solid var(--border)', background: 'var(--bg-card-alt)',
            }}>
              {[
                { label: 'Bid', val: '24.85', color: 'var(--buy)' },
                { label: 'Ask', val: '24.89', color: 'var(--sell)' },
                { label: 'Spread', val: '0.017%', color: 'var(--text-2)' },
                { label: 'Volume', val: '2.4M', color: 'var(--text-2)' },
              ].map(item => (
                <div key={item.label} style={{ padding: '10px 14px', borderRight: '1px solid var(--border)' }}>
                  <div style={{ fontFamily: 'var(--font-ui)', fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>
                    {item.label}
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 500, color: item.color }}>
                    {item.val}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Ticker tape ── */}
      <TickerTape />

      {/* ── Stats ── */}
      <section style={{ padding: '64px 40px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 40,
          padding: '40px 48px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--r-lg)',
        }}>
          <Stat value="$2.4B+" label="Daily Volume" />
          <Stat value="200ms"  label="Order Latency" />
          <Stat value="150+"  label="Spot Markets" />
          <Stat value="24/7"  label="Uptime" />
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{ padding: '0 40px 80px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ marginBottom: 48, animation: 'fadeUp 0.6s var(--ease-out) both' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--info)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
            What's inside
          </div>
          <h2 style={{
            fontFamily: "'Syne', var(--font-ui)", fontSize: 'clamp(28px, 4vw, 40px)',
            fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-1)', margin: 0, lineHeight: 1.1,
          }}>
            Everything you need<br />to trade on-chain
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          <FeatureCard
            icon="📊"
            tag="Real-time · Pyth Oracle"
            title="Live Price Charts"
            desc="Candlestick charts powered by Pyth Network and Band Protocol oracles. Switch between 1m to 1D timeframes with sub-second price updates."
            delay="0.1s"
          />
          <FeatureCard
            icon="📖"
            tag="Depth · Injective Indexer"
            title="Full Order Book"
            desc="Live bid/ask depth visualization with animated depth bars, spread tracking, and volume summaries pulled directly from the Injective indexer."
            delay="0.2s"
          />
          <FeatureCard
            icon="⚡"
            tag="On-chain · Keplr + MetaMask"
            title="Direct Trade Execution"
            desc="Place market and limit orders directly on-chain through Injective Protocol. Connect your Keplr or MetaMask wallet and trade with full custody."
            delay="0.3s"
          />
          <FeatureCard
            icon="🤖"
            tag="AI · Gemini 2.5 Flash"
            title="AI Market Advisory"
            desc="Gemini AI analyzes live orderbook depth, recent trade flow, and price action to generate buy/sell signals with confidence scores and risk levels."
            delay="0.4s"
          />
          <FeatureCard
            icon="🔄"
            tag="Streaming · 3s Refresh"
            title="Recent Trade Feed"
            desc="Live stream of executed trades with price, size, total, timestamp, and buy/sell direction. New trades flash green on arrival."
            delay="0.5s"
          />
          <FeatureCard
            icon="🌐"
            tag="Multi-asset · 150+ Markets"
            title="Spot & Derivatives"
            desc="Access INJ, ETH, BTC, ATOM, and 150+ spot markets plus perpetual contracts, all sourced from the Injective Protocol testnet and mainnet."
            delay="0.6s"
          />
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section style={{ padding: '0 40px 100px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{
          position: 'relative',
          padding: '56px 48px',
          background: 'var(--bg-card)',
          border: '1px solid rgba(56,139,253,0.2)',
          borderRadius: 'var(--r-lg)',
          textAlign: 'center',
          overflow: 'hidden',
        }}>
          {/* Glow behind */}
          <div style={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
            width: 500, height: 200,
            background: 'radial-gradient(ellipse, rgba(56,139,253,0.07) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--info)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16 }}>
            Built for Injective Africa Builderthon
          </div>
          <h2 style={{
            fontFamily: "'Syne', var(--font-ui)", fontSize: 'clamp(24px, 3.5vw, 36px)',
            fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-1)',
            margin: '0 0 16px', lineHeight: 1.1,
          }}>
            Ready to trade on Injective?
          </h2>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--text-2)', marginBottom: 32, lineHeight: 1.6 }}>
            Connect your wallet and start trading in under 60 seconds.
          </p>
          <button
            onClick={onLaunch}
            style={{
              padding: '14px 40px',
              background: 'var(--accent)',
              border: 'none',
              borderRadius: 'var(--r-md)',
              color: '#fff',
              fontFamily: "'Syne', var(--font-ui)",
              fontSize: 16,
              fontWeight: 700,
              cursor: 'pointer',
              letterSpacing: '-0.01em',
              transition: 'all 0.15s',
              animation: 'glow 3s ease-in-out infinite',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#58a6ff'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent)'; (e.currentTarget as HTMLButtonElement).style.transform = '' }}
          >
            Open Dashboard →
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{
        borderTop: '1px solid var(--border)',
        padding: '24px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: "'Syne', var(--font-ui)", fontSize: 13, fontWeight: 700, color: 'var(--text-1)' }}>Kora</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)' }}>
            / Injective Africa Builderthon · {new Date().getFullYear()}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          {[
            { label: 'Injective', href: 'https://injective.com' },
            { label: 'Docs', href: 'https://docs.injective.network' },
            { label: 'GitHub', href: 'https://github.com/InjectiveLabs' },
          ].map(({ label, href }) => (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer"
              style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)', textDecoration: 'none', transition: 'color 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-1)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-3)')}
            >
              {label}
            </a>
          ))}
        </div>
      </footer>
    </div>
  )
}