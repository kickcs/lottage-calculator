'use client';

import { memo } from 'react';
import { LotCalculation } from '@/types';
import { formatCurrency, formatNumber } from '@/utils/lotUtils';

interface CalculationResultsProps {
  calculation: LotCalculation | null;
}

interface ResultRowProps {
  label: string;
  value: string;
  colorClass: string;
  borderClass: string;
  large?: boolean;
}

const ResultRow = memo(function ResultRow({
  label,
  value,
  colorClass,
  borderClass,
  large = false,
}: ResultRowProps) {
  return (
    <div
      className={`flex justify-between items-center p-2 bg-white rounded border ${borderClass}`}
      role="listitem"
    >
      <span className="text-sm font-bold text-gray-900">{label}</span>
      <span className={`${large ? 'text-lg' : 'text-sm'} font-bold ${colorClass}`}>
        {value}
      </span>
    </div>
  );
});

function CalculationResultsComponent({ calculation }: CalculationResultsProps) {
  if (!calculation) return null;

  return (
    <div
      className="space-y-2 p-3 bg-green-50 rounded border border-green-300"
      role="list"
      aria-label="Calculation results"
    >
      <div className="grid grid-cols-1 gap-2">
        <ResultRow
          label="Lot Size"
          value={formatNumber(calculation.lotSize, 2)}
          colorClass="text-green-700"
          borderClass="border-green-200"
          large
        />
        <ResultRow
          label="Risk"
          value={formatCurrency(calculation.riskAmount)}
          colorClass="text-red-700"
          borderClass="border-red-200"
        />
        {calculation.potentialProfit !== undefined && (
          <ResultRow
            label="Profit"
            value={formatCurrency(calculation.potentialProfit)}
            colorClass="text-green-700"
            borderClass="border-green-200"
          />
        )}
        {calculation.riskRewardRatio !== undefined && (
          <ResultRow
            label="RR"
            value={`1:${formatNumber(calculation.riskRewardRatio, 2)}`}
            colorClass="text-blue-700"
            borderClass="border-blue-200"
          />
        )}
      </div>
    </div>
  );
}

export const CalculationResults = memo(CalculationResultsComponent);
