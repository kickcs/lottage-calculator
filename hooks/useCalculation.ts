'use client';

import { useMemo, useCallback } from 'react';
import { Quote, LotCalculation } from '@/types';
import {
  calculateLotSizeByPrice,
  getPipValue,
} from '@/utils/lotUtils';
import { validateLotCalculation } from '@/utils/validation';

interface UseCalculationParams {
  accountSize: string;
  riskPercentage: string;
  stopLossPrice: string;
  takeProfitPrice: string;
  selectedTicker: string;
  currentQuote: Quote | null;
}

interface UseCalculationResult {
  calculation: LotCalculation | null;
  validationError: string | null;
}

export function useCalculation({
  accountSize,
  riskPercentage,
  stopLossPrice,
  takeProfitPrice,
  selectedTicker,
  currentQuote,
}: UseCalculationParams): UseCalculationResult {
  return useMemo(() => {
    if (!currentQuote || !stopLossPrice || !accountSize || !riskPercentage) {
      return { calculation: null, validationError: null };
    }

    // Validate inputs
    const validation = validateLotCalculation({
      accountSize,
      riskPercentage,
      stopLossPoints: stopLossPrice,
      takeProfitPoints: takeProfitPrice,
    });

    if (!validation.isValid) {
      return {
        calculation: null,
        validationError: validation.errors.join('. '),
      };
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
        pipValue,
        selectedTicker
      );

      return { calculation: result, validationError: null };
    } catch (error) {
      console.error('Calculation error:', error);
      return {
        calculation: null,
        validationError: 'Error in calculation. Please check your inputs.',
      };
    }
  }, [accountSize, riskPercentage, stopLossPrice, takeProfitPrice, selectedTicker, currentQuote]);
}

export function useInputHandler(setter: (value: string) => void) {
  return useCallback(
    (value: string) => {
      // Format input: remove non-numeric characters except decimal and minus
      const formatted = value.trim().replace(/[^0-9.-]/g, '');
      // Prevent multiple decimal points
      const parts = formatted.split('.');
      const result = parts.length > 2
        ? parts[0] + '.' + parts.slice(1).join('')
        : formatted;
      setter(result);
    },
    [setter]
  );
}
