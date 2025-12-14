'use client';

import { useEffect, useCallback, useRef } from 'react';
import { Quote } from '@/types';
import { quoteCache } from '@/utils/performance';
import {
  API_BASE_URL,
  QUOTE_REFRESH_INTERVAL,
  QUOTE_CACHE_TTL,
  CACHE_KEYS,
} from '@/constants';

interface UseQuoteOptions {
  ticker: string;
  onQuoteUpdate: (quote: Quote | null) => void;
  onError: (error: string) => void;
  onLoadingChange: (loading: boolean) => void;
}

export function useQuote({
  ticker,
  onQuoteUpdate,
  onError,
  onLoadingChange,
}: UseQuoteOptions) {
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchQuote = useCallback(async (symbol: string) => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    if (!symbol) {
      onQuoteUpdate(null);
      return;
    }

    const cacheKey = `${CACHE_KEYS.QUOTE}${symbol}`;
    const cachedQuote = quoteCache.get(cacheKey);

    if (cachedQuote) {
      onQuoteUpdate(cachedQuote);
      onError('');
      return;
    }

    abortControllerRef.current = new AbortController();
    onLoadingChange(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}?endpoint=quote&symbol=${encodeURIComponent(symbol)}`,
        { signal: abortControllerRef.current.signal }
      );
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const quoteData = data.results[0];
        const quote: Quote = {
          ticker: quoteData.ticker || symbol,
          price: quoteData.price || 0,
          bid: quoteData.bid,
          ask: quoteData.ask,
          timestamp: quoteData.timestamp || new Date().toISOString(),
        };

        onQuoteUpdate(quote);
        onError('');
        quoteCache.set(cacheKey, quote, QUOTE_CACHE_TTL);
      } else {
        onError(data.error || 'Unable to fetch quote for this asset');
        onQuoteUpdate(null);
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return; // Request was cancelled
      }
      console.error('Error fetching quote:', error);
      onError('Failed to fetch current price');
      onQuoteUpdate(null);
    } finally {
      onLoadingChange(false);
    }
  }, [onQuoteUpdate, onError, onLoadingChange]);

  useEffect(() => {
    if (!ticker) {
      onQuoteUpdate(null);
      return;
    }

    fetchQuote(ticker);

    const interval = setInterval(() => {
      fetchQuote(ticker);
    }, QUOTE_REFRESH_INTERVAL);

    return () => {
      clearInterval(interval);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [ticker, fetchQuote, onQuoteUpdate]);

  return { refetch: () => fetchQuote(ticker) };
}
