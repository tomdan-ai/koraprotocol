import { useState, useCallback } from 'react'
import { analyzeMarket, MarketAnalysis } from '../services/geminiService'
import { Market } from '../types'

export interface OrderbookData {
  bids: Array<{ price: number | string; quantity: number | string }>
  asks: Array<{ price: number | string; quantity: number | string }>
}

export interface TradeData {
  price: number | string
  quantity: number | string
  timestamp: number
}

export const useAIAnalysis = () => {
  const [analysis, setAnalysis] = useState<MarketAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const analyze = useCallback(
    async (
      market: Market,
      currentPrice: number,
      orderbook: OrderbookData,
      trades: TradeData[]
    ) => {
      setLoading(true)
      setError(null)

      try {
        // Ensure currentPrice is a number
        const price = typeof currentPrice === 'string' ? parseFloat(currentPrice) : currentPrice
        
        // Calculate 24h stats from available data
        const prices = trades.map(t => typeof t.price === 'string' ? parseFloat(t.price) : t.price)
        const highPrice = prices.length > 0 ? Math.max(...prices, price) : price
        const lowPrice = prices.length > 0 ? Math.min(...prices, price) : price
        const priceChange = prices.length > 0 
          ? ((price - prices[0]) / prices[0]) * 100 
          : 0
        const volume = trades.reduce((sum, t) => {
          const qty = typeof t.quantity === 'string' ? parseFloat(t.quantity) : t.quantity
          return sum + qty
        }, 0)

        const result = await analyzeMarket({
          symbol: market.ticker,
          currentPrice: price,
          priceChange24h: priceChange,
          volume24h: volume * price,
          highPrice24h: highPrice,
          lowPrice24h: lowPrice,
          bids: orderbook.bids.map(b => ({
            price: typeof b.price === 'string' ? parseFloat(b.price) : b.price,
            quantity: typeof b.quantity === 'string' ? parseFloat(b.quantity) : b.quantity,
          })),
          asks: orderbook.asks.map(a => ({
            price: typeof a.price === 'string' ? parseFloat(a.price) : a.price,
            quantity: typeof a.quantity === 'string' ? parseFloat(a.quantity) : a.quantity,
          })),
          recentTrades: trades.map(t => ({
            price: typeof t.price === 'string' ? parseFloat(t.price) : t.price,
            quantity: typeof t.quantity === 'string' ? parseFloat(t.quantity) : t.quantity,
            timestamp: t.timestamp,
          })),
        })

        setAnalysis(result)
        return result
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to analyze market'
        setError(errorMessage)
        throw err
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return { analysis, loading, error, analyze }
}
