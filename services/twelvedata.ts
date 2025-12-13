import { Ticker, Quote } from '@/types';

const TWELVE_DATA_BASE_URL = 'https://api.twelvedata.com';

interface ForexPairResponse {
  symbol: string;
  currency_group: string;
  currency_base: string;
  currency_quote: string;
}

interface CommodityResponse {
  symbol: string;
  name: string;
  category: string;
}

interface PriceResponse {
  price: string;
}

interface QuoteResponse {
  symbol: string;
  name?: string;
  exchange?: string;
  currency?: string;
  datetime?: string;
  timestamp?: number;
  open?: string;
  high?: string;
  low?: string;
  close?: string;
  volume?: string;
  previous_close?: string;
  change?: string;
  percent_change?: string;
  average_volume?: string;
  fifty_two_week?: {
    low?: string;
    high?: string;
    low_change?: string;
    high_change?: string;
    low_change_percent?: string;
    high_change_percent?: string;
    range?: string;
  };
}

// In-memory cache with TTL
interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class TwelveDataService {
  private cache = new Map<string, CacheItem<any>>();
  private apiKey: string | undefined;

  constructor() {
    // API key will be set on server-side
    this.apiKey = process.env.TWELVE_DATA_API_KEY;
  }

  // Helper method to get from cache
  private getFromCache<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    const now = Date.now();
    if (now - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  // Helper method to set cache
  private setCache<T>(key: string, data: T, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  // Fetch forex pairs - cached for 7 days
  async getForexPairs(): Promise<Ticker[]> {
    const cacheKey = 'forex_pairs';
    const cached = this.getFromCache<Ticker[]>(cacheKey);
    if (cached) {
      console.log('Returning cached forex pairs');
      return cached;
    }

    try {
      const url = `${TWELVE_DATA_BASE_URL}/forex_pairs?apikey=${this.apiKey}`;
      const response = await fetch(url);

      if (!response.ok) {
        console.error(`Forex pairs API error: ${response.status}`);
        return [];
      }

      const data = await response.json();

      if (data.status === 'error') {
        console.error('Forex pairs error:', data.message);
        return [];
      }

      const tickers: Ticker[] = (data.data || []).map((pair: ForexPairResponse) => ({
        active: true,
        currency_name: pair.currency_quote.toLowerCase(),
        currency_symbol: pair.currency_quote,
        last_updated_utc: new Date().toISOString(),
        locale: 'global' as const,
        market: 'fx' as const,
        name: `${pair.currency_base}/${pair.currency_quote}`,
        ticker: pair.symbol,
        type: 'FX',
        base_currency_name: pair.currency_base.toLowerCase(),
        base_currency_symbol: pair.currency_base,
      }));

      // Cache for 7 days (7 * 24 * 60 * 60 * 1000 ms)
      this.setCache(cacheKey, tickers, 7 * 24 * 60 * 60 * 1000);
      console.log(`Loaded ${tickers.length} forex pairs from API`);

      return tickers;
    } catch (error) {
      console.error('Error fetching forex pairs:', error);
      return [];
    }
  }

  // Fetch commodities - cached for 7 days
  async getCommodities(): Promise<Ticker[]> {
    const cacheKey = 'commodities';
    const cached = this.getFromCache<Ticker[]>(cacheKey);
    if (cached) {
      console.log('Returning cached commodities');
      return cached;
    }

    try {
      const url = `${TWELVE_DATA_BASE_URL}/commodities?apikey=${this.apiKey}`;
      const response = await fetch(url);

      if (!response.ok) {
        console.error(`Commodities API error: ${response.status}`);
        return [];
      }

      const data = await response.json();

      if (data.status === 'error') {
        console.error('Commodities error:', data.message);
        return [];
      }

      const tickers: Ticker[] = (data.data || []).map((commodity: CommodityResponse) => ({
        active: true,
        currency_name: 'usd',
        currency_symbol: 'USD',
        last_updated_utc: new Date().toISOString(),
        locale: 'global' as const,
        market: 'commodities' as const,
        name: commodity.name,
        ticker: commodity.symbol,
        type: commodity.category || 'COMMODITY',
      }));

      // Cache for 7 days
      this.setCache(cacheKey, tickers, 7 * 24 * 60 * 60 * 1000);
      console.log(`Loaded ${tickers.length} commodities from API`);

      return tickers;
    } catch (error) {
      console.error('Error fetching commodities:', error);
      return [];
    }
  }

  // Get indices - using a predefined list since Twelve Data doesn't have a direct endpoint
  async getIndices(): Promise<Ticker[]> {
    const cacheKey = 'indices';
    const cached = this.getFromCache<Ticker[]>(cacheKey);
    if (cached) {
      console.log('Returning cached indices');
      return cached;
    }

    // Predefined list of popular indices
    const popularIndices = [
      { symbol: 'SPX', name: 'S&P 500 Index', currency: 'USD', locale: 'us' as const },
      { symbol: 'DJI', name: 'Dow Jones Industrial Average', currency: 'USD', locale: 'us' as const },
      { symbol: 'IXIC', name: 'NASDAQ Composite', currency: 'USD', locale: 'us' as const },
      { symbol: 'DAX', name: 'DAX Index', currency: 'EUR', locale: 'global' as const },
      { symbol: 'FTSE', name: 'FTSE 100 Index', currency: 'GBP', locale: 'global' as const },
      { symbol: 'N225', name: 'Nikkei 225', currency: 'JPY', locale: 'global' as const },
      { symbol: 'HSI', name: 'Hang Seng Index', currency: 'HKD', locale: 'global' as const },
      { symbol: 'GDAXI', name: 'DAX 40', currency: 'EUR', locale: 'global' as const },
      { symbol: 'FCHI', name: 'CAC 40', currency: 'EUR', locale: 'global' as const },
      { symbol: 'STOXX50E', name: 'EURO STOXX 50', currency: 'EUR', locale: 'global' as const },
    ];

    const tickers: Ticker[] = popularIndices.map(index => ({
      active: true,
      currency_name: index.currency.toLowerCase(),
      currency_symbol: index.currency,
      last_updated_utc: new Date().toISOString(),
      locale: index.locale,
      market: 'indices' as const,
      name: index.name,
      ticker: index.symbol,
      type: 'INDEX',
    }));

    // Cache for 7 days
    this.setCache(cacheKey, tickers, 7 * 24 * 60 * 60 * 1000);
    console.log(`Loaded ${tickers.length} indices`);

    return tickers;
  }

  // Get current price for a symbol
  async getPrice(symbol: string): Promise<number | null> {
    try {
      const url = `${TWELVE_DATA_BASE_URL}/price?symbol=${symbol}&apikey=${this.apiKey}`;
      const response = await fetch(url);

      if (!response.ok) {
        console.error(`Price API error for ${symbol}: ${response.status}`);
        return null;
      }

      const data: PriceResponse = await response.json();

      if (!data.price) {
        console.error('No price data available for', symbol);
        return null;
      }

      return parseFloat(data.price);
    } catch (error) {
      console.error(`Error fetching price for ${symbol}:`, error);
      return null;
    }
  }

  // Get detailed quote for a symbol - cached for 30 seconds
  async getQuote(symbol: string): Promise<Quote | null> {
    const cacheKey = `quote_${symbol}`;
    const cached = this.getFromCache<Quote>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const url = `${TWELVE_DATA_BASE_URL}/quote?symbol=${symbol}&apikey=${this.apiKey}`;
      const response = await fetch(url);

      if (!response.ok) {
        console.error(`Quote API error for ${symbol}: ${response.status}`);
        return null;
      }

      const data: QuoteResponse = await response.json();

      if (!data.close && !data.previous_close) {
        console.error('No quote data available for', symbol);
        return null;
      }

      const quote: Quote = {
        ticker: symbol,
        price: parseFloat(data.close || data.previous_close || '0'),
        bid: data.close ? parseFloat(data.close) : undefined,
        ask: data.close ? parseFloat(data.close) : undefined,
        timestamp: data.datetime || new Date().toISOString(),
      };

      // Cache for 30 seconds
      this.setCache(cacheKey, quote, 30 * 1000);

      return quote;
    } catch (error) {
      console.error(`Error fetching quote for ${symbol}:`, error);
      return null;
    }
  }

  // Get all tickers by market type
  async getMarketTickers(market: 'fx' | 'indices' | 'commodities'): Promise<Ticker[]> {
    switch (market) {
      case 'fx':
        return this.getForexPairs();
      case 'indices':
        return this.getIndices();
      case 'commodities':
        return this.getCommodities();
      default:
        return [];
    }
  }

  // Get all available tickers
  async getAllTickers(): Promise<Ticker[]> {
    const [forexPairs, commodities, indices] = await Promise.all([
      this.getForexPairs(),
      this.getCommodities(),
      this.getIndices(),
    ]);

    return [...forexPairs, ...commodities, ...indices];
  }

  // Helper method to determine pip value (moved from utils)
  calculatePipValue(ticker: string): number {
    if (ticker.includes('JPY')) {
      return 0.01; // JPY pairs have 2 decimal places
    } else if (ticker.includes('XAU') || ticker.includes('XAG')) {
      return 0.01; // Precious metals
    } else if (ticker.match(/^[A-Z]{6}$/)) {
      return 0.0001; // Standard forex pairs
    } else {
      // Indices and other instruments typically use points
      return 1.0;
    }
  }
}

// Create singleton instance
export const twelveDataService = new TwelveDataService();
