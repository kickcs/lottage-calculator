import { LotCalculation, CalculationInput } from '@/types';

export function calculateLotSize(input: CalculationInput): LotCalculation {
  const {
    accountSize,
    riskPercentage,
    stopLossPoints,
    takeProfitPoints,
    currentPrice,
    pipValue,
  } = input;

  // Calculate risk amount in account currency
  const riskAmount = (accountSize * riskPercentage) / 100;

  // Calculate lot size based on risk and stop loss
  // Formula: Lot Size = Risk Amount / (Stop Loss in Points * Pip Value * 100,000)
  const lotSize = riskAmount / (stopLossPoints * pipValue * 100000);

  let potentialProfit: number | undefined;
  let riskRewardRatio: number | undefined;

  if (takeProfitPoints) {
    potentialProfit = lotSize * takeProfitPoints * pipValue * 100000;
    riskRewardRatio = potentialProfit / riskAmount;
  }

  return {
    lotSize: Math.max(0.01, Math.min(lotSize, 100)), // Clamp between 0.01 and 100 lots
    riskAmount,
    potentialProfit,
    riskRewardRatio,
    pipValue,
  };
}

// New function to calculate lot size based on price levels instead of points
export function calculateLotSizeByPrice(
  accountSize: number,
  riskPercentage: number,
  currentPrice: number,
  stopLossPrice: number,
  takeProfitPrice?: number,
  pipValue: number = 0.0001
): LotCalculation {
  // Calculate distance in price
  const stopLossDistance = Math.abs(currentPrice - stopLossPrice);

  // Convert price distance to points
  const stopLossPoints = stopLossDistance / pipValue;

  // Calculate take profit in points if provided
  let takeProfitPoints: number | undefined;
  if (takeProfitPrice) {
    const takeProfitDistance = Math.abs(takeProfitPrice - currentPrice);
    takeProfitPoints = takeProfitDistance / pipValue;
  }

  // Use existing calculation with converted points
  return calculateLotSize({
    accountSize,
    riskPercentage,
    stopLossPoints,
    takeProfitPoints,
    currentPrice,
    pipValue,
    ticker: '', // Not needed for this calculation
  });
}

export function getPipValue(ticker: string, price: number): number {
  if (ticker.includes('JPY')) {
    // JPY pairs have 2 decimal places
    return 0.01;
  } else if (ticker.includes('XAU') || ticker.includes('XAG')) {
    // Precious metals
    return 0.01;
  } else if (ticker.match(/^[A-Z]{6}$/)) {
    // Standard forex pairs (e.g., EURUSD, GBPUSD)
    return 0.0001;
  } else if (isIndex(ticker)) {
    // Index CFDs use points
    return 1.0;
  } else if (isCommodity(ticker)) {
    // Other commodities
    return 0.01;
  } else {
    // Default to standard forex pip value
    return 0.0001;
  }
}

export function isIndex(ticker: string): boolean {
  const indices = [
    'GER40', 'DAX', 'US30', 'DJIA', 'SPX', 'NASDAQ', 'FTSE',
    'CAC40', 'IBEX35', 'SMI', 'AEX', 'OMX', 'MIB', 'STOXX50'
  ];
  return indices.some(index => ticker.includes(index));
}

export function isCommodity(ticker: string): boolean {
  const commodities = [
    'XAU', 'XAG', 'XPT', 'XPD', // Precious metals
    'BRENT', 'WTI', 'CRUDE', 'OIL', // Oil
    'NATGAS', 'GAS', // Natural gas
    'COPPER', 'ALUMINIUM', 'ZINC', 'NICKEL', // Industrial metals
    'CORN', 'WHEAT', 'SOYBEAN', 'SUGAR', 'COFFEE', // Agricultural
  ];
  return commodities.some(commodity => ticker.includes(commodity));
}

export function getMarketType(ticker: string): 'forex' | 'indices' | 'commodities' {
  if (isIndex(ticker)) return 'indices';
  if (isCommodity(ticker)) return 'commodities';
  return 'forex';
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(amount: number, decimals: number = 2): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}

export function formatPrice(price: number, ticker: string): string {
  const decimals = getPriceDecimals(ticker);
  return formatNumber(price, decimals);
}

export function getPriceDecimals(ticker: string): number {
  if (ticker.includes('JPY')) return 3;
  if (ticker.includes('XAU') || ticker.includes('XAG')) return 2;
  if (isIndex(ticker)) return 2;
  return 5;
}