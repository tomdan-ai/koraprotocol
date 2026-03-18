import { create } from 'zustand'

interface WalletStore {
  address: string | null
  setAddress: (addr: string) => void
  disconnect: () => void
}

export const useWalletStore = create<WalletStore>((set) => ({
  address: null,
  setAddress: (address) => set({ address }),
  disconnect: () => set({ address: null }),
}))