# Custom Price Input & Mobile Fix Design

## Problem
1. No way to set a custom price for calculations
2. iOS Chrome decimal keyboard doesn't show "." button — users can't enter decimal values
3. No manual refresh button for current price

## Solution

### 1. Inline-Editable PriceDisplay
- Click on price turns it into an input field with autofocus
- Custom price stops auto-polling (30s interval)
- "Custom" badge appears next to "Price" label
- Refresh button (right side) clears custom price, refetches, resumes polling
- Empty input on blur reverts to live price

### 2. Mobile Decimal Input Fix
- Accept comma `,` as decimal separator — auto-convert to `.` in onChange handler
- Keeps `inputMode="decimal"` and `type="text"`

### 3. Architecture Changes
- **useQuote**: add `enabled` param to control polling
- **Zustand store**: add `customPrice: string | null`, `setCustomPrice`, `clearCustomPrice`
- **LotCalculator**: pass `enabled={!customPrice}` to useQuote, use `customPrice ?? quote.price` for calculations
