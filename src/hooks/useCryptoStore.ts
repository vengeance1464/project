import create from 'zustand';
import { CryptoData } from '../types/CryptoTypes';
import { ProcessedTickerData } from '../types/WebSocketTypes';

interface CryptoStore {
  cryptoData: CryptoData[];
  setCryptoData: (data: CryptoData[]) => void;
  updateCryptoPrice: (tickerData: ProcessedTickerData) => void;
  selectedCrypto: string | null;
  setSelectedCrypto: (symbol: string | null) => void;
}

export const useCryptoStore = create<CryptoStore>((set) => ({
  cryptoData: [],
  setCryptoData: (data) => set({ cryptoData: data }),
  updateCryptoPrice: (tickerData) => 
    set((state) => ({
      cryptoData: state.cryptoData.map(crypto => 
        crypto.symbol === tickerData.symbol
          ? {
              ...crypto,
              price: tickerData.price,
              percentChange: tickerData.percentChange,
              volume: tickerData.volume
            }
          : crypto
      )
    })),
  selectedCrypto: null,
  setSelectedCrypto: (symbol) => set({ selectedCrypto: symbol })
}));