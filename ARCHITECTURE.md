# AI Trading Dashboard - Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    React Dashboard UI                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────┐  ┌──────────────────┐                 │
│  │  AI Advisory     │  │  Trade Panel     │                 │
│  │  Component       │  │  Component       │                 │
│  └────────┬─────────┘  └────────┬─────────┘                 │
│           │                     │                            │
│           └──────────┬──────────┘                            │
│                      │                                       │
│  ┌────────────────────────────────────────┐                 │
│  │  Dashboard (Main Container)            │                 │
│  │  - Market Selector                     │                 │
│  │  - Price Widget                        │                 │
│  │  - Orderbook Table                     │                 │
│  │  - Price Chart                         │                 │
│  │  - Trades List                         │                 │
│  └────────────────────────────────────────┘                 │
│                                                               │
└─────────────────────────────────────────────────────────────┘
         │                              │
         │                              │
         ▼                              ▼
┌──────────────────────┐      ┌──────────────────────┐
│  Injective Client    │      │  Gemini API Service  │
│  (Market Data)       │      │  (AI Analysis)       │
└──────────────────────┘      └──────────────────────┘
         │                              │
         ▼                              ▼
┌──────────────────────┐      ┌──────────────────────┐
│  Kora Protocol  │      │  Google Gemini API   │
│  (Blockchain)        │      │  (AI Model)          │
└──────────────────────┘      └──────────────────────┘
```

## Data Flow

### Market Analysis Flow

```
User selects market
        │
        ▼
User clicks "Analyze"
        │
        ▼
useAIAnalysis hook triggered
        │
        ▼
Fetch market data:
  - Current price
  - Order book
  - Recent trades
  - 24h stats
        │
        ▼
Call geminiService.analyzeMarket()
        │
        ▼
Send to Gemini API with prompt
        │
        ▼
Gemini returns analysis:
  - Sentiment
  - Confidence
  - Recommendation
  - Risk level
  - Targets
        │
        ▼
Display in AIAdvisory component
        │
        ▼
User can execute trade or dismiss
```

### Trading Flow

```
User enters order details:
  - Action (Buy/Sell)
  - Quantity
  - Price
  - Order type
        │
        ▼
User clicks "Execute"
        │
        ▼
TradePanel validates input
        │
        ▼
[Currently] Show confirmation
[Future] Connect wallet → Sign → Submit to Injective
        │
        ▼
Display result to user
```

## Component Hierarchy

```
App
└── Dashboard
    ├── MarketSelector
    ├── AIAdvisory
    │   ├── API Key Input
    │   ├── Analyze Button
    │   └── Analysis Display
    │       ├── Sentiment Card
    │       ├── Recommendation Card
    │       ├── Price Targets
    │       └── Execute Trade Button
    ├── TradePanel
    │   ├── Action Tabs (Buy/Sell)
    │   ├── Order Type Selector
    │   ├── Quantity Input
    │   ├── Price Input
    │   ├── Total Display
    │   └── Execute Button
    ├── PriceWidget
    ├── OrderbookTable
    ├── PriceChart
    └── TradesList
```

## State Management

### Local Component State

**AIAdvisory.tsx**
```typescript
- apiKey: string
- showApiInput: boolean
- isInitialized: boolean
- analysis: MarketAnalysis | null
- loading: boolean
- error: string | null
```

**TradePanel.tsx**
```typescript
- action: 'buy' | 'sell'
- quantity: string
- price: string
- orderType: 'market' | 'limit'
- executing: boolean
```

**Dashboard.tsx**
```typescript
- selectedMarket: Market | null
- showDebug: boolean
- showAIPanel: boolean
- showTradePanel: boolean
```

### Persistent State

**Browser localStorage**
```typescript
- selectedMarketId: string
- gemini_api_key: string (encrypted recommended for production)
```

## Service Layer

### geminiService.ts

```typescript
initializeGemini(apiKey: string)
  └─ Creates GoogleGenerativeAI instance

analyzeMarket(marketData)
  ├─ Formats market data
  ├─ Creates analysis prompt
  ├─ Calls Gemini API
  └─ Returns MarketAnalysis

generateTradingSignal(symbol, analysis, balance)
  ├─ Creates signal prompt
  ├─ Calls Gemini API
  └─ Returns trading signal
```

### injectiveClient.ts (Existing)

```typescript
getMarkets()
  └─ Fetches available markets

getOrderbook(marketId)
  └─ Fetches order book data

getTrades(marketId)
  └─ Fetches recent trades
```

## Hook Layer

### useAIAnalysis.ts

```typescript
useAIAnalysis()
  ├─ State: analysis, loading, error
  ├─ Function: analyze(market, price, orderbook, trades)
  └─ Returns: { analysis, loading, error, analyze }
