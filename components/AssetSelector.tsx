'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';

export default function AssetSelector() {
  const { selectedAssets, setSelectedAssets, tickers, setTickers, loading, setLoading } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMarket, setSelectedMarket] = useState<string>('all');
  const [showDropdown, setShowDropdown] = useState(false);
  const maxSelections = 10;

  useEffect(() => {
    loadTickers();
  }, []);

  const loadTickers = async () => {
    try {
      setLoading(true);

      // Fetch all tickers from API endpoint (cached on server for 7 days)
      const response = await fetch('/api/assets?endpoint=tickers');
      const data = await response.json();

      if (data.results && Array.isArray(data.results)) {
        setTickers(data.results);
        console.log(`Loaded ${data.results.length} tickers from API`);
      } else {
        console.error('Invalid response from API:', data);
        setTickers([]);
      }
    } catch (error) {
      console.error('Error loading tickers:', error);
      setTickers([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredTickers = tickers.filter((ticker) => {
    const name = ticker.name || ticker.ticker || '';
    const tickerSymbol = ticker.ticker || '';
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tickerSymbol.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMarket = selectedMarket === 'all' || ticker.market === selectedMarket;
    return matchesSearch && matchesMarket;
  });

  const handleAssetToggle = (ticker: string) => {
    if (selectedAssets.includes(ticker)) {
      setSelectedAssets(selectedAssets.filter(asset => asset !== ticker));
    } else if (selectedAssets.length < maxSelections) {
      setSelectedAssets([...selectedAssets, ticker]);
    }
  };

  const getMarketBadgeColor = (market: string) => {
    switch (market) {
      case 'fx':
        return 'bg-blue-200 text-blue-900 border border-blue-400';
      case 'indices':
        return 'bg-green-200 text-green-900 border border-green-400';
      case 'commodities':
        return 'bg-orange-200 text-orange-900 border border-orange-400';
      default:
        return 'bg-gray-200 text-gray-900 border border-gray-400';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 border border-gray-300">
      <div className="mb-3">
        <h3 className="text-lg font-bold text-gray-900 mb-1">
          Select Assets
        </h3>
        <p className="text-xs text-gray-700">
          Choose up to {maxSelections} assets
        </p>
      </div>

      {/* Selected Assets */}
      {selectedAssets.length > 0 && (
        <div className="mb-3">
          <h4 className="text-xs font-bold text-gray-900 mb-1">Selected:</h4>
          <div className="flex flex-wrap gap-1">
            {selectedAssets.map((asset) => (
              <span
                key={asset}
                className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-indigo-100 text-indigo-900 border border-indigo-300"
              >
                {asset}
                <button
                  onClick={() => handleAssetToggle(asset)}
                  className="ml-1 text-indigo-800 hover:text-indigo-950 font-bold"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="mb-3 space-y-2">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setShowDropdown(true)}
          className="w-full px-3 py-1.5 text-sm border border-gray-400 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
        />

        <select
          value={selectedMarket}
          onChange={(e) => setSelectedMarket(e.target.value)}
          className="w-full px-3 py-1.5 text-sm border border-gray-400 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 font-semibold"
        >
          <option value="all">All Markets</option>
          <option value="fx">Forex</option>
          <option value="indices">Indices</option>
          <option value="commodities">Commodities</option>
        </select>
      </div>

      {/* Asset List Dropdown */}
      {showDropdown && (
        <div className="border border-gray-400 rounded max-h-60 overflow-y-auto mb-3 bg-white">
          {loading ? (
            <div className="p-3 text-center text-sm font-bold text-gray-900">Loading...</div>
          ) : filteredTickers.length === 0 ? (
            <div className="p-3 text-center text-sm font-bold text-gray-900">No assets found</div>
          ) : (
            filteredTickers.slice(0, 50).map((ticker) => {
              const tickerSymbol = ticker.ticker || 'UNKNOWN';
              const isSelected = selectedAssets.includes(tickerSymbol);
              const isDisabled = !isSelected && selectedAssets.length >= maxSelections;

              return (
                <div
                  key={`${ticker.market || 'unknown'}-${tickerSymbol}`}
                  className={`p-2 hover:bg-gray-100 cursor-pointer border-b border-gray-200 ${
                    isDisabled ? 'opacity-50 cursor-not-allowed' : ''
                  } ${isSelected ? 'bg-indigo-50' : ''}`}
                  onClick={() => !isDisabled && handleAssetToggle(tickerSymbol)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        disabled={isDisabled}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-400 rounded"
                      />
                      <div>
                        <div className="font-bold text-gray-900 text-sm">
                          {tickerSymbol}
                        </div>
                        <div className="text-xs text-gray-700">
                          {ticker.name || tickerSymbol || 'Unknown'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span
                        className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-bold ${getMarketBadgeColor(
                          ticker.market || 'unknown'
                        )}`}
                      >
                        {(ticker.market || 'unknown').toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      <div className="text-sm font-bold text-gray-900">
        {selectedAssets.length}/{maxSelections} assets selected
      </div>
    </div>
  );
}
