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
    <div className="p-2 bg-blue-50 rounded border border-blue-300">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-semibold text-gray-900">Price</span>
        {loading && (
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>
      <div className="text-lg font-bold text-blue-700 mb-1">
        {formatPrice(price, ticker)}
      </div>
      {bid && ask && (
        <div className="flex justify-between text-xs text-gray-700">
          <span>Bid: {formatPrice(bid, ticker)}</span>
          <span>Ask: {formatPrice(ask, ticker)}</span>
        </div>
      )}
    </div>
  );
}