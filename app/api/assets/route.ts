import { NextRequest, NextResponse } from 'next/server';
import { twelveDataService } from '@/services/twelvedata';

const TWELVE_DATA_API_KEY = process.env.TWELVE_DATA_API_KEY;

// Server-side in-memory cache for tickers
// Cache TTL: 7 days (as per user requirement)
const TICKERS_CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

interface CacheItem {
  data: any;
  timestamp: number;
}

const tickersCache = new Map<string, CacheItem>();

// Helper function to get cache key
function getCacheKey(endpoint: string, market?: string | null): string {
  return `${endpoint}:${market || 'all'}`;
}

// Helper function to get cached data
function getCachedData(key: string): any | null {
  const item = tickersCache.get(key);
  if (!item) return null;

  const age = Date.now() - item.timestamp;
  if (age > TICKERS_CACHE_TTL) {
    tickersCache.delete(key);
    return null;
  }

  console.log(`Cache HIT for ${key} (age: ${Math.round(age / 1000 / 60)} minutes)`);
  return item.data;
}

// Helper function to set cache
function setCachedData(key: string, data: any): void {
  tickersCache.set(key, {
    data,
    timestamp: Date.now(),
  });
  console.log(`Cached data for ${key}`);
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const endpoint = searchParams.get('endpoint');
    const market = searchParams.get('market');
    const symbol = searchParams.get('symbol') || searchParams.get('ticker');

    if (!TWELVE_DATA_API_KEY) {
      return NextResponse.json(
        { error: 'API key not configured. Please set TWELVE_DATA_API_KEY in .env.local' },
        { status: 500 }
      );
    }

    // Validate endpoint
    if (!endpoint) {
      return NextResponse.json(
        { error: 'Missing endpoint parameter. Use "tickers", "quote", or "price"' },
        { status: 400 }
      );
    }

    // Handle tickers endpoint
    if (endpoint === 'tickers') {
      const cacheKey = getCacheKey(endpoint, market);

      // Check cache first
      const cachedData = getCachedData(cacheKey);
      if (cachedData) {
        return NextResponse.json(
          { results: cachedData, count: cachedData.length, status: 'OK' },
          {
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET',
              'Access-Control-Allow-Headers': 'Content-Type',
              'Cache-Control': 'public, s-maxage=604800, stale-while-revalidate=86400', // 7 days cache
              'X-Cache': 'HIT',
            },
          }
        );
      }

      let tickers;

      // Fetch from Twelve Data API
      if (market === 'fx' || market === 'forex') {
        tickers = await twelveDataService.getForexPairs();
      } else if (market === 'indices') {
        tickers = await twelveDataService.getIndices();
      } else if (market === 'commodities') {
        tickers = await twelveDataService.getCommodities();
      } else {
        // Get all tickers if no specific market is requested
        tickers = await twelveDataService.getAllTickers();
      }

      // Cache the results
      setCachedData(cacheKey, tickers);

      return NextResponse.json(
        { results: tickers, count: tickers.length, status: 'OK' },
        {
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Cache-Control': 'public, s-maxage=604800, stale-while-revalidate=86400', // 7 days cache
            'X-Cache': 'MISS',
          },
        }
      );
    }

    // Handle quote endpoint
    if (endpoint === 'quote') {
      if (!symbol) {
        return NextResponse.json(
          { error: 'Missing symbol parameter for quote endpoint' },
          { status: 400 }
        );
      }

      const quote = await twelveDataService.getQuote(symbol);

      if (!quote) {
        return NextResponse.json(
          {
            error: `Unable to fetch quote for symbol: ${symbol}`,
            results: [],
            count: 0,
            status: 'ERROR',
          },
          { status: 200 } // Return 200 to prevent frontend errors
        );
      }

      return NextResponse.json(
        {
          results: [quote],
          count: 1,
          status: 'OK',
        },
        {
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60', // 30 seconds cache
            'X-Cache': 'MISS',
          },
        }
      );
    }

    // Handle price endpoint
    if (endpoint === 'price') {
      if (!symbol) {
        return NextResponse.json(
          { error: 'Missing symbol parameter for price endpoint' },
          { status: 400 }
        );
      }

      const price = await twelveDataService.getPrice(symbol);

      if (price === null) {
        return NextResponse.json(
          {
            error: `Unable to fetch price for symbol: ${symbol}`,
            results: [],
            count: 0,
            status: 'ERROR',
          },
          { status: 200 } // Return 200 to prevent frontend errors
        );
      }

      return NextResponse.json(
        {
          results: [{ ticker: symbol, price }],
          count: 1,
          status: 'OK',
        },
        {
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60', // 30 seconds cache
            'X-Cache': 'MISS',
          },
        }
      );
    }

    // Unknown endpoint
    return NextResponse.json(
      { error: `Unknown endpoint: ${endpoint}. Use "tickers", "quote", or "price"` },
      { status: 400 }
    );

  } catch (error) {
    console.error('Twelve Data API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      {
        error: 'Failed to fetch data from Twelve Data API',
        details: errorMessage,
        status: 'ERROR',
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
