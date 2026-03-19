import { WalletStrategy, Wallet } from '@injectivelabs/wallet-strategy'
import { MsgBroadcaster } from '@injectivelabs/sdk-ts'
import { NETWORK, ENDPOINTS } from './injective'

const envNetwork = process.env.NEXT_PUBLIC_NETWORK
const chainId = envNetwork === 'testnet' ? 'injective-888' : 'injective-1'

export const walletStrategy = new WalletStrategy({
  chainId,
  wallet: Wallet.Keplr,
})

export const msgBroadcaster = new MsgBroadcaster({
  walletStrategy,
  network: NETWORK,
  endpoints: ENDPOINTS,
})

export async function connectWallet() {
  const addresses = await walletStrategy.getAddresses()
  return addresses[0] // injective address
}