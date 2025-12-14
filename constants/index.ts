// API Constants
export const API_BASE_URL = '/api/assets';
export const QUOTE_REFRESH_INTERVAL = 30000; // 30 seconds
export const QUOTE_CACHE_TTL = 30000; // 30 seconds

// Trading Constants
export const DEFAULT_SPREAD_PIPS = 3;
export const MIN_LOT_SIZE = 0.01;
export const MAX_LOT_SIZE = 100;
export const STANDARD_LOT_SIZE = 100000;

// Default Values
export const DEFAULT_ACCOUNT_SIZE = '10000';
export const DEFAULT_RISK_PERCENTAGE = '2';

// Validation Limits
export const MAX_ACCOUNT_SIZE = 1000000000;
export const MAX_RISK_PERCENTAGE = 100;
export const WARNING_RISK_PERCENTAGE = 10;
export const MAX_STOP_LOSS_POINTS = 1000;

// Cache Keys
export const CACHE_KEYS = {
  QUOTE: 'quote_',
  FOREX_PAIRS: 'forex_pairs',
  COMMODITIES: 'commodities',
  INDICES: 'indices',
} as const;

// Asset Categories
export const INDICES = [
  'GER40', 'DAX', 'US30', 'DJIA', 'SPX', 'NASDAQ', 'FTSE',
  'CAC40', 'IBEX35', 'SMI', 'AEX', 'OMX', 'MIB', 'STOXX50',
  'DJI', 'IXIC', 'N225', 'HSI', 'GDAXI', 'FCHI', 'STOXX50E',
] as const;

export const COMMODITIES = [
  'XAU', 'XAG', 'XPT', 'XPD', // Precious metals
  'BRENT', 'WTI', 'CRUDE', 'OIL', // Oil
  'NATGAS', 'GAS', // Natural gas
  'COPPER', 'ALUMINIUM', 'ZINC', 'NICKEL', // Industrial metals
  'CORN', 'WHEAT', 'SOYBEAN', 'SUGAR', 'COFFEE', // Agricultural
] as const;

// Debounce delays
export const CALCULATION_DEBOUNCE_MS = 300;
