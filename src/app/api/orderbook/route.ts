import { spotApi } from '@/lib/injective'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const marketId = url.searchParams.get('marketId')
    if (!marketId) return NextResponse.json({ error: 'marketId required' }, { status: 400 })

    // fetch orderbook (v2 if available)
    // fallback to whichever method the SDK exposes
    // prefer fetchOrderbookV2 if present on spotApi
    // @ts-ignore
    const orderbook = typeof spotApi.fetchOrderbookV2 === 'function'
      ? await (spotApi as any).fetchOrderbookV2(marketId)
      : await (spotApi as any).fetchOrderbook({ marketId })

    return NextResponse.json(orderbook)
  } catch (err) {
    return NextResponse.json({ error: (err as any).message ?? 'unknown' }, { status: 500 })
  }
}
