'use client'

import { useEffect, useMemo, useState } from 'react'
import { IndexerGrpcAccountStream, IndexerGrpcSpotStream, getDefaultSubaccountId } from '@injectivelabs/sdk-ts'
import { ENDPOINTS } from '@/lib/injective'

type PortfolioState = {
  balances: any[]
  orders: any[]
  positions: any[]
  pnl: number
  loading: boolean
  error: string | null
}

function findBalanceKey(balance: any) {
  return (balance?.denom ?? balance?.denomination ?? balance?.symbol ?? '').toString()
}

function findOrderKey(order: any) {
  return (
    order?.orderHash ?? order?.hash ?? order?.id ?? order?.orderId ?? order?.order_id ?? ''
  ).toString()
}

function applyUpdate<T>(items: T[], update: { operation?: any; [key: string]: any }, keyFn: (item: any) => string) {
  const operation = (update?.operation ?? '').toString().toLowerCase()
  const item = update?.balance ?? update?.order ?? update?.position ?? update?.data ?? null
  if (!item) return items

  const key = keyFn(item)
  if (!key) return items

  if (operation === 'delete' || operation === 'remove') {
    return items.filter((i) => keyFn(i) !== key)
  }

  const existingIndex = items.findIndex((i) => keyFn(i) === key)
  if (existingIndex >= 0) {
    const updated = [...items]
    updated[existingIndex] = item
    return updated
  }

  return [item, ...items]
}

function calculatePnL(positions: any[]) {
  if (!positions?.length) return 0
  return positions.reduce((sum, p) => {
    const pnl = Number(p?.unrealizedPnl ?? p?.unrealized_pnl ?? p?.pnl ?? 0)
    return sum + (Number.isFinite(pnl) ? pnl : 0)
  }, 0)
}

export function usePortfolioStream(address?: string | null) {
  const [balances, setBalances] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [positions, setPositions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!address) {
      setBalances([])
      setOrders([])
      setPositions([])
      setLoading(false)
      setError(null)
      return
    }

    const subaccountId = getDefaultSubaccountId(address)
    const accountStream = new IndexerGrpcAccountStream(ENDPOINTS.indexer)
    const spotStream = new IndexerGrpcSpotStream(ENDPOINTS.indexer)

    let balanceSub: any
    let orderSub: any

    const fetchInitial = async () => {
      setLoading(true)
      setError(null)

      try {
        const res = await fetch(`/api/portfolio?address=${encodeURIComponent(address)}`)
        const data = await res.json()
        if (data?.error) {
          setError(data.error)
        } else {
          setBalances(Array.isArray(data.balances) ? data.balances : [])
          setOrders(Array.isArray(data.orders) ? data.orders : [])
          setPositions(Array.isArray(data.positions) ? data.positions : [])
        }
      } catch (err: any) {
        setError(err?.message ?? 'Failed to load portfolio')
      } finally {
        setLoading(false)
      }
    }

    fetchInitial()

    try {
      balanceSub = accountStream.streamSubaccountBalance({
        subaccountId,
        callback: (update) => {
          setBalances((prev) => applyUpdate(prev, update, findBalanceKey))
        },
        onStatusCallback: (status) => {
          // optionally track connection health
        },
      })
    } catch (err) {
      // ignore streaming setup errors
      // eslint-disable-next-line no-console
      console.warn('portfolio balance stream error', err)
    }

    try {
      orderSub = spotStream.streamOrders({
        subaccountId,
        callback: (update) => {
          setOrders((prev) => applyUpdate(prev, update, findOrderKey))
        },
        onStatusCallback: (status) => {
          // optionally track connection health
        },
      })
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('portfolio orders stream error', err)
    }

    return () => {
      try {
        balanceSub?.unsubscribe?.()
      } catch (e) {
        // ignore
      }
      try {
        orderSub?.unsubscribe?.()
      } catch (e) {
        // ignore
      }
    }
  }, [address])

  const pnl = useMemo(() => calculatePnL(positions), [positions])

  return { balances, orders, positions, pnl, loading, error }
}
