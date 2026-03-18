'use client'
import { useEffect, useState } from 'react'
import { IndexerGrpcSpotStream } from '@injectivelabs/sdk-ts'
import { ENDPOINTS } from '@/lib/injective'

export function useTradesStream(marketId?: string | null) {
  const [trades, setTrades] = useState<any[]>([])

  useEffect(() => {
    if (!marketId) return
    const stream: any = new (IndexerGrpcSpotStream as any)(ENDPOINTS.indexer)

    try {
      if (stream?.trades?.start) {
        stream.trades.start({
          marketId,
          callback: (data: any) => {
            if (!data) return
            // data may be an array or a single trade
            const incoming = Array.isArray(data) ? data : [data]
            setTrades((prev) => {
              const merged = [...incoming, ...prev]
              return merged.slice(0, 200)
            })
          },
        })
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('trades stream error', err)
    }

    return () => {
      try {
        stream?.destroy?.()
      } catch (e) {}
    }
  }, [marketId])

  return trades
}
