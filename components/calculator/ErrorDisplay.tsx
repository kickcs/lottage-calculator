'use client';

import { memo } from 'react';

interface ErrorDisplayProps {
  error: string | null;
}

function ErrorDisplayComponent({ error }: ErrorDisplayProps) {
  if (!error) return null;

  return (
    <div
      className="mb-3 p-2 bg-red-50 border border-red-300 rounded"
      role="alert"
      aria-live="polite"
    >
      <div className="text-xs font-semibold text-red-800">{error}</div>
    </div>
  );
}

export const ErrorDisplay = memo(ErrorDisplayComponent);
