import { spotApi } from '@/lib/injective'
import { NextResponse } from 'next/server'

export async function GET() {
  const markets = await spotApi.fetchMarkets()
  return NextResponse.json(markets)
}
