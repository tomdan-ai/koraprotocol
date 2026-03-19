import Anthropic from '@anthropic-ai/sdk'
import { spotApi } from '@/lib/injective'
import { NextResponse } from 'next/server'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY ?? '',
  baseURL: process.env.ANTHROPIC_BASE_URL ?? 'https://api.anthropic.com/v1',
})

export async function POST(req: Request) {
  const { message, walletAddress } = await req.json()
  if (!message) {
    return NextResponse.json({ error: 'message required' }, { status: 400 })
  }

  const markets = await spotApi.fetchMarkets().catch(() => [])
  const topMarkets = Array.isArray(markets) ? markets.slice(0, 10) : []
  const topMarketsContext = topMarkets
    .map((m: any) => ({
      ticker: m.ticker ?? m.marketId ?? `${m.base}/${m.quote}`,
      price: m.price,
      change: m.percentChange,
      volume: m.volume,
    }))
    .slice(0, 10)

  const systemPrompt = `You are Kora, an on-chain DeFi intelligence assistant for the Injective blockchain.\n` +
    `You help users understand markets, manage their portfolio, and make informed decisions. ` +
    `You are direct, data-driven, and concise. Never give financial advice — give insights.\n\n` +
    `LIVE MARKET DATA (right now on Injective):\n${JSON.stringify(topMarketsContext, null, 2)}\n\n` +
    `${walletAddress ? `User's wallet: ${walletAddress}` : 'User has not connected a wallet.'}\n\n` +
    `Always reference the live data when answering market questions.`

  const response = await anthropic.messages.create({
    model: 'claude-2.1',
    max_tokens_to_sample: 512,
    system: systemPrompt,
    messages: [{ role: 'user', content: message }],
  })

  return NextResponse.json({ reply: response?.content?.[0]?.text ?? '' })
}
