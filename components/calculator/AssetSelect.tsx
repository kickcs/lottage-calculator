'use client';

import { memo } from 'react';

interface AssetSelectProps {
  selectedTicker: string;
  selectedAssets: string[];
  onSelect: (ticker: string) => void;
  disabled?: boolean;
}

function AssetSelectComponent({
  selectedTicker,
  selectedAssets,
  onSelect,
  disabled = false,
}: AssetSelectProps) {
  if (selectedAssets.length === 0) {
    return (
      <div className="mb-3">
        <label className="block text-sm font-bold text-gray-900 mb-1">
          Asset
        </label>
        <div
          className="w-full px-3 py-2 border border-yellow-400 bg-yellow-50 rounded text-sm"
          role="alert"
        >
          <p className="font-bold text-gray-900">No assets selected</p>
          <p className="text-gray-700 text-xs mt-0.5">
            Go to Settings to select assets
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-3">
      <label
        htmlFor="asset-select"
        className="block text-sm font-bold text-gray-900 mb-1"
      >
        Asset
      </label>
      <select
        id="asset-select"
        value={selectedTicker}
        onChange={(e) => onSelect(e.target.value)}
        disabled={disabled}
        aria-label="Select trading asset"
        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <option value="">Choose an asset...</option>
        {selectedAssets.map((ticker) => (
          <option key={ticker} value={ticker}>
            {ticker}
          </option>
        ))}
      </select>
    </div>
  );
}

export const AssetSelect = memo(AssetSelectComponent);
