'use client';

interface PriceDisplayProps {
  ticker: string;
  price: number;
  bid?: number;
  ask?: number;
  loading?: boolean;
}

export default function PriceDisplay({
  ticker,
  price,
  bid,
  ask,
  loading = false,
}: PriceDisplayProps) {
  const formatPrice = (value: number, ticker: string) => {
    // Don't round prices - show full precision
    return value.toString();
  };

  return (
    <div className="p-4 bg-blue-100 rounded-lg border-2 border-blue-300">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-semibold text-gray-900">Current Price:</span>
        {loading && (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-blue-700 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs font-medium text-blue-700">Updating...</span>
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-blue-700 mb-2">
        {formatPrice(price, ticker)}
      </div>
      {bid && ask && (
        <div className="flex justify-between text-xs font-medium text-gray-800">
          <span>Bid: {formatPrice(bid, ticker)}</span>
          <span>Ask: {formatPrice(ask, ticker)}</span>
        </div>
      )}
      <div className="text-xs font-medium text-gray-700 mt-2">
        Spread: {bid && ask ? formatPrice(ask - bid, ticker) : 'N/A'}
      </div>
    </div>
  );
}