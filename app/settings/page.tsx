'use client';

import Link from 'next/link';
import AssetSelector from '@/components/AssetSelector';

export default function SettingsPage() {
  return (
    <div className="h-dvh bg-gray-50 flex flex-col overflow-hidden">
      <div className="container mx-auto px-4 py-3 max-w-4xl flex-1 flex flex-col min-h-0">
        {/* Header */}
        <div className="mb-2 flex-shrink-0">
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-2xl font-bold text-gray-900">
              Settings
            </h1>
            <Link
              href="/"
              className="px-3 py-1.5 text-sm bg-gray-200 text-gray-800 font-semibold rounded hover:bg-gray-300 transition-colors"
            >
              ← Back
            </Link>
          </div>
        </div>

        {/* Asset Selector */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0">
          <AssetSelector />
        </div>

        {/* Footer */}
        <div className="mt-2 flex-shrink-0 text-center text-xs text-gray-600">
          <p>Assets auto-saved to calculator</p>
        </div>
      </div>
    </div>
  );
}
