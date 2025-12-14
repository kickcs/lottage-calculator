import { LotCalculation, CalculationInput } from '@/types';
import {
  DEFAULT_SPREAD_PIPS,
  MIN_LOT_SIZE,
  MAX_LOT_SIZE,
  CONTRACT_SIZES,
  INDICES,
  COMMODITIES,
} from '@/constants';

// Get contract size based on ticker
export function getContractSize(ticker: string): number {
  const upperTicker = ticker.toUpperCase();

  if (upperTicker.includes('XAU')) return CONTRACT_SIZES.XAU;
  if (upperTicker.includes('XAG')) return CONTRACT_SIZES.XAG;
  if (upperTicker.includes('XPT')) return CONTRACT_SIZES.XPT;
  if (upperTicker.includes('XPD')) return CONTRACT_SIZES.XPD;
  if (upperTicker.includes('OIL') || upperTicker.includes('BRENT') ||
      upperTicker.includes('WTI') || upperTicker.includes('CRUDE')) {
    return CONTRACT_SIZES.OIL;
  }
  if (upperTicker.includes('NATGAS') || upperTicker.includes('GAS')) {
    return CONTRACT_SIZES.NATGAS;
  }
  if (isIndex(ticker)) return CONTRACT_SIZES.INDEX;

  return CONTRACT_SIZES.FOREX;
}

export function calculateLotSize(input: CalculationInput): LotCalculation {
  const {
    accountSize,
    riskPercentage,
    stopLossPoints,
    takeProfitPoints,
    pipValue,
    ticker,
  } = input;

  // Get contract size for this asset type
  const contractSize = getContractSize(ticker);

  // Calculate risk amount in account currency
  const riskAmount = (accountSize * riskPercentage) / 100;

  // Formula: Lot Size = Risk Amount / (Stop Loss in Points * Pip Value * Contract Size)
  // This gives us how many lots we can trade while risking exactly riskAmount
  const lotSize = riskAmount / (stopLossPoints * pipValue * contractSize);

  let potentialProfit: number | undefined;
  let riskRewardRatio: number | undefined;

  if (takeProfitPoints) {
    potentialProfit = lotSize * takeProfitPoints * pipValue * contractSize;
    riskRewardRatio = potentialProfit / riskAmount;
  }

  return {
    lotSize: Math.max(MIN_LOT_SIZE, Math.min(lotSize, MAX_LOT_SIZE)),
    riskAmount,
    potentialProfit,
    riskRewardRatio,
    pipValue,
  };
}

// Calculate lot size based on price levels instead of points
export function calculateLotSizeByPrice(
  accountSize: number,
  riskPercentage: number,
  currentPrice: number,
  stopLossPrice: number,
  takeProfitPrice: number | undefined,
  pipValue: number,
  ticker: string
): LotCalculation {
  // Calculate distance in price
  const stopLossDistance = Math.abs(currentPrice - stopLossPrice);

  // Convert price distance to points
  const stopLossPoints = stopLossDistance / pipValue;

  // Calculate take profit in points if provided, accounting for spread
  let takeProfitPoints: number | undefined;
  if (takeProfitPrice) {
    const takeProfitDistance = Math.abs(takeProfitPrice - currentPrice);
    takeProfitPoints = takeProfitDistance / pipValue;

    // Subtract spread as it reduces actual profit
    if (takeProfitPoints > DEFAULT_SPREAD_PIPS) {
      takeProfitPoints = takeProfitPoints - DEFAULT_SPREAD_PIPS;
    }
  }

  return calculateLotSize({
    accountSize,
    riskPercentage,
    stopLossPoints,
    takeProfitPoints,
    currentPrice,
    pipValue,
    ticker,
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
  return INDICES.some(index => ticker.includes(index));
}

export function isCommodity(ticker: string): boolean {
  return COMMODITIES.some(commodity => ticker.includes(commodity));
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