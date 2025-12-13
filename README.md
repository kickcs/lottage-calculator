# Forex Lot Size Calculator

A modern, responsive web application for calculating position sizes and risk/reward ratios in Forex, Indices, and Commodities trading, built with Next.js and powered by Twelve Data API.

## Features

- **Real-time Data**: Live price quotes from Twelve Data API
- **Multi-Asset Support**: Forex pairs, Indices, and Commodities
- **Smart Caching**: Server-side caching with 7-day TTL for asset lists
- **Risk Management**: Calculate lot size based on account risk percentage
- **RR Ratio**: Automatic risk/reward ratio calculation
- **Mobile Responsive**: Optimized for mobile devices
- **Local Storage**: Saves your selected assets for convenience
- **Pip Value Calculation**: Automatic pip/point value detection

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure API Key

1. Sign up for a Twelve Data account at [https://twelvedata.com/](https://twelvedata.com/)
2. Get your API key from [https://twelvedata.com/account/api-keys](https://twelvedata.com/account/api-keys)
3. Create a `.env.local` file in the root directory
4. Add your API key:

```env
TWELVE_DATA_API_KEY=your_actual_api_key_here
```

**Note**: You can use `apikey=demo` for testing, but it has limited functionality.

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Usage

1. **Select Assets**: Choose up to 10 trading assets from the Asset Selector
2. **Enter Parameters**:
   - Account size in USD
   - Risk percentage per trade
   - Stop loss in points/pips
   - Optional: Take profit for RR ratio calculation
3. **View Results**: Get recommended lot size, risk amount, and potential profit

## Project Structure

```
/
 ├─ app
 │   ├─ page.tsx                # Main page component
 │   ├─ api/assets/route.ts     # API proxy for Twelve Data API
 │   └─ layout.tsx              # Root layout
 ├─ components
 │   ├─ AssetSelector.tsx       # Asset selection component
 │   ├─ LotCalculator.tsx       # Main calculator component
 │   └─ PriceDisplay.tsx        # Price display component
 ├─ services
 │   └─ twelvedata.ts           # Twelve Data API service
 ├─ utils
 │   ├─ lotUtils.ts             # Calculation utilities
 │   ├─ validation.ts           # Input validation
 │   └─ performance.ts          # Caching and performance
 └─ types
     └─ index.ts                # TypeScript type definitions
```

## Technology Stack

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type safety
- **TailwindCSS v4** - Utility-first CSS framework
- **Twelve Data API** - Real-time market data

## API & Caching Strategy

### Server-Side Caching
- **Asset Lists**: Cached for 7 days (as per requirement)
- **Price Quotes**: Cached for 30 seconds
- Automatic cache invalidation after TTL expires

### Twelve Data API
- Free plan available with daily limits
- Paid plans offer higher limits and more features
- Visit [https://twelvedata.com/pricing](https://twelvedata.com/pricing) for details
- API proxy implementation prevents client-side exposure of API key

## Build and Deploy

### Build for Production

```bash
npm run build
npm start
```

### Deploy on Vercel

The easiest way to deploy is using [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

Make sure to add your `TWELVE_DATA_API_KEY` as an environment variable in your deployment settings.

## Risk Disclaimer

This tool is for educational purposes only. Always verify calculations with your broker before placing real trades. Trading involves substantial risk of loss.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
