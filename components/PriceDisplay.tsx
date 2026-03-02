'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useInputHandler } from '@/hooks';

interface PriceDisplayProps {
  price: number;
  bid?: number;
  ask?: number;
  loading?: boolean;
  customPrice: string | null;
  onCustomPriceChange: (price: string | null) => void;
  onRefresh: () => void;
}

export default function PriceDisplay({
  price,
  bid,
  ask,
  loading = false,
  customPrice,
  onCustomPriceChange,
  onRefresh,
}: PriceDisplayProps) {
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const isCustom = customPrice !== null;
  const displayPrice = isCustom ? customPrice : price.toString();

  const handleInputChange = useInputHandler(setInputValue);

  const startEditing = useCallback(() => {
    setInputValue(displayPrice);
    setEditing(true);
  }, [displayPrice]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const commitEdit = () => {
    setEditing(false);
    const parsed = parseFloat(inputValue);
    if (!inputValue || isNaN(parsed) || parsed <= 0) {
      onCustomPriceChange(null);
    } else if (parsed === price) {
      onCustomPriceChange(null);
    } else {
      onCustomPriceChange(inputValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') commitEdit();
    if (e.key === 'Escape') {
      setEditing(false);
      setInputValue('');
    }
  };

  const handleRefresh = () => {
    onCustomPriceChange(null);
    setEditing(false);
    onRefresh();
  };

  return (
    <div className="p-2 bg-blue-50 rounded border border-blue-300">
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-gray-900">Price</span>
          {isCustom && (
            <span className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 border border-amber-300">
              Custom
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {loading && (
            <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          )}
          <button
            type="button"
            onClick={handleRefresh}
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-blue-200 active:bg-blue-300 transition-colors text-blue-600"
            title="Refresh price"
            aria-label="Refresh current price"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.5 2v6h-6M2.5 22v-6h6" />
              <path d="M2.5 11.5a10 10 0 0 1 16.5-5.5L21.5 8M21.5 12.5a10 10 0 0 1-16.5 5.5L2.5 16" />
            </svg>
          </button>
        </div>
      </div>

      {editing ? (
        <input
          ref={inputRef}
          type="text"
          inputMode="decimal"
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={handleKeyDown}
          className="w-full text-lg font-bold text-blue-700 bg-white border border-blue-400 rounded px-1.5 py-0.5 mb-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      ) : (
        <div
          onClick={startEditing}
          className="text-lg font-bold text-blue-700 mb-1 cursor-text rounded px-1.5 py-0.5 -mx-1.5 hover:bg-blue-100 transition-colors"
          title="Click to set custom price"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') startEditing(); }}
        >
          {displayPrice}
        </div>
      )}

      {bid && ask && (
        <div className="flex justify-between text-xs text-gray-700">
          <span>Bid: {bid}</span>
          <span>Ask: {ask}</span>
        </div>
      )}
    </div>
  );
}
