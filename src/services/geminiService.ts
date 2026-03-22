import { GoogleGenerativeAI } from '@google/generative-ai'

export interface MarketAnalysis {
  sentiment: 'bullish' | 'bearish' | 'neutral'
  confidence: number
  analysis: string
  recommendation: 'buy' | 'sell' | 'hold'
  riskLevel: 'low' | 'medium' | 'high'
  targetPrice?: number
  stopLoss?: number
  reasoning: string
}

let genAI: GoogleGenerativeAI | null = null

export const initializeGemini = (apiKey: string) => {
  genAI = new GoogleGenerativeAI(apiKey)
}

export const analyzeMarket = async (
  marketData: {
    symbol: string
    currentPrice: number
    priceChange24h: number
    volume24h: number
    highPrice24h: number
    lowPrice24h: number
    bids: Array<{ price: number; quantity: number }>
    asks: Array<{ price: number; quantity: number }>
    recentTrades: Array<{ price: number; quantity: number; timestamp: number }>
  }
): Promise<MarketAnalysis> => {
  if (!genAI) {
    throw new Error('Gemini API not initialized. Please set your API key.')
  }

  // Validate input data
  const currentPrice = typeof marketData.currentPrice === 'string' 
    ? parseFloat(marketData.currentPrice) 
    : marketData.currentPrice
  
  if (!currentPrice || isNaN(currentPrice)) {
    throw new Error('Invalid current price data')
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' })

  const prompt = `You are a professional crypto market analyst. Analyze the following market data and provide trading advice.

Market: ${marketData.symbol}
Current Price: $${currentPrice.toFixed(2)}
24h Change: ${marketData.priceChange24h.toFixed(2)}%
24h Volume: $${marketData.volume24h.toLocaleString()}
24h High: $${marketData.highPrice24h.toFixed(2)}
24h Low: $${marketData.lowPrice24h.toFixed(2)}

Order Book (Top 5):
Bids: ${marketData.bids.slice(0, 5).map(b => `$${b.price.toFixed(2)} (${b.quantity.toFixed(2)})`).join(', ')}
Asks: ${marketData.asks.slice(0, 5).map(a => `$${a.price.toFixed(2)} (${a.quantity.toFixed(2)})`).join(', ')}

Recent Trades (Last 10):
${marketData.recentTrades.slice(0, 10).map(t => `$${t.price.toFixed(2)} - ${t.quantity.toFixed(2)} units`).join('\n')}

Based on this data, provide your analysis in the following JSON format:
{
  "sentiment": "bullish|bearish|neutral",
  "confidence": 0-100,
  "analysis": "Brief technical analysis",
  "recommendation": "buy|sell|hold",
  "riskLevel": "low|medium|high",
  "targetPrice": number or null,
  "stopLoss": number or null,
  "reasoning": "Detailed reasoning for the recommendation"
}

Respond ONLY with valid JSON, no additional text.`

  try {
    const result = await model.generateContent(prompt)
    const responseText = result.response.text()
    
    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Invalid response format from Gemini')
    }

    const analysis = JSON.parse(jsonMatch[0]) as MarketAnalysis
    return analysis
  } catch (error) {
    console.error('Error analyzing market:', error)
    throw error
  }
}

export const generateTradingSignal = async (
  marketSymbol: string,
  analysis: MarketAnalysis,
  accountBalance: number
): Promise<{
  action: 'buy' | 'sell' | 'hold'
  quantity: number
  reason: string
  estimatedCost: number
}> => {
  if (!genAI) {
    throw new Error('Gemini API not initialized')
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' })

  const prompt = `Based on the following market analysis, suggest a specific trading action:

Market: ${marketSymbol}
Recommendation: ${analysis.recommendation}
Confidence: ${analysis.confidence}%
Risk Level: ${analysis.riskLevel}
Target Price: ${analysis.targetPrice || 'N/A'}
Stop Loss: ${analysis.stopLoss || 'N/A'}
Account Balance: $${accountBalance.toFixed(2)}

Provide a trading signal in JSON format:
{
  "action": "buy|sell|hold",
  "quantity": number,
  "reason": "Brief explanation",
  "estimatedCost": number
}

Respond ONLY with valid JSON.`

  try {
    const result = await model.generateContent(prompt)
    const responseText = result.response.text()
    
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Invalid response format')
    }

    return JSON.parse(jsonMatch[0])
  } catch (error) {
    console.error('Error generating trading signal:', error)
    throw error
  }
}
