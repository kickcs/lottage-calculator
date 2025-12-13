export interface Ticker {
  active: boolean;
  base_currency_name?: string;
  base_currency_symbol?: string;
  cik?: string;
  composite_figi?: string;
  currency_name: string;
  currency_symbol: string;
  delisted_utc?: string;
  last_updated_utc: string;
  locale: 'us' | 'global';
  market: 'stocks' | 'crypto' | 'fx' | 'otc' | 'indices' | 'commodities';
  name: string;
  primary_exchange?: string;
  share_class_figi?: string;
  ticker: string;
  type: string;
}

export interface Quote {
  ticker: string;
  price: number;
  bid?: number;
  ask?: number;
  timestamp: string;
}

export interface LotCalculation {
  lotSize: number;
  riskAmount: number;
  potentialProfit?: number;
  riskRewardRatio?: number;
  pipValue: number;
}

export interface UserSettings {
  selectedAssets: string[];
  accountSize: number;
  riskPercentage: number;
  defaultStopLoss: number;
  defaultTakeProfit?: number;
  currency: string;
}

export interface CalculationInput {
  accountSize: number;
  riskPercentage: number;
  stopLossPoints: number;
  takeProfitPoints?: number;
  ticker: string;
  currentPrice: number;
  pipValue: number;
}