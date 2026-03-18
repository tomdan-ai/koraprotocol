import { spotApi } from '@/lib/injective'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const marketId = url.searchParams.get('marketId')
    if (!marketId) return NextResponse.json({ error: 'marketId required' }, { status: 400 })

    // fetch trades for market
    // try common SDK method names
    let trades: any
    // @ts-ignore
    if (typeof spotApi.fetchTrades === 'function') {
      // some SDK methods accept an object or the marketId directly
      try {
        trades = await (spotApi as any).fetchTrades({ marketId })
      } catch (_) {
        trades = await (spotApi as any).fetchTrades(marketId)
      }
    } else {
      trades = []
    }

    return NextResponse.json(trades)
  } catch (err) {
    return NextResponse.json({ error: (err as any).message ?? 'unknown' }, { status: 500 })
  }
}
