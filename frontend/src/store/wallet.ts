import { create } from 'zustand';

interface Wallet {
  id: string;
  currency: string;
  balance: string;
  locked_balance: string;
  available: string;
}

interface WalletStore {
  wallets: Wallet[];
  selectedWallet: Wallet | null;
  isLoading: boolean;
  setWallets: (wallets: Wallet[]) => void;
  setSelectedWallet: (wallet: Wallet | null) => void;
  setLoading: (loading: boolean) => void;
  fetchWallets: () => Promise<void>;
}

export const useWalletStore = create<WalletStore>((set) => ({
  wallets: [],
  selectedWallet: null,
  isLoading: false,
  setWallets: (wallets) => set({ wallets }),
  setSelectedWallet: (wallet) => set({ selectedWallet: wallet }),
  setLoading: (loading) => set({ isLoading: loading }),
  fetchWallets: async () => {
    set({ isLoading: true });
    try {
      const response = await fetch('/api/wallets', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      set({ wallets: data });
    } catch (error) {
      console.error('Failed to fetch wallets:', error);
    } finally {
      set({ isLoading: false });
    }
  },
}));

export default useWalletStore;
