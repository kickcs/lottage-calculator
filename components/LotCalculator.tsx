'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import PriceDisplay from '@/components/PriceDisplay';
import {
  calculateLotSizeByPrice,
  getPipValue,
  formatCurrency,
  formatNumber,
} from '@/utils/lotUtils';
import { validateLotCalculation, formatInput } from '@/utils/validation';
import { debounce, quoteCache } from '@/utils/performance';

export default function LotCalculator() {
  const {
    selectedTicker,
    selectedAssets,
    accountSize,
    riskPercentage,
    stopLossPrice,
    takeProfitPrice,
    currentQuote,
    calculation,
    error,
    setSelectedTicker,
    setAccountSize,
    setRiskPercentage,
    setStopLossPrice,
    setTakeProfitPrice,
    setCurrentQuote,
    setCalculation,
    setError,
    setLoading,
    loading,
  } = useStore();

  useEffect(() => {
    if (selectedTicker) {
      fetchQuote(selectedTicker);
      const interval = setInterval(() => {
        fetchQuote(selectedTicker);
      }, 30000); // Update every 30 seconds

      return () => clearInterval(interval);
    }
  }, [selectedTicker]);

  useEffect(() => {
    calculateLot();
  }, [accountSize, riskPercentage, stopLossPrice, takeProfitPrice, currentQuote]);

  const fetchQuote = async (ticker: string) => {
    try {
      setLoading(true);

      // Check cache first
      const cacheKey = `quote_${ticker}`;
      const cachedQuote = quoteCache.get(cacheKey);

      if (cachedQuote) {
        setCurrentQuote(cachedQuote);
        setError('');
        setLoading(false);
        return;
      }

      // Fetch from Twelve Data API via our proxy
      const response = await fetch(`/api/assets?endpoint=quote&symbol=${encodeURIComponent(ticker)}`);
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const quoteData = data.results[0];
        const quote = {
          ticker: quoteData.ticker || ticker,
          price: quoteData.price || 0,
          bid: quoteData.bid,
          ask: quoteData.ask,
          timestamp: quoteData.timestamp || new Date().toISOString(),
        };

        setCurrentQuote(quote);
        setError('');
        // Cache quotes for 30 seconds
        quoteCache.set(cacheKey, quote, 30000);
      } else {
        setError(data.error || 'Unable to fetch quote for this asset');
        setCurrentQuote(null);
      }
    } catch (error) {
      console.error('Error fetching quote:', error);
      setError('Failed to fetch current price');
      setCurrentQuote(null);
    } finally {
      setLoading(false);
    }
  };

  // Debounced calculation function
  const debouncedCalculate = debounce(() => {
    if (!currentQuote || !stopLossPrice || !accountSize || !riskPercentage) {
      setCalculation(null);
      return;
    }

    // Validate inputs
    const validation = validateLotCalculation({
      accountSize,
      riskPercentage,
      stopLossPoints: stopLossPrice, // Using price now
      takeProfitPoints: takeProfitPrice,
    });

    if (!validation.isValid) {
      setError(validation.errors.join('. '));
      setCalculation(null);
      return;
    }

    try {
      const pipValue = getPipValue(selectedTicker, currentQuote.price);
      const accountSizeNum = parseFloat(accountSize);
      const riskPercentageNum = parseFloat(riskPercentage);
      const stopLossPriceNum = parseFloat(stopLossPrice);
      const takeProfitPriceNum = takeProfitPrice ? parseFloat(takeProfitPrice) : undefined;

      const result = calculateLotSizeByPrice(
        accountSizeNum,
        riskPercentageNum,
        currentQuote.price,
        stopLossPriceNum,
        takeProfitPriceNum,
        pipValue
      );

      setCalculation(result);
      setError('');
    } catch (error) {
      console.error('Calculation error:', error);
      setError('Error in calculation. Please check your inputs.');
      setCalculation(null);
    }
  }, 300);

  const calculateLot = debouncedCalculate;

  const handleInputChange = (
    setter: (value: string) => void,
    value: string,
    allowNegative: boolean = false
  ) => {
    const formattedValue = formatInput(value, allowNegative);
    setter(formattedValue);
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 border border-gray-300">
      {/* Asset Selection */}
      <div className="mb-3">
        <label className="block text-sm font-bold text-gray-900 mb-1">
          Asset
        </label>
        {selectedAssets.length === 0 ? (
          <div className="w-full px-3 py-2 border border-yellow-400 bg-yellow-50 rounded text-sm">
            <p className="font-bold text-gray-900">No assets selected</p>
            <p className="text-gray-700 text-xs mt-0.5">Go to Settings to select assets</p>
          </div>
        ) : (
          <select
            value={selectedTicker}
            onChange={(e) => setSelectedTicker(e.target.value)}
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-gray-900"
          >
            <option value="">Choose an asset...</option>
            {selectedAssets.map((ticker) => (
              <option key={ticker} value={ticker}>
                {ticker}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Current Price Display */}
      {currentQuote && (
        <div className="mb-3">
          <PriceDisplay
            ticker={selectedTicker}
            price={currentQuote.price}
            bid={currentQuote.bid}
            ask={currentQuote.ask}
            loading={loading}
          />
        </div>
      )}

      {/* Input Fields */}
      <div className="space-y-2 mb-3">
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-1">
            Account Size ($)
          </label>
          <input
            type="text"
            value={accountSize}
            onChange={(e) => handleInputChange(setAccountSize, e.target.value)}
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-gray-900"
            placeholder="10000"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-900 mb-1">
            Risk per Trade (%)
          </label>
          <input
            type="text"
            value={riskPercentage}
            onChange={(e) => handleInputChange(setRiskPercentage, e.target.value)}
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-gray-900"
            placeholder="2"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-900 mb-1">
            Stop Loss Price
          </label>
          <input
            type="text"
            value={stopLossPrice}
            onChange={(e) => handleInputChange(setStopLossPrice, e.target.value)}
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-gray-900"
            placeholder={currentQuote ? (currentQuote.price * 0.98).toFixed(5) : "Enter price"}
          />
          {currentQuote && stopLossPrice && (
            <p className="text-xs text-gray-600 mt-0.5">
              {Math.abs(currentQuote.price - parseFloat(stopLossPrice)).toFixed(5)} ({((Math.abs(currentQuote.price - parseFloat(stopLossPrice)) / currentQuote.price) * 100).toFixed(2)}%)
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-900 mb-1">
            Take Profit Price
          </label>
          <input
            type="text"
            value={takeProfitPrice}
            onChange={(e) => handleInputChange(setTakeProfitPrice, e.target.value)}
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-gray-900"
            placeholder={currentQuote ? (currentQuote.price * 1.04).toFixed(5) : "Enter price"}
          />
          {currentQuote && takeProfitPrice && (
            <p className="text-xs text-gray-600 mt-0.5">
              {Math.abs(parseFloat(takeProfitPrice) - currentQuote.price).toFixed(5)} ({((Math.abs(parseFloat(takeProfitPrice) - currentQuote.price) / currentQuote.price) * 100).toFixed(2)}%)
            </p>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-3 p-2 bg-red-50 border border-red-300 rounded">
          <div className="text-xs font-semibold text-red-800">{error}</div>
        </div>
      )}

      {/* Results */}
      {calculation && (
        <div className="space-y-2 p-3 bg-green-50 rounded border border-green-300">
          <div className="grid grid-cols-1 gap-2">
            <div className="flex justify-between items-center p-2 bg-white rounded border border-green-200">
              <span className="text-sm font-bold text-gray-900">Lot Size</span>
              <span className="text-lg font-bold text-green-700">
                {formatNumber(calculation.lotSize, 2)}
              </span>
            </div>

            <div className="flex justify-between items-center p-2 bg-white rounded border border-red-200">
              <span className="text-sm font-bold text-gray-900">Risk</span>
              <span className="text-sm font-bold text-red-700">
                {formatCurrency(calculation.riskAmount)}
              </span>
            </div>

            {calculation.potentialProfit && (
              <div className="flex justify-between items-center p-2 bg-white rounded border border-green-200">
                <span className="text-sm font-bold text-gray-900">Profit</span>
                <span className="text-sm font-bold text-green-700">
                  {formatCurrency(calculation.potentialProfit)}
                </span>
              </div>
            )}

            {calculation.riskRewardRatio && (
              <div className="flex justify-between items-center p-2 bg-white rounded border border-blue-200">
                <span className="text-sm font-bold text-gray-900">RR</span>
                <span className="text-sm font-bold text-blue-700">
                  1:{formatNumber(calculation.riskRewardRatio, 2)}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Instructions */}
      {!selectedTicker && (
        <div className="mt-3 p-2 bg-gray-100 rounded border border-gray-300">
          <p className="text-xs text-gray-700">
            Select an asset to calculate position size
          </p>
        </div>
      )}
    </div>
  );
}
