'use client'

import React, { useCallback, useState } from 'react'
import { connectWallet } from '@/lib/wallet'
import { useWalletStore } from '@/store/wallet'

export default function WalletConnect() {
  const address = useWalletStore((s) => s.address)
  const setAddress = useWalletStore((s) => s.setAddress)
  const disconnect = useWalletStore((s) => s.disconnect)
  const [loading, setLoading] = useState(false)

  const onConnect = useCallback(async () => {
    setLoading(true)
    try {
      const addr = await connectWallet()
      setAddress(addr)
    } catch (err) {
      console.error('wallet connect failed', err)
    } finally {
      setLoading(false)
    }
  }, [setAddress])

  return (
    <div className="flex items-center gap-2">
      {address ? (
        <div className="flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-900/40 px-4 py-2 text-xs text-zinc-100">
          <span className="font-mono">{address.slice(0, 6)}...{address.slice(-6)}</span>
          <button
            onClick={disconnect}
            className="rounded-full bg-zinc-800 px-3 py-1 text-xs font-semibold text-zinc-200 hover:bg-zinc-700"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button
          onClick={onConnect}
          disabled={loading}
          className="rounded-full bg-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Connecting…' : 'Connect Wallet'}
        </button>
      )}
    </div>
  )
}
