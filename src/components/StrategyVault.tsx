'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { useWalletStore } from '@/store/wallet'
import { wasmApi } from '@/lib/injective'
import { msgBroadcaster } from '@/lib/wallet'
import { MsgExecuteContract } from '@injectivelabs/sdk-ts'
import { Settings, Play, Pause, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react'

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_VAULT_CONTRACT_ADDRESS || ''

export default function StrategyVault() {
  const address = useWalletStore((s) => s.address)
  const [strategy, setStrategy] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [executing, setExecuting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Form states
  const [marketId, setMarketId] = useState('inj-usdt')
  const [amount, setAmount] = useState('1000000') // 1 INJ in 18 decimals? or whatever the contract expects
  const [interval, setInterval] = useState('3600')

  const fetchStrategy = useCallback(async () => {
    if (!address || !CONTRACT_ADDRESS) return
    setLoading(true)
    setError(null)
    try {
      const queryMsg = { get_strategy: { address } }
      const response = await wasmApi.fetchSmartContractState(
        CONTRACT_ADDRESS,
        btoa(JSON.stringify(queryMsg))
      )
      // fetchSmartContractState returns a base64 encoded string of the JSON response or the parsed JSON depending on SDK version
      // usually it returns the raw data as a string/object
      const data = response as any
      setStrategy(data?.strategy || null)
    } catch (err: any) {
      console.error('fetch strategy failed', err)
      // If contract returns null or error for "not found", we handle it
      setStrategy(null)
    } finally {
      setLoading(false)
    }
  }, [address])

  useEffect(() => {
    fetchStrategy()
  }, [fetchStrategy])

  const handleExecute = async (msg: any) => {
    if (!address || !CONTRACT_ADDRESS) return
    setExecuting(true)
    setError(null)
    setSuccess(null)
    try {
      const executeMsg = MsgExecuteContract.fromJSON({
        sender: address,
        contractAddress: CONTRACT_ADDRESS,
        msg,
      })

      const txHash = await msgBroadcaster.broadcast({
        msgs: [executeMsg],
        injectiveAddress: address,
      })

      setSuccess(`Transaction successful: ${txHash.txHash.slice(0, 8)}...`)
      await fetchStrategy()
    } catch (err: any) {
      setError(err.message || 'Transaction failed')
    } finally {
      setExecuting(false)
    }
  }

  const onSetStrategy = (e: React.FormEvent) => {
    e.preventDefault()
    handleExecute({
      set_strategy: {
        amount_per_order: amount,
        interval_seconds: parseInt(interval),
        market_id: marketId,
      },
    })
  }

  const onPause = () => handleExecute({ pause_strategy: {} })
  const onResume = () => handleExecute({ resume_strategy: {} })

  if (!address) {
    return (
      <div className="p-6 text-center rounded-2xl border border-white/5 bg-white/5 backdrop-blur-md">
        <p className="text-zinc-500 text-sm">Connect wallet to manage strategies</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full gap-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
            <Settings size={18} />
          </div>
          <h3 className="text-sm font-bold tracking-wider text-zinc-400 uppercase">Strategy Vault</h3>
        </div>
        <button 
          onClick={fetchStrategy}
          disabled={loading}
          className="p-1.5 rounded-full hover:bg-white/5 text-zinc-500 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {strategy ? (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl relative overflow-hidden group">
            <div className={`absolute top-0 right-0 w-24 h-24 blur-3xl rounded-full -mr-12 -mt-12 transition-colors ${strategy.is_active ? 'bg-emerald-500/20' : 'bg-rose-500/20'}`} />
            
            <div className="flex items-center justify-between mb-4">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                strategy.is_active 
                  ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' 
                  : 'text-rose-400 bg-rose-400/10 border-rose-400/20'
              }`}>
                {strategy.is_active ? 'ACTIVE' : 'PAUSED'}
              </span>
              <span className="text-[10px] font-mono text-zinc-500">{strategy.market_id}</span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-[10px] text-zinc-500 uppercase mb-1">Amount</div>
                <div className="text-lg font-bold text-white font-mono">{strategy.amount_per_order}</div>
              </div>
              <div>
                <div className="text-[10px] text-zinc-500 uppercase mb-1">Interval</div>
                <div className="text-lg font-bold text-white font-mono">{strategy.interval_seconds}s</div>
              </div>
            </div>

            <div className="flex gap-2">
              {strategy.is_active ? (
                <button
                  onClick={onPause}
                  disabled={executing}
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-white/5 border border-white/10 text-sm font-semibold hover:bg-white/10 transition-all disabled:opacity-50"
                >
                  <Pause size={14} /> Pause
                </button>
              ) : (
                <button
                  onClick={onResume}
                  disabled={executing}
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-sm font-semibold hover:bg-emerald-500/30 transition-all disabled:opacity-50"
                >
                  <Play size={14} /> Resume
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={onSetStrategy} className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] text-zinc-500 uppercase px-1">Market ID</label>
            <input 
              value={marketId}
              onChange={(e) => setMarketId(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-cyan-500/50 transition-colors"
              placeholder="e.g. inj-usdt"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] text-zinc-500 uppercase px-1">Amount</label>
              <input 
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-cyan-500/50 transition-colors"
                placeholder="Micro units"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] text-zinc-500 uppercase px-1">Seconds</label>
              <input 
                type="number"
                value={interval}
                onChange={(e) => setInterval(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-cyan-500/50 transition-colors"
                placeholder="Interval"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={executing}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 text-white font-bold text-sm shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {executing ? 'Deploying...' : 'Deploy DCA Strategy'}
          </button>
        </form>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
          <AlertCircle size={14} className="shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs text-balance">
          <CheckCircle2 size={14} className="shrink-0" />
          <p>{success}</p>
        </div>
      )}
    </div>
  )
}
