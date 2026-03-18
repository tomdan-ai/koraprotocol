'use client'
import { useEffect, useState } from 'react'
import { IndexerGrpcSpotStream } from '@injectivelabs/sdk-ts'
import { ENDPOINTS } from '@/lib/injective'

export function useOrderbookStream(marketId?: string | null) {
  const [orderbook, setOrderbook] = useState<{ bids: any[]; asks: any[] }>({ bids: [], asks: [] })

  useEffect(() => {
    if (!marketId) return
    // create stream and subscribe to orderbook updates
    // use any casts because SDK typings may vary across versions
    const stream: any = new (IndexerGrpcSpotStream as any)(ENDPOINTS.indexer)

    try {
      if (stream?.orderbook?.start) {
        stream.orderbook.start({
          marketId,
          callback: (data: any) => {
            // SDK may return orderbook shape { bids, asks }
            if (!data) return
            if (data.bids || data.asks) setOrderbook({ bids: data.bids ?? [], asks: data.asks ?? [] })
            else setOrderbook(data)
          },
        })
      }
    } catch (err) {
      // swallow errors; fallback will be initial empty
      // eslint-disable-next-line no-console
      console.warn('orderbook stream error', err)
    }

    return () => {
      try {
        stream?.destroy?.()
      } catch (e) {}
    }
  }, [marketId])

  return orderbook
}
