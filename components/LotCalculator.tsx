'use client';

import { useCallback, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { useQuote, useCalculation, useInputHandler } from '@/hooks';
import {
  AssetSelect,
  CalculatorInputs,
  CalculationResults,
  ErrorDisplay,
} from '@/components/calculator';
import PriceDisplay from '@/components/PriceDisplay';

export default function LotCalculator() {
  const {
    selectedTicker,
    selectedAssets,
    accountSize,
    riskPercentage,
    stopLossPrice,
    takeProfitPrice,
    currentQuote,
    error,
    loading,
    setSelectedTicker,
    setAccountSize,
    setRiskPercentage,
    setStopLossPrice,
    setTakeProfitPrice,
    setCurrentQuote,
    setError,
    setLoading,
  } = useStore();

  // Custom hook for fetching quotes
  const handleQuoteUpdate = useCallback(
    (quote: typeof currentQuote) => setCurrentQuote(quote),
    [setCurrentQuote]
  );
  const handleQuoteError = useCallback(
    (err: string) => setError(err),
    [setError]
  );
  const handleLoadingChange = useCallback(
    (isLoading: boolean) => setLoading(isLoading),
    [setLoading]
  );

  useQuote({
    ticker: selectedTicker,
    onQuoteUpdate: handleQuoteUpdate,
    onError: handleQuoteError,
    onLoadingChange: handleLoadingChange,
  });

  // Custom hook for calculations
  const { calculation, validationError } = useCalculation({
    accountSize,
    riskPercentage,
    stopLossPrice,
    takeProfitPrice,
    selectedTicker,
    currentQuote,
  });

  // Update error state from validation
  useEffect(() => {
    if (validationError) {
      setError(validationError);
    } else if (currentQuote && !error.includes('fetch')) {
      setError('');
    }
  }, [validationError, currentQuote, error, setError]);

  // Memoized input handlers
  const handleAccountSizeChange = useInputHandler(setAccountSize);
  const handleRiskPercentageChange = useInputHandler(setRiskPercentage);
  const handleStopLossPriceChange = useInputHandler(setStopLossPrice);
  const handleTakeProfitPriceChange = useInputHandler(setTakeProfitPrice);

  const handleAssetSelect = useCallback(
    (ticker: string) => setSelectedTicker(ticker),
    [setSelectedTicker]
  );

  return (
    <div className="bg-white rounded-lg shadow p-4 border border-gray-300">
      <AssetSelect
        selectedTicker={selectedTicker}
        selectedAssets={selectedAssets}
        onSelect={handleAssetSelect}
        disabled={loading}
      />

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

      <CalculatorInputs
        accountSize={accountSize}
        riskPercentage={riskPercentage}
        stopLossPrice={stopLossPrice}
        takeProfitPrice={takeProfitPrice}
        currentPrice={currentQuote?.price}
        onAccountSizeChange={handleAccountSizeChange}
        onRiskPercentageChange={handleRiskPercentageChange}
        onStopLossPriceChange={handleStopLossPriceChange}
        onTakeProfitPriceChange={handleTakeProfitPriceChange}
      />

      <ErrorDisplay error={error} />

      <CalculationResults calculation={calculation} />

      {!selectedTicker && (
        <div
          className="mt-3 p-2 bg-gray-100 rounded border border-gray-300"
          role="status"
        >
          <p className="text-xs text-gray-700">
            Select an asset to calculate position size
          </p>
        </div>
      )}
    </div>
  );
}
