'use client';

import { memo, useMemo } from 'react';

interface CalculatorInputsProps {
  accountSize: string;
  riskPercentage: string;
  stopLossPrice: string;
  takeProfitPrice: string;
  currentPrice?: number;
  onAccountSizeChange: (value: string) => void;
  onRiskPercentageChange: (value: string) => void;
  onStopLossPriceChange: (value: string) => void;
  onTakeProfitPriceChange: (value: string) => void;
}

interface InputFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  hint?: string;
}

const InputField = memo(function InputField({
  id,
  label,
  value,
  onChange,
  placeholder,
  hint,
}: InputFieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-bold text-gray-900 mb-1"
      >
        {label}
      </label>
      <input
        id={id}
        type="text"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-gray-900"
        placeholder={placeholder}
        aria-describedby={hint ? `${id}-hint` : undefined}
      />
      {hint && (
        <p id={`${id}-hint`} className="text-xs text-gray-600 mt-0.5">
          {hint}
        </p>
      )}
    </div>
  );
});

function CalculatorInputsComponent({
  accountSize,
  riskPercentage,
  stopLossPrice,
  takeProfitPrice,
  currentPrice,
  onAccountSizeChange,
  onRiskPercentageChange,
  onStopLossPriceChange,
  onTakeProfitPriceChange,
}: CalculatorInputsProps) {
  const stopLossHint = useMemo(() => {
    if (!currentPrice || !stopLossPrice) return undefined;
    const slPrice = parseFloat(stopLossPrice);
    if (isNaN(slPrice)) return undefined;
    const distance = Math.abs(currentPrice - slPrice);
    const percentage = (distance / currentPrice) * 100;
    return `${distance.toFixed(5)} (${percentage.toFixed(2)}%)`;
  }, [currentPrice, stopLossPrice]);

  const takeProfitHint = useMemo(() => {
    if (!currentPrice || !takeProfitPrice) return undefined;
    const tpPrice = parseFloat(takeProfitPrice);
    if (isNaN(tpPrice)) return undefined;
    const distance = Math.abs(tpPrice - currentPrice);
    const percentage = (distance / currentPrice) * 100;
    return `${distance.toFixed(5)} (${percentage.toFixed(2)}%)`;
  }, [currentPrice, takeProfitPrice]);

  const stopLossPlaceholder = useMemo(() => {
    return currentPrice ? (currentPrice * 0.98).toFixed(5) : 'Enter price';
  }, [currentPrice]);

  const takeProfitPlaceholder = useMemo(() => {
    return currentPrice ? (currentPrice * 1.04).toFixed(5) : 'Enter price';
  }, [currentPrice]);

  return (
    <div className="space-y-2 mb-3">
      <InputField
        id="account-size"
        label="Account Size ($)"
        value={accountSize}
        onChange={onAccountSizeChange}
        placeholder="10000"
      />
      <InputField
        id="risk-percentage"
        label="Risk per Trade (%)"
        value={riskPercentage}
        onChange={onRiskPercentageChange}
        placeholder="2"
      />
      <InputField
        id="stop-loss"
        label="Stop Loss Price"
        value={stopLossPrice}
        onChange={onStopLossPriceChange}
        placeholder={stopLossPlaceholder}
        hint={stopLossHint}
      />
      <InputField
        id="take-profit"
        label="Take Profit Price"
        value={takeProfitPrice}
        onChange={onTakeProfitPriceChange}
        placeholder={takeProfitPlaceholder}
        hint={takeProfitHint}
      />
    </div>
  );
}

export const CalculatorInputs = memo(CalculatorInputsComponent);
