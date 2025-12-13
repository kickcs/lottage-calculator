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
    <div className="bg-white rounded-lg shadow-lg p-5 border-2 border-gray-300">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Select Trading Assets
        </h3>
        <p className="text-sm font-medium text-gray-800">
          Choose up to {maxSelections} assets for your calculator
        </p>
      </div>

      {/* Selected Assets */}
      {selectedAssets.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-bold text-gray-900 mb-2">Selected Assets:</h4>
          <div className="flex flex-wrap gap-2">
            {selectedAssets.map((asset) => (
              <span
                key={asset}
                className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold bg-indigo-200 text-indigo-900 border-2 border-indigo-400"
              >
                {asset}
                <button
                  onClick={() => handleAssetToggle(asset)}
                  className="ml-2 text-indigo-800 hover:text-indigo-950 font-bold text-lg"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="mb-4 space-y-2">
        <input
          type="text"
          placeholder="Search assets..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setShowDropdown(true)}
          className="w-full px-3 py-2 border-2 border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 font-medium placeholder-gray-600"
        />

        <select
          value={selectedMarket}
          onChange={(e) => setSelectedMarket(e.target.value)}
          className="w-full px-3 py-2 border-2 border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 font-semibold"
        >
          <option value="all" className="font-semibold">All Markets</option>
          <option value="fx" className="font-semibold">Forex</option>
          <option value="indices" className="font-semibold">Indices</option>
          <option value="commodities" className="font-semibold">Commodities</option>
        </select>
      </div>

      {/* Asset List Dropdown */}
      {showDropdown && (
        <div className="border-2 border-gray-400 rounded-md max-h-60 overflow-y-auto mb-4 bg-white">
          {loading ? (
            <div className="p-4 text-center font-bold text-gray-900">Loading assets...</div>
          ) : filteredTickers.length === 0 ? (
            <div className="p-4 text-center font-bold text-gray-900">No assets found</div>
          ) : (
            filteredTickers.slice(0, 50).map((ticker) => {
              const tickerSymbol = ticker.ticker || 'UNKNOWN';
              const isSelected = selectedAssets.includes(tickerSymbol);
              const isDisabled = !isSelected && selectedAssets.length >= maxSelections;

              return (
                <div
                  key={`${ticker.market || 'unknown'}-${tickerSymbol}`}
                  className={`p-3 hover:bg-gray-200 cursor-pointer border-b-2 border-gray-300 bg-white ${
                    isDisabled ? 'opacity-50 cursor-not-allowed' : ''
                  } ${isSelected ? 'bg-indigo-50' : ''}`}
                  onClick={() => !isDisabled && handleAssetToggle(tickerSymbol)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        disabled={isDisabled}
                        className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-500 rounded"
                      />
                      <div>
                        <div className="font-bold text-gray-950 text-base">
                          {tickerSymbol}
                        </div>
                        <div className="text-sm font-semibold text-gray-800">
                          {ticker.name || tickerSymbol || 'Unknown Asset'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${getMarketBadgeColor(
                          ticker.market || 'unknown'
                        )}`}
                      >
                        {(ticker.market || 'unknown').toUpperCase()}
                      </span>
                      <span className="text-xs font-bold text-gray-900">
                        {ticker.currency_symbol || 'N/A'}
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