```

### useMarkets.ts (Existing)

```typescript
useMarkets()
  ├─ State: markets, loading, error
  └─ Returns: { markets, loading, error }
```

### useOrderbook.ts (Existing)

```typescript
useOrderbook(marketId)
  ├─ State: orderbook, loading, error
  └─ Returns: { orderbook, loading, error }
```

### useTrades.ts (Existing)

```typescript
useTrades(marketId)
  ├─ State: trades, loading, error
  └─ Returns: { trades, loading, error }
```

## Type Definitions

### MarketAnalysis (from geminiService.ts)

```typescript
interface MarketAnalysis {
  sentiment: 'bullish' | 'bearish' | 'neutral'
  confidence: number (0-100)
  analysis: string
  recommendation: 'buy' | 'sell' | 'hold'
  riskLevel: 'low' | 'medium' | 'high'
  targetPrice?: number
  stopLoss?: number
  reasoning: string
}
```

### Market (from types/index.ts)

```typescript
interface Market {
  id: string
  ticker: string
  baseToken: Token
  quoteToken: Token
  // ... other fields
}
```

## API Integration Points

### Gemini API

**Endpoint**: `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent`

**Authentication**: API Key in header

**Rate Limits**: 60 requests/minute (free tier)

**Latency**: 10-30 seconds per request

### Kora Protocol

**Endpoints**: 
- Testnet: `https://testnet.tm.injective.network`
- Mainnet: `https://tm.injective.network`

**Data Fetched**:
- Markets list
- Order book (bids/asks)
- Recent trades
- Price history

## Security Architecture

```
┌─────────────────────────────────────────┐
│  User Browser                           │
│  ┌─────────────────────────────────────┐│
│  │ React App                           ││
│  │ ┌───────────────────────────────────┤│
│  │ │ API Key (localStorage)            ││
│  │ │ - Stored locally only             ││
│  │ │ - Never logged                    ││
│  │ │ - Never sent to backend           ││
│  │ └───────────────────────────────────┤│
│  └─────────────────────────────────────┘│
│           │                              │
│           ├──────────────────────────────┼─────────────────┐
│           │                              │                 │
│           ▼                              ▼                 ▼
│  ┌──────────────────┐        ┌──────────────────┐  ┌──────────────┐
│  │ Injective API    │        │ Gemini API       │  │ Blockchain   │
│  │ (Public)         │        │ (Public)         │  │ (Public)     │
│  └──────────────────┘        └──────────────────┘  └──────────────┘
└─────────────────────────────────────────┘
```

## Performance Considerations

### Caching
- Market data: 3-second refresh interval
- Analysis results: Cached until user requests new analysis
- API key: Cached in localStorage

### Optimization
- Memoized components to prevent unnecessary re-renders
- useCallback for event handlers
- useMemo for computed values
- Lazy loading of components

### API Calls
- Gemini: On-demand (user clicks analyze)
- Injective: Periodic polling (3 seconds)
- No unnecessary duplicate requests

## Error Handling

```
User Action
    │
    ▼
Try/Catch Block
    │
    ├─ Success ──▶ Update State ──▶ Display Result
    │
    └─ Error ──▶ Set Error State ──▶ Display Error Message
                                      │
                                      ├─ API Error
                                      ├─ Network Error
                                      ├─ Validation Error
                                      └─ Unknown Error
```

## Future Enhancements

### Phase 1: Real Trading
- Wallet connection
- Transaction signing
- Order execution
- Order tracking

### Phase 2: Advanced Analysis
- Multiple AI models
- Custom analysis prompts
- Historical analysis tracking
- Performance metrics

### Phase 3: Portfolio Management
- Position tracking
- P&L calculation
- Risk management
- Automated trading

### Phase 4: Social Features
- Share analysis
- Follow traders
- Copy trading
- Community signals

## Deployment Considerations

### Environment Variables
```
VITE_INJECTIVE_NETWORK=testnet|mainnet
VITE_GEMINI_API_KEY=optional (user-provided)
```

### Security for Production
- Use backend proxy for API keys
- Implement rate limiting
- Add authentication
- Use HTTPS only
- Implement CORS properly

### Monitoring
- Track API usage
- Monitor error rates
- Log user actions
- Track performance metrics

## Testing Strategy

### Unit Tests
- Service functions
- Hook logic
- Component rendering

### Integration Tests
- API communication
- State management
- User workflows

### E2E Tests
- Complete trading flow
- Error scenarios
- Edge cases

## Documentation

- **AI_FEATURES.md**: Feature documentation
- **QUICK_START_AI.md**: Setup guide
- **TRADING_INTEGRATION.md**: Integration guide
- **ARCHITECTURE.md**: This file
- **IMPLEMENTATION_SUMMARY.md**: Summary of changes
