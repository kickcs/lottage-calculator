'use client';

import Link from 'next/link';
import AssetSelector from '@/components/AssetSelector';

export default function SettingsPage() {
  return (
    <div className="h-dvh bg-gray-50 flex flex-col overflow-hidden">
      <div className="container mx-auto px-4 py-6 max-w-4xl flex-1 flex flex-col min-h-0">
        {/* Header */}
        <div className="mb-4 flex-shrink-0">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-4xl font-bold text-gray-900">
              Settings
            </h1>
            <Link
              href="/"
              className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-md hover:bg-gray-300 transition-colors border-2 border-gray-300"
            >
              ← Back to Calculator
            </Link>
          </div>
          <p className="text-base font-semibold text-gray-800">
            Configure your trading assets and preferences
          </p>
        </div>

        {/* Asset Selector */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0">
          <AssetSelector />
        </div>

        {/* Footer */}
        <div className="mt-4 flex-shrink-0 text-center text-sm text-gray-700 font-medium">
          <p>
            Selected assets will be saved automatically and used in the calculator
          </p>
        </div>
      </div>
    </div>
  );
}
