import { MsgCreateSpotMarketOrder, MsgCreateSpotLimitOrder } from '@injectivelabs/sdk-ts'
import { InjectiveExchangeV1Beta1Exchange } from '@injectivelabs/core-proto-ts'
import { Market } from '../types'

export interface TradeRequest {
  market: Market
  action: 'buy' | 'sell'
  quantity: number
  price: number
  orderType: 'market' | 'limit'
}

export interface TradeResponse {
  success: boolean
  txHash?: string
  orderId?: string
  message: string
  error?: string
}

/**
 * Execute a spot market order on Injective
 */
export const executeSpotOrder = async (
  tradeRequest: TradeRequest,
  signer: any
): Promise<TradeResponse> => {
  try {
    if (!signer || !signer.address) {
      return {
        success: false,
        message: 'Wallet not connected',
        error: 'Please connect your wallet first'
      }
    }

    const { market, action, quantity, price, orderType } = tradeRequest

    const orderTypeValue = action === 'buy'
      ? InjectiveExchangeV1Beta1Exchange.OrderType.BUY
      : InjectiveExchangeV1Beta1Exchange.OrderType.SELL

    // Build generic order payload with required fields
    const baseMsgParams = {
      marketId: market.id,
      subaccountId: market.id, // placeholder; replace with real subaccount logic when available
      injectiveAddress: signer.address,
      orderType: orderTypeValue,
      triggerPrice: '0',
      feeRecipient: signer.address,
      price: price.toString(),
      quantity: quantity.toString(),
    }

    let orderMsg
    if (orderType === 'market') {
      orderMsg = MsgCreateSpotMarketOrder.fromJSON(baseMsgParams)
    } else {
      orderMsg = MsgCreateSpotLimitOrder.fromJSON(baseMsgParams)
    }

    // If signer has native signAndBroadcast use it.
    if (typeof signer.signAndBroadcast === 'function') {
      const tx = await signer.signAndBroadcast([orderMsg])
      return {
        success: true,
        txHash: tx.txHash,
        orderId: tx.orderId,
        message: `${action.toUpperCase()} order executed successfully`
      }
    }

    // Fallback simulation path (for wallets not implementing signAndBroadcast)
    const simulatedTxHash = `SIMULATED-${Date.now()}-${Math.floor(Math.random() * 1000000)}`
    return {
      success: true,
      txHash: simulatedTxHash,
      orderId: `SIM-${Date.now()}`,
      message: `${action.toUpperCase()} order simulated. Connect a real Injective wallet to submit on-chain.`
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Trade execution error:', error)
    return {
      success: false,
      message: 'Trade execution failed',
      error: errorMessage
    }
  }
}

/**
 * Cancel an existing order
 */
export const cancelOrder = async (
  _marketId: string,
  _orderHash: string,
  signer: any
): Promise<TradeResponse> => {
  try {
    if (!signer || !signer.address) {
      return {
        success: false,
        message: 'Wallet not connected',
        error: 'Please connect your wallet first'
      }
    }

    // This would require the MsgCancelSpotOrder message
    // Implementation depends on Injective SDK version
    
    return {
      success: false,
      message: 'Cancel order not yet implemented',
      error: 'Feature coming soon'
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return {
      success: false,
      message: 'Cancel order failed',
      error: errorMessage
    }
  }
}

/**
 * Get order status
 */
export const getOrderStatus = async (
  _orderId: string,
  _injectiveClient: any
): Promise<any> => {
  try {
    // This would query the order status from Injective
    // Implementation depends on available RPC methods
    return null
  } catch (error) {
    console.error('Error fetching order status:', error)
    return null
  }
}

/**
 * Validate trade parameters
 */
export const validateTradeRequest = (request: TradeRequest): { valid: boolean; error?: string } => {
  if (!request.market) {
    return { valid: false, error: 'Market not selected' }
  }

  if (request.quantity <= 0) {
    return { valid: false, error: 'Quantity must be greater than 0' }
  }

  if (request.price <= 0) {
    return { valid: false, error: 'Price must be greater than 0' }
  }

  if (!['buy', 'sell'].includes(request.action)) {
    return { valid: false, error: 'Invalid action' }
  }

  if (!['market', 'limit'].includes(request.orderType)) {
    return { valid: false, error: 'Invalid order type' }
  }

  return { valid: true }
}

/**
 * Calculate order total
 */
export const calculateOrderTotal = (quantity: number, price: number): number => {
  return quantity * price
}

/**
 * Format order for display
 */
export const formatOrder = (request: TradeRequest): string => {
  const total = calculateOrderTotal(request.quantity, request.price)
  return `${request.action.toUpperCase()} ${request.quantity} ${request.market.baseSymbol} @ $${request.price.toFixed(2)} = $${total.toFixed(2)}`
}
