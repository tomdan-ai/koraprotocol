"use client"

import React, { useEffect, useMemo, useState } from 'react'
import WalletConnect from '@/components/WalletConnect'
import { useWalletStore } from '@/store/wallet'

function formatCoin(entry: any) {
  if (!entry) return ''
  return `${entry.denom ?? entry.denomination ?? ''} ${entry.amount ?? entry.free ?? entry.total ?? ''}`
}

export default function PortfolioPage() {
  const address = useWalletStore((s) => s.address)
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!address) return
    setLoading(true)
    setError(null)
    fetch(`/api/portfolio?address=${encodeURIComponent(address)}`)
      .then((r) => r.json())
      .then((d) => {
        if (d?.error) {
          setError(d.error)
        } else {
          setData(d)
        }
      })
      .catch((err) => setError(err?.message ?? 'failed'))
      .finally(() => setLoading(false))
  }, [address])

  const summary = useMemo(() => {
    if (!data) return null
    const total = data?.balances?.reduce((sum: number, b: any) => sum + Number(b.amount ?? 0), 0)
    return { total }
  }, [data])

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
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-950/30 p-6">
              <h3 className="text-sm font-semibold text-white">Balances</h3>
              <div className="mt-4 space-y-2">
                {data?.balances?.length ? (
                  data.balances.map((b: any) => (
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
                {data?.orders?.length ? (
                  data.orders.slice(0, 6).map((o: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span>{o.marketId ?? o.market ?? '—'}</span>
                      <span className="font-medium text-white">{o.price ?? o.limit ?? '—'}</span>
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
                {data?.positions?.length ? (
                  data.positions.slice(0, 6).map((p: any, idx: number) => (
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
