import { WalletStrategy, Wallet } from '@injectivelabs/wallet-ts'

export const walletStrategy = new WalletStrategy({
  chainId: 'injective-1', // mainnet
  wallet: Wallet.Keplr,
})

export async function connectWallet() {
  const addresses = await walletStrategy.getAddresses()
  return addresses[0] // injective address
}