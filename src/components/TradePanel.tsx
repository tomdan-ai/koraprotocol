import { useState, useEffect, useCallback } from 'react'
import { getNetworkChainInfo, Network } from '@injectivelabs/networks'
import { ChainId } from '@injectivelabs/ts-types'
import { Market } from '../types'
import { executeSpotOrder, validateTradeRequest, TradeRequest } from '../services/tradingService'

interface AITradeRequest { action: 'buy' | 'sell'; quantity: number }
interface TradePanelProps {
  market: Market | null
  currentPrice: number
  aiTrade?: AITradeRequest | null
  onAiTradeComplete?: (r: { success: boolean; message: string; txHash?: string }) => void
  loading?: boolean
}

const INJECTIVE_NETWORK = (import.meta as any).env?.VITE_INJECTIVE_NETWORK === 'mainnet'
  ? Network.Mainnet : Network.Testnet
const INJECTIVE_CHAIN_ID = getNetworkChainInfo(INJECTIVE_NETWORK)?.chainId || ChainId.Testnet

export default function TradePanel({ market, currentPrice, aiTrade, onAiTradeComplete, loading = false }: TradePanelProps) {
  const [action, setAction]           = useState<'buy' | 'sell'>('buy')
  const [quantity, setQuantity]       = useState('1')
  const [price, setPrice]             = useState(currentPrice.toString())
  const [orderType, setOrderType]     = useState<'market' | 'limit'>('market')
  const [executing, setExecuting]     = useState(false)
  const [tradeResult, setTradeResult] = useState<{ success: boolean; message: string } | null>(null)
  const [walletConnected, setWallet]  = useState(false)
  const [walletAddress, setAddress]   = useState<string | null>(null)
  const [signer, setSigner]           = useState<any>(null)
  const [walletProvider, setProvider] = useState<string | null>(null)
  const [connecting, setConnecting]   = useState(false)

  const handleConnectWallet = async () => {
    setConnecting(true)
    try {
      if ((window as any).keplr) {
        await (window as any).keplr.enable(INJECTIVE_CHAIN_ID)
        const offlineSigner = (window as any).getOfflineSigner(INJECTIVE_CHAIN_ID)
        const accounts = await offlineSigner.getAccounts()
        if (accounts?.length) {
          setWallet(true); setAddress(accounts[0].address); setProvider('keplr')
          setSigner({ address: accounts[0].address, type: 'keplr', offlineSigner, chainId: INJECTIVE_CHAIN_ID })
          setTradeResult({ success: true, message: 'Keplr connected' }); return
        }
      }
      if ((window as any).ethereum) {
        const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' })
        if (accounts?.length) {
          setWallet(true); setAddress(accounts[0]); setProvider('metamask')
          setSigner({ address: accounts[0], type: 'metamask', provider: (window as any).ethereum })
          setTradeResult({ success: true, message: 'MetaMask connected' }); return
        }
      }
      setTradeResult({ success: false, message: 'No wallet found' })
    } catch (e) {
      setTradeResult({ success: false, message: e instanceof Error ? e.message : 'Connection failed' })
    } finally {
      setConnecting(false)
    }
  }

  const handleExecute = useCallback(async (aiReq?: AITradeRequest) => {
    if (!market) return
    const req: TradeRequest = {
      market,
      action: aiReq?.action ?? action,
      quantity: aiReq?.quantity ?? parseFloat(quantity),
      price: parseFloat(price),
      orderType,
    }
    const v = validateTradeRequest(req)
    if (!v.valid) { setTradeResult({ success: false, message: v.error || 'Invalid' }); onAiTradeComplete?.({ success: false, message: v.error || '' }); return }
    if (!walletConnected || !signer) { setTradeResult({ success: false, message: 'Connect wallet first' }); onAiTradeComplete?.({ success: false, message: 'Connect wallet first' }); return }
    setExecuting(true); setTradeResult(null)
    try {
      const result = await executeSpotOrder(req, signer)
      setTradeResult({ success: result.success, message: result.message })
      onAiTradeComplete?.({ success: result.success, message: result.message, txHash: result.txHash })
      if (result.success) setQuantity('1')
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed'
      setTradeResult({ success: false, message: msg }); onAiTradeComplete?.({ success: false, message: msg })
    } finally { setExecuting(false) }
  }, [action, market, orderType, price, quantity, signer, walletConnected, onAiTradeComplete])

  useEffect(() => {
    if (!aiTrade) return
    if (!walletConnected) { setTradeResult({ success: false, message: 'Connect wallet for AI trade' }); return }
    handleExecute(aiTrade)
  }, [aiTrade, walletConnected, handleExecute])

  const total   = parseFloat(quantity) * parseFloat(price)
  const isValid = parseFloat(quantity) > 0 && parseFloat(price) > 0
  const base    = market?.baseSymbol  || 'BASE'
  const quote   = market?.quoteSymbol || 'QUOTE'

  if (!market) {
    return (
      <div style={{ padding: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <span style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--text-3)' }}>Select a market</span>
      </div>
    )
  }

  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Title */}
      <div>
        <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: 15, color: 'var(--text-1)' }}>
          Trade {market.ticker}
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-2)', marginTop: 2 }}>
          ···
        </div>
      </div>

      {/* Buy / Sell segmented control — matches reference exactly */}
      <div
        style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          border: '1px solid var(--border-mid)',
          borderRadius: 'var(--r-md)',
          overflow: 'hidden',
        }}
      >
        <button
          onClick={() => setAction('buy')}
          style={{
            padding: '9px 0',
            background: action === 'buy' ? '#238636' : 'transparent',
            border: 'none',
            borderRight: '1px solid var(--border-mid)',
            color: action === 'buy' ? '#fff' : 'var(--text-2)',
            fontFamily: 'var(--font-ui)',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background var(--dur-sm)',
          }}
        >
          Buy
        </button>
        <button
          onClick={() => setAction('sell')}
          style={{
            padding: '9px 0',
            background: action === 'sell' ? '#b91c1c' : 'transparent',
            border: 'none',
            color: action === 'sell' ? '#fff' : 'var(--text-2)',
            fontFamily: 'var(--font-ui)',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background var(--dur-sm)',
          }}
        >
          Sell
        </button>
      </div>

      {/* Order type */}
      <div
        style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          border: '1px solid var(--border-mid)',
          borderRadius: 'var(--r-md)',
          overflow: 'hidden',
        }}
      >
        {(['market', 'limit'] as const).map((ot, i) => (
          <button
            key={ot}
            onClick={() => setOrderType(ot)}
            style={{
              padding: '7px 0',
              background: orderType === ot ? 'var(--bg-active)' : 'transparent',
              border: 'none',
              borderRight: i === 0 ? '1px solid var(--border-mid)' : 'none',
              color: orderType === ot ? 'var(--text-1)' : 'var(--text-2)',
              fontFamily: 'var(--font-ui)',
              fontSize: 12,
              fontWeight: orderType === ot ? 600 : 400,
              cursor: 'pointer',
              transition: 'background var(--dur-sm), color var(--dur-sm)',
              textTransform: 'capitalize',
            }}
          >
            {ot.charAt(0).toUpperCase() + ot.slice(1)}
          </button>
        ))}
      </div>

      {/* Wallet connect if needed */}
      {!walletConnected && (
        <button
          className="btn"
          onClick={handleConnectWallet}
          disabled={connecting}
          style={{ width: '100%', justifyContent: 'center', fontSize: 12 }}
        >
          {connecting ? 'Connecting…' : '⟠ Connect Wallet'}
        </button>
      )}

      {walletConnected && walletAddress && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 8px', background: 'var(--buy-dim)', border: '1px solid var(--buy-border)', borderRadius: 'var(--r-sm)' }}>
          <span className="live-dot" style={{ width: 5, height: 5 }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--buy)' }}>
            {walletProvider} · {walletAddress.slice(0, 8)}…{walletAddress.slice(-6)}
          </span>
        </div>
      )}

      {/* Quantity */}
      <div>
        <div style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--text-2)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Quantity ({base})
        </div>
        <div style={{ position: 'relative' }}>
          <input
            type="number"
            value={quantity}
            onChange={e => setQuantity(e.target.value)}
            placeholder="0.00"
            className="input"
            step="0.01"
            min="0"
          />
          <span
            style={{
              position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
              fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)',
              pointerEvents: 'none',
            }}
          >
            {base}
          </span>
        </div>
      </div>

      {/* Price */}
      <div>
        <div style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--text-2)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Price ({quote})
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              type="number"
              value={price}
              onChange={e => setPrice(e.target.value)}
              placeholder="0.00"
              disabled={orderType === 'market'}
              className="input"
              step="0.01"
              min="0"
            />
          </div>
          <button
            className="btn"
            onClick={() => setPrice(currentPrice.toString())}
            style={{ padding: '7px 10px', fontSize: 11, flexShrink: 0 }}
          >
            Current
          </button>
        </div>
      </div>

      {/* Total */}
      <div
        style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '8px 10px',
          background: 'var(--bg-inset)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--r-md)',
        }}
      >
        <span style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-1)', fontWeight: 500 }}>
          {isNaN(total) ? '—' : total.toFixed(2)} {quote}
        </span>
      </div>

      {/* Result */}
      {tradeResult && (
        <div
          style={{
            padding: '8px 10px',
            background: tradeResult.success ? 'var(--buy-dim)' : 'var(--sell-dim)',
            border: `1px solid ${tradeResult.success ? 'var(--buy-border)' : 'var(--sell-border)'}`,
            borderRadius: 'var(--r-md)',
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: tradeResult.success ? 'var(--buy)' : 'var(--sell)',
          }}
        >
          {tradeResult.success ? '✓ ' : '✗ '}{tradeResult.message}
        </div>
      )}

      {/* Execute button — full width, color matches action */}
      <button
        onClick={() => handleExecute()}
        disabled={!isValid || executing || loading || !walletConnected}
        className={action === 'buy' ? 'btn-buy' : 'btn-sell'}
        style={{
          width: '100%',
          padding: '12px 0',
          borderRadius: 'var(--r-md)',
          border: 'none',
          fontSize: 14,
          fontWeight: 700,
          fontFamily: 'var(--font-ui)',
          cursor: isValid && !executing && !loading && walletConnected ? 'pointer' : 'not-allowed',
          opacity: !isValid || executing || loading || !walletConnected ? 0.5 : 1,
          letterSpacing: '0.02em',
          transition: 'background var(--dur-sm)',
        }}
      >
        {executing || loading
          ? 'Processing…'
          : !walletConnected
          ? 'Connect Wallet First'
          : `${action === 'buy' ? 'Buy' : 'Sell'} ${base}`}
      </button>

      {/* Info note */}
      <div
        style={{
          padding: '8px 10px',
          background: 'var(--info-dim)',
          border: '1px solid var(--info-border)',
          borderRadius: 'var(--r-md)',
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          color: 'var(--info)',
          lineHeight: 1.5,
        }}
      >
        ℹ Real trading on Injective {(import.meta as any).env?.VITE_INJECTIVE_NETWORK === 'mainnet' ? 'Mainnet' : 'Testnet'}. Ensure you have tokens.
      </div>
    </div>
  )
}