import { useState, useCallback, useEffect } from 'react'

export interface WalletState {
  address: string | null
  connected: boolean
  connecting: boolean
  error: string | null
}

export const useWallet = () => {
  const [wallet, setWallet] = useState<WalletState>({
    address: null,
    connected: false,
    connecting: false,
    error: null,
  })

  // Check if wallet is already connected on mount
  useEffect(() => {
    const checkWalletConnection = async () => {
      try {
        // Check if window.ethereum or Injective wallet is available
        if (typeof window !== 'undefined' && (window as any).ethereum) {
          const accounts = await (window as any).ethereum.request({
            method: 'eth_accounts',
          })
          if (accounts && accounts.length > 0) {
            setWallet({
              address: accounts[0],
              connected: true,
              connecting: false,
              error: null,
            })
          }
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error)
      }
    }

    checkWalletConnection()
  }, [])

  const connect = useCallback(async () => {
    setWallet(prev => ({ ...prev, connecting: true, error: null }))

    try {
      // Try to connect to Injective wallet
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        const accounts = await (window as any).ethereum.request({
          method: 'eth_requestAccounts',
        })

        if (accounts && accounts.length > 0) {
          setWallet({
            address: accounts[0],
            connected: true,
            connecting: false,
            error: null,
          })
          return true
        }
      } else {
        throw new Error('Wallet not found. Please install MetaMask or Injective wallet.')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect wallet'
      setWallet(prev => ({
        ...prev,
        connecting: false,
        error: errorMessage,
      }))
      return false
    }
  }, [])

  const disconnect = useCallback(() => {
    setWallet({
      address: null,
      connected: false,
      connecting: false,
      error: null,
    })
  }, [])

  return {
    ...wallet,
    connect,
    disconnect,
  }
}
