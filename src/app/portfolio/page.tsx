"use client"

import React, { useMemo } from 'react'
import WalletConnect from '@/components/WalletConnect'
import { useWalletStore } from '@/store/wallet'
import { usePortfolioStream } from '@/hooks/usePortfolioStream'

function formatCoin(entry: any) {
  if (!entry) return ''
  return `${entry.denom ?? entry.denomination ?? ''} ${entry.amount ?? entry.free ?? entry.total ?? ''}`
}

export default function PortfolioPage() {
  const address = useWalletStore((s) => s.address)
  const { balances, orders, positions, pnl, loading, error } = usePortfolioStream(address)

  const summary = useMemo(() => {
    const total = balances?.reduce((sum: number, b: any) => sum + Number(b.amount ?? 0), 0)
    return { total: total ?? 0 }
  }, [balances])

  return (
    <div className="min-h-screen px-6 py-8">
      <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Portfolio</h1>
          <p className="mt-1 text-sm text-zinc-300">Wallet balances, open orders, and PnL.</p>
        </div>
        <WalletConnect />
      </header>

      {!address ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-8 text-center text-sm text-zinc-300">
          Connect your wallet to view portfolio balances and open orders.
        </div>
      ) : loading ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-8 text-center text-sm text-zinc-300">Loading...</div>
      ) : error ? (
        <div className="rounded-xl border border-rose-600/40 bg-rose-950/20 p-8 text-center text-sm text-rose-200">{error}</div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/30 p-6">
              <div className="flex items-baseline justify-between">
                <h2 className="text-base font-semibold text-white">Total Balance</h2>
                <span className="text-sm text-zinc-400">Updated now</span>
              </div>
              <div className="mt-4 text-3xl font-bold text-white">
                {summary?.total ? `$${Number(summary.total).toFixed(2)}` : '—'}
              </div>
              <div className="mt-2 text-sm font-semibold" aria-label="Real-time PnL">
                <span
                  className={`px-2 py-1 rounded-full ${
                    pnl > 0 ? 'bg-emerald-500/20 text-emerald-200' : pnl < 0 ? 'bg-rose-500/20 text-rose-200' : 'bg-zinc-800 text-zinc-300'
                  }`}
                >
                  PnL {pnl >= 0 ? '+' : ''}{pnl.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-950/30 p-6">
              <h3 className="text-sm font-semibold text-white">Balances</h3>
              <div className="mt-4 space-y-2">
                {balances?.length ? (
                  balances.map((b: any) => (
                    <div key={b.denom ?? b.denomination} className="flex items-center justify-between text-sm">
                      <span className="text-zinc-300">{b.denom ?? b.denomination}</span>
                      <span className="font-semibold text-white">{b.amount ?? b.free ?? '0'}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-zinc-400">No balances found.</div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/30 p-6">
              <h3 className="text-sm font-semibold text-white">Open Orders</h3>
              <div className="mt-4 space-y-2 text-sm text-zinc-300">
                {orders?.length ? (
                  orders.slice(0, 6).map((o: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span>{o.marketId ?? o.market ?? '—'}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">{o.price ?? o.limit ?? '—'}</span>
                        <span className="text-xs text-zinc-500">{o.state ?? o.status ?? o.orderState ?? 'open'}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div>No open orders</div>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-950/30 p-6">
              <h3 className="text-sm font-semibold text-white">Positions</h3>
              <div className="mt-4 space-y-2 text-sm text-zinc-300">
                {positions?.length ? (
                  positions.slice(0, 6).map((p: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span>{p.marketId ?? p.market ?? '—'}</span>
                      <span className="font-medium text-white">{p.size ?? p.quantity ?? '—'}</span>
                    </div>
                  ))
                ) : (
                  <div>No positions</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
