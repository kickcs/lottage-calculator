import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Ticker, Quote, LotCalculation } from '@/types';

interface AppState {
  // Assets
  selectedAssets: string[];
  tickers: Ticker[];
  loading: boolean;

  // Calculator inputs
  selectedTicker: string;
  accountSize: string;
  riskPercentage: string;
  stopLossPrice: string;
  takeProfitPrice: string;

  // Current data
  currentQuote: Quote | null;
  calculation: LotCalculation | null;
  error: string;

  // Actions
  setSelectedAssets: (assets: string[]) => void;
  setTickers: (tickers: Ticker[]) => void;
  setLoading: (loading: boolean) => void;
  setSelectedTicker: (ticker: string) => void;
  setAccountSize: (size: string) => void;
  setRiskPercentage: (percentage: string) => void;
  setStopLossPrice: (price: string) => void;
  setTakeProfitPrice: (price: string) => void;
  setCurrentQuote: (quote: Quote | null) => void;
  setCalculation: (calculation: LotCalculation | null) => void;
  setError: (error: string) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      // Initial state
      selectedAssets: [],
      tickers: [],
      loading: false,
      selectedTicker: '',
      accountSize: '10000',
      riskPercentage: '2',
      stopLossPrice: '',
      takeProfitPrice: '',
      currentQuote: null,
      calculation: null,
      error: '',

      // Actions
      setSelectedAssets: (assets) => set({ selectedAssets: assets }),
      setTickers: (tickers) => set({ tickers }),
      setLoading: (loading) => set({ loading }),
      setSelectedTicker: (ticker) => set({ selectedTicker: ticker }),
      setAccountSize: (size) => set({ accountSize: size }),
      setRiskPercentage: (percentage) => set({ riskPercentage: percentage }),
      setStopLossPrice: (price) => set({ stopLossPrice: price }),
      setTakeProfitPrice: (price) => set({ takeProfitPrice: price }),
      setCurrentQuote: (quote) => set({ currentQuote: quote }),
      setCalculation: (calculation) => set({ calculation }),
      setError: (error) => set({ error }),
    }),
    {
      name: 'forex-calculator-storage',
      partialize: (state) => ({
        selectedAssets: state.selectedAssets,
        accountSize: state.accountSize,
        riskPercentage: state.riskPercentage,
      }),
    }
  )
);
