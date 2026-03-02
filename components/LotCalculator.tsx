'use client';

import { useCallback, useEffect, useMemo } from 'react';
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
    customPrice,
    setSelectedTicker,
    setAccountSize,
    setRiskPercentage,
    setStopLossPrice,
    setTakeProfitPrice,
    setCurrentQuote,
    setError,
    setLoading,
    setCustomPrice,
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

  const { refetch } = useQuote({
    ticker: selectedTicker,
    enabled: customPrice === null,
    onQuoteUpdate: handleQuoteUpdate,
    onError: handleQuoteError,
    onLoadingChange: handleLoadingChange,
  });

  // Build an effective quote that uses customPrice when set
  const effectiveQuote = useMemo(() => {
    if (!currentQuote) return null;
    if (customPrice === null) return currentQuote;
    const parsed = parseFloat(customPrice);
    if (isNaN(parsed) || parsed <= 0) return currentQuote;
    return { ...currentQuote, price: parsed };
  }, [currentQuote, customPrice]);

  // Custom hook for calculations — uses effectiveQuote
  const { calculation, validationError } = useCalculation({
    accountSize,
    riskPercentage,
    stopLossPrice,
    takeProfitPrice,
    selectedTicker,
    currentQuote: effectiveQuote,
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

  const handleRefresh = useCallback(() => {
    setCustomPrice(null);
    refetch();
  }, [setCustomPrice, refetch]);

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
            price={currentQuote.price}
            bid={currentQuote.bid}
            ask={currentQuote.ask}
            loading={loading}
            customPrice={customPrice}
            onCustomPriceChange={setCustomPrice}
            onRefresh={handleRefresh}
          />
        </div>
      )}

      <CalculatorInputs
        accountSize={accountSize}
        riskPercentage={riskPercentage}
        stopLossPrice={stopLossPrice}
        takeProfitPrice={takeProfitPrice}
        currentPrice={effectiveQuote?.price}
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
